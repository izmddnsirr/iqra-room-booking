import { formatBookingDate, formatBookingPeriod } from '@/lib/bookings/format'

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

export function bookingExpiringSoonEmail({ fullName, roomNumber, endDate }: {
  fullName: string
  roomNumber: string
  endDate: string
}) {
  return wrapper('Rental Expiring Soon', `
    <p>Hi ${fullName},</p>
    <p>Your rental for <strong>Room ${roomNumber}</strong> will end on <strong>${formatBookingDate(endDate)}</strong> (5 days from now).</p>
    <p>Please return your access card to the PTTA counter by the end date to avoid penalties.</p>
  `)
}

export function bookingAutoMissingEmail({ fullName, roomNumber, endDate }: {
  fullName: string
  roomNumber: string
  endDate: string
}) {
  return wrapper('Access Card Marked as Lost', `
    <p>Hi ${fullName},</p>
    <p>Your rental for <strong>Room ${roomNumber}</strong> ended on <strong>${formatBookingDate(endDate)}</strong> and the access card has not been returned within 5 days.</p>
    <p>The access card has been categorized as <strong>LOST</strong>. A penalty of RM50.00 will be charged and recorded in the Student Information System.</p>
  `)
}

export function bookingPenaltyChargedEmail({ fullName, roomNumber, amount }: {
  fullName: string
  roomNumber: string
  amount: number
}) {
  return wrapper('Penalty Charged', `
    <p>Hi ${fullName},</p>
    <p>A penalty of <strong>RM${amount.toFixed(2)}</strong> for the lost access card of <strong>Room ${roomNumber}</strong> has been charged and recorded in the Student Information System.</p>
  `)
}

export function bookingMarkedMissingEmail({ fullName, roomNumber }: {
  fullName: string
  roomNumber: string
}) {
  return wrapper('Access Card Marked as Lost', `
    <p>Hi ${fullName},</p>
    <p>Your access card for <strong>Room ${roomNumber}</strong> has been categorized as <strong>LOST</strong>.</p>
    <p>A penalty of RM50.00 will be charged and recorded in the Student Information System.</p>
    <p>If you have located the access card, please return it to the PTTA counter immediately.</p>
  `)
}

export function bookingWarningEmail({ fullName, roomNumber, message }: {
  fullName: string
  roomNumber: string
  message: string
}) {
  return wrapper('Warning Notice - Iqra Room', `
    <p>Hi ${fullName},</p>
    <p>You have received a warning notice regarding your rental of <strong>Room ${roomNumber}</strong>:</p>
    <blockquote style="margin: 12px 0; padding: 8px 12px; border-left: 3px solid #f59e0b; background: #fffbeb;">${message}</blockquote>
    <p>Please address this issue promptly. Ignoring this notice may result in the cancellation of your rental without compensation or refund.</p>
  `)
}

export function bookingForceCancelledEmail({ fullName, roomNumber }: {
  fullName: string
  roomNumber: string
}) {
  return wrapper('Rental Cancelled', `
    <p>Hi ${fullName},</p>
    <p>Your rental for <strong>Room ${roomNumber}</strong> has been cancelled by PTTA due to a rule violation.</p>
    <p>No compensation or refund will be provided for this cancellation.</p>
  `)
}
