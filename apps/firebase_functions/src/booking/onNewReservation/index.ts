import { onValueCreated } from "firebase-functions/v2/database";
import * as logger from "firebase-functions/logger";

export const onNewReservation = onValueCreated("/reservations/{pushId}", async (event) => {
  const pushId = event.params.pushId;

  // Legacy trigger intentionally disabled.
  // Reservations are now created through booking-createReservation, which already:
  // 1. validates availability,
  // 2. creates the Google Calendar event,
  // 3. stores calendarEventId in RTDB.
  // Recreating the event here would duplicate entries in Google Calendar.
  logger.info(`[RESERVATION TRIGGER OMITIDO] ID: ${pushId}`, { structuredData: true });
  return null;
});
