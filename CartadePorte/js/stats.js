import { db } from "../public/firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

async function inicializarEstadisticas() {
    const querySnapshot = await getDocs(collection(db, "cartas"));
    const datos = [];
    querySnapshot.forEach(doc => datos.push(doc.data()));

    if (datos.length === 0) return;

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
        const mes = d.fecha.substring(0, 7); // YYYY-MM
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
    
    // Inyectar en IDs únicos
    document.getElementById("totalNetoPrincipal").innerText = format(netoTotal);
    document.getElementById("totalViajes").innerText = datos.length;
    
    document.getElementById("totalGananciaBruta").innerText = format(brutoTotal);
    document.getElementById("totalAdelantos").innerText = format(adelantosTotal);
    document.getElementById("totalNetoSecundario").innerText = format(netoTotal);

    const mesesOrdenados = Object.keys(statsMesBruto).sort();

    // 1. Gráfico Comparativo: Bruto vs Neto
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
        options: { 
            responsive: true,
            scales: {
                y: { ticks: { callback: (val) => '$' + val.toLocaleString() } }
            }
        }
    });

    // 2. Gráfico de Viajes por Mes
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

    // 3. Gráfico de Cereales
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
}

inicializarEstadisticas();