import { ContratoService } from './contrato-service';

// Re-exportar las funciones de formato y utilidades
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatPrecio,
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  calcularNuevoPrecioIPC,
} from './contrato-service';

// Obtener la instancia del servicio
const contratoService = ContratoService.getInstance();

// Cargar contratos
export const loadContratos = async () => {
  return contratoService.loadContratos();
};

// Cargar propiedades para contratos
export const loadPropiedadesParaContratos = async (editando = false, propiedadIdActual = null) => {
  return contratoService.loadPropiedadesParaContratos(editando, propiedadIdActual);
};

// Cargar inquilinos para contratos
export const loadInquilinosParaContratos = async (editando = false, inquilinosIdsActuales = []) => {
  return contratoService.loadInquilinosParaContratos(editando, inquilinosIdsActuales);
};

// Obtener contrato por ID
export const getContratoById = async (id) => {
  return contratoService.getContratoById(id);
};

// Crear un nuevo contrato
export const createContrato = async (contratoData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return contratoService.createContrato(contratoData, userId);
};

// Actualizar un contrato
export const updateContrato = async (contratoId, contratoData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return contratoService.updateContrato(contratoId, contratoData, userId);
};

// Eliminar un contrato
export const deleteContrato = async (contratoId) => {
  return contratoService.deleteContrato(contratoId);
};

// Cambiar estado de un contrato
export const toggleEstadoContrato = async (contratoId, nuevoEstado, user) => {
  const userId = user && user.uid ? user.uid : user;
  return contratoService.toggleEstadoContrato(contratoId, nuevoEstado, userId);
};

// Renovar un contrato
export const renovarContrato = async (contratoId, nuevaFechaRenovacion, user) => {
  const userId = user && user.uid ? user.uid : user;
  return contratoService.renovarContrato(contratoId, nuevaFechaRenovacion, userId);
};

// Ajustar IPC de un contrato
export const ajustarIPCContrato = async (contratoId, nuevoPrecio, user) => {
  const userId = user && user.uid ? user.uid : user;
  return contratoService.ajustarIPCContrato(contratoId, nuevoPrecio, userId);
};

// Eliminar documento de un contrato
export const eliminarDocumentoContrato = async (contratoId, documentoPath, user) => {
  const userId = user && user.uid ? user.uid : user;
  return contratoService.eliminarDocumentoContrato(contratoId, documentoPath, userId);
};

// Obtener contratos por ID de propiedad
export const getByPropiedadId = async (propiedadId) => {
  return contratoService.getByPropiedadId(propiedadId);
};

// Exportamos todas las funciones de utilidad
export {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatPrecio,
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  calcularNuevoPrecioIPC,
};

// Crear una exportación por defecto para mantener la compatibilidad con el código existente
export default {
  getAll: loadContratos,
  getById: getContratoById,
  create: createContrato,
  update: updateContrato,
  delete: deleteContrato,
  getByPropiedadId,
  loadPropiedadesParaContratos,
  loadInquilinosParaContratos,
  toggleEstadoContrato,
  renovarContrato,
  ajustarIPCContrato,
  eliminarDocumentoContrato,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatPrecio,
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  calcularNuevoPrecioIPC,
};
