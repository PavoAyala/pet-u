import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAUxDf0vZMM0v4YRzuFiZcIabezjgDyerQ",
  authDomain: "pet-u-fe87c.firebaseapp.com",
  projectId: "pet-u-fe87c",
  storageBucket: "pet-u-fe87c.firebasestorage.app",
  messagingSenderId: "636517114119",
  appId: "1:636517114119:web:b642d82fdb291d999d25a2",
  measurementId: "G-XQVFNSWM9B"
};

// Initialize Firebase efficiently for SSR/Client
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Detectar si estamos en un entorno de desarrollo (cliente o servidor)
const isDev = 
  (globalThis.window !== undefined && (globalThis.window.location.hostname === 'localhost' || globalThis.window.location.hostname === '127.0.0.1')) ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');

if (isDev) {
  console.log('--- CONECTANDO A EMULADORES DE FIREBASE ---');
  // En el servidor (SSR), usamos la IP interna o localhost
  const host = '127.0.0.1';
  connectFirestoreEmulator(db, host, 8080);
  connectAuthEmulator(auth, `http://${host}:9099`);
}

let analyticsInstance: any = null;
if (globalThis.window !== undefined) {
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
  }
}

export const analytics = analyticsInstance;

export { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  Timestamp,
  type DocumentData 
} from 'firebase/firestore';

export * from './types';
export type { Product } from './types';

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User
} from 'firebase/auth';
