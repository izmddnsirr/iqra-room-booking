export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'ready_for_collection'
  | 'in_process'
  | 'completed'
  | 'cancelled'
  | 'missing'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  ready_for_collection: 'Ready for Collection',
  in_process: 'In Process',
  completed: 'Completed',
  cancelled: 'Cancelled',
  missing: 'Missing',
}

// Key status colours per the receptionist key-status flow:
// In Preparation (approved) -> Ready for Pickup (ready_for_collection)
// -> Collected (in_process) -> Returned (completed) / Missing / Overdue (derived)
export const KEY_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  ready_for_collection: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
  in_process: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
  overdue: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
  missing: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
}
