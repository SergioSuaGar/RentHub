import { ContratoService } from './contrato-service';

// Importar funciones de format
import { formatCurrency, formatPrecio } from '@/services/utils/format-utils';
// Importar funciones de date-utils
import {
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  formatDate,
  formatDateShort,
} from '@/services/utils/date-utils';
// Importar funciones de math-utils
import { calcularNuevoPrecioIPC } from '@/services/utils/math-utils';

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

// Exportaciones
export {
  formatCurrency,
  formatPrecio,
  formatDate,
  formatDateShort,
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  calcularNuevoPrecioIPC,
};

// Exportación predeterminada
export default {
  loadContratos,
  loadPropiedadesParaContratos,
  loadInquilinosParaContratos,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato,
  toggleEstadoContrato,
  renovarContrato,
  ajustarIPCContrato,
  eliminarDocumentoContrato,
  getByPropiedadId,
  formatCurrency,
  formatPrecio,
  formatDate,
  formatDateShort,
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  calcularNuevoPrecioIPC,
};
