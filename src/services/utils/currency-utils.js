/**
 * Utilidades para el manejo de moneda y valores numéricos
 */

/**
 * Formatea un número como moneda EUR
 * @param {number|string} value - Valor a formatear
 * @param {Object} options - Opciones de formato
 * @param {boolean} options.showSymbol - Muestra el símbolo de euro
 * @param {boolean} options.showDecimals - Muestra los decimales
 * @returns {string} - Valor formateado como moneda
 */
export function formatCurrency(value, options = {}) {
  const { showSymbol = true, showDecimals = true } = options;

  if (value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }

  const numValue = Number(value);

  try {
    const formatter = new Intl.NumberFormat('es-ES', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'EUR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    return formatter.format(numValue);
  } catch (error) {
    console.error('Error al formatear moneda:', error);

    // Formateo manual como fallback
    const formattedValue = showDecimals
      ? numValue.toFixed(2).replace('.', ',')
      : Math.round(numValue).toString();

    // Agregar separadores de miles manualmente
    const parts = formattedValue.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return showSymbol ? parts.join(',') + ' €' : parts.join(',');
  }
}

/**
 * Formatea un número como porcentaje
 * @param {number|string} value - Valor a formatear (0.15 para 15%)
 * @param {Object} options - Opciones de formato
 * @param {boolean} options.showSymbol - Muestra el símbolo %
 * @param {number} options.decimals - Número de decimales a mostrar
 * @returns {string} - Valor formateado como porcentaje
 */
export function formatPercent(value, options = {}) {
  const { showSymbol = true, decimals = 2 } = options;

  if (value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }

  const numValue = Number(value);

  try {
    // Multiplicar por 100 para mostrar como porcentaje
    const percentValue = numValue * 100;

    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'decimal',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return showSymbol ? formatter.format(percentValue) + ' %' : formatter.format(percentValue);
  } catch (error) {
    console.error('Error al formatear porcentaje:', error);

    // Formateo manual como fallback
    const percentValue = numValue * 100;
    const formattedValue = percentValue.toFixed(decimals).replace('.', ',');

    return showSymbol ? formattedValue + ' %' : formattedValue;
  }
}

/**
 * Calcula el IVA de un valor
 * @param {number} value - Valor base
 * @param {number} rate - Tasa de IVA (0.21 para 21%)
 * @returns {number} - Monto del IVA
 */
export function calculateVAT(value, rate = 0.21) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }

  return Number(value) * rate;
}

/**
 * Calcula el total incluyendo IVA
 * @param {number} value - Valor base
 * @param {number} rate - Tasa de IVA (0.21 para 21%)
 * @returns {number} - Total con IVA
 */
export function calculateTotalWithVAT(value, rate = 0.21) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }

  return Number(value) * (1 + rate);
}

/**
 * Calcula el valor base a partir de un total con IVA
 * @param {number} total - Total con IVA
 * @param {number} rate - Tasa de IVA (0.21 para 21%)
 * @returns {number} - Valor base sin IVA
 */
export function calculateBaseFromTotal(total, rate = 0.21) {
  if (total === null || total === undefined || isNaN(Number(total))) {
    return 0;
  }

  return Number(total) / (1 + rate);
}

/**
 * Calcula el importe proporcional para un período
 * @param {number} amount - Importe total del período completo
 * @param {number} totalDays - Días totales del período completo
 * @param {number} usedDays - Días utilizados o a facturar
 * @returns {number} - Importe proporcional
 */
export function calculateProportionalAmount(amount, totalDays, usedDays) {
  if (
    amount === null ||
    amount === undefined ||
    isNaN(Number(amount)) ||
    totalDays === null ||
    totalDays === undefined ||
    isNaN(Number(totalDays)) ||
    totalDays === 0 ||
    usedDays === null ||
    usedDays === undefined ||
    isNaN(Number(usedDays))
  ) {
    return 0;
  }

  // Calcular proporción y redondear a 2 decimales
  const proportion = Number(usedDays) / Number(totalDays);
  const proportionalAmount = Number(amount) * proportion;

  return Math.round(proportionalAmount * 100) / 100;
}

/**
 * Calcula el incremento según IPC
 * @param {number} amount - Importe original
 * @param {number} ipcRate - Tasa de incremento del IPC (0.038 para 3.8%)
 * @returns {number} - Importe con incremento del IPC
 */
export function calculateIPCIncrease(amount, ipcRate) {
  if (
    amount === null ||
    amount === undefined ||
    isNaN(Number(amount)) ||
    ipcRate === null ||
    ipcRate === undefined ||
    isNaN(Number(ipcRate))
  ) {
    return amount || 0;
  }

  // Calcular nuevo importe y redondear a 2 decimales
  const newAmount = Number(amount) * (1 + Number(ipcRate));

  return Math.round(newAmount * 100) / 100;
}

/**
 * Parsea un valor de moneda a número
 * @param {string} value - Valor en formato de moneda (p.ej. "1.234,56 €")
 * @returns {number|null} - Valor numérico o null si no es válido
 */
export function parseCurrencyToNumber(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    // Eliminar símbolo de moneda y espacios
    const cleanValue = value.replace(/[€$\s]/g, '');

    // Reemplazar separadores de formato español (1.234,56 -> 1234.56)
    const normalizedValue = cleanValue
      .replace(/\./g, '') // Eliminar puntos de miles
      .replace(',', '.'); // Cambiar coma decimal por punto

    const numValue = parseFloat(normalizedValue);

    return isNaN(numValue) ? null : numValue;
  } catch (error) {
    console.error('Error al parsear valor de moneda:', error);
    return null;
  }
}

/**
 * Redondea un número a un número específico de decimales
 * @param {number} value - Valor a redondear
 * @param {number} decimals - Número de decimales
 * @returns {number} - Valor redondeado
 */
export function roundToDecimals(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }

  const factor = Math.pow(10, decimals);
  return Math.round(Number(value) * factor) / factor;
}

/**
 * Suma una lista de valores numéricos
 * @param {Array<number>} values - Lista de valores a sumar
 * @returns {number} - Resultado de la suma
 */
export function sumValues(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  return values.reduce((total, current) => {
    const numValue = Number(current);
    return total + (isNaN(numValue) ? 0 : numValue);
  }, 0);
}

/**
 * Exporta todas las funciones de utilidad
 */
export default {
  formatCurrency,
  formatPercent,
  calculateVAT,
  calculateTotalWithVAT,
  calculateBaseFromTotal,
  calculateProportionalAmount,
  calculateIPCIncrease,
  parseCurrencyToNumber,
  roundToDecimals,
  sumValues,
};
