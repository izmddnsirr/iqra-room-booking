export function formatBookingDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatBookingPeriod(startDate: string, endDate: string) {
  return `${formatBookingDate(startDate)} – ${formatBookingDate(endDate)}`;
}
