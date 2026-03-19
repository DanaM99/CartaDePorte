import { db, auth } from "../firebaseConfig.js"; // Importamos auth también
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// SEGURIDAD: Solo inicializar cuando Firebase confirme al usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Sesión confirmada: Cargando estadísticas...");
        inicializarEstadisticas();
    } else {
        window.location.href = "login.html";
    }
});

async function inicializarEstadisticas() {
    try {
        const querySnapshot = await getDocs(collection(db, "cartas"));
        const datos = [];
        querySnapshot.forEach(doc => datos.push(doc.data()));

        if (datos.length === 0) {
            console.warn("No hay datos en la colección 'cartas'");
            return;
        }

        // --- VARIABLES DE CÁLCULO ---
        let brutoTotal = 0;
        let adelantosTotal = 0;
        let netoTotal = 0;
        
        const statsMesBruto = {};
        const statsMesNeto = {};
        const statsCereal = {};
        const statsViajesMes = {};
        const tarifasPorCereal = {};

        datos.forEach(d => {
            const bruto = d.totalGanancia || 0;
            const adelanto = d.adelantoMonto || 0;
            const neto = d.netoACobrar || 0;
            const mes = d.fecha ? d.fecha.substring(0, 7) : "Sin Fecha"; // YYYY-MM
            const cereal = d.cereal || "Otro";

            // Acumuladores Generales
            brutoTotal += bruto;
            adelantosTotal += adelanto;
            netoTotal += neto;

            // Procesamiento para Gráficos
            statsMesBruto[mes] = (statsMesBruto[mes] || 0) + bruto;
            statsMesNeto[mes] = (statsMesNeto[mes] || 0) + neto;
            statsViajesMes[mes] = (statsViajesMes[mes] || 0) + 1;
            statsCereal[cereal] = (statsCereal[cereal] || 0) + 1;

            if (!tarifasPorCereal[cereal]) tarifasPorCereal[cereal] = [];
            tarifasPorCereal[cereal].push(d.tarifa || 0);
        });

        // --- ACTUALIZAR PANTALLA (KPIs) ---
        const format = (num) => `$${num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Verificamos que los elementos existan antes de inyectar
        const elNeto = document.getElementById("totalNetoPrincipal");
        const elViajes = document.getElementById("totalViajes");
        const elBruto = document.getElementById("totalGananciaBruta");
        const elAdelantos = document.getElementById("totalAdelantos");
        const elNetoSec = document.getElementById("totalNetoSecundario");

        if(elNeto) elNeto.innerText = format(netoTotal);
        if(elViajes) elViajes.innerText = datos.length;
        if(elBruto) elBruto.innerText = format(brutoTotal);
        if(elAdelantos) elAdelantos.innerText = format(adelantosTotal);
        if(elNetoSec) elNetoSec.innerText = format(netoTotal);

        const mesesOrdenados = Object.keys(statsMesBruto).sort();

        // --- RENDERIZAR GRÁFICOS ---

        // 1. Comparativa
        new Chart(document.getElementById('chartComparativa'), {
            type: 'bar',
            data: {
                labels: mesesOrdenados,
                datasets: [
                    {
                        label: 'Comisión Bruta',
                        data: mesesOrdenados.map(m => statsMesBruto[m]),
                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                        borderColor: '#10b981',
                        borderWidth: 1
                    },
                    {
                        label: 'Neto Real',
                        data: mesesOrdenados.map(m => statsMesNeto[m]),
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    }
                ]
            },
            options: { responsive: true }
        });

        // 2. Viajes por Mes
        new Chart(document.getElementById('chartMeses'), {
            type: 'bar',
            data: {
                labels: mesesOrdenados,
                datasets: [{
                    label: 'Cantidad de Viajes',
                    data: mesesOrdenados.map(m => statsViajesMes[m]),
                    backgroundColor: '#6366f1'
                }]
            }
        });

        // 3. Cereales
        new Chart(document.getElementById('chartCereales'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(statsCereal),
                datasets: [{
                    data: Object.values(statsCereal),
                    backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#f87171', '#a78bfa']
                }]
            }
        });

        // 4. Tarifas Promedio
        const promediosTarifa = Object.keys(tarifasPorCereal).map(c => {
            const sum = tarifasPorCereal[c].reduce((a, b) => a + b, 0);
            return (sum / tarifasPorCereal[c].length).toFixed(2);
        });

        new Chart(document.getElementById('chartTarifas'), {
            type: 'line',
            data: {
                labels: Object.keys(tarifasPorCereal),
                datasets: [{
                    label: 'Tarifa Promedio ($)',
                    data: promediosTarifa,
                    borderColor: '#10b981',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                }]
            }
        });

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}