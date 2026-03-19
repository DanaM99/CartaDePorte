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
  // Con el rewrite de Vercel, el index.html en /public es la raíz "/"
  const path = window.location.pathname;
  const isLoginPage = path === "/" || path.endsWith("index.html") || path === "";

  if (user) {
    // Si está logueado y entra al inicio, mandarlo al dashboard
    if (isLoginPage) {
      window.location.href = "dashboard.html";
    }

    // Actualizar UI (Navbar)
    const userNameSpan = document.getElementById("userName");
    const userPhotoImg = document.getElementById("userPhoto");
    if (userNameSpan) userNameSpan.textContent = user.displayName;
    if (userPhotoImg) userPhotoImg.src = user.photoURL;
    
  } else {
    // Si NO está logueado y NO está en el login, mandarlo al inicio (index.html)
    if (!isLoginPage) {
      window.location.href = "index.html";
    }
  }
});

// --- LOGIN ---
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      // Al estar en el mismo nivel (public), la ruta es directa
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Error en Login:", error);
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
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al salir:", error);
    }
  });
}