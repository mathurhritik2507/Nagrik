// Browser-specific Firebase Auth initialization. Native config remains unchanged.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { NAGRIK_FIRESTORE_DATABASE_ID } from "./config/firestoreDatabase";

const firebaseConfig = {
  apiKey: "AIzaSyCX0Vkq75s7D2ag0oQt_JRf-bjfnhQ_7DM",
  authDomain: "nagrik-5ef31.firebaseapp.com",
  projectId: "nagrik-5ef31",
  storageBucket: "nagrik-5ef31.firebasestorage.app",
  messagingSenderId: "552256240213",
  appId: "1:552256240213:web:04652c76e61039a0fcb2dc",
  measurementId: "G-T5RTHM3L3K",
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// IMPORTANT: Firebase's implicit "(default)" database does not exist in
// Nagrik. Existing data/rules are in the explicitly named "default" database.
// Set the third argument, otherwise community writes silently queue offline.
// Keep the web-only long-polling option for now, until authenticated testing
// establishes it can be removed without transport regressions.
export const db = initializeFirestore(app,{
  experimentalForceLongPolling:true,
},NAGRIK_FIRESTORE_DATABASE_ID);
export const auth = getAuth(app);
