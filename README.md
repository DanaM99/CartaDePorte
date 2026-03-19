# 📦 Gestión de Cartas de Porte

**CartaDePorte** es una solución integral de software diseñada para la administración, seguimiento y análisis estadístico de operaciones logísticas de granos.  

La aplicación permite a transportistas y administradores gestionar sus **Cartas de Porte** de manera digital, centralizando la información y automatizando cálculos complejos de comisiones y adelantos.

🔗 **Repositorio:** https://github.com/DanaM99/CartaDePorte  
🌐 **Demo en producción:** https://carta-de-porte.vercel.app/

---

## 🚀 Características Principales

### 📌 Gestión CRUD Completa
Registro, edición, visualización y eliminación de Cartas de Porte en tiempo real.

### 🧮 Cálculo Automatizado
Algoritmo integrado para el cálculo de comisiones netas:


((Kg * Tarifa * % Comisión) / 1000) - Adelantos


### 📊 Panel de Estadísticas Dinámico
Visualización de métricas clave (KPIs) mediante gráficos interactivos:
- Rendimiento mensual  
- Distribución por tipo de cereal  
- Promedios de tarifas  

### 🔎 Sistema de Filtros Avanzado
Búsqueda y segmentación por:
- CTG  
- Tipo de grano  
- Fechas  
- Estado de adelantos  

### 📤 Exportación de Datos
- Generación de reportes en Excel  
- Envío de resúmenes vía WhatsApp  

### 🌙 Modo Oscuro/Claro
Interfaz adaptativa para mejorar la experiencia de usuario.

---

## 🛠️ Stack Tecnológico

**Frontend**
- HTML5  
- CSS3 (Custom Variables)  
- JavaScript (ES6+ Modules)  

**Gráficos**
- Chart.js  

**Backend & Persistencia**
- Firebase Firestore (Base de datos NoSQL en tiempo real)  
- Firebase Authentication (Google Auth)  

**Despliegue**
- Vercel (configurado para SPA con reglas de ruteo)

---

## 🔐 Integración con Firebase

El proyecto utiliza una arquitectura desacoplada con foco en seguridad:

- **Firestore Rules:** cada usuario accede únicamente a su información  
- **Persistent Auth:** manejo de sesiones con `onAuthStateChanged`  
- Protección de rutas críticas  

---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/DanaM99/CartaDePorte.git
cd CartaDePorte
2️⃣ Configuración de Firebase

Crear un proyecto en Firebase Console

Habilitar Firestore Database

Habilitar Google Auth

Registrar una Web App y copiar credenciales

3️⃣ Variables de Entorno

Editar el archivo:

public/firebaseConfig.js

Reemplazar con tus credenciales:

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
4️⃣ Ejecución Local

Debido al uso de módulos ES6, es necesario un servidor local:

# Python
python -m http.server 8000

# Node.js
npx serve .

O usar la extensión Live Server en VS Code.

🔐 Seguridad y Autenticación con Google
🔒 Acceso Protegido

Se utiliza onAuthStateChanged para validar sesión en cada carga:

Si el usuario no está autenticado, es redirigido a index.html

Rutas protegidas:

dashboard.html

view.html

estadisticas.html

🌐 Dominios Autorizados

Agregar en Firebase:

tu-app.vercel.app

En:
Authentication → Settings → Authorized domains

👤 Experiencia de Usuario

Recuperación automática de nombre y foto de Google

Personalización del Navbar

📌 Notas Finales

Este proyecto está pensado como una herramienta escalable para digitalizar procesos logísticos, reducir errores manuales y mejorar la toma de decisiones mediante datos.
