'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import {
  bookingApprovedEmail,
  bookingReadyForCollectionEmail,
  bookingCompletedEmail,
  bookingMarkedMissingEmail,
  bookingPenaltyChargedEmail,
  bookingWarningEmail,
  bookingForceCancelledEmail,
} from '@/lib/email/templates'
import type { BookingStatus } from './types'

export type BookingFormState = { error?: string; success?: boolean } | undefined

const MONTHLY_RATE = 20
const ACCESS_CARD_PENALTY = 50

async function getProfileRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { supabase, userId: user.id, role: profile.role }
}

export async function createBooking(_prevState: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in to book a room.' }

  const roomId = formData.get('room_id')
  const startDate = formData.get('start_date')
  const rentalMonths = formData.get('rental_months')

  if (typeof roomId !== 'string' || !roomId) {
    return { error: 'Please select a room.' }
  }
  if (typeof startDate !== 'string' || !startDate) {
    return { error: 'Please select a start date.' }
  }
  const months = Number(rentalMonths)
  if (!Number.isInteger(months) || months < 1 || months > 3) {
    return { error: 'Rental period must be between 1 and 3 months.' }
  }

  const { supabase, userId } = ctx

  const activeStatuses: BookingStatus[] = ['approved', 'key_prepared', 'ready_for_collection', 'in_process']

  const { data: ownActiveBookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', userId)
    .in('status', activeStatuses)
    .limit(1)

  if (ownActiveBookings && ownActiveBookings.length > 0) {
    return { error: 'You already have an active booking. Complete or cancel it before booking another room.' }
  }

  const { data: room } = await supabase
    .from('rooms')
    .select('status')
    .eq('id', roomId)
    .single()

  if (!room || room.status !== 'active') {
    return { error: 'This room is not available for booking.' }
  }

  const start = new Date(startDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + months)

  const adminClient = createAdminClient()
  const { data: existingBookings } = await adminClient
    .from('bookings')
    .select('start_date, end_date')
    .eq('room_id', roomId)
    .in('status', activeStatuses)

  const startStr = start.toISOString().slice(0, 10)
  const endStr = end.toISOString().slice(0, 10)

  const hasOverlap = (existingBookings ?? []).some(
    (booking) => startStr < booking.end_date && booking.start_date < endStr
  )

  if (hasOverlap) {
    return { error: 'This room is already booked for the selected dates.' }
  }

  const totalAmount = MONTHLY_RATE * months

  const { error } = await supabase.from('bookings').insert({
    user_id: userId,
    room_id: roomId,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    rental_months: months,
    monthly_rate: MONTHLY_RATE,
    total_amount: totalAmount,
    status: 'approved',
  })

  if (error) {
    if (error.code === '23P01') {
      return { error: 'This room is already booked for the selected dates.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/bookings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  const { data: bookedRoom } = await supabase
    .from('rooms')
    .select('room_number')
    .eq('id', roomId)
    .single()

  if (profile?.email) {
    const { subject, html } = {
      subject: 'Booking Confirmed - Iqra Room',
      html: bookingApprovedEmail({
        fullName: profile.full_name,
        roomNumber: bookedRoom?.room_number ?? '—',
        startDate: startStr,
        endDate: endStr,
        rentalMonths: months,
        totalAmount,
      }),
    }
    await sendEmail({ to: profile.email, subject, html })
  }

  return { success: true }
}

export async function cancelBooking(bookingId: string) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }

  const { supabase, userId } = ctx

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', userId)
    .eq('status', 'approved')
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'This booking can no longer be cancelled.' }

  revalidatePath('/dashboard')
  revalidatePath('/admin/bookings')
  return { success: true }
}

type BookingEmailDetails = {
  email: string
  fullName: string
  roomNumber: string
  startDate: string
  endDate: string
  rentalMonths: number
  totalAmount: number
}

async function setBookingStatus(
  bookingId: string,
  status: BookingStatus,
  fromStatuses: BookingStatus[],
  allowedRoles: string[],
  paths: string[],
  buildEmail?: (details: BookingEmailDetails) => { subject: string; html: string },
  extraFields?: Record<string, unknown>
) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }
  if (!allowedRoles.includes(ctx.role)) return { error: 'Not authorized.' }

  const { supabase } = ctx

  const { data, error } = await supabase
    .from('bookings')
    .update({ status, ...extraFields })
    .eq('id', bookingId)
    .in('status', fromStatuses)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Booking is no longer in a state that allows this action.' }

  for (const path of paths) revalidatePath(path)

  if (buildEmail) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('start_date, end_date, rental_months, total_amount, profiles(email, full_name), rooms(room_number)')
      .eq('id', bookingId)
      .single()

    if (booking) {
      const profile = booking.profiles as unknown as { email: string; full_name: string } | null
      const room = booking.rooms as unknown as { room_number: string } | null

      if (profile?.email) {
        const { subject, html } = buildEmail({
          email: profile.email,
          fullName: profile.full_name,
          roomNumber: room?.room_number ?? '—',
          startDate: booking.start_date,
          endDate: booking.end_date,
          rentalMonths: booking.rental_months,
          totalAmount: booking.total_amount,
        })
        await sendEmail({ to: profile.email, subject, html })
      }
    }
  }

  return { success: true }
}

