import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD_60yCFTxfiiaRZpLDaonu7h7vz40e86I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "highonyou.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "highonyou",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "highonyou.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "552619953683",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:552619953683:web:26e0f1793c85fbf73af9e6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HM32F5382K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics conditionally
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.debug("Firebase Analytics not supported in this environment:", err);
  });
}

export default app;

