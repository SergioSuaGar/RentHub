/**
 * Servicio de utilidades para manipulación de fechas
 * Contiene funciones para convertir, calcular y comparar fechas
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
 * Calcula el número de días entre dos fechas
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
 * Obtiene el último día del mes para una fecha dada
 * @param {string|Date} fecha - Fecha de referencia
 * @returns {number} - Último día del mes
 */
export const obtenerUltimoDiaMes = (fecha) => {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0).getDate();
};

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
