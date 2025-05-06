document.addEventListener("DOMContentLoaded", () => {
  const formEnt = document.getElementById("entidadForm");
  const nameInput  = document.getElementById("name");
  const montoInput = document.getElementById("monto");
  const tipoInput  = document.getElementById("tipo");

  if (formEnt) {
    formEnt.addEventListener("submit", async e => {
      e.preventDefault();

      const nombre = nameInput.value.trim();
      const monto  = parseFloat(montoInput.value);
      const tipo   = tipoInput.value;

      if (!nombre || isNaN(monto)) {
        alert("Completa todos los campos correctamente.");
        return;
      }

      await db.collection("entidades").add({
        nombre,
        monto,
        tipo,
        fecha: new Date().toISOString()
      });

      alert("Entidad guardada");
      formEnt.reset();
      mostrarEntidades();
    });

    mostrarEntidades();
  }
});

async function mostrarEntidades() {
  const snapshot = await db.collection("entidades").get();
  const tabla = document.getElementById("tablaEntidades");
  tabla.innerHTML = "";

  let totales = {
    MXN: 0,
    USD: 0,
    Cripto: 0,
    Capital: 0
  };

  snapshot.forEach(doc => {
    const { nombre, monto, tipo } = doc.data();

    if (totales[tipo] !== undefined) {
      totales[tipo] += monto;
    }

    const fila = document.createElement("tr");  // <- esta línea debe estar dentro del forEach
    fila.innerHTML = `
      <td>${nombre}</td>
      <td>$${monto.toFixed(2)}</td>
      <td>${tipo}</td>
    `;
    tabla.appendChild(fila); // <- también debe estar dentro del forEach
  });

  console.log("Totales por tipo:", totales);

}
