import { HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { MAX_RESERVATIONS_PER_SLOT, MONTERREY_TIMEZONE, SLOT_INTERVAL_MIN } from "./config";

function getDatePartsInTimezone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MONTERREY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

export function getTomorrowDateString() {
  const { year, month, day } = getDatePartsInTimezone(new Date());
  const tomorrow = new Date(Date.UTC(year, month - 1, day));
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getOperatingHoursForDate(date: string) {
  const localDate = new Date(`${date}T12:00:00-06:00`);
  const day = localDate.getUTCDay();

  if (day === 0) return null;
  if (day === 6) return { start: "08:00", end: "16:00" };
  return { start: "08:00", end: "19:00" };
}

export function generateSlotsForDate(date: string) {
  const hours = getOperatingHoursForDate(date);
  if (!hours) return [];

  const [startHour, startMinute] = hours.start.split(":").map(Number);
  const [endHour, endMinute] = hours.end.split(":").map(Number);
  const slots: string[] = [];

  const current = new Date(Date.UTC(2000, 0, 1, startHour, startMinute));
  const end = new Date(Date.UTC(2000, 0, 1, endHour, endMinute));

  while (current <= end) {
    const hour = String(current.getUTCHours()).padStart(2, "0");
    const minute = String(current.getUTCMinutes()).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    current.setUTCMinutes(current.getUTCMinutes() + SLOT_INTERVAL_MIN);
  }

  return slots;
}

export function validateBookableDate(date: string) {
  if (!isValidDateString(date)) {
    throw new HttpsError("invalid-argument", "La fecha seleccionada no es válida.");
  }

  if (date < getTomorrowDateString()) {
    throw new HttpsError("failed-precondition", "Las reservaciones deben hacerse con al menos 1 día de anticipación.");
  }

  if (!getOperatingHoursForDate(date)) {
    throw new HttpsError("failed-precondition", "No hay reservaciones disponibles para la fecha seleccionada.");
  }
}

export async function decrementSlotCount(date?: string | null, time?: string | null) {
  if (!date || !time) return;
  const slotRef = admin.database().ref(`appointmentSlots/${date}/${time}`);

  await slotRef.transaction((current) => {
    const count = Number(current || 0);
    if (count <= 1) return null;
    return count - 1;
  });
}

export async function getSlotCounts(date: string) {
  const snapshot = await admin.database().ref(`appointmentSlots/${date}`).get();
  return (snapshot.val() || {}) as Record<string, number>;
}

export async function reserveSlotOrThrow(date: string, time: string) {
  const slotRef = admin.database().ref(`appointmentSlots/${date}/${time}`);
  const txResult = await slotRef.transaction((current) => {
    const count = Number(current || 0);
    if (count >= MAX_RESERVATIONS_PER_SLOT) return;
    return count + 1;
  });

  if (!txResult.committed) {
    throw new HttpsError("already-exists", "La hora seleccionada ya fue apartada. Elige otra.");
  }
}
