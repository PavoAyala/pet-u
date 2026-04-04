import { onValueCreated, onValueDeleted } from "firebase-functions/v2/database";
import * as logger from "firebase-functions/logger";
import { google } from "googleapis";
import * as fs from "fs";

// ID del calendario de Google. 
const HOTEL_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
const VACUNAS_CALENDAR_ID = process.env.VACUNAS_CALENDAR_ID || HOTEL_CALENDAR_ID;

// Función centralizada para burlar al emulador y conectarse directo al JSON
function getCalendarClient() {
  const keyPath = process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
  const certs = JSON.parse(fs.readFileSync(keyPath, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: certs.client_email,
      private_key: certs.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

// ============================================
// 🌟 TRIGGER: CREACIÓN DE EVENTO
// ============================================
export const onNewReservation = onValueCreated("/reservations/{pushId}", async (event) => {
  const reservation = event.data.val();
  const pushId = event.params.pushId;

  // Determinar calendario destino
  const targetCalendar = reservation.serviceType === 'vacunas' ? VACUNAS_CALENDAR_ID : HOTEL_CALENDAR_ID;

  logger.info(`[NUEVA RESERVA] ID: ${pushId} (Servicio: ${reservation.serviceType || 'hotel'})`, { structuredData: true });
  
  try {
    const calendar = getCalendarClient();

    const eventParams = {
      calendarId: targetCalendar,
      requestBody: {
        summary: `${(reservation.serviceType || 'HOGAR').toUpperCase()}: ${reservation.petName} (${reservation.ownerName})`,
        description: `
🐶 Mascota: ${reservation.petName} (${reservation.petSize || 'Sin tamaño'})
👤 Cliente: ${reservation.ownerName}
🛠️ Servicio: ${reservation.serviceType || 'hotel'}
${reservation.vaccineType && reservation.vaccineType !== 'n/a' ? `💉 Vacuna: ${reservation.vaccineType}\n` : ''}💰 Total Estimado: $${reservation.totalEstimado || 0} MXN
📅 ID de Reserva: ${pushId}
        `.trim(),
        start: {
          dateTime: `${reservation.checkin}T11:00:00-06:00`,
          timeZone: "America/Monterrey",
        },
        end: {
          dateTime: `${reservation.checkout || reservation.checkin}T10:00:00-06:00`,
          timeZone: "America/Monterrey",
        },
      },
    };

    const response: any = await calendar.events.insert(eventParams);
    logger.info(`[GOOGLE CALENDAR ÉXITO] Evento creado en ${targetCalendar}: ${response.data.id}`);
    
    await event.data.ref.update({ 
        calendarEventId: response.data.id,
        calendarIdUsed: targetCalendar 
    });

  } catch (error) {
    logger.error(`[ERROR GOOGLE CALENDAR] Fallo al crear el evento`, error);
  }

  return null;
});

export const onReservationDeleted = onValueDeleted("/reservations/{pushId}", async (event) => {
  const reservation = event.data.val();
  // const pushId = event.params.pushId;

  const calendarEventId = reservation.calendarEventId;
  const calendarIdUsed = reservation.calendarIdUsed || HOTEL_CALENDAR_ID;
  
  if (!calendarEventId) return null;

  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: calendarIdUsed,
      eventId: calendarEventId,
    });
    logger.info(`[GOOGLE CALENDAR ÉXITO] Evento destruido: ${calendarEventId} del calendario ${calendarIdUsed}`);
  } catch (error) {
    logger.error(`[ERROR GOOGLE CALENDAR] Fallo al borrar el evento:`, error);
  }

  return null;
});
