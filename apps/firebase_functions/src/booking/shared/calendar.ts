import { google } from "googleapis";
import * as fs from "fs";
import { HOTEL_CALENDAR_ID, MONTERREY_TIMEZONE, SLOT_DURATION_MIN, VACUNAS_CALENDAR_ID } from "./config";
import type { ArrivalMode, HappyBusPayload, ReservationPayload } from "./types";

export function getCalendarClient() {
  const credentialsString = process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
  
  let certs;
  try {
    if (credentialsString.trim().startsWith("{")) {
      certs = JSON.parse(credentialsString);
    } else if (credentialsString) {
      certs = JSON.parse(fs.readFileSync(credentialsString, "utf8"));
    } else {
      throw new Error("No Google Calendar credentials found in environment variables.");
    }
  } catch (error) {
    console.error("Error parsing Google Calendar credentials:", error);
    throw error;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: certs.client_email,
      private_key: certs.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

export function getTargetCalendar(serviceType?: string) {
  return serviceType === "vacunas" ? VACUNAS_CALENDAR_ID : HOTEL_CALENDAR_ID;
}

export function normalizeHappyBus(happyBus?: HappyBusPayload) {
  const want = happyBus?.want === true || happyBus?.want === "true";
  return {
    want,
    zone: want ? happyBus?.zone || null : null,
    address: want ? happyBus?.address || null : null,
    lat: want ? Number(happyBus?.lat ?? 0) || null : null,
    lng: want ? Number(happyBus?.lng ?? 0) || null : null,
    cost: want ? Number(happyBus?.cost || 0) : 0,
  };
}

function buildSlotDate(date: string, time: string) {
  return new Date(`${date}T${time}:00-06:00`);
}

function addDaysToDateString(date: string, days: number) {
  const base = new Date(`${date}T12:00:00-06:00`);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function formatDisplayTime(time?: string | null) {
  if (!time) return null;
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function buildCalendarEvent(pushId: string, reservation: ReservationPayload & {
  arrivalMode: ArrivalMode;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
}) {
  const targetCalendar = getTargetCalendar(reservation.serviceType);
  const usesTimedAppointment = reservation.serviceType !== "hotel";
  const isSelfArrival = usesTimedAppointment && reservation.arrivalMode === "self_arrival" && reservation.appointmentDate && reservation.appointmentTime;
  const happyBus = normalizeHappyBus(reservation.happyBus);
  const isHappyBusAllDay = happyBus.want;
  const hotelCheckinTime = reservation.checkinTime || "11:00";
  const hotelCheckoutTime = reservation.checkoutTime || "10:00";

  const startDate = isSelfArrival
    ? buildSlotDate(reservation.appointmentDate!, reservation.appointmentTime!)
    : new Date(`${reservation.checkin}T${reservation.serviceType === "hotel" ? hotelCheckinTime : "11:00"}:00-06:00`);
  const endDate = isSelfArrival
    ? new Date(startDate.getTime() + SLOT_DURATION_MIN * 60 * 1000)
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
  } else if (reservation.serviceType === "hotel" && !happyBus.want) {
    descriptionLines.push(`🕒 Check-in: ${formatDisplayTime(hotelCheckinTime) || hotelCheckinTime}`);
    descriptionLines.push(`🕒 Check-out: ${formatDisplayTime(hotelCheckoutTime) || hotelCheckoutTime}`);
  } else if (happyBus.want) {
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
            timeZone: MONTERREY_TIMEZONE,
          }
        : {
            dateTime: startDate.toISOString(),
            timeZone: MONTERREY_TIMEZONE,
          },
      end: isHappyBusAllDay
        ? {
            date: addDaysToDateString(reservation.serviceType === "hotel" ? reservation.checkout || reservation.checkin : reservation.checkin, 1),
            timeZone: MONTERREY_TIMEZONE,
          }
        : {
            dateTime: endDate.toISOString(),
            timeZone: MONTERREY_TIMEZONE,
          },
    },
  };
}
