"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = void 0;
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../shared/config");
const calendar_1 = require("../shared/calendar");
const slots_1 = require("../shared/slots");
exports.getAvailability = (0, https_1.onCall)(async (request) => {
    var _a;
    const date = String(((_a = request.data) === null || _a === void 0 ? void 0 : _a.date) || "");
    (0, slots_1.validateBookableDate)(date);
    const slots = (0, slots_1.generateSlotsForDate)(date);
    const counts = await (0, slots_1.getSlotCounts)(date);
    return {
        date,
        slotIntervalMin: config_1.SLOT_INTERVAL_MIN,
        maxReservationsPerSlot: config_1.MAX_RESERVATIONS_PER_SLOT,
        slots: slots.map((time) => ({
            time,
            label: (0, calendar_1.formatDisplayTime)(time),
            reservedCount: Number(counts[time] || 0),
            available: Number(counts[time] || 0) < config_1.MAX_RESERVATIONS_PER_SLOT,
        })),
    };
});
//# sourceMappingURL=index.js.map