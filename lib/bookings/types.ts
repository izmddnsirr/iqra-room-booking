export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'ready_for_collection'
  | 'in_process'
  | 'completed'
  | 'cancelled'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  ready_for_collection: 'Ready for Collection',
  in_process: 'In Process',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
