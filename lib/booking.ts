const blockedBookingUrlPatterns = [
  "static.practicefusion.com/apps/ehr",
  "practicefusion.com/apps/ehr",
];

export function getBookingUrl() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();

  if (
    !bookingUrl ||
    blockedBookingUrlPatterns.some((pattern) =>
      bookingUrl.toLowerCase().includes(pattern),
    )
  ) {
    return null;
  }

  return bookingUrl;
}
