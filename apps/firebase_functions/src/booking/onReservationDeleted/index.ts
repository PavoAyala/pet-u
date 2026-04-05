import { onValueDeleted } from "firebase-functions/v2/database";
import * as logger from "firebase-functions/logger";
import { getCalendarClient } from "../shared/calendar";
import { HOTEL_CALENDAR_ID } from "../shared/config";
import { decrementSlotCount } from "../shared/slots";

export const onReservationDeleted = onValueDeleted("/reservations/{pushId}", async (event) => {
  const reservation = event.data.val();

  if (reservation?.appointmentDate && reservation?.appointmentTime) {
    await decrementSlotCount(reservation.appointmentDate, reservation.appointmentTime);
  }

  const calendarEventId = reservation?.calendarEventId;
  const calendarIdUsed = reservation?.calendarIdUsed || HOTEL_CALENDAR_ID;

  if (!calendarEventId) return null;

  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: calendarIdUsed,
      eventId: calendarEventId,
    });
    logger.info(`[GOOGLE CALENDAR ÉXITO] Evento destruido: ${calendarEventId} del calendario ${calendarIdUsed}`);
  } catch (error) {
    logger.error("[ERROR GOOGLE CALENDAR] Fallo al borrar el evento:", error);
  }

  return null;
});
