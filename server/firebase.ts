import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente para o servidor
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase Config no servidor:", {
  apiKey: process.env.VITE_FIREBASE_API_KEY ? "***" : undefined,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);