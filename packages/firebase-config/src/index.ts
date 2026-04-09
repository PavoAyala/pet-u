import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, getDoc, setDoc } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getDatabase,
  connectDatabaseEmulator,
  type Database,
} from "firebase/database";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";

// Ensure side-effects are loaded for service registration
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAUxDf0vZMM0v4YRzuFiZcIabezjgDyerQ",
  authDomain: "pet-u-fe87c.firebaseapp.com",
  projectId: "pet-u-fe87c",
  databaseURL: "https://pet-u-fe87c-default-rtdb.firebaseio.com",
  storageBucket: "pet-u-fe87c.firebasestorage.app",
  messagingSenderId: "636517114119",
  appId: "1:636517114119:web:b642d82fdb291d999d25a2",
  measurementId: "G-XQVFNSWM9B",
};

// Initialize Firebase efficiently for SSR/Client
export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const isBrowser = typeof window !== "undefined";

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Detectar si estamos en un entorno de desarrollo (cliente o servidor)
const isDev =
  (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")) ||
  (typeof globalThis !== "undefined" && 
   // @ts-ignore
   globalThis.process?.env?.NODE_ENV === "development");

// Lazy initialization for Realtime Database to avoid issues during SSR
let rtdbInstance: Database | undefined;
export function getRtdb(): Database | undefined {
  if (!isBrowser) return undefined;
  if (!rtdbInstance) {
    rtdbInstance = getDatabase(app);
    if (isDev) {
      connectDatabaseEmulator(rtdbInstance, "127.0.0.1", 9000);
    }
  }
  return rtdbInstance;
}

if (isDev) {
  console.log("--- CONECTANDO A EMULADORES DE FIREBASE ---");
  const host = "127.0.0.1";
  connectFirestoreEmulator(db, host, 8080);
  connectAuthEmulator(auth, `http://${host}:9099`);
  connectFunctionsEmulator(functions, host, 5001);
}

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
if (isBrowser) {
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
  }
}

export const analytics = analyticsInstance;

export {
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";

export { httpsCallable } from "firebase/functions";

export * from "./types";
export type { Product } from "./types";

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";

export {
  ref,
  push,
  set,
  get,
  onValue,
  onChildAdded,
  remove,
  update,
  child,
} from "firebase/database";
