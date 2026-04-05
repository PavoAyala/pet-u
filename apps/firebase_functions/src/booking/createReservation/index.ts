import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { buildCalendarEvent, getCalendarClient, normalizeHappyBus } from "../shared/calendar";
import { SLOT_DURATION_MIN } from "../shared/config";
import { decrementSlotCount, generateSlotsForDate, reserveSlotOrThrow, validateBookableDate } from "../shared/slots";
import type { ArrivalMode, ReservationPayload } from "../shared/types";

export const createReservation = onCall(async (request) => {
  const payload = request.data as ReservationPayload;

  if (!payload?.serviceType || !payload?.petName || !payload?.ownerName || !payload?.checkin) {
    throw new HttpsError("invalid-argument", "Faltan datos obligatorios para crear la reservación.");
  }

  validateBookableDate(payload.checkin);

  const happyBus = normalizeHappyBus(payload.happyBus);
  const arrivalMode: ArrivalMode = happyBus.want ? "happy_bus" : "self_arrival";
  const usesTimedAppointment = payload.serviceType !== "hotel";

  if (usesTimedAppointment && arrivalMode === "self_arrival" && !payload.appointmentTime) {
    throw new HttpsError("failed-precondition", "Selecciona una hora disponible antes de confirmar.");
  }

  if (usesTimedAppointment && arrivalMode === "self_arrival" && !generateSlotsForDate(payload.checkin).includes(payload.appointmentTime!)) {
    throw new HttpsError("failed-precondition", "La hora seleccionada no está disponible para ese día.");
  }

  let slotLocked = false;
  const appointmentDate = usesTimedAppointment && arrivalMode === "self_arrival" ? payload.checkin : null;
  const appointmentTime = usesTimedAppointment && arrivalMode === "self_arrival" ? payload.appointmentTime || null : null;

  try {
    if (usesTimedAppointment && arrivalMode === "self_arrival" && appointmentDate && appointmentTime) {
      await reserveSlotOrThrow(appointmentDate, appointmentTime);
      slotLocked = true;
    }

    const reservationRef = admin.database().ref("reservations").push();
    const pushId = reservationRef.key;

    if (!pushId) {
      throw new HttpsError("internal", "No fue posible generar el identificador de la reservación.");
    }

    const calendar = getCalendarClient();
    const eventParams = buildCalendarEvent(pushId, {
      ...payload,
      arrivalMode,
      appointmentDate,
      appointmentTime,
      happyBus,
    });

    const response: any = await calendar.events.insert({
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
      appointmentDurationMin: usesTimedAppointment && arrivalMode === "self_arrival" ? SLOT_DURATION_MIN : null,
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
  } catch (error) {
    if (slotLocked) {
      await decrementSlotCount(appointmentDate, appointmentTime);
    }

    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error("[ERROR RESERVATION CREATE] No se pudo crear la reservación", error);
    throw new HttpsError("internal", "No fue posible crear la reservación en este momento.");
  }
});
