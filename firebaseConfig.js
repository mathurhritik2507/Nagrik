import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

const app = initializeApp(firebaseConfig);

// Match the existing named database without changing Firebase Authentication.
export const db = getFirestore(app,NAGRIK_FIRESTORE_DATABASE_ID);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});