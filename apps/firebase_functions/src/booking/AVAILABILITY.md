# Booking Availability

Las reglas principales de disponibilidad viven en [index.ts](/home/robertoayala/Documentos/VS_CodeLocal/pet-u/apps/firebase_functions/src/booking/index.ts).

Cambios rápidos a futuro:

- `MAX_RESERVATIONS_PER_SLOT`
  - Capacidad por horario. Hoy está en `1`.
- `SLOT_INTERVAL_MIN`
  - Intervalo entre horarios publicados.
- `SLOT_DURATION_MIN`
  - Duración base que se usa al crear el evento en Google Calendar.
- `getOperatingHoursForDate()`
  - Define horario de lunes a viernes y sábado.
- `getTomorrowDateString()`
  - Define la anticipación mínima.

Notas:

- La disponibilidad se resuelve en backend para evitar conflictos de carrera.
- El bloqueo del slot se guarda en RTDB bajo `appointmentSlots/{date}/{time}`.
- Google Calendar sigue siendo el espejo del evento creado, pero la capacidad por slot se controla desde backend.
