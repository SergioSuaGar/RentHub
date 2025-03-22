/**
 * Servicio para gestionar propiedades
 * Archivo wrapper para mantener compatibilidad con código existente
 */

import propiedadService, { formatCurrency, formatPrecio } from './propiedad-service';

// Cargar propiedades
export const loadPropiedades = async () => {
  return propiedadService.loadPropiedades();
};

// Obtener propiedades activas
export const getActivas = async () => {
  return propiedadService.getActivas();
};

// Crear propiedad
export const createPropiedad = async (propiedadData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return propiedadService.createPropiedad(propiedadData, userId);
};

// Actualizar propiedad
export const updatePropiedad = async (propiedadId, propiedadData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return propiedadService.updatePropiedad(propiedadId, propiedadData, userId);
};

// Eliminar propiedad
export const deletePropiedad = async (propiedadId) => {
  return propiedadService.deletePropiedad(propiedadId);
};

// Cambiar estado de propiedad
export const toggleEstadoPropiedad = async (propiedadId, nuevoEstado, user) => {
  const userId = user && user.uid ? user.uid : user;
  return propiedadService.toggleEstadoPropiedad(propiedadId, nuevoEstado, userId);
};

// Exportamos todas las funciones de utilidad
export { formatCurrency, formatPrecio };

// Exportación por defecto para mantener compatibilidad
export default {
  getAll: loadPropiedades,
  getActivas,
  create: createPropiedad,
  update: updatePropiedad,
  delete: deletePropiedad,
  toggleEstado: toggleEstadoPropiedad,
  formatCurrency,
  formatPrecio,
};
