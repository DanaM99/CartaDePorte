import { auth, db } from "../firebaseConfig.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const tableBody = document.getElementById("tableBodyFiltros");
let todosLosDatos = [];

// PROTECCIÓN Y CARGA: Solo cargamos datos si hay sesión activa
onAuthStateChanged(auth, (user) => {
    if (user) {
        cargarDatos(); 
    } else {
        window.location.href = "login.html";
    }
});

// --- CARGAR DATOS ---
async function cargarDatos() {
    try {
        const q = query(collection(db, "cartas"), orderBy("fecha", "desc"));
        const snapshot = await getDocs(q);
        todosLosDatos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarTabla(todosLosDatos);
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

// --- RENDERIZAR TABLA ---
function renderizarTabla(lista) {
    tableBody.innerHTML = "";
    lista.forEach(d => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Fecha">${d.fecha}</td>
            <td data-label="Grano">${d.cereal}</td>
            <td data-label="CTG">${d.ctg}</td>
            <td data-label="Kilos">${d.kg.toLocaleString()}</td>
            <td data-label="Tarifa">$${d.tarifa.toLocaleString()}</td>
            <td data-label="Neto Final"><strong>$${d.netoACobrar.toLocaleString(undefined, {minimumFractionDigits:2})}</strong></td>
        `;
        tableBody.appendChild(row);
    });
}

// --- FILTRADO ---
document.getElementById("btnFiltrar").addEventListener("click", () => {
    const ctg = document.getElementById("filterCtg").value.toLowerCase();
    const grano = document.getElementById("filterGrano").value;
    const mes = document.getElementById("filterMes").value;
    const adelanto = document.getElementById("filterAdelanto").value;
    const fInicio = document.getElementById("fechaInicio").value;
    const fFin = document.getElementById("fechaFin").value;

    const filtrados = todosLosDatos.filter(d => {
        const matchCtg = d.ctg.toLowerCase().includes(ctg);
        const matchGrano = grano === "" || d.cereal === grano;
        const matchMes = mes === "" || d.fecha.startsWith(mes);
        const matchAdelanto = adelanto === "todos" || 
                             (adelanto === "con" && d.adelantoMonto > 0) || 
                             (adelanto === "sin" && d.adelantoMonto === 0);
        const matchRango = (!fInicio || d.fecha >= fInicio) && (!fFin || d.fecha <= fFin);

        return matchCtg && matchGrano && matchMes && matchAdelanto && matchRango;
    });

    renderizarTabla(filtrados);
});

// ... (Tus imports se mantienen igual arriba) ...

// --- EXPORTAR A EXCEL (LIMPIO) ---
document.getElementById("btnExcel").addEventListener("click", () => {
    if (todosLosDatos.length === 0) return;

    // Creamos una lista limpia solo con los datos que quieres ver en el Excel
    const datosParaExcel = todosLosDatos.map(d => ({
        Fecha: d.fecha,
        Grano: d.cereal,
        CTG: d.ctg,
        Kilos: d.kg,
        Tarifa: d.tarifa,
        Comision_Porc: d.porcentaje + "%",
        Total_Comision: d.totalGanancia,
        Adelanto: d.adelantoMonto,
        Neto_Final: d.netoACobrar
    }));

    const ws = XLSX.utils.json_to_sheet(datosParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `Reporte_Cartas_${new Date().toLocaleDateString()}.xlsx`);
});

// --- ENVIAR POR WHATSAPP (FORMATO CLARO) ---
document.getElementById("btnWhatsapp").addEventListener("click", () => {
    let mensaje = "📋 *RESUMEN DE CARTAS DE PORTE*%0A";
    mensaje += "-----------------------------------%0A%0A";
    
    const filas = tableBody.querySelectorAll("tr");
    
    filas.forEach(fila => {
        const td = fila.querySelectorAll("td");
        // Usamos caracteres universales para evitar errores de símbolos
        mensaje += `🔹 *Fecha:* ${td[0].innerText}%0A`;
        mensaje += `🌾 *Grano:* ${td[1].innerText}%0A`;
        mensaje += `🆔 *CTG:* ${td[2].innerText}%0A`;
        mensaje += `💰 *Neto:* ${td[5].innerText}%0A`;
        mensaje += "-----------------------------------%0A";
    });

    const url = `https://wa.me/?text=${mensaje}`;
    window.open(url, '_blank');
});

// --- LIMPIAR ---
document.getElementById("btnLimpiar").addEventListener("click", () => {
    document.querySelectorAll("input, select").forEach(el => el.value = "");
    document.getElementById("filterAdelanto").value = "todos";
    renderizarTabla(todosLosDatos);
});