import { auth } from "./firebaseConfig.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

// --- ESTADO DE LA SESIÓN ---
onAuthStateChanged(auth, (user) => {
  const isLoginPage = window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("/");

  if (user) {
    if (isLoginPage) window.location.href = "./dashboard.html";

    // Actualizar UI
    const userNameSpan = document.getElementById("userName");
    const userPhotoImg = document.getElementById("userPhoto");
    if (userNameSpan) userNameSpan.textContent = user.displayName;
    if (userPhotoImg) userPhotoImg.src = user.photoURL;
  } else {
    if (!isLoginPage) window.location.href = "./login.html";
  }
});

// --- LOGIN ---
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "./dashboard.html";
    } catch (error) {
      alert("Error al ingresar: " + error.message);
    }
  });
}

// --- LOGOUT ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "./login.html";
    } catch (error) {
      console.error("Error al salir:", error);
    }
  });
}