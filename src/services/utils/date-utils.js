/**
 * Utilidades para el manejo de fechas
 */

/**
 * Formatea una fecha en formato local (DD/MM/YYYY)
 * @param {Date|Timestamp|string|number} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export function formatDate(date) {
  if (!date) return '';

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'object' && date.toDate) {
    // Firebase Timestamp
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha en formato largo (D de Mes de YYYY)
 * @param {Date|Timestamp|string|number} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export function formatDateLong(date) {
  if (!date) return '';

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'object' && date.toDate) {
    // Firebase Timestamp
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha en formato de entrada (YYYY-MM-DD)
 * @param {Date|Timestamp|string|number} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export function formatDateForInput(date) {
  if (!date) return '';

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'object' && date.toDate) {
    // Firebase Timestamp
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toISOString().split('T')[0];
}

/**
 * Obtiene la fecha actual como objeto Date
 * @returns {Date} - Fecha actual
 */
export function getCurrentDate() {
  return new Date();
}

/**
 * Calcula la fecha de fin a partir de una fecha de inicio y una duración
 * @param {Date|Timestamp|string|number} startDate - Fecha de inicio
 * @param {number} months - Duración en meses
 * @returns {Date} - Fecha de fin
 */
export function calculateEndDate(startDate, months) {
  if (!startDate || !months) return null;

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (startDate instanceof Date) {
    dateObj = new Date(startDate);
  } else if (typeof startDate === 'object' && startDate.toDate) {
    // Firebase Timestamp
    dateObj = startDate.toDate();
  } else if (typeof startDate === 'string' || typeof startDate === 'number') {
    dateObj = new Date(startDate);
  } else {
    return null;
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return null;

  // Calcular fecha de fin
  dateObj.setMonth(dateObj.getMonth() + parseInt(months));
  dateObj.setDate(dateObj.getDate() - 1); // Restar un día para que sea el último día del periodo

  return dateObj;
}

/**
 * Calcula la fecha de renovación a partir de una fecha de fin
 * @param {Date|Timestamp|string|number} endDate - Fecha de fin
 * @returns {Date} - Fecha de renovación (1 día después del fin)
 */
export function calculateRenewalDate(endDate) {
  if (!endDate) return null;

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (endDate instanceof Date) {
    dateObj = new Date(endDate);
  } else if (typeof endDate === 'object' && endDate.toDate) {
    // Firebase Timestamp
    dateObj = endDate.toDate();
  } else if (typeof endDate === 'string' || typeof endDate === 'number') {
    dateObj = new Date(endDate);
  } else {
    return null;
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return null;

  // Fecha de renovación es un día después de la fecha fin
  dateObj.setDate(dateObj.getDate() + 1);

  return dateObj;
}

/**
 * Calcula el número de días entre dos fechas
 * @param {Date|Timestamp|string|number} date1 - Primera fecha
 * @param {Date|Timestamp|string|number} date2 - Segunda fecha
 * @returns {number} - Número de días entre las fechas
 */
export function daysBetweenDates(date1, date2) {
  if (!date1 || !date2) return 0;

  let dateObj1, dateObj2;

  // Convertir date1 a objeto Date
  if (date1 instanceof Date) {
    dateObj1 = new Date(date1);
  } else if (typeof date1 === 'object' && date1.toDate) {
    dateObj1 = date1.toDate();
  } else if (typeof date1 === 'string' || typeof date1 === 'number') {
    dateObj1 = new Date(date1);
  } else {
    return 0;
  }

  // Convertir date2 a objeto Date
  if (date2 instanceof Date) {
    dateObj2 = new Date(date2);
  } else if (typeof date2 === 'object' && date2.toDate) {
    dateObj2 = date2.toDate();
  } else if (typeof date2 === 'string' || typeof date2 === 'number') {
    dateObj2 = new Date(date2);
  } else {
    return 0;
  }

  // Validar que sean fechas válidas
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) return 0;

  // Normalizar a medianoche para evitar problemas con horario de verano
  const normalizedDate1 = new Date(dateObj1.getFullYear(), dateObj1.getMonth(), dateObj1.getDate());
  const normalizedDate2 = new Date(dateObj2.getFullYear(), dateObj2.getMonth(), dateObj2.getDate());

  // Calcular diferencia en milisegundos y convertir a días
  const diffTime = Math.abs(normalizedDate2 - normalizedDate1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Obtiene el primer día del mes actual
 * @returns {Date} - Primer día del mes actual
 */
export function getFirstDayOfCurrentMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

/**
 * Obtiene el último día del mes actual
 * @returns {Date} - Último día del mes actual
 */
export function getLastDayOfCurrentMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
}

/**
 * Obtiene el primer día del mes de una fecha dada
 * @param {Date|Timestamp|string|number} date - Fecha
 * @returns {Date} - Primer día del mes
 */
export function getFirstDayOfMonth(date) {
  if (!date) return null;

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (date instanceof Date) {
    dateObj = new Date(date);
  } else if (typeof date === 'object' && date.toDate) {
    // Firebase Timestamp
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return null;
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return null;

  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
}

/**
 * Obtiene el último día del mes de una fecha dada
 * @param {Date|Timestamp|string|number} date - Fecha
 * @returns {Date} - Último día del mes
 */
export function getLastDayOfMonth(date) {
  if (!date) return null;

  let dateObj;

  // Manejar diferentes tipos de fecha
  if (date instanceof Date) {
    dateObj = new Date(date);
  } else if (typeof date === 'object' && date.toDate) {
    // Firebase Timestamp
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return null;
  }

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return null;

  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
}

/**
 * Verifica si una fecha es anterior a otra
 * @param {Date|Timestamp|string|number} date1 - Primera fecha
 * @param {Date|Timestamp|string|number} date2 - Segunda fecha
 * @returns {boolean} - true si date1 es anterior a date2
 */
export function isDateBefore(date1, date2) {
  if (!date1 || !date2) return false;

  let dateObj1, dateObj2;

  // Convertir date1 a objeto Date
  if (date1 instanceof Date) {
    dateObj1 = new Date(date1);
  } else if (typeof date1 === 'object' && date1.toDate) {
    dateObj1 = date1.toDate();
  } else if (typeof date1 === 'string' || typeof date1 === 'number') {
    dateObj1 = new Date(date1);
  } else {
    return false;
  }

  // Convertir date2 a objeto Date
  if (date2 instanceof Date) {
    dateObj2 = new Date(date2);
  } else if (typeof date2 === 'object' && date2.toDate) {
    dateObj2 = date2.toDate();
  } else if (typeof date2 === 'string' || typeof date2 === 'number') {
    dateObj2 = new Date(date2);
  } else {
    return false;
  }

  // Validar que sean fechas válidas
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) return false;

  // Normalizar a medianoche para comparar solo fechas
  const normalizedDate1 = new Date(dateObj1.getFullYear(), dateObj1.getMonth(), dateObj1.getDate());
  const normalizedDate2 = new Date(dateObj2.getFullYear(), dateObj2.getMonth(), dateObj2.getDate());

  return normalizedDate1 < normalizedDate2;
}

/**
 * Verifica si una fecha está dentro de un rango
 * @param {Date|Timestamp|string|number} date - Fecha a verificar
 * @param {Date|Timestamp|string|number} startDate - Fecha de inicio del rango
 * @param {Date|Timestamp|string|number} endDate - Fecha de fin del rango
 * @returns {boolean} - true si la fecha está dentro del rango (inclusivo)
 */
export function isDateInRange(date, startDate, endDate) {
  if (!date || !startDate || !endDate) return false;

  let dateObj, startDateObj, endDateObj;

  // Convertir date a objeto Date
  if (date instanceof Date) {
    dateObj = new Date(date);
  } else if (typeof date === 'object' && date.toDate) {
    dateObj = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // Convertir startDate a objeto Date
  if (startDate instanceof Date) {
    startDateObj = new Date(startDate);
  } else if (typeof startDate === 'object' && startDate.toDate) {
    startDateObj = startDate.toDate();
  } else if (typeof startDate === 'string' || typeof startDate === 'number') {
    startDateObj = new Date(startDate);
  } else {
    return false;
  }

  // Convertir endDate a objeto Date
  if (endDate instanceof Date) {
    endDateObj = new Date(endDate);
  } else if (typeof endDate === 'object' && endDate.toDate) {
    endDateObj = endDate.toDate();
  } else if (typeof endDate === 'string' || typeof endDate === 'number') {
    endDateObj = new Date(endDate);
  } else {
    return false;
  }

  // Validar que sean fechas válidas
  if (isNaN(dateObj.getTime()) || isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return false;
  }

  // Normalizar a medianoche para comparar solo fechas
  const normalizedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const normalizedStartDate = new Date(
    startDateObj.getFullYear(),
    startDateObj.getMonth(),
    startDateObj.getDate()
  );
  const normalizedEndDate = new Date(
    endDateObj.getFullYear(),
    endDateObj.getMonth(),
    endDateObj.getDate()
  );

  return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
}

/**
 * Exporta todas las funciones de utilidad
 */
export default {
  formatDate,
  formatDateLong,
  formatDateForInput,
  getCurrentDate,
  calculateEndDate,
  calculateRenewalDate,
  daysBetweenDates,
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  isDateBefore,
  isDateInRange,
};
