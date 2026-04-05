import { onCall } from "firebase-functions/v2/https";
import { MAX_RESERVATIONS_PER_SLOT, SLOT_INTERVAL_MIN } from "../shared/config";
import { formatDisplayTime } from "../shared/calendar";
import { generateSlotsForDate, getSlotCounts, validateBookableDate } from "../shared/slots";

export const getAvailability = onCall(async (request) => {
  const date = String(request.data?.date || "");

  validateBookableDate(date);

  const slots = generateSlotsForDate(date);
  const counts = await getSlotCounts(date);

  return {
    date,
    slotIntervalMin: SLOT_INTERVAL_MIN,
    maxReservationsPerSlot: MAX_RESERVATIONS_PER_SLOT,
    slots: slots.map((time) => ({
      time,
      label: formatDisplayTime(time),
      reservedCount: Number(counts[time] || 0),
      available: Number(counts[time] || 0) < MAX_RESERVATIONS_PER_SLOT,
    })),
  };
});
