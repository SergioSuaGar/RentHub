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

    // Verificar si ya existe una factura de cuota piso para este mes y propiedad
    const facturasSnapshot = await db
      .collection('facturas')
      .where('propiedadId', '==', contrato.propiedadId)
      .where('tipo', '==', 'Cuota piso')
      .where('fechaInicio', '>=', new Date(añoActual, mesActual, 1).toISOString().split('T')[0])
      .where('fechaInicio', '<', new Date(añoActual, mesActual + 1, 1).toISOString().split('T')[0])
      .get();

    // Si no existe factura para este mes, crear una nueva
    if (facturasSnapshot.empty) {
      // Convertir el importe a número
      const importe = Number(contrato.precio);
      const fechaInicioFactura = new Date(añoActual, mesActual, 1).toISOString().split('T')[0];
      const fechaFinFactura = new Date(añoActual, mesActual + 1, 0).toISOString().split('T')[0];

      // Crear la factura
      const facturaData = {
        tipo: 'Cuota piso',
        propiedadId: contrato.propiedadId,
        propiedadNombre: contrato.propiedadNombre,
        importe: importe.toFixed(2),
        fechaInicio: fechaInicioFactura,
        fechaFin: fechaFinFactura,
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
