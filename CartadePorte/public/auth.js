import { app } from "./firebaseConfig.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Inicializar Auth
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// BOTÓN LOGIN (asegúrate que existe el botón)
document.getElementById("googleLoginBtn").addEventListener("click", () => {
  signInWithRedirect(auth, provider);
});

// Procesar login después del redirect
getRedirectResult(auth)
  .then((result) => {
    if (result) {
      const user = result.user;
      console.log("Usuario logueado:", user);
      window.location.href = "dashboard.html";
    }
  })
  .catch((error) => {
    console.error("Error login Google:", error);
  });
