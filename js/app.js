document.addEventListener("DOMContentLoaded", () => {
  const formMov = document.getElementById("movForm");
  const formCambio = document.getElementById("formCambio");

  if (formMov) {
    formMov.addEventListener("submit", async e => {
      e.preventDefault();
      const tipo = document.getElementById("tipo").value;
      const monto = parseFloat(document.getElementById("monto").value);
      const moneda = document.getElementById("moneda").value;

      await db.collection("movimientos").add({
        tipo, monto, moneda, fecha: new Date().toISOString()
      });

      alert("Movimiento guardado");
      formMov.reset();
      mostrarSaldo();
    });

    mostrarSaldo();
  }

  if (formCambio) {
    obtenerTipoCambio();
    formCambio.addEventListener("submit", async e => {
      e.preventDefault();
      const cantidad = parseFloat(document.getElementById("cantidad").value);
      const de = document.getElementById("de").value;
      const a = de === "MXN" ? "USD" : "MXN";

      const tasa = await getTipoCambio(de, a);
      const convertido = cantidad * tasa;

      // Registrar conversión como egreso y ingreso
      await db.collection("movimientos").add({ tipo: "egreso", monto: cantidad, moneda: de, fecha: new Date().toISOString() });
      await db.collection("movimientos").add({ tipo: "ingreso", monto: convertido, moneda: a, fecha: new Date().toISOString() });

      alert(`Convertidos ${cantidad} ${de} a ${convertido.toFixed(2)} ${a}`);
      formCambio.reset();
    });
  }
});

async function mostrarSaldo() {
  const snapshot = await db.collection("movimientos").get();
  let saldo = { MXN: 0, USD: 0 };

  snapshot.forEach(doc => {
    const { tipo, monto, moneda } = doc.data();
    if (tipo === "ingreso") saldo[moneda] += monto;
    else saldo[moneda] -= monto;
  });

  document.getElementById("saldo").textContent =
    `MXN: $${saldo.MXN.toFixed(2)} | USD: $${saldo.USD.toFixed(2)}`;
}

async function getTipoCambio(base, target) {
  const res = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${target}`);
  const data = await res.json();
  return data.rates[target];
}

async function obtenerTipoCambio() {
  const tasa = await getTipoCambio("MXN", "USD");
  document.getElementById("tasaCambio").textContent = `1 MXN = ${tasa.toFixed(4)} USD`;
}
