// Firebase configuration — reads from environment variables in production (Vercel),
// falls back to hardcoded values for local development.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAToailfH685tDZl71xXiRgn-ZFwrpJOmY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "hercycle-7a116.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "https://hercycle-7a116-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "hercycle-7a116",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "hercycle-7a116.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "372732672252",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:372732672252:web:3f1742e6eb0fc5bf08bf79",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-PLW1B2R4QN",
};
