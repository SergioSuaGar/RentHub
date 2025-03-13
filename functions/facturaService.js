const admin = require('firebase-admin');

async function generarFacturasCuotaPiso() {
  const db = admin.firestore();

  // Obtener todos los contratos activos
  const contratosSnapshot = await db.collection('contratos').where('estado', '==', true).get();

  // Obtener la fecha actual
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const añoActual = fechaActual.getFullYear();

  // Para cada contrato activo
  for (const contratoDoc of contratosSnapshot.docs) {
    const contrato = contratoDoc.data();
    const fechaInicio = new Date(contrato.fechaInicio);

    // Verificar si ya existe una factura de cuota piso para este mes y propiedad
    const facturasSnapshot = await db
      .collection('facturas')
      .where('propiedadId', '==', contrato.propiedadId)
      .where('tipo', '==', 'Cuota piso')
      .where('fechaInicio', '>=', new Date(añoActual, mesActual, 1).toISOString())
      .where('fechaInicio', '<', new Date(añoActual, mesActual + 1, 1).toISOString())
      .get();

    // Si no existe factura para este mes, crear una nueva
    if (facturasSnapshot.empty) {
      let importe = contrato.precio;
      let fechaInicioFactura = new Date(añoActual, mesActual, 1);
      let fechaFinFactura = new Date(añoActual, mesActual + 1, 0);

      // Si el contrato comenzó en el mes actual, calcular el importe proporcional
      if (fechaInicio.getMonth() === mesActual && fechaInicio.getFullYear() === añoActual) {
        const diasTotales = new Date(añoActual, mesActual + 1, 0).getDate();
        const diasRestantes = diasTotales - fechaInicio.getDate() + 1;
        importe = (contrato.precio * diasRestantes) / diasTotales;
        fechaInicioFactura = fechaInicio;
      }

      // Crear la factura
      const facturaData = {
        tipo: 'Cuota piso',
        propiedadId: contrato.propiedadId,
        propiedadNombre: contrato.propiedadNombre,
        importe: importe.toFixed(2),
        fechaInicio: fechaInicioFactura.toISOString(),
        fechaFin: fechaFinFactura.toISOString(),
        estado: 'pendiente',
        createdAt: new Date().toISOString(),
        createdBy: contrato.createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: contrato.updatedBy,
      };

      await db.collection('facturas').add(facturaData);
    }
  }
}

module.exports = {
  generarFacturasCuotaPiso,
};
