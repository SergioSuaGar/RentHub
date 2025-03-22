/**
 * Servicio de utilidades matemáticas
 * Contiene funciones para cálculos y operaciones numéricas
 */

/**
 * Calcula el nuevo precio aplicando un incremento de IPC
 * @param {string} precioActual - Precio actual (formato con coma)
 * @param {string} incrementoIPC - Porcentaje de incremento del IPC (formato con coma)
 * @returns {string} - Nuevo precio formateado
 */
export const calcularNuevoPrecioIPC = (precioActual, incrementoIPC) => {
  if (!precioActual || !incrementoIPC) return '';

  const precio = parseFloat(precioActual.replace(',', '.'));
  const incremento = parseFloat(incrementoIPC.replace(',', '.'));
  const nuevoPrecio = precio * (1 + incremento / 100);

  // Convertir a string con 2 decimales y reemplazar punto por coma
  let precioFormateado = nuevoPrecio.toFixed(2).replace('.', ',');

  // Eliminar decimales si son ceros
  if (precioFormateado.endsWith(',00')) {
    precioFormateado = precioFormateado.slice(0, -3);
  }

  return precioFormateado;
};

/**
 * Calcula el importe proporcional basado en el precio y los días ocupados
 * @param {string} precio - Precio base (formato con coma)
 * @param {number} diasOcupados - Número de días ocupados
 * @param {number} diasTotales - Número total de días del período
 * @returns {string} - Importe proporcional formateado
 */
export const calcularImporteProporcionalPorDias = (precio, diasOcupados, diasTotales) => {
  if (!precio || !diasOcupados || !diasTotales) return '';

  // Convertir el precio a número
  const precioNumerico = parseFloat(precio.toString().replace(',', '.'));

  // Calcular el precio por día
  const precioDiario = precioNumerico / diasTotales;

  // Calcular el importe total
  const importeCalculado = precioDiario * diasOcupados;

  // Redondear a 2 decimales y formatear
  let importeFormateado = importeCalculado.toFixed(2).replace('.', ',');

  // Eliminar decimales si son ceros
  if (importeFormateado.endsWith(',00')) {
    importeFormateado = importeFormateado.slice(0, -3);
  }

  return importeFormateado;
};

/**
 * Convierte un valor en formato texto (con coma) a número
 * @param {string} valor - Valor a convertir (formato con coma)
 * @returns {number} - Valor numérico
 */
export const textoANumero = (valor) => {
  if (!valor) return 0;
  return parseFloat(valor.toString().replace(',', '.'));
};

/**
 * Convierte un número a formato texto con coma
 * @param {number} numero - Número a convertir
 * @param {number} decimales - Número de decimales a mostrar
 * @returns {string} - Valor en formato texto
 */
export const numeroATexto = (numero, decimales = 2) => {
  if (numero === null || numero === undefined) return '';

  // Convertir a string con los decimales especificados
  let textoFormateado = numero.toFixed(decimales).replace('.', ',');

  // Eliminar decimales si son ceros
  if (decimales > 0 && textoFormateado.endsWith(','.padEnd(decimales + 1, '0'))) {
    textoFormateado = textoFormateado.slice(0, -(decimales + 1));
  }

  return textoFormateado;
};

/**
 * Exporta todas las funciones de utilidad
 */
export default {
  calcularNuevoPrecioIPC,
  calcularImporteProporcionalPorDias,
  textoANumero,
  numeroATexto,
};
