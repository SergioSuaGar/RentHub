/**
 * Servicio para gestionar propiedades
 * Proporciona funcionalidades específicas para propiedades
 * basadas en el servicio base FirestoreService
 */

import { FirestoreService } from './firestore-base';
import { where, query, getDocs, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formatCurrency, formatPrecio } from '@/services/utils/format-utils';

// Instancia única de la clase (patrón Singleton)
let instance = null;

/**
 * Servicio para gestionar propiedades
 * @extends FirestoreService
 */
export class PropiedadService extends FirestoreService {
  /**
   * Constructor privado para implementar patrón Singleton
   * @private
   */
  constructor() {
    super('propiedades');
  }

  /**
   * Método estático para obtener la instancia única del servicio
   * @returns {PropiedadService} Instancia única del servicio
   * @static
   */
  static getInstance() {
    if (!instance) {
      instance = new PropiedadService();
    }
    return instance;
  }

  /**
   * Carga todas las propiedades
   * @returns {Promise<Array>} - Lista de propiedades
   */
  async loadPropiedades() {
    return this.getAll();
  }

  /**
   * Carga las propiedades activas
   * @returns {Promise<Array>} - Lista de propiedades activas
   */
  async getActivas() {
    try {
      const q = query(collection(db, 'propiedades'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error al cargar propiedades activas:', error);
      return [];
    }
  }

  /**
   * Carga las propiedades activas (alias de getActivas para mantener consistencia en API)
   * @returns {Promise<Array>} - Lista de propiedades activas
   */
  async loadPropiedadesActivas() {
    return this.getActivas();
  }

  /**
   * Crea una nueva propiedad
   * @param {Object} propiedadData - Datos de la propiedad
   * @param {string} userId - ID del usuario que crea la propiedad
   * @returns {Promise<Object|null>} - Propiedad creada o null
   */
  async createPropiedad(propiedadData, userId) {
    return this.create(propiedadData, userId);
  }

  /**
   * Actualiza una propiedad existente
   * @param {string} propiedadId - ID de la propiedad
   * @param {Object} propiedadData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} - Propiedad actualizada o null
   */
  async updatePropiedad(propiedadId, propiedadData, userId) {
    return this.update(propiedadId, propiedadData, userId);
  }

  /**
   * Elimina una propiedad
   * @param {string} propiedadId - ID de la propiedad a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deletePropiedad(propiedadId) {
    return this.delete(propiedadId);
  }

  /**
   * Cambia el estado de una propiedad
   * @param {string} propiedadId - ID de la propiedad
   * @param {boolean} nuevoEstado - Nuevo estado
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async toggleEstadoPropiedad(propiedadId, nuevoEstado, userId) {
    return this.updateField(propiedadId, 'estado', nuevoEstado, userId);
  }
}

// Crear una instancia única del servicio
const propiedadService = PropiedadService.getInstance();

// Exportar las funciones de formateo necesarias
export { formatCurrency, formatPrecio };

// Exportar la instancia del servicio como predeterminada
export default propiedadService;
