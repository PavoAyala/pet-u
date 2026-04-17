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
exports.getCalendarClient = getCalendarClient;
exports.getTargetCalendar = getTargetCalendar;
exports.normalizeHappyBus = normalizeHappyBus;
exports.formatDisplayTime = formatDisplayTime;
exports.buildCalendarEvent = buildCalendarEvent;
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
const config_1 = require("./config");
function getCalendarClient() {
    const credentialsString = process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
    let certs;
    try {
        if (credentialsString.trim().startsWith("{")) {
            certs = JSON.parse(credentialsString);
        }
        else if (credentialsString) {
            certs = JSON.parse(fs.readFileSync(credentialsString, "utf8"));
        }
        else {
            throw new Error("No Google Calendar credentials found in environment variables.");
        }
    }
    catch (error) {
        console.error("Error parsing Google Calendar credentials:", error);
        throw error;
    }
    const auth = new googleapis_1.google.auth.GoogleAuth({
        credentials: {
            client_email: certs.client_email,
            private_key: certs.private_key,
        },
        scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    return googleapis_1.google.calendar({ version: "v3", auth });
}
function getTargetCalendar(serviceType) {
    return serviceType === "vacunas" ? config_1.VACUNAS_CALENDAR_ID : config_1.HOTEL_CALENDAR_ID;
}
function normalizeHappyBus(happyBus) {
    var _a, _b;
    const want = (happyBus === null || happyBus === void 0 ? void 0 : happyBus.want) === true || (happyBus === null || happyBus === void 0 ? void 0 : happyBus.want) === "true";
    return {
        want,
        zone: want ? (happyBus === null || happyBus === void 0 ? void 0 : happyBus.zone) || null : null,
        address: want ? (happyBus === null || happyBus === void 0 ? void 0 : happyBus.address) || null : null,
        lat: want ? Number((_a = happyBus === null || happyBus === void 0 ? void 0 : happyBus.lat) !== null && _a !== void 0 ? _a : 0) || null : null,
        lng: want ? Number((_b = happyBus === null || happyBus === void 0 ? void 0 : happyBus.lng) !== null && _b !== void 0 ? _b : 0) || null : null,
        cost: want ? Number((happyBus === null || happyBus === void 0 ? void 0 : happyBus.cost) || 0) : 0,
    };
}
function buildSlotDate(date, time) {
    return new Date(`${date}T${time}:00-06:00`);
}
function addDaysToDateString(date, days) {
    const base = new Date(`${date}T12:00:00-06:00`);
    base.setDate(base.getDate() + days);
    return base.toISOString().slice(0, 10);
}
function formatDisplayTime(time) {
    if (!time)
        return null;
    const [hourString, minuteString] = time.split(":");
    const hour = Number(hourString);
    const minute = Number(minuteString);
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 || 12;
    return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
function buildCalendarEvent(pushId, reservation) {
    const targetCalendar = getTargetCalendar(reservation.serviceType);
    const usesTimedAppointment = reservation.serviceType !== "hotel";
    const isSelfArrival = usesTimedAppointment && reservation.arrivalMode === "self_arrival" && reservation.appointmentDate && reservation.appointmentTime;
    const happyBus = normalizeHappyBus(reservation.happyBus);
    const isHappyBusAllDay = happyBus.want;
    const hotelCheckinTime = reservation.checkinTime || "11:00";
    const hotelCheckoutTime = reservation.checkoutTime || "10:00";
    const startDate = isSelfArrival
        ? buildSlotDate(reservation.appointmentDate, reservation.appointmentTime)
        : new Date(`${reservation.checkin}T${reservation.serviceType === "hotel" ? hotelCheckinTime : "11:00"}:00-06:00`);
    const endDate = isSelfArrival
        ? new Date(startDate.getTime() + config_1.SLOT_DURATION_MIN * 60 * 1000)
        : new Date(`${reservation.checkout || reservation.checkin}T${reservation.serviceType === "hotel" ? hotelCheckoutTime : "10:00"}:00-06:00`);
    const descriptionLines = [
        `🐶 Mascota: ${reservation.petName} (${reservation.petSize || "Sin tamaño"})`,
        `👤 Cliente: ${reservation.ownerName}`,
        `🛠️ Servicio: ${reservation.serviceType || "hotel"}`,
    ];
    if (reservation.vaccineType && reservation.vaccineType !== "n/a") {
        descriptionLines.push(`💉 Vacuna: ${reservation.vaccineType}`);
    }
    if (isSelfArrival) {
        descriptionLines.push(`🕒 Hora seleccionada: ${formatDisplayTime(reservation.appointmentTime)}`);
    }
    else if (reservation.serviceType === "hotel" && !happyBus.want) {
        descriptionLines.push(`🕒 Check-in: ${formatDisplayTime(hotelCheckinTime) || hotelCheckinTime}`);
        descriptionLines.push(`🕒 Check-out: ${formatDisplayTime(hotelCheckoutTime) || hotelCheckoutTime}`);
    }
    else if (happyBus.want) {
        descriptionLines.push(`🚌 Happy Bus: ${happyBus.zone || "Sin zona"} (${happyBus.address || "Ubicación seleccionada en mapa"})`);
    }
    descriptionLines.push(`💰 Total Estimado: $${reservation.totalEstimado || 0} MXN`);
    descriptionLines.push(`📅 ID de Reserva: ${pushId}`);
    return {
        targetCalendar,
        requestBody: {
            summary: `${(reservation.serviceType || "HOGAR").toUpperCase()}: ${reservation.petName} (${reservation.ownerName})`,
            description: descriptionLines.join("\n"),
            start: isHappyBusAllDay
                ? {
                    date: reservation.checkin,
                    timeZone: config_1.MONTERREY_TIMEZONE,
                }
                : {
                    dateTime: startDate.toISOString(),
                    timeZone: config_1.MONTERREY_TIMEZONE,
                },
            end: isHappyBusAllDay
                ? {
                    date: addDaysToDateString(reservation.serviceType === "hotel" ? reservation.checkout || reservation.checkin : reservation.checkin, 1),
                    timeZone: config_1.MONTERREY_TIMEZONE,
                }
                : {
                    dateTime: endDate.toISOString(),
                    timeZone: config_1.MONTERREY_TIMEZONE,
                },
        },
    };
}
//# sourceMappingURL=calendar.js.map