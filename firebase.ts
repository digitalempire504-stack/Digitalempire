
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * FIREBASE SECURITY RULES NOTE:
 * If you get "Missing or insufficient permissions", you MUST update your rules in Firebase Console.
 * Go to: Firebase Console -> Firestore Database -> Rules
 * 
 * Set them to (TEST MODE):
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{document=**} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 */

const firebaseConfig = {
  apiKey: "AIzaSyBAbRF8MRlH3_o1kBjs5dwtBkjfrTq695w",
  authDomain: "digitalempire-fc5c4.firebaseapp.com",
  projectId: "digitalempire-fc5c4",
  storageBucket: "digitalempire-fc5c4.firebasestorage.app",
  messagingSenderId: "907365562874",
  appId: "1:907365562874:web:9c8c0f94b475843f420c43",
  measurementId: "G-9S6RBHX157"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_UID = "prmH3zHk8INajXl4ZCDKWqA4dwX2";
