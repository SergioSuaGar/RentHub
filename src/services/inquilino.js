/**
 * Servicio para gestionar inquilinos
 * Archivo wrapper para mantener compatibilidad con código existente
 */

import inquilinoService, { formatDate, formatDateShort } from './inquilino-service';

// Cargar inquilinos
export const loadInquilinos = async () => {
  return inquilinoService.loadInquilinos();
};

// Obtener inquilinos activos
export const getActivos = async () => {
  return inquilinoService.getActivos();
};

// Crear inquilino
export const createInquilino = async (inquilinoData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return inquilinoService.createInquilino(inquilinoData, userId);
};

// Actualizar inquilino
export const updateInquilino = async (inquilinoId, inquilinoData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return inquilinoService.updateInquilino(inquilinoId, inquilinoData, userId);
};

// Eliminar inquilino
export const deleteInquilino = async (inquilinoId) => {
  return inquilinoService.deleteInquilino(inquilinoId);
};

// Cambiar estado de inquilino
export const toggleEstadoInquilino = async (inquilinoId, nuevoEstado, user) => {
  const userId = user && user.uid ? user.uid : user;
  return inquilinoService.toggleEstadoInquilino(inquilinoId, nuevoEstado, userId);
};

// Verificar si un DNI ya existe
export const verificarDniExistente = async (dni, inquilinoIdActual = null) => {
  return inquilinoService.verificarDniExistente(dni, inquilinoIdActual);
};

// Exportamos todas las funciones de utilidad
export { formatDate, formatDateShort };

// Exportación por defecto para mantener compatibilidad
export default {
  getAll: loadInquilinos,
  getActivos,
  create: createInquilino,
  update: updateInquilino,
  delete: deleteInquilino,
  toggleEstado: toggleEstadoInquilino,
  verificarDniExistente,
  formatDate,
  formatDateShort,
};
