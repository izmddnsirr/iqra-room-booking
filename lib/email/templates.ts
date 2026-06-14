import { formatBookingPeriod } from '@/lib/bookings/format'

function wrapper(title: string, body: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px;">${title}</h2>
      ${body}
      <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">Iqra Room Booking System</p>
    </div>
  `
}

export function bookingApprovedEmail({ fullName, roomNumber, startDate, endDate, rentalMonths, totalAmount }: {
  fullName: string
  roomNumber: string
  startDate: string
  endDate: string
  rentalMonths: number
  totalAmount: number
}) {
  return wrapper('Booking Confirmed', `
    <p>Hi ${fullName},</p>
    <p>Your booking for <strong>Room ${roomNumber}</strong> (${formatBookingPeriod(startDate, endDate)}) has been confirmed.</p>
    <p>Total payment: <strong>RM ${totalAmount.toFixed(2)}</strong> for ${rentalMonths} month${rentalMonths > 1 ? 's' : ''}, to be credited to SMAP.</p>
    <p>You will be notified once your key is ready for collection.</p>
  `)
}

export function bookingReadyForCollectionEmail({ fullName, roomNumber }: {
  fullName: string
  roomNumber: string
}) {
  return wrapper('Key Ready for Collection', `
    <p>Hi ${fullName},</p>
    <p>Your key for <strong>Room ${roomNumber}</strong> is ready. Please collect it at the counter.</p>
  `)
}

export function bookingCompletedEmail({ fullName, roomNumber }: {
  fullName: string
  roomNumber: string
}) {
  return wrapper('Booking Completed', `
    <p>Hi ${fullName},</p>
    <p>Your rental for <strong>Room ${roomNumber}</strong> has ended. Thank you for using Iqra Room.</p>
  `)
}
