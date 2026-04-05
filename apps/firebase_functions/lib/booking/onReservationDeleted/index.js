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
exports.onReservationDeleted = void 0;
const database_1 = require("firebase-functions/v2/database");
const logger = __importStar(require("firebase-functions/logger"));
const calendar_1 = require("../shared/calendar");
const config_1 = require("../shared/config");
const slots_1 = require("../shared/slots");
exports.onReservationDeleted = (0, database_1.onValueDeleted)("/reservations/{pushId}", async (event) => {
    const reservation = event.data.val();
    if ((reservation === null || reservation === void 0 ? void 0 : reservation.appointmentDate) && (reservation === null || reservation === void 0 ? void 0 : reservation.appointmentTime)) {
        await (0, slots_1.decrementSlotCount)(reservation.appointmentDate, reservation.appointmentTime);
    }
    const calendarEventId = reservation === null || reservation === void 0 ? void 0 : reservation.calendarEventId;
    const calendarIdUsed = (reservation === null || reservation === void 0 ? void 0 : reservation.calendarIdUsed) || config_1.HOTEL_CALENDAR_ID;
    if (!calendarEventId)
        return null;
    try {
        const calendar = (0, calendar_1.getCalendarClient)();
        await calendar.events.delete({
            calendarId: calendarIdUsed,
            eventId: calendarEventId,
        });
        logger.info(`[GOOGLE CALENDAR ÉXITO] Evento destruido: ${calendarEventId} del calendario ${calendarIdUsed}`);
    }
    catch (error) {
        logger.error("[ERROR GOOGLE CALENDAR] Fallo al borrar el evento:", error);
    }
    return null;
});
//# sourceMappingURL=index.js.map