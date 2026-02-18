// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

// Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyCb8ofrkQHnm5nA-CK9XMKGkseN3P4rIM4",
  authDomain: "cartadeporte-c13e1.firebaseapp.com",
  projectId: "cartadeporte-c13e1",
  storageBucket: "cartadeporte-c13e1.firebasestorage.app",
  messagingSenderId: "1022999039967",
  appId: "1:1022999039967:web:95cd55f87fc8d82cfafe6a",
  measurementId: "G-JZQQGN8D0X"
};

// Inicializamos Firebase y exportamos la app
export const app = initializeApp(firebaseConfig);
