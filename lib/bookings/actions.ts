'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import {
  bookingApprovedEmail,
  bookingRejectedEmail,
  bookingReadyForCollectionEmail,
  bookingCompletedEmail,
} from '@/lib/email/templates'
import type { BookingStatus } from './types'

export type BookingFormState = { error?: string; success?: boolean } | undefined

const MONTHLY_RATE = 20

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

  const activeStatuses: BookingStatus[] = ['pending', 'approved', 'ready_for_collection', 'in_process']

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
    .select('is_available, is_visible')
    .eq('id', roomId)
    .single()

  if (!room || !room.is_available || !room.is_visible) {
    return { error: 'This room is not available for booking.' }
  }

  const start = new Date(startDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + months)

  const { data: existingBookings } = await supabase
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
  })

  if (error) return { error: error.message }

  revalidatePath('/booking/status')
  revalidatePath('/dashboard')
  revalidatePath('/admin/pending-approvals')
  revalidatePath('/admin/bookings')
  return { success: true }
}

export async function cancelBooking(bookingId: string) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }

  const { supabase, userId } = ctx

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  revalidatePath('/booking/status')
  revalidatePath('/dashboard')
  revalidatePath('/admin/pending-approvals')
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
  allowedRoles: string[],
  paths: string[],
  buildEmail?: (details: BookingEmailDetails) => { subject: string; html: string }
) {
  const ctx = await getProfileRole()
  if (!ctx) return { error: 'You must be logged in.' }
  if (!allowedRoles.includes(ctx.role)) return { error: 'Not authorized.' }

  const { supabase } = ctx

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) return { error: error.message }

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

export async function approveBooking(bookingId: string) {
  return setBookingStatus(bookingId, 'approved', ['admin'], [
    '/booking/status', '/dashboard', '/admin/pending-approvals', '/admin/bookings', '/receptionist/ready-collection',
  ], (details) => ({
    subject: 'Booking Approved - Iqra Room',
    html: bookingApprovedEmail(details),
  }))
}

export async function rejectBooking(bookingId: string) {
  return setBookingStatus(bookingId, 'rejected', ['admin'], [
    '/booking/status', '/dashboard', '/admin/pending-approvals', '/admin/bookings', '/receptionist/key-history',
  ], (details) => ({
    subject: 'Booking Rejected - Iqra Room',
    html: bookingRejectedEmail(details),
  }))
}

export async function markReadyForCollection(bookingId: string) {
  return setBookingStatus(bookingId, 'ready_for_collection', ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/ready-collection',
  ], (details) => ({
    subject: 'Key Ready for Collection - Iqra Room',
    html: bookingReadyForCollectionEmail(details),
  }))
}

export async function markCollected(bookingId: string) {
  return setBookingStatus(bookingId, 'in_process', ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/ready-collection', '/receptionist/in-process',
  ])
}

export async function markCompleted(bookingId: string) {
  return setBookingStatus(bookingId, 'completed', ['admin', 'receptionist'], [
    '/booking/status', '/dashboard', '/admin/bookings', '/receptionist/in-process', '/receptionist/key-history',
  ], (details) => ({
    subject: 'Booking Completed - Iqra Room',
    html: bookingCompletedEmail(details),
  }))
}
