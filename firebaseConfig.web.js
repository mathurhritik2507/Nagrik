// Browser-specific Firebase Auth initialization. Native config remains unchanged.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);
export const auth = getAuth(app);
