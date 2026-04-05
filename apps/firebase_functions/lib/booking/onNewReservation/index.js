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
exports.onNewReservation = (0, database_1.onValueCreated)("/reservations/{pushId}", async (event) => {
    const pushId = event.params.pushId;
    // Legacy trigger intentionally disabled.
    // Reservations are now created through booking-createReservation, which already:
    // 1. validates availability,
    // 2. creates the Google Calendar event,
    // 3. stores calendarEventId in RTDB.
    // Recreating the event here would duplicate entries in Google Calendar.
    logger.info(`[RESERVATION TRIGGER OMITIDO] ID: ${pushId}`, { structuredData: true });
    return null;
});
//# sourceMappingURL=index.js.map