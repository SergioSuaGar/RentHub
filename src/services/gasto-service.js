/**
 * Servicio para gestionar gastos
 * Proporciona funcionalidades específicas para gastos
 * basadas en el servicio base FirestoreService
 */

import { FirestoreService } from './firestore-base';
import { where, query, getDocs, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formatCurrency, formatPrecio } from '@/services/utils/format-utils';
import { formatDate, formatDateShort } from '@/services/utils/date-utils';

// Instancia única de la clase (patrón Singleton)
let instance = null;

/**
 * Servicio para gestionar gastos
 * @extends FirestoreService
 */
export class GastoService extends FirestoreService {
  /**
   * Constructor privado para implementar patrón Singleton
   * @private
   */
  constructor() {
    super('gastos');
  }

  /**
   * Método estático para obtener la instancia única del servicio
   * @returns {GastoService} Instancia única del servicio
   * @static
   */
  static getInstance() {
    if (!instance) {
      instance = new GastoService();
    }
    return instance;
  }

  /**
   * Carga todos los gastos
   * @returns {Promise<Array>} - Lista de gastos
   */
  async loadGastos() {
    return this.getAll();
  }

  /**
   * Carga todos los gastos con información de propiedades
   * @param {Array} propiedades - Lista de propiedades para enriquecer los gastos
   * @returns {Promise<Array>} - Lista de gastos enriquecidos
   */
  async loadGastosConPropiedades(propiedades) {
    try {
      const gastos = await this.getAll();
      return gastos.map((gasto) => {
        const propiedad = propiedades.find((p) => p.id === gasto.propiedadId);
        return {
          ...gasto,
          propiedadNombre: propiedad ? propiedad.nombre : '',
        };
      });
    } catch (error) {
      console.error('Error al cargar gastos con propiedades:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo gasto
   * @param {Object} gastoData - Datos del gasto
   * @param {string} userId - ID del usuario que crea el gasto
   * @returns {Promise<Object|null>} - Gasto creado o null
   */
  async createGasto(gastoData, userId) {
    return this.create(gastoData, userId);
  }

  /**
   * Actualiza un gasto existente
   * @param {string} gastoId - ID del gasto
   * @param {Object} gastoData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} - Gasto actualizado o null
   */
  async updateGasto(gastoId, gastoData, userId) {
    return this.update(gastoId, gastoData, userId);
  }

  /**
   * Elimina un gasto
   * @param {string} gastoId - ID del gasto a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteGasto(gastoId) {
    return this.delete(gastoId);
  }

  /**
   * Obtiene los gastos por tipo
   * @param {string} tipo - Tipo de gasto
   * @returns {Promise<Array>} - Lista de gastos del tipo especificado
   */
  async getGastosPorTipo(tipo) {
    try {
      const q = query(collection(db, 'gastos'), where('tipo', '==', tipo));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener gastos de tipo ${tipo}:`, error);
      return [];
    }
  }

  /**
   * Obtiene los gastos por propiedad
   * @param {string} propiedadId - ID de la propiedad
   * @returns {Promise<Array>} - Lista de gastos de la propiedad especificada
   */
  async getGastosPorPropiedad(propiedadId) {
    try {
      const q = query(collection(db, 'gastos'), where('propiedadId', '==', propiedadId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener gastos de la propiedad ${propiedadId}:`, error);
      return [];
    }
  }

  /**
   * Calcula el total de gastos por tipo
   * @returns {Promise<Object>} - Objeto con totales por tipo de gasto
   */
  async calcularTotalPorTipo() {
    try {
      const gastos = await this.getAll();
      return gastos.reduce((acc, gasto) => {
        const tipo = gasto.tipo || 'Otros';
        if (!acc[tipo]) acc[tipo] = 0;

        const importe = parseFloat(gasto.importeTotal?.toString().replace(',', '.') || 0);
        acc[tipo] += importe;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error al calcular totales por tipo:', error);
      return {};
    }
  }
}

// Crear una instancia única del servicio
const gastoService = GastoService.getInstance();

// Exportar las funciones de formateo necesarias
export { formatCurrency, formatDate, formatDateShort, formatPrecio };

// Exportar la instancia del servicio como predeterminada
export default gastoService;
