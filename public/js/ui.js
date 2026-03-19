// ui.js
const main = document.getElementById("mainContent");
const navLinks = document.querySelectorAll(".nav-links a");

async function loadView(view) {
    try {
        // Asumiendo que ui.js se llama desde dashboard.html en la raíz de /public
        const response = await fetch(`./${view}`); 
        const html = await response.text();
        main.innerHTML = html;

        // Lógica de inicialización según la vista
        if (view.includes("view.html")) {
            const crud = await import("./crud.js");
            // crud.init(); // Si exportas una función de inicio
        }
    } catch (err) {
        main.innerHTML = "<p>Error al cargar la vista.</p>";
        console.error("Error al cargar vista:", err);
    }
}

// Listener para los links del navbar
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = e.target.getAttribute("href");
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
// Lógica de Modo Oscuro
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Aplicar al cargar
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.innerText = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerText = newTheme === 'dark' ? '☀️' : '🌙';
});

// Resaltar link activo automáticamente
const activePage = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(link => {
  if(link.href.includes(`${activePage}`)){
    link.classList.add('active');
  }
});