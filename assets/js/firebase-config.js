import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYe9I1I_fwkuL1tc-stmZAcsB3zKTKutg",
  authDomain: "sammir-trick-admin.firebaseapp.com",
  projectId: "sammir-trick-admin",
  storageBucket: "sammir-trick-admin.firebasestorage.app",
  messagingSenderId: "1099371777309",
  appId: "1:1099371777309:web:813cbb07ecf5bb820ca5f4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
