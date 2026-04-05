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
exports.createReservation = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const calendar_1 = require("../shared/calendar");
const config_1 = require("../shared/config");
const slots_1 = require("../shared/slots");
exports.createReservation = (0, https_1.onCall)(async (request) => {
    const payload = request.data;
    if (!(payload === null || payload === void 0 ? void 0 : payload.serviceType) || !(payload === null || payload === void 0 ? void 0 : payload.petName) || !(payload === null || payload === void 0 ? void 0 : payload.ownerName) || !(payload === null || payload === void 0 ? void 0 : payload.checkin)) {
        throw new https_1.HttpsError("invalid-argument", "Faltan datos obligatorios para crear la reservación.");
    }
    (0, slots_1.validateBookableDate)(payload.checkin);
    const happyBus = (0, calendar_1.normalizeHappyBus)(payload.happyBus);
    const arrivalMode = happyBus.want ? "happy_bus" : "self_arrival";
    const usesTimedAppointment = payload.serviceType !== "hotel";
    if (usesTimedAppointment && arrivalMode === "self_arrival" && !payload.appointmentTime) {
        throw new https_1.HttpsError("failed-precondition", "Selecciona una hora disponible antes de confirmar.");
    }
    if (usesTimedAppointment && arrivalMode === "self_arrival" && !(0, slots_1.generateSlotsForDate)(payload.checkin).includes(payload.appointmentTime)) {
        throw new https_1.HttpsError("failed-precondition", "La hora seleccionada no está disponible para ese día.");
    }
    let slotLocked = false;
    const appointmentDate = usesTimedAppointment && arrivalMode === "self_arrival" ? payload.checkin : null;
    const appointmentTime = usesTimedAppointment && arrivalMode === "self_arrival" ? payload.appointmentTime || null : null;
    try {
        if (usesTimedAppointment && arrivalMode === "self_arrival" && appointmentDate && appointmentTime) {
            await (0, slots_1.reserveSlotOrThrow)(appointmentDate, appointmentTime);
            slotLocked = true;
        }
        const reservationRef = admin.database().ref("reservations").push();
        const pushId = reservationRef.key;
        if (!pushId) {
            throw new https_1.HttpsError("internal", "No fue posible generar el identificador de la reservación.");
        }
        const calendar = (0, calendar_1.getCalendarClient)();
        const eventParams = (0, calendar_1.buildCalendarEvent)(pushId, Object.assign(Object.assign({}, payload), { arrivalMode,
            appointmentDate,
            appointmentTime,
            happyBus }));
        const response = await calendar.events.insert({
            calendarId: eventParams.targetCalendar,
            requestBody: eventParams.requestBody,
        });
        const reservationData = {
            serviceType: payload.serviceType,
            petName: payload.petName,
            ownerName: payload.ownerName,
            petSize: payload.petSize || null,
            vaccineType: payload.serviceType === "vacunas" ? payload.vaccineType || null : null,
            happyBus,
            checkin: payload.checkin,
            checkout: payload.serviceType === "hotel" ? payload.checkout || payload.checkin : payload.checkin,
            mandatoryBathCost: Number(payload.mandatoryBathCost || 0),
            totalEstimado: Number(payload.totalEstimado || 0),
            status: "pending",
            createdAt: new Date().toISOString(),
            checkinTime: payload.serviceType === "hotel" && !happyBus.want ? payload.checkinTime || null : null,
            checkoutTime: payload.serviceType === "hotel" && !happyBus.want ? payload.checkoutTime || null : null,
            arrivalMode,
            appointmentDate,
            appointmentTime,
            appointmentDurationMin: usesTimedAppointment && arrivalMode === "self_arrival" ? config_1.SLOT_DURATION_MIN : null,
            appointmentSlotKey: appointmentDate && appointmentTime ? `${appointmentDate}/${appointmentTime}` : null,
            calendarEventId: response.data.id,
            calendarIdUsed: eventParams.targetCalendar,
        };
        await reservationRef.set(reservationData);
        logger.info(`[GOOGLE CALENDAR ÉXITO] Evento creado en ${eventParams.targetCalendar}: ${response.data.id}`);
        return {
            reservationId: pushId,
            calendarEventId: response.data.id,
        };
    }
    catch (error) {
        if (slotLocked) {
            await (0, slots_1.decrementSlotCount)(appointmentDate, appointmentTime);
        }
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        logger.error("[ERROR RESERVATION CREATE] No se pudo crear la reservación", error);
        throw new https_1.HttpsError("internal", "No fue posible crear la reservación en este momento.");
    }
});
//# sourceMappingURL=index.js.map