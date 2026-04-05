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
exports.getTomorrowDateString = getTomorrowDateString;
exports.isValidDateString = isValidDateString;
exports.getOperatingHoursForDate = getOperatingHoursForDate;
exports.generateSlotsForDate = generateSlotsForDate;
exports.validateBookableDate = validateBookableDate;
exports.decrementSlotCount = decrementSlotCount;
exports.getSlotCounts = getSlotCounts;
exports.reserveSlotOrThrow = reserveSlotOrThrow;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const config_1 = require("./config");
function getDatePartsInTimezone(date) {
    var _a, _b, _c;
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: config_1.MONTERREY_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const year = Number((_a = parts.find((part) => part.type === "year")) === null || _a === void 0 ? void 0 : _a.value);
    const month = Number((_b = parts.find((part) => part.type === "month")) === null || _b === void 0 ? void 0 : _b.value);
    const day = Number((_c = parts.find((part) => part.type === "day")) === null || _c === void 0 ? void 0 : _c.value);
    return { year, month, day };
}
function getTomorrowDateString() {
    const { year, month, day } = getDatePartsInTimezone(new Date());
    const tomorrow = new Date(Date.UTC(year, month - 1, day));
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
}
function isValidDateString(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function getOperatingHoursForDate(date) {
    const localDate = new Date(`${date}T12:00:00-06:00`);
    const day = localDate.getUTCDay();
    if (day === 0)
        return null;
    if (day === 6)
        return { start: "08:00", end: "16:00" };
    return { start: "08:00", end: "19:00" };
}
function generateSlotsForDate(date) {
    const hours = getOperatingHoursForDate(date);
    if (!hours)
        return [];
    const [startHour, startMinute] = hours.start.split(":").map(Number);
    const [endHour, endMinute] = hours.end.split(":").map(Number);
    const slots = [];
    const current = new Date(Date.UTC(2000, 0, 1, startHour, startMinute));
    const end = new Date(Date.UTC(2000, 0, 1, endHour, endMinute));
    while (current <= end) {
        const hour = String(current.getUTCHours()).padStart(2, "0");
        const minute = String(current.getUTCMinutes()).padStart(2, "0");
        slots.push(`${hour}:${minute}`);
        current.setUTCMinutes(current.getUTCMinutes() + config_1.SLOT_INTERVAL_MIN);
    }
    return slots;
}
function validateBookableDate(date) {
    if (!isValidDateString(date)) {
        throw new https_1.HttpsError("invalid-argument", "La fecha seleccionada no es válida.");
    }
    if (date < getTomorrowDateString()) {
        throw new https_1.HttpsError("failed-precondition", "Las reservaciones deben hacerse con al menos 1 día de anticipación.");
    }
    if (!getOperatingHoursForDate(date)) {
        throw new https_1.HttpsError("failed-precondition", "No hay reservaciones disponibles para la fecha seleccionada.");
    }
}
async function decrementSlotCount(date, time) {
    if (!date || !time)
        return;
    const slotRef = admin.database().ref(`appointmentSlots/${date}/${time}`);
    await slotRef.transaction((current) => {
        const count = Number(current || 0);
        if (count <= 1)
            return null;
        return count - 1;
    });
}
async function getSlotCounts(date) {
    const snapshot = await admin.database().ref(`appointmentSlots/${date}`).get();
    return (snapshot.val() || {});
}
async function reserveSlotOrThrow(date, time) {
    const slotRef = admin.database().ref(`appointmentSlots/${date}/${time}`);
    const txResult = await slotRef.transaction((current) => {
        const count = Number(current || 0);
        if (count >= config_1.MAX_RESERVATIONS_PER_SLOT)
            return;
        return count + 1;
    });
    if (!txResult.committed) {
        throw new https_1.HttpsError("already-exists", "La hora seleccionada ya fue apartada. Elige otra.");
    }
}
//# sourceMappingURL=slots.js.map