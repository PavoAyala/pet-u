import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, analytics };