export async function markKeyPrepared(bookingId: string) {
  return setBookingStatus(bookingId, 'key_prepared', ['approved'], ['admin', 'receptionist'], [
    '/dashboard', '/admin', '/admin/bookings', '/receptionist', '/receptionist/ready-collection',
  ])
}

export async function markReadyForCollection(bookingId: string) {
  return setBookingStatus(bookingId, 'ready_for_collection', ['key_prepared'], ['admin', 'receptionist'], [
    '/dashboard', '/admin', '/admin/bookings', '/receptionist/ready-collection',
  ], (details) => ({
    subject: 'Key Ready for Collection - Iqra Room',
    html: bookingReadyForCollectionEmail(details),
  }))
}

export async function markCollected(bookingId: string) {
  return setBookingStatus(bookingId, 'in_process', ['ready_for_collection'], ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/ready-collection', '/receptionist/in-process',
  ])
}

export async function revertToInProcess(bookingId: string) {
  return setBookingStatus(bookingId, 'in_process', ['completed'], ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/ready-collection', '/receptionist/in-process', '/receptionist/key-history',
  ], undefined, { reverted_at: new Date().toISOString() })
}

export async function markCompleted(bookingId: string) {
  return setBookingStatus(bookingId, 'completed', ['in_process'], ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/in-process', '/receptionist/key-history',
  ], (details) => ({
    subject: 'Booking Completed - Iqra Room',
    html: bookingCompletedEmail(details),
  }), { reverted_at: null })
}

export async function markMissing(bookingId: string) {
  return setBookingStatus(bookingId, 'missing', ['in_process', 'completed'], ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/in-process', '/receptionist/key-history',
  ], (details) => ({
    subject: 'Access Card Marked as Lost - Iqra Room',
    html: bookingMarkedMissingEmail(details),
  }))
}

export async function markFound(bookingId: string) {
  return setBookingStatus(bookingId, 'in_process', ['missing'], ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/in-process', '/receptionist/key-history',
  ], undefined, { reverted_at: new Date().toISOString() })
}

export async function chargePenalty(bookingId: string, amount: number = ACCESS_CARD_PENALTY) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }
  if (!['admin', 'receptionist'].includes(ctx.role)) return { error: 'Not authorized.' }

  const { supabase } = ctx

  const { data: booking } = await supabase
    .from('bookings')
    .select('status, penalty_charged_at')
    .eq('id', bookingId)
    .single()

  if (!booking || booking.status !== 'missing') {
    return { error: 'Only missing bookings can be charged a penalty.' }
  }
  if (booking.penalty_charged_at) {
    return { error: 'A penalty has already been charged for this booking.' }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ penalty_amount: amount, penalty_charged_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) return { error: error.message }

  const { data: bookingDetails } = await supabase
    .from('bookings')
    .select('profiles(email, full_name), rooms(room_number)')
    .eq('id', bookingId)
    .single()

  if (bookingDetails) {
    const profile = bookingDetails.profiles as unknown as { email: string; full_name: string } | null
    const room = bookingDetails.rooms as unknown as { room_number: string } | null

    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: 'Penalty Charged - Iqra Room',
        html: bookingPenaltyChargedEmail({
          fullName: profile.full_name,
          roomNumber: room?.room_number ?? '—',
          amount,
        }),
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
  revalidatePath('/receptionist/in-process')
  revalidatePath('/receptionist/key-history')
  return { success: true }
}

export async function issueWarning(bookingId: string, message: string) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }
  if (!['admin', 'receptionist'].includes(ctx.role)) return { error: 'Not authorized.' }
  if (!message.trim()) return { error: 'Warning message is required.' }

  const { supabase, userId } = ctx

  const { error } = await supabase
    .from('booking_warnings')
    .insert({ booking_id: bookingId, message: message.trim(), created_by: userId })

  if (error) return { error: error.message }

  const { data: booking } = await supabase
    .from('bookings')
    .select('profiles(email, full_name), rooms(room_number)')
    .eq('id', bookingId)
    .single()

  if (booking) {
    const profile = booking.profiles as unknown as { email: string; full_name: string } | null
    const room = booking.rooms as unknown as { room_number: string } | null

    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: 'Warning Notice - Iqra Room',
        html: bookingWarningEmail({
          fullName: profile.full_name,
          roomNumber: room?.room_number ?? '—',
          message: message.trim(),
        }),
      })
    }
  }

  revalidatePath('/admin/bookings')
  return { success: true }
}

export async function forceCancelBooking(bookingId: string) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }
  if (ctx.role !== 'admin') return { error: 'Not authorized.' }

  const { supabase } = ctx

  const { data: booking } = await supabase
    .from('bookings')
    .select('profiles(email, full_name), rooms(room_number)')
    .eq('id', bookingId)
    .single()

  const cancellableStatuses: BookingStatus[] = ['approved', 'key_prepared', 'ready_for_collection', 'in_process', 'missing']

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .in('status', cancellableStatuses)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Booking is no longer active and cannot be cancelled.' }

  if (booking) {
    const profile = booking.profiles as unknown as { email: string; full_name: string } | null
    const room = booking.rooms as unknown as { room_number: string } | null

    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: 'Rental Cancelled - Iqra Room',
        html: bookingForceCancelledEmail({
          fullName: profile.full_name,
          roomNumber: room?.room_number ?? '—',
        }),
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/bookings')
  revalidatePath('/receptionist/in-process')
  revalidatePath('/receptionist/key-history')
  return { success: true }
}
