import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { bookingAutoMissingEmail, bookingExpiringSoonEmail } from '@/lib/email/templates'

const EXPIRY_WARNING_DAYS = 5
const OVERDUE_MISSING_DAYS = 5

type BookingRow = {
  id: string
  end_date: string
  profiles: { email: string; full_name: string } | null
  rooms: { room_number: string } | null
}

function dateOffset(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const expiringSoonDate = dateOffset(EXPIRY_WARNING_DAYS)
  const { data: expiringBookings } = await supabase
    .from('bookings')
    .select('id, end_date, profiles(email, full_name), rooms(room_number)')
    .eq('status', 'in_process')
    .eq('end_date', expiringSoonDate)
    .is('expiry_notified_at', null)

  let notified = 0
  for (const booking of (expiringBookings ?? []) as unknown as BookingRow[]) {
    if (booking.profiles?.email) {
      await sendEmail({
        to: booking.profiles.email,
        subject: 'Rental Expiring Soon - Iqra Room',
        html: bookingExpiringSoonEmail({
          fullName: booking.profiles.full_name,
          roomNumber: booking.rooms?.room_number ?? '—',
          endDate: booking.end_date,
        }),
      })
    }
    await supabase
      .from('bookings')
      .update({ expiry_notified_at: new Date().toISOString() })
      .eq('id', booking.id)
    notified++
  }

  const overdueCutoff = dateOffset(-OVERDUE_MISSING_DAYS)
  const { data: overdueBookings } = await supabase
    .from('bookings')
    .select('id, end_date, profiles(email, full_name), rooms(room_number)')
    .eq('status', 'in_process')
    .lt('end_date', overdueCutoff)

  let markedMissing = 0
  for (const booking of (overdueBookings ?? []) as unknown as BookingRow[]) {
    if (booking.profiles?.email) {
      await sendEmail({
        to: booking.profiles.email,
        subject: 'Access Card Marked as Lost - Iqra Room',
        html: bookingAutoMissingEmail({
          fullName: booking.profiles.full_name,
          roomNumber: booking.rooms?.room_number ?? '—',
          endDate: booking.end_date,
        }),
      })
    }
    await supabase
      .from('bookings')
      .update({ status: 'missing' })
      .eq('id', booking.id)
    markedMissing++
  }

  return NextResponse.json({ notified, markedMissing })
}
