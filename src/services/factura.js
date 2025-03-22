import { FacturaService } from './factura-service';

// Re-exportar las funciones de formato y utilidades
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatImporte,
  formatImportePagado,
  calcularDiasEntreFechas,
  obtenerUltimoDiaMes,
  calcularImporteProporcionalPorDias,
} from './factura-service';

// Obtener la instancia del servicio
const facturaService = FacturaService.getInstance();

// Cargar facturas
export const loadFacturas = async () => {
  return facturaService.loadFacturas();
};

// Cargar propiedades para facturas
export const loadPropiedades = async () => {
  return facturaService.loadPropiedades();
};

// Cargar contratos activos
export const loadContratosActivos = async () => {
  return facturaService.loadContratosActivos();
};

// Crear factura
export const createFactura = async (facturaData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return facturaService.createFactura(facturaData, userId);
};

// Actualizar factura
export const updateFactura = async (facturaId, facturaData, user) => {
  const userId = user && user.uid ? user.uid : user;
  return facturaService.updateFactura(facturaId, facturaData, userId);
};

// Eliminar factura
export const deleteFactura = async (facturaId) => {
  return facturaService.deleteFactura(facturaId);
};

// Calcular importe proporcional
export const calcularImporteProporcional = (precio, fechaInicio, fechaFin) => {
  return facturaService.calcularImporteProporcional(precio, fechaInicio, fechaFin);
};

// Exportamos todas las funciones de utilidad
export {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatImporte,
  formatImportePagado,
  calcularDiasEntreFechas,
  obtenerUltimoDiaMes,
  calcularImporteProporcionalPorDias,
};

// Crear una exportación por defecto para mantener la compatibilidad con el código existente
export default {
  loadFacturas,
  loadPropiedades,
  loadContratosActivos,
  createFactura,
  updateFactura,
  deleteFactura,
  calcularImporteProporcional,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatImporte,
  formatImportePagado,
  calcularDiasEntreFechas,
  obtenerUltimoDiaMes,
  calcularImporteProporcionalPorDias,
};
