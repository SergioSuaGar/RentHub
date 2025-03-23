import gastoService from './gasto-service';

// Importar funciones de formato
import { formatCurrency, formatPrecio } from '@/services/utils/format-utils';
// Importar funciones de date-utils
import { formatDate, formatDateShort } from '@/services/utils/date-utils';

// Cargar gastos
export const loadGastos = async () => {
  return gastoService.loadGastos();
};

// Cargar gastos con información de propiedades
export const loadGastosConPropiedades = async () => {
  return gastoService.loadGastosConPropiedades();
};

// Obtener gasto por ID
export const getGastoById = async (id) => {
  return gastoService.getById(id);
};

// Crear un nuevo gasto
export const createGasto = async (gastoData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return gastoService.createGasto(gastoData, userId);
};

// Actualizar un gasto
export const updateGasto = async (gastoId, gastoData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return gastoService.updateGasto(gastoId, gastoData, userId);
};

// Eliminar un gasto
export const deleteGasto = async (gastoId) => {
  return gastoService.deleteGasto(gastoId);
};

// Obtener gastos por propiedad
export const getGastosPorPropiedad = async (propiedadId) => {
  return gastoService.getGastosPorPropiedad(propiedadId);
};

// Calcular total por tipo
export const calcularTotalPorTipo = async () => {
  return gastoService.calcularTotalPorTipo();
};

// Exportaciones de funciones de utilidad
export { formatCurrency, formatPrecio, formatDate, formatDateShort };

// Exportación predeterminada
export default {
  loadGastos,
  loadGastosConPropiedades,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
  getGastosPorPropiedad,
  calcularTotalPorTipo,
  formatCurrency,
  formatPrecio,
  formatDate,
  formatDateShort,
};
