import * as admin from "firebase-admin";

// Inicializar la app de Admin UNA SOLA VEZ aquí en el archivo raíz.
if (admin.apps.length === 0) {
  admin.initializeApp({
    databaseURL: "https://pet-u-fe87c-default-rtdb.firebaseio.com",
  });
}

// ============================================
// MODULOS DE FUNCIONES
// ============================================

// Exportamos todas las funciones dentro de la carpeta 'booking'
// Aparecerán en Firebase identificadas como 'booking-onNewReservation'
export * as booking from './booking';

// En el futuro puedes agregar más:
// export * as payments from './payments';
// export * as users from './users';
