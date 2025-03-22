/**
 * Utilidades para el manejo de fechas
 */

/**
 * Convierte una fecha ISO a formato de entrada YYYY-MM-DD
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const isoToDateInput = (isoDate) => {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
};

/**
 * Convierte una fecha de entrada a formato ISO
 * @param {string} inputDate - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha en formato ISO
 */
export const dateInputToIso = (inputDate) => {
  if (!inputDate) return '';
  return new Date(inputDate).toISOString();
};

/**
 * Calcula una fecha futura basada en una fecha base
 * @param {string} fechaBase - Fecha base en formato YYYY-MM-DD
 * @param {number} añosAñadir - Años a añadir a la fecha base
 * @param {boolean} restarDia - Si debe restar un día al resultado
 * @returns {string} - Fecha resultante en formato YYYY-MM-DD
 */
export const calcularFechaFutura = (fechaBase, añosAñadir = 1, restarDia = true) => {
  if (!fechaBase) return '';
  const fecha = new Date(fechaBase);
  fecha.setFullYear(fecha.getFullYear() + añosAñadir);
  if (restarDia) {
    fecha.setDate(fecha.getDate() - 1); // Restar un día para que sea el día anterior al año
  }
  return fecha.toISOString().split('T')[0];
};

/**
 * Calcula la fecha de renovación de un contrato (un año menos un día)
 * @param {string} fechaInicio - Fecha de inicio del contrato
 * @returns {string} - Fecha de renovación en formato YYYY-MM-DD
 */
export const calcularFechaRenovacion = (fechaInicio) => {
  return calcularFechaFutura(fechaInicio, 1, true);
};

/**
 * Calcula el estado de renovación de un contrato
 * @param {string} fechaRenovacion - Fecha de renovación del contrato
 * @param {boolean} ipcAjustado - Si el IPC ha sido ajustado
 * @returns {Object} - Objeto con el estado y color asociado
 */
export const calcularEstadoRenovacion = (fechaRenovacion, ipcAjustado = true) => {
  if (!fechaRenovacion) return { estado: 'Vigente', color: 'success' };

  const fechaRenovacionObj = new Date(fechaRenovacion);
  const hoy = new Date();

  // Establecer las horas a 0 para comparar solo fechas
  fechaRenovacionObj.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  // Si la fecha de renovación es menor o igual a hoy
  if (fechaRenovacionObj <= hoy) {
    return { estado: 'Pendiente de Renovación', color: 'error' };
  }

  // Si el IPC no ha sido ajustado después de la última renovación
  if (!ipcAjustado) {
    return { estado: 'Pendiente de Ajuste IPC', color: 'warning' };
  }

  return { estado: 'Vigente', color: 'success' };
};

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
 * Calcula el número de días entre dos fechas (versión original)
 * @param {string|Date} fechaInicio - Fecha de inicio
 * @param {string|Date} fechaFin - Fecha de fin
 * @returns {number} - Número de días entre las fechas
 */
export const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;

  const inicio = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
  const fin = fechaFin instanceof Date ? fechaFin : new Date(fechaFin);

  // Establecer las horas a 0 para comparar solo fechas
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  // Calcular la diferencia en milisegundos y convertir a días
  const diferencia = Math.abs(fin - inicio);
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

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
 * Obtiene el último día del mes para una fecha dada (versión original)
 * @param {string|Date} fecha - Fecha de referencia
 * @returns {number} - Último día del mes
 */
export const obtenerUltimoDiaMes = (fecha) => {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0).getDate();
};

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
 * Compara dos fechas para determinar si la primera es anterior, igual o posterior a la segunda
 * @param {string|Date} fecha1 - Primera fecha
 * @param {string|Date} fecha2 - Segunda fecha
 * @returns {number} - -1 si fecha1 es anterior, 0 si son iguales, 1 si fecha1 es posterior
 */
export const compararFechas = (fecha1, fecha2) => {
  if (!fecha1 || !fecha2) return null;

  const f1 = fecha1 instanceof Date ? fecha1 : new Date(fecha1);
  const f2 = fecha2 instanceof Date ? fecha2 : new Date(fecha2);

  // Establecer las horas a 0 para comparar solo fechas
  f1.setHours(0, 0, 0, 0);
  f2.setHours(0, 0, 0, 0);

  if (f1 < f2) return -1;
  if (f1 > f2) return 1;
  return 0;
};

/**
 * Verifica si una fecha está dentro de un rango
 * @param {Date|Timestamp|string|number} date - Fecha a verificar
 * @param {Date|Timestamp|string|number} startDate - Fecha de inicio del rango
 * @param {Date|Timestamp|string|number} endDate - Fecha de fin del rango
 * @returns {boolean} - true si la fecha está dentro del rango
 */
export function isDateInRange(date, startDate, endDate) {
  if (!date || !startDate || !endDate) return false;

  // Convertir a objetos Date
  const dateObj = date instanceof Date ? date : new Date(date);
  const startObj = startDate instanceof Date ? startDate : new Date(startDate);
  const endObj = endDate instanceof Date ? endDate : new Date(endDate);

  // Validar que sean fechas válidas
  if (isNaN(dateObj.getTime()) || isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    return false;
  }

  // Normalizar a medianoche para comparar solo fechas
  const normalizedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const normalizedStart = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
  const normalizedEnd = new Date(endObj.getFullYear(), endObj.getMonth(), endObj.getDate());

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * Exporta todas las funciones de utilidad
 */
export default {
  // Funciones del archivo original
  isoToDateInput,
  dateInputToIso,
  calcularFechaFutura,
  calcularFechaRenovacion,
  calcularDiasEntreFechas,
  obtenerUltimoDiaMes,
  calcularEstadoRenovacion,
  compararFechas,

  // Funciones del archivo en utils
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
