export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'key_prepared'
  | 'ready_for_collection'
  | 'in_process'
  | 'completed'
  | 'cancelled'
  | 'missing'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  key_prepared: 'Key Prepared',
  ready_for_collection: 'Ready for Collection',
  in_process: 'In Process',
  completed: 'Completed',
  cancelled: 'Cancelled',
  missing: 'Missing',
}

// Key status labels per the receptionist key-status flow:
// In Preparation (approved) -> Key Prepared (key_prepared) -> Ready for Pickup (ready_for_collection)
// -> Collected (in_process) -> Returned (completed) / Missing / Overdue (derived)
export const KEY_STATUS_LABELS: Record<BookingStatus, string> = {
  ...BOOKING_STATUS_LABELS,
  approved: 'In Preparation',
  ready_for_collection: 'Ready for Pickup',
  in_process: 'Collected',
  completed: 'Returned',
}

// Key status colours per the receptionist key-status flow:
// In Preparation (approved) -> Key Prepared (key_prepared) -> Ready for Pickup (ready_for_collection)
// -> Collected (in_process) -> Returned (completed) / Missing / Overdue (derived)
export const KEY_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  key_prepared: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900',
  ready_for_collection: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
  in_process: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
  overdue: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
  missing: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
}
