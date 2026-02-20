import { db } from "../public/firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const form = document.getElementById("cartaForm");
const tableBody = document.getElementById("tableBody");

const ref = collection(db, "cartas");

// ------------------------
// CREATE
// ------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const fecha = document.getElementById("fecha").value;
    const cereal = document.getElementById("cereal").value;
    const ctg = document.getElementById("ctg").value;
    const kg = parseFloat(document.getElementById("kg").value);
    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const porcentaje = parseFloat(document.getElementById("porcentaje").value);

    // Total bruto y neto
    const bruto = tarifa * kg;
    const comision = bruto * (porcentaje / 100);
    const total = bruto - comision;

    await addDoc(ref, {
      fecha,
      cereal,
      ctg,
      kg,
      tarifa,
      porcentaje,
      bruto,
      comision,
      total
    });

    form.reset();
    loadTable();
  } catch (err) {
    console.error("Error al guardar registro:", err);
    alert("Hubo un error al guardar el registro.");
  }
});

// ------------------------
// READ
// ------------------------
async function loadTable() {
  tableBody.innerHTML = "";

  try {
    const snapshot = await getDocs(ref);

    snapshot.forEach((docu) => {
      const data = docu.data();

      const row = document.createElement("tr");

      row.innerHTML = `
        <td data-label="Fecha">${data.fecha}</td>
        <td data-label="Cereal">${data.cereal}</td>
        <td data-label="CTG">${data.ctg}</td>
        <td data-label="KG">${data.kg}</td>
        <td data-label="Tarifa">$${data.tarifa}</td>
        <td data-label="%">${data.porcentaje}%</td>
        <td data-label="Total">$${data.total.toFixed(2)}</td>
        <td data-label="Acciones">
          <button class="btn btn-edit" onclick="edit('${docu.id}')">Editar</button>
          <button class="btn btn-delete" onclick="remove('${docu.id}')">Eliminar</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error al cargar registros:", err);
    tableBody.innerHTML = "<tr><td colspan='8'>Error al cargar registros.</td></tr>";
  }
}

// ------------------------
// DELETE
// ------------------------
window.remove = async (id) => {
  try {
    await deleteDoc(doc(db, "cartas", id));
    loadTable();
  } catch (err) {
    console.error("Error al eliminar registro:", err);
    alert("No se pudo eliminar el registro.");
  }
};

// ------------------------
// UPDATE
// ------------------------
window.edit = async (id) => {
  try {
    const newTarifa = parseFloat(prompt("Nueva tarifa:"));
    const newPorcentaje = parseFloat(prompt("Nuevo %:"));

    if (isNaN(newTarifa) || isNaN(newPorcentaje)) {
      alert("Valores inválidos.");
      return;
    }

    const docRef = doc(db, "cartas", id);
    const snapshot = await getDocs(ref);

    let kg = 0;
    snapshot.forEach((d) => {
      if (d.id === id) {
        kg = d.data().kg;
      }
    });

    const bruto = newTarifa * kg;
    const comision = bruto * (newPorcentaje / 100);
    const total = bruto - comision;

    await updateDoc(docRef, {
      tarifa: newTarifa,
      porcentaje: newPorcentaje,
      bruto,
      comision,
      total
    });

    loadTable();
  } catch (err) {
    console.error("Error al actualizar registro:", err);
    alert("No se pudo actualizar el registro.");
  }
};

// Inicializar tabla
loadTable();
