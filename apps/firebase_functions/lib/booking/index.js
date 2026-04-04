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
exports.onReservationDeleted = exports.onNewReservation = void 0;
const database_1 = require("firebase-functions/v2/database");
const logger = __importStar(require("firebase-functions/logger"));
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
// ID del calendario de Google. 
const HOTEL_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
const VACUNAS_CALENDAR_ID = process.env.VACUNAS_CALENDAR_ID || HOTEL_CALENDAR_ID;
// Función centralizada para burlar al emulador y conectarse directo al JSON
function getCalendarClient() {
    const keyPath = process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
    const certs = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    const auth = new googleapis_1.google.auth.GoogleAuth({
        credentials: {
            client_email: certs.client_email,
            private_key: certs.private_key,
        },
        scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    return googleapis_1.google.calendar({ version: "v3", auth });
}
// ============================================
// 🌟 TRIGGER: CREACIÓN DE EVENTO
// ============================================
exports.onNewReservation = (0, database_1.onValueCreated)("/reservations/{pushId}", async (event) => {
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
        const response = await calendar.events.insert(eventParams);
        logger.info(`[GOOGLE CALENDAR ÉXITO] Evento creado en ${targetCalendar}: ${response.data.id}`);
        await event.data.ref.update({
            calendarEventId: response.data.id,
            calendarIdUsed: targetCalendar
        });
    }
    catch (error) {
        logger.error(`[ERROR GOOGLE CALENDAR] Fallo al crear el evento`, error);
    }
    return null;
});
exports.onReservationDeleted = (0, database_1.onValueDeleted)("/reservations/{pushId}", async (event) => {
    const reservation = event.data.val();
    // const pushId = event.params.pushId;
    const calendarEventId = reservation.calendarEventId;
    const calendarIdUsed = reservation.calendarIdUsed || HOTEL_CALENDAR_ID;
    if (!calendarEventId)
        return null;
    try {
        const calendar = getCalendarClient();
        await calendar.events.delete({
            calendarId: calendarIdUsed,
            eventId: calendarEventId,
        });
        logger.info(`[GOOGLE CALENDAR ÉXITO] Evento destruido: ${calendarEventId} del calendario ${calendarIdUsed}`);
    }
    catch (error) {
        logger.error(`[ERROR GOOGLE CALENDAR] Fallo al borrar el evento:`, error);
    }
    return null;
});
//# sourceMappingURL=index.js.map