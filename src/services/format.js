/**
 * Servicio de formateo centralizado para toda la aplicación.
 * Contiene funciones para formatear moneda, fechas y valores numéricos.
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
 * Formatea una fecha en formato largo
 * @param {Date|string|object} timestamp - Fecha a formatear (puede ser objeto Date, string ISO o Timestamp de Firestore)
 * @returns {string} - Fecha formateada en formato largo (ej: "1 de enero de 2023, 12:00")
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'No disponible';

  // Si es un objeto Timestamp de Firestore
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Si es una cadena de fecha ISO
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return 'No disponible';
};

/**
 * Formatea una fecha en formato corto
 * @param {Date|string|object} timestamp - Fecha a formatear
 * @returns {string} - Fecha formateada en formato corto (ej: "01/01/2023")
 */
export const formatDateShort = (timestamp) => {
  if (!timestamp) return 'No disponible';

  // Si es un objeto Timestamp de Firestore
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si es una cadena de fecha ISO
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return 'No disponible';
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
