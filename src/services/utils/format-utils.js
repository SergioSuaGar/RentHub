/**
 * Servicio de formateo centralizado para toda la aplicación.
 * Contiene funciones para formatear moneda y valores numéricos.
 */

/**
 * Formatea un valor numérico como moneda (EUR)
 * @param {string|number} value - Valor a formatear
 * @returns {string} - Valor formateado como moneda (ej: "123,45 €")
 */
export const formatCurrency = (value) => {
  if (!value) return '0,00 €';
  return `${value} €`;
};

/**
 * Formatea un valor de entrada para campos numéricos
 * Aplica reglas comunes como permitir solo números y coma decimal,
 * y limitar a dos decimales
 * @param {string} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatNumericInput = (value) => {
  if (!value) return '';

  // Permitir solo números y una coma
  value = value.replace(/[^\d,]/g, '');

  // Asegurar solo una coma
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }

  // Limitar a dos decimales
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }

  return value;
};

/**
 * Versión específica para formatear precios
 * @param {string} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatPrecio = (value) => {
  return formatNumericInput(value);
};

/**
 * Versión específica para formatear importes
 * @param {string} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatImporte = (value) => {
  return formatNumericInput(value);
};

/**
 * Versión específica para formatear importes pagados
 * @param {string} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatImportePagado = (value) => {
  return formatNumericInput(value);
};

/**
 * Exporta todas las funciones de utilidad
 */
export default {
  formatCurrency,
  formatNumericInput,
  formatPrecio,
  formatImporte,
  formatImportePagado,
};
