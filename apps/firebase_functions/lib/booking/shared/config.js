"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_RESERVATIONS_PER_SLOT = exports.SLOT_DURATION_MIN = exports.SLOT_INTERVAL_MIN = exports.MONTERREY_TIMEZONE = exports.VACUNAS_CALENDAR_ID = exports.HOTEL_CALENDAR_ID = void 0;
exports.HOTEL_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
exports.VACUNAS_CALENDAR_ID = process.env.VACUNAS_CALENDAR_ID || exports.HOTEL_CALENDAR_ID;
exports.MONTERREY_TIMEZONE = "America/Monterrey";
exports.SLOT_INTERVAL_MIN = 30;
exports.SLOT_DURATION_MIN = 30;
// Future change point: raise this value to allow more than one reservation per slot.
exports.MAX_RESERVATIONS_PER_SLOT = 1;
//# sourceMappingURL=config.js.map