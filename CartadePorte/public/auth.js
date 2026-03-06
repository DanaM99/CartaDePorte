import { app } from "./firebaseConfig.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- ESTADO DE LA SESIÓN ---
onAuthStateChanged(auth, (user) => {
  const isLoginPage = window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("/");

  if (user) {
    console.log("Sesión activa de:", user.displayName);
    
    // Si estamos en login, vamos al dashboard
    if (isLoginPage) {
      window.location.href = "./dashboard.html";
    }

    // Actualizar UI del Dashboard
    const userNameSpan = document.getElementById("userName");
    const userPhotoImg = document.getElementById("userPhoto");
    if (userNameSpan) userNameSpan.textContent = user.displayName;
    if (userPhotoImg) userPhotoImg.src = user.photoURL;

  } else {
    // Si NO hay usuario y NO estamos en login, proteger la ruta
    if (!isLoginPage) {
      console.warn("Usuario no autenticado. Redirigiendo a login...");
      window.location.href = "./login.html";
    }
  }
});

// --- ACCIÓN DE LOGIN ---
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      console.log("Iniciando Login...");
      const result = await signInWithPopup(auth, provider);
      console.log("Login exitoso:", result.user.displayName);
      
      // Redirección manual inmediata tras el éxito del popup
      window.location.href = "./dashboard.html";
    } catch (error) {
      console.error("Error en Login:", error.code, error.message);
      alert("Error al ingresar: " + error.message);
    }
  });
}

// --- ACCIÓN DE LOGOUT ---
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