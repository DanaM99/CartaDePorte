// Manejar la carga de vistas dinámicas
const main = document.getElementById("mainContent");
const menuItems = document.querySelectorAll(".sidebar li");

// Cargar vista inicial
loadView("view.html");

// Listener de menú
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        loadView(view);
    });
});

// Función para cargar cualquier vista HTML dentro del dashboard
async function loadView(view) {
    try {
        const response = await fetch(`./${view}`);
        const html = await response.text();
        main.innerHTML = html;

        // Cargar scripts correspondientes
        if (view === "view.html") {
            import("./crud.js");
        }
        if (view === "estadisticas.html") {
            import("./stats.js");
        }
        if (view === "filtros.html") {
            import("./filters.js");
        }

    } catch (err) {
        main.innerHTML = "<p>Error al cargar la vista.</p>";
        console.error(err);
    }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userNameSpan = document.getElementById("userName");
    const userPhotoImg = document.getElementById("userPhoto");

    if (userNameSpan) userNameSpan.textContent = user.displayName;
    if (userPhotoImg) userPhotoImg.src = user.photoURL;

    if (window.location.pathname.endsWith("login.html")) {
      window.location.href = "./dashboard.html";
    }
  }
});
