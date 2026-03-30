"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewReservation = void 0;
const database_1 = require("firebase-functions/v2/database");
const logger = __importStar(require("firebase-functions/logger"));
const googleapis_1 = require("googleapis");
// ID del calendario de Google. Idealmente usa process.env.GOOGLE_CALENDAR_ID
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
// Trigger que se ejecuta cada vez que una nueva reserva cae en Realtime Database
exports.onNewReservation = (0, database_1.onValueCreated)("/reservations/{pushId}", async (event) => {
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
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: certs.client_email,
                private_key: certs.private_key,
            },
            scopes: ["https://www.googleapis.com/auth/calendar"],
        });
        const calendar = googleapis_1.google.calendar({ version: "v3", auth });
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
    }
    catch (error) {
        logger.error(`[ERROR GOOGLE CALENDAR] Fallo al crear el evento`, error);
    }
    return null;
});
//# sourceMappingURL=index.js.map