import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export const FIRESTORE_DATABASE_ID =
  import.meta.env.PUBLIC_FIRESTORE_DATABASE_ID || "(default)";

// Local and OSS runs talk to the Firebase emulators, like the API and the app do.
const EMULATOR_HOST = import.meta.env.PUBLIC_FIREBASE_EMULATOR_HOST;
let emulatorsConnected = false;

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.authDomain);
}

function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(config);
}

// Auth keeps its session in IndexedDB, so a passenger signs in once per browser.
export function firebaseAuth(): Auth {
  const auth = getAuth(firebaseApp());
  auth.languageCode = "es";
  if (EMULATOR_HOST && !auth.emulatorConfig) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
  }
  return auth;
}

export async function rideDocument(rideId: string) {
  const { connectFirestoreEmulator, doc, getFirestore } = await import("firebase/firestore");
  const firestore = getFirestore(firebaseApp(), FIRESTORE_DATABASE_ID);
  if (EMULATOR_HOST && !emulatorsConnected) {
    connectFirestoreEmulator(firestore, EMULATOR_HOST, 8080);
    emulatorsConnected = true;
  }
  return doc(firestore, "rides", rideId);
}

// A redirect only survives Safari and Chrome's storage partitioning when the auth
// handler is served from this same origin, which is what the /__/auth proxy does in
// production. Previews and localhost point authDomain at firebaseapp.com: popup there.
export function canUseRedirect(): boolean {
  return typeof window !== "undefined" && config.authDomain === window.location.host;
}
