import { onValueCreated } from "firebase-functions/v2/database";
import * as logger from "firebase-functions/logger";
import { google } from "googleapis";

// ID del calendario de Google. Idealmente usa process.env.GOOGLE_CALENDAR_ID
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

// Trigger que se ejecuta cada vez que una nueva reserva cae en Realtime Database
export const onNewReservation = onValueCreated("/reservations/{pushId}", async (event) => {
  const reservation = event.data.val();
  const pushId = event.params.pushId;

  logger.info(`[NUEVA RESERVA] ID: ${pushId}`, { structuredData: true });
  logger.info(`> Cliente: ${reservation.ownerName}`);
  logger.info(`> Mascota: ${reservation.petName} (${reservation.petSize})`);
  logger.info(`> Fechas: ${reservation.checkin} -> ${reservation.checkout}`);
  logger.info(`> Cotización en RTDB: $${reservation.totalEstimado} MXN`);
  
  try {
    // El Emulador Firebase secuestra GoogleAuth. 
    // Usamos JWT puro y leemos el archivo nosotros para saltar el bloqueo:
    const fs = require('fs');
    const keyPath = process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
    const certs = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: certs.client_email,
        private_key: certs.private_key,
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Preparar evento (11am Check-in, 10am Check-out)
    const eventParams = {
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `HOGAR: ${reservation.petName} (${reservation.ownerName})`,
        description: `
🐶 Mascota: ${reservation.petName} (${reservation.petSize})
👤 Cliente: ${reservation.ownerName}
💰 Total Estimado: $${reservation.totalEstimado} MXN
📅 ID de Reserva: ${pushId}
        `,
        start: {
          dateTime: `${reservation.checkin}T11:00:00-06:00`,
          timeZone: "America/Monterrey",
        },
        end: {
          dateTime: `${reservation.checkout}T10:00:00-06:00`,
          timeZone: "America/Monterrey",
        },
      },
    };

    const response = await calendar.events.insert(eventParams);
    logger.info(`[GOOGLE CALENDAR EXITO] Evento creado: ${response.data.htmlLink}`);
    
    // Guardar el reference ID back al RTDB
    await event.data.ref.update({ calendarEventId: response.data.id });

  } catch (error) {
    logger.error(`[ERROR GOOGLE CALENDAR] Fallo al crear el evento`, error);
  }

  return null;
});
