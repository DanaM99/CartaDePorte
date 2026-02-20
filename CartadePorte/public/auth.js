import { app } from "./firebaseConfig.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Inicializar Auth
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// BOTÓN LOGIN
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    signInWithRedirect(auth, provider);
  });
}

// Procesar login después del redirect
getRedirectResult(auth)
  .then((result) => {
    if (result && result.user) {
      console.log("Usuario logueado:", result.user);
      window.location.href = "./dashboard.html"; // ✅ ruta relativa
    }
  })
  .catch((error) => {
    console.error("Error login Google:", error);
  });

// 🔑 Verificar si ya hay sesión activa
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Sesión activa:", user);

    // Mostrar nombre en dashboard
    const userNameSpan = document.getElementById("userName");
    if (userNameSpan) {
      userNameSpan.textContent = user.displayName;
    }

    // Redirigir si está en login.html
    if (window.location.pathname.endsWith("login.html")) {
      window.location.href = "./dashboard.html";
    }
  }
});

// BOTÓN LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./login.html"; // ✅ ruta relativa
  });
}
