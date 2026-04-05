export const HOTEL_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
export const VACUNAS_CALENDAR_ID = process.env.VACUNAS_CALENDAR_ID || HOTEL_CALENDAR_ID;
export const MONTERREY_TIMEZONE = "America/Monterrey";
export const SLOT_INTERVAL_MIN = 30;
export const SLOT_DURATION_MIN = 30;
// Future change point: raise this value to allow more than one reservation per slot.
export const MAX_RESERVATIONS_PER_SLOT = 1;
