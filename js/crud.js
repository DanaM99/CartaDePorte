import { db } from "../public/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, getDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const form = document.getElementById("cartaForm");
const tableBody = document.getElementById("tableBody");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const ref = collection(db, "cartas");

// --- CARGAR TABLA ---
async function loadTable() {
  if (!tableBody) return;
  tableBody.innerHTML = "";
  try {
    const q = query(ref, orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((docu) => {
      const d = docu.data();
      const row = document.createElement("tr");
      
      // Formateo de números para que se vean bien en la tabla
      const totalComision = d.totalGanancia || 0;
      const netoFinal = d.netoACobrar || 0;

      row.innerHTML = `
        <td data-label="Fecha">${d.fecha}</td>
        <td data-label="Grano">${d.cereal}</td>
        <td data-label="CTG">${d.ctg}</td>
        <td data-label="Kilos">${d.kg.toLocaleString()}</td>
        <td data-label="Tarifa">$${d.tarifa.toLocaleString()}</td>
        <td data-label="% Comisión">${d.porcentaje}%</td>
        <td data-label="Total Comisión">$${totalComision.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td data-label="Adelanto">$${d.adelantoMonto.toLocaleString()}</td>
        <td data-label="Neto Final"><strong>$${netoFinal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
        <td>
          <button class="btn-edit" onclick="openEditModal('${docu.id}')">✏️</button>
          <button class="btn-delete" onclick="remove('${docu.id}')">🗑️</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (e) { console.error("Error al cargar tabla:", e); }
}

// --- GUARDAR (CREATE) ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const kg = parseFloat(document.getElementById("kg").value);
    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const porc = parseFloat(document.getElementById("porcentaje").value);
    const adelanto = document.getElementById("pidioAdelanto").value === "si" ? parseFloat(document.getElementById("montoAdelanto").value) : 0;

    // NUEVA FÓRMULA: ((Kg * Tarifa * %) / 1000) - Adelanto
    const comisionTotal = (kg * tarifa * (porc / 100)) / 1000;
    const neto = comisionTotal - adelanto;

    await addDoc(ref, {
      fecha: document.getElementById("fecha").value,
      cereal: document.getElementById("cereal").value,
      ctg: document.getElementById("ctg").value,
      kg, tarifa, porcentaje: porc,
      totalGanancia: comisionTotal, // Esto es el "Total Comisión"
      adelantoMonto: adelanto,
      netoACobrar: neto
    });

    Swal.fire("¡Guardado!", "Registro cargado con éxito", "success");
    form.reset();
    document.getElementById("contenedorMontoAdelanto").style.display = "none";
    loadTable();
  } catch (e) { Swal.fire("Error", e.message, "error"); }
});

// --- ABRIR MODAL (READ DOC) ---
window.openEditModal = async (id) => {
  const docSnap = await getDoc(doc(db, "cartas", id));
  if (docSnap.exists()) {
    const d = docSnap.data();
    document.getElementById("editId").value = id;
    document.getElementById("editFecha").value = d.fecha;
    document.getElementById("editCereal").value = d.cereal;
    document.getElementById("editCtg").value = d.ctg;
    document.getElementById("editKg").value = d.kg;
    document.getElementById("editTarifa").value = d.tarifa;
    document.getElementById("editPorcentaje").value = d.porcentaje;
    document.getElementById("editAdelanto").value = d.adelantoMonto;
    editModal.style.display = "block";
  }
};

// --- ACTUALIZAR (UPDATE) ---
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  try {
    const kg = parseFloat(document.getElementById("editKg").value);
    const tarifa = parseFloat(document.getElementById("editTarifa").value);
    const porc = parseFloat(document.getElementById("editPorcentaje").value);
    const adelanto = parseFloat(document.getElementById("editAdelanto").value);

    // RECALCULAR CON NUEVA FÓRMULA
    const comisionTotal = (kg * tarifa * (porc / 100)) / 1000;
    const neto = comisionTotal - adelanto;

    await updateDoc(doc(db, "cartas", id), {
      fecha: document.getElementById("editFecha").value,
      cereal: document.getElementById("editCereal").value,
      ctg: document.getElementById("editCtg").value,
      kg, tarifa, porcentaje: porc,
      totalGanancia: comisionTotal,
      adelantoMonto: adelanto,
      netoACobrar: neto
    });

    Swal.fire("¡Actualizado!", "Los cambios fueron guardados", "success");
    window.closeEditModal();
    loadTable();
  } catch (e) { Swal.fire("Error", "No se pudo actualizar", "error"); }
});

// --- ELIMINAR ---
window.remove = async (id) => {
  const res = await Swal.fire({ 
    title: '¿Borrar registro?', 
    text: "Esta acción no se puede deshacer",
    icon: 'warning', 
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });
  if (res.isConfirmed) {
    await deleteDoc(doc(db, "cartas", id));
    loadTable();
    Swal.fire("Eliminado", "El registro ha sido borrado", "success");
  }
};

loadTable();