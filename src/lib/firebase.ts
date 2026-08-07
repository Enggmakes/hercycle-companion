// Firebase configuration — reads strictly from environment variables (VITE_FIREBASE_*)
// Local development uses .env (ignored by git), Vercel uses Environment Variables configured in Vercel Dashboard.
export const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  databaseURL: import.meta.env["VITE_FIREBASE_DATABASE_URL"] ?? "",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] ?? "",
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] ?? "",
};

// When no Firebase project is configured, the app runs fully local-first
// (localStorage only) instead of crashing on auth/invalid-api-key.
export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId);
