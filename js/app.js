document.addEventListener("DOMContentLoaded", () => {
  // Referencias globales
  const db = firebase.firestore();

  // --- MOVIMIENTOS ---
  const formMov = document.getElementById("movForm");
  if (formMov) {
    formMov.addEventListener("submit", async e => {
      e.preventDefault();
      const tipo   = document.getElementById("tipo").value;
      const monto  = parseFloat(document.getElementById("monto").value);
      const moneda = document.getElementById("moneda").value;

      await db.collection("movimientos").add({
        tipo,
        monto,
        moneda,
        fecha: new Date().toISOString()
      });

      alert("Movimiento guardado");
      formMov.reset();
      mostrarSaldoMov();
    });
    // Carga inicial de saldo movimientos
    mostrarSaldoMov();
  }

  async function mostrarSaldoMov() {
    const snapshot = await db.collection("movimientos").get();
    let saldo = { MXN: 0, USD: 0 };
    snapshot.forEach(doc => {
      const { tipo, monto, moneda } = doc.data();
      saldo[moneda] += tipo === "ingreso" ? monto : -monto;
    });
    const el = document.getElementById("saldoMov");
    if (el) el.textContent = `MXN: $${saldo.MXN.toFixed(2)} | USD: $${saldo.USD.toFixed(2)}`;
  }

  // --- CAMBIO DE DIVISAS ---
  const formCambio = document.getElementById("formCambio");
  if (formCambio) {
    // Mostrar tasa al cargar
    mostrarTasa();
    formCambio.addEventListener("submit", async e => {
      e.preventDefault();
      const cantidad = parseFloat(document.getElementById("cantidad").value);
      const de       = document.getElementById("de").value;
      const a        = de === "MXN" ? "USD" : "MXN";

      const tasa = await getTipoCambio(de, a);
      if (tasa === null) return;

      const convertido = cantidad * tasa;
      // Registrar en Firestore
      await db.collection("movimientos").add({
        tipo: "egreso",
        monto: cantidad,
        moneda: de,
        fecha: new Date().toISOString()
      });
      await db.collection("movimientos").add({
        tipo: "ingreso",
        monto: convertido,
        moneda: a,
        fecha: new Date().toISOString()
      });

      alert(`Convertidos ${cantidad} ${de} a ${convertido.toFixed(2)} ${a}`);
      formCambio.reset();
      mostrarSaldoMov();
    });
  }

  async function mostrarTasa() {
    const tasa = await getTipoCambio("MXN", "USD");
    const el   = document.getElementById("tasaCambio");
    if (el) {
      el.textContent = tasa !== null
        ? `1 MXN = ${tasa.toFixed(4)} USD`
        : "No se pudo obtener la tasa.";
    }
  }

  async function getTipoCambio(base, target) {
    try {
      const res  = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${target}`);
      const data = await res.json();
      if (!data.rates || data.rates[target] == null) {
        throw new Error("Tipo de cambio no disponible");
      }
      return data.rates[target];
    } catch (err) {
      console.error("Error al obtener el tipo de cambio:", err);
      alert("Hubo un problema al obtener el tipo de cambio. Intenta de nuevo más tarde.");
      return null;
    }
  }

  // --- ENTIDADES ---
  const formEnt = document.getElementById("entidadForm");
  if (formEnt) {
    const nameInput  = document.getElementById("name");
    const montoInput = document.getElementById("monto");
    const tipoInput  = document.getElementById("tipo");

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

    // Carga inicial de entidades
    mostrarEntidades();
  }

  async function mostrarEntidades() {
    const snapshot = await db.collection("entidades").get();
    const tabla = document.getElementById("tablaEntidades");
    if (!tabla) return;
    
    tabla.innerHTML = "";

    let totales = {
      MXN: 0,
      USD: 0,
      Cripto: 0,
      Capital: 0
    };

    snapshot.forEach(doc => {
      const { nombre, monto, tipo } = doc.data();

      // Suma al total por tipo
      if (totales[tipo] !== undefined) {
        totales[tipo] += monto;
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${nombre}</td>
        <td>$${monto.toFixed(2)}</td>
        <td>${tipo}</td>
      `;
      tabla.appendChild(fila);
    });

    // Actualizar saldo total en la interfaz
    const saldoElement = document.getElementById("saldoEnt");
    if (saldoElement) {
      saldoElement.textContent = 
        `MXN: $${totales.MXN.toFixed(2)} | USD: $${totales.USD.toFixed(2)} | 
         Cripto: $${totales.Cripto.toFixed(2)} | Capital: $${totales.Capital.toFixed(2)}`;
    }

    console.log("Totales por tipo:", totales);
  }
});