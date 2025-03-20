import { generarFacturasCuotaPiso } from '../services/facturaService';

// Función principal que se ejecutará
const main = async () => {
  try {
    console.log('Iniciando generación de facturas de cuota piso...');
    await generarFacturasCuotaPiso();
    console.log('Generación de facturas completada exitosamente.');
  } catch (error) {
    console.error('Error en la generación de facturas:', error);
    process.exit(1);
  }
};

// Ejecutar el script
main();
