/**
 * Servicio para gestionar facturas
 * Proporciona funcionalidades específicas para facturas
 * basadas en el servicio base FirestoreService
 */

import { FirestoreService } from './firestore-base';
import { sortProperties } from '@/config/propertyOrder';
import { where, query, getDocs, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';

// Importar utilidades
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatImporte,
  formatImportePagado,
} from '@/services/format';
import { calcularDiasEntreFechas, obtenerUltimoDiaMes } from '@/services/date-utils';
import { calcularImporteProporcionalPorDias } from '@/services/math-utils';

// Instancia única de la clase (patrón Singleton)
let instance = null;

/**
 * Servicio para gestionar facturas
 * @extends FirestoreService
 */
export class FacturaService extends FirestoreService {
  /**
   * Constructor privado para implementar patrón Singleton
   * @private
   */
  constructor() {
    super('facturas');
  }

  /**
   * Método estático para obtener la instancia única del servicio
   * @returns {FacturaService} Instancia única del servicio
   * @static
   */
  static getInstance() {
    if (!instance) {
      instance = new FacturaService();
    }
    return instance;
  }

  /**
   * Carga todas las facturas
   * @returns {Promise<Array>} - Lista de facturas
   */
  async loadFacturas() {
    return this.getAll();
  }

  /**
   * Carga las propiedades activas
   * @returns {Promise<Array>} - Lista de propiedades activas ordenadas
   */
  async loadPropiedades() {
    try {
      const q = query(collection(db, 'propiedades'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      const propiedadesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return sortProperties(propiedadesData);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      return [];
    }
  }

  /**
   * Carga los contratos activos
   * @returns {Promise<Array>} - Lista de contratos activos
   */
  async loadContratosActivos() {
    try {
      const q = query(collection(db, 'contratos'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      const contratosActivos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return contratosActivos;
    } catch (error) {
      console.error('Error al cargar contratos activos:', error);
      return [];
    }
  }

  /**
   * Crea una nueva factura
   * @param {Object} facturaData - Datos de la factura
   * @param {string} userId - ID del usuario que crea la factura
   * @returns {Promise<Object|null>} - Factura creada o null
   */
  async createFactura(facturaData, userId) {
    return this.create(facturaData, userId);
  }

  /**
   * Actualiza una factura existente
   * @param {string} facturaId - ID de la factura
   * @param {Object} facturaData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} - Factura actualizada o null
   */
  async updateFactura(facturaId, facturaData, userId) {
    return this.update(facturaId, facturaData, userId);
  }

  /**
   * Elimina una factura
   * @param {string} facturaId - ID de la factura a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteFactura(facturaId) {
    return this.delete(facturaId);
  }

  /**
   * Calcula el importe proporcional de una factura
   * @param {string} precio - Precio base
   * @param {string|Date} fechaInicio - Fecha de inicio
   * @param {string|Date} fechaFin - Fecha de fin
   * @returns {string} - Importe proporcional formateado
   */
  calcularImporteProporcional(precio, fechaInicio, fechaFin) {
    if (!precio || !fechaInicio || !fechaFin) return '';

    // Obtener el último día del mes
    const ultimoDiaMes = obtenerUltimoDiaMes(fechaInicio);

    // Calcular días ocupados
    const diasOcupados = calcularDiasEntreFechas(fechaInicio, fechaFin);

    // Calcular el importe proporcional
    return calcularImporteProporcionalPorDias(precio, diasOcupados, ultimoDiaMes);
  }
}

// Crear una instancia única del servicio
const facturaService = FacturaService.getInstance();

// Exportar funciones de utilidad y formateo
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

// Exportar la instancia del servicio como predeterminada
export default facturaService;
