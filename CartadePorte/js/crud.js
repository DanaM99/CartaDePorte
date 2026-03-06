import { db } from "../public/firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  getDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const form = document.getElementById("cartaForm");
const tableBody = document.getElementById("tableBody");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

const ref = collection(db, "cartas");

// ------------------------
// CREATE (CON SWEETALERT Y FÓRMULA CORREGIDA)
// ------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const kg = parseFloat(document.getElementById("kg").value);
    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const porcentaje = parseFloat(document.getElementById("porcentaje").value);
    const adelantoMonto = document.getElementById("pidioAdelanto").value === "si" 
                          ? parseFloat(document.getElementById("montoAdelanto").value) 
                          : 0;

    // FÓRMULA SEGÚN TU INDICACIÓN: (KG * Tarifa) * %
    const subtotal = kg * tarifa;
    const totalComision = subtotal * (porcentaje / 100);
    const netoFinal = totalComision - adelantoMonto;

    await addDoc(ref, {
      fecha: document.getElementById("fecha").value,
      cereal: document.getElementById("cereal").value,
      ctg: document.getElementById("ctg").value,
      kg,
      tarifa,
      porcentaje,
      brutoOperacion: subtotal, // KG * Tarifa
      totalGanancia: totalComision, // (KG * Tarifa) * %
      adelantoMonto,
      netoACobrar: netoFinal
    });

    // ÉXITO: SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Registro Guardado',
      text: 'La carta de porte se cargó con éxito',
      confirmButtonColor: '#3085d6'
    });

    form.reset();
    document.getElementById("contenedorMontoAdelanto").style.display = "none";
    loadTable();

  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'No se pudo guardar: ' + err.message, 'error');
  }
});

// ------------------------
// READ (PUNTO 2: VER REGISTROS PREVIOS)
// ------------------------
async function loadTable() {
  if (!tableBody) return;
  tableBody.innerHTML = "<tr><td colspan='10'>Cargando registros...</td></tr>";

  try {
    // Ordenamos por fecha para ver los más recientes arriba
    const q = query(ref, orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    tableBody.innerHTML = "";

    snapshot.forEach((docu) => {
      const data = docu.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.fecha}</td>
        <td>${data.cereal}</td>
        <td>${data.ctg}</td>
        <td>${data.kg}</td>
        <td>$${data.tarifa}</td>
        <td>$${data.totalGanancia.toFixed(2)}</td>
        <td>${data.porcentaje}%</td>
        <td>$${data.adelantoMonto}</td>
        <td><strong>$${data.netoACobrar.toFixed(2)}</strong></td>
        <td>
          <button class="btn-edit" onclick="openEditModal('${docu.id}')">✏️</button>
          <button class="btn-delete" onclick="remove('${docu.id}')">🗑️</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='10'>Error al cargar datos. Revisa la consola.</td></tr>";
  }
}

// ------------------------
// EDITAR (PUNTO 3: MOSTRAR TODOS LOS CAMPOS)
// ------------------------
window.openEditModal = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, "cartas", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Cargamos TODOS los campos en el modal (asegúrate de que los IDs existan en el HTML)
      document.getElementById("editId").value = id;
      document.getElementById("editTarifa").value = data.tarifa;
      document.getElementById("editPorcentaje").value = data.porcentaje;
      document.getElementById("editAdelanto").value = data.adelantoMonto;
      
      // Mostramos el modal
      editModal.style.display = "block";
    }
  } catch (err) {
    Swal.fire('Error', 'No se pudo abrir el editor', 'error');
  }
};

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;

  try {
    const newTarifa = parseFloat(document.getElementById("editTarifa").value);
    const newPorcentaje = parseFloat(document.getElementById("editPorcentaje").value);
    const newAdelanto = parseFloat(document.getElementById("editAdelanto").value);

    const docSnap = await getDoc(doc(db, "cartas", id));
    const kg = docSnap.data().kg;

    // Recalculamos con la fórmula corregida
    const subtotal = kg * newTarifa;
    const totalComision = subtotal * (newPorcentaje / 100);
    const netoFinal = totalComision - newAdelanto;

    await updateDoc(doc(db, "cartas", id), {
      tarifa: newTarifa,
      porcentaje: newPorcentaje,
      adelantoMonto: newAdelanto,
      brutoOperacion: subtotal,
      totalGanancia: totalComision,
      netoACobrar: netoFinal
    });

    Swal.fire('Actualizado', 'Los cambios se guardaron correctamente', 'success');
    window.closeEditModal();
    loadTable();
  } catch (err) {
    Swal.fire('Error', 'No se pudo actualizar', 'error');
  }
});

// ------------------------
// ELIMINAR
// ------------------------
window.remove = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar registro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, borrar'
  });

  if (result.isConfirmed) {
    await deleteDoc(doc(db, "cartas", id));
    loadTable();
    Swal.fire('Borrado', 'El registro ha sido eliminado.', 'success');
  }
};

// Carga inicial
loadTable();