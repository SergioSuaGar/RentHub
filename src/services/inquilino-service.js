/**
 * Servicio para gestionar inquilinos
 * Proporciona funcionalidades específicas para inquilinos
 * basadas en el servicio base FirestoreService
 */

import { FirestoreService } from './firestore-base';
import {
  where,
  query,
  getDocs,
  collection,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formatDate, formatDateShort } from '@/services/utils/date-utils';

// Instancia única de la clase (patrón Singleton)
let instance = null;

/**
 * Servicio para gestionar inquilinos
 * @extends FirestoreService
 */
export class InquilinoService extends FirestoreService {
  /**
   * Constructor privado para implementar patrón Singleton
   * @private
   */
  constructor() {
    super('inquilinos');
  }

  /**
   * Método estático para obtener la instancia única del servicio
   * @returns {InquilinoService} Instancia única del servicio
   * @static
   */
  static getInstance() {
    if (!instance) {
      instance = new InquilinoService();
    }
    return instance;
  }

  /**
   * Carga todos los inquilinos
   * @returns {Promise<Array>} - Lista de inquilinos
   */
  async loadInquilinos() {
    return this.getAll();
  }

  /**
   * Carga los inquilinos activos
   * @returns {Promise<Array>} - Lista de inquilinos activos con nombre completo
   */
  async getActivos() {
    try {
      const q = query(collection(db, 'inquilinos'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          nombreCompleto: `${data.nombre} ${data.apellidos}`,
        };
      });
    } catch (error) {
      console.error('Error al cargar inquilinos activos:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo inquilino
   * @param {Object} inquilinoData - Datos del inquilino
   * @param {string} userId - ID del usuario que crea el inquilino
   * @returns {Promise<Object|null>} - Inquilino creado o null
   */
  async createInquilino(inquilinoData, userId) {
    return this.create(inquilinoData, userId);
  }

  /**
   * Actualiza un inquilino existente
   * @param {string} inquilinoId - ID del inquilino
   * @param {Object} inquilinoData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} - Inquilino actualizado o null
   */
  async updateInquilino(inquilinoId, inquilinoData, userId) {
    return this.update(inquilinoId, inquilinoData, userId);
  }

  /**
   * Elimina un inquilino
   * @param {string} inquilinoId - ID del inquilino a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteInquilino(inquilinoId) {
    return this.delete(inquilinoId);
  }

  /**
   * Cambia el estado de un inquilino
   * @param {string} inquilinoId - ID del inquilino
   * @param {boolean} nuevoEstado - Nuevo estado
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async toggleEstadoInquilino(inquilinoId, nuevoEstado, userId) {
    return this.updateField(inquilinoId, 'estado', nuevoEstado, userId);
  }

  /**
   * Verifica si un DNI ya existe en la base de datos
   * @param {string} dni - DNI a verificar
   * @param {string} [inquilinoIdActual] - ID del inquilino actual (para excluirlo en la verificación)
   * @returns {Promise<boolean>} - true si el DNI ya existe
   */
  async verificarDniExistente(dni, inquilinoIdActual = null) {
    try {
      const q = query(collection(db, 'inquilinos'), where('dni', '==', dni));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      // Si hay resultados, verificar que no sea el mismo inquilino
      if (inquilinoIdActual) {
        return querySnapshot.docs.some((doc) => doc.id !== inquilinoIdActual);
      }

      return true;
    } catch (error) {
      console.error('Error al verificar DNI:', error);
      return false;
    }
  }
}

// Crear una instancia única del servicio
const inquilinoService = InquilinoService.getInstance();

// Exportar las funciones de formateo necesarias
export { formatDate, formatDateShort };

// Exportar la instancia del servicio como predeterminada
export default inquilinoService;
