/**
 * Servicio para gestionar contratos
 * Proporciona funcionalidades específicas para contratos
 * basadas en el servicio base FirestoreService
 */

import { FirestoreService } from './firestore-base';
import { sortProperties } from '@/config/propertyOrder';
import { where, query, getDocs, collection, getDoc, doc } from 'firebase/firestore';
import { db, storage } from '@/services/firebase';
import { ref as storageRef, deleteObject } from 'firebase/storage';

// Importar utilidades
import { formatCurrency, formatDate, formatDateShort, formatPrecio } from '@/services/format';
import {
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
} from '@/services/date-utils';
import { calcularNuevoPrecioIPC } from '@/services/math-utils';

// Instancia única de la clase (patrón Singleton)
let instance = null;

/**
 * Servicio para gestionar contratos
 * @extends FirestoreService
 */
export class ContratoService extends FirestoreService {
  /**
   * Constructor privado para implementar patrón Singleton
   * @private
   */
  constructor() {
    super('contratos');
  }

  /**
   * Método estático para obtener la instancia única del servicio
   * @returns {ContratoService} Instancia única del servicio
   * @static
   */
  static getInstance() {
    if (!instance) {
      instance = new ContratoService();
    }
    return instance;
  }

  /**
   * Carga todos los contratos
   * @returns {Promise<Array>} - Lista de contratos
   */
  async loadContratos() {
    return this.getAll();
  }

  /**
   * Carga propiedades activas filtradas para contratos
   * @param {boolean} editando - Si está en modo edición
   * @param {string} propiedadIdActual - ID de la propiedad actual (si está editando)
   * @returns {Promise<Array>} - Lista de propiedades disponibles
   */
  async loadPropiedadesParaContratos(editando = false, propiedadIdActual = null) {
    try {
      // Obtener todas las propiedades activas
      const q = query(collection(db, 'propiedades'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      const todasLasPropiedades = sortProperties(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      // Obtener contratos activos
      const contratosData = await this.loadContratos();
      const contratosActivos = contratosData.filter((c) => c.estado);
      const propiedadesConContrato = new Set(contratosActivos.map((c) => c.propiedadId));

      if (editando && propiedadIdActual) {
        // Si está editando, incluir la propiedad actual
        return todasLasPropiedades.filter(
          (propiedad) =>
            !propiedadesConContrato.has(propiedad.id) || propiedad.id === propiedadIdActual
        );
      } else if (!editando) {
        // Si es nuevo contrato, mostrar solo propiedades sin contrato activo
        return todasLasPropiedades.filter((propiedad) => !propiedadesConContrato.has(propiedad.id));
      }

      return todasLasPropiedades;
    } catch (error) {
      console.error('Error al cargar propiedades para contratos:', error);
      return [];
    }
  }

  /**
   * Carga inquilinos activos filtrados para contratos
   * @param {boolean} editando - Si está en modo edición
   * @param {Array} inquilinosIdsActuales - IDs de inquilinos actuales (si está editando)
   * @returns {Promise<Array>} - Lista de inquilinos disponibles
   */
  async loadInquilinosParaContratos(editando = false, inquilinosIdsActuales = []) {
    try {
      // Obtener todos los inquilinos activos
      const q = query(collection(db, 'inquilinos'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      const todosLosInquilinos = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          nombreCompleto: `${data.nombre} ${data.apellidos}`,
        };
      });

      // Obtener contratos activos
      const contratosData = await this.loadContratos();
      const contratosActivos = contratosData.filter((c) => c.estado);

      // Crear conjunto de inquilinos que ya tienen contratos
      const inquilinosConContrato = new Set();
      contratosActivos.forEach((contrato) => {
        if (!editando || (editando && inquilinosIdsActuales.length > 0)) {
          contrato.inquilinosIds.forEach((id) => {
            if (!inquilinosIdsActuales.includes(id)) {
              inquilinosConContrato.add(id);
            }
          });
        }
      });

      if (editando && inquilinosIdsActuales.length > 0) {
        // Si está editando, incluir los inquilinos actuales
        return todosLosInquilinos.filter(
          (inquilino) =>
            !inquilinosConContrato.has(inquilino.id) || inquilinosIdsActuales.includes(inquilino.id)
        );
      } else if (!editando) {
        // Si es nuevo contrato, mostrar solo inquilinos sin contrato activo
        return todosLosInquilinos.filter((inquilino) => !inquilinosConContrato.has(inquilino.id));
      }

      return todosLosInquilinos;
    } catch (error) {
      console.error('Error al cargar inquilinos para contratos:', error);
      return [];
    }
  }

  /**
   * Obtiene un contrato por su ID
   * @param {string} id - ID del contrato
   * @returns {Promise<Object|null>} - Contrato encontrado o null
   */
  async getContratoById(id) {
    return this.getById(id);
  }

  /**
   * Crea un nuevo contrato
   * @param {Object} contratoData - Datos del contrato
   * @param {string} userId - ID del usuario que crea el contrato
   * @returns {Promise<Object|null>} - Contrato creado o null
   */
  async createContrato(contratoData, userId) {
    return this.create(contratoData, userId);
  }

  /**
   * Actualiza un contrato existente
   * @param {string} contratoId - ID del contrato
   * @param {Object} contratoData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} - Contrato actualizado o null
   */
  async updateContrato(contratoId, contratoData, userId) {
    return this.update(contratoId, contratoData, userId);
  }

  /**
   * Elimina un contrato
   * @param {string} contratoId - ID del contrato a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteContrato(contratoId) {
    return this.delete(contratoId);
  }

  /**
   * Cambia el estado de un contrato
   * @param {string} contratoId - ID del contrato
   * @param {boolean} nuevoEstado - Nuevo estado del contrato
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async toggleEstadoContrato(contratoId, nuevoEstado, userId) {
    return this.updateField(contratoId, 'estado', nuevoEstado, userId);
  }

  /**
   * Renueva un contrato actualizando la fecha de renovación
   * @param {string} contratoId - ID del contrato
   * @param {string} nuevaFechaRenovacion - Nueva fecha de renovación
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async renovarContrato(contratoId, nuevaFechaRenovacion, userId) {
    try {
      await this.updateContrato(
        contratoId,
        {
          fechaRenovacion: nuevaFechaRenovacion,
        },
        userId
      );
      return true;
    } catch (error) {
      console.error('Error al renovar contrato:', error);
      return false;
    }
  }

  /**
   * Ajusta el IPC de un contrato
   * @param {string} contratoId - ID del contrato
   * @param {string} nuevoPrecio - Nuevo precio ajustado
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async ajustarIPCContrato(contratoId, nuevoPrecio, userId) {
    try {
      await this.updateContrato(
        contratoId,
        {
          precio: nuevoPrecio,
          ipcAjustado: true,
        },
        userId
      );
      return true;
    } catch (error) {
      console.error('Error al ajustar IPC de contrato:', error);
      return false;
    }
  }

  /**
   * Elimina el documento asociado a un contrato
   * @param {string} contratoId - ID del contrato
   * @param {string} documentoPath - Ruta del documento en Storage
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async eliminarDocumentoContrato(contratoId, documentoPath, userId) {
    try {
      if (!documentoPath) return false;

      const fileRef = storageRef(storage, documentoPath);
      await deleteObject(fileRef);

      await this.updateContrato(
        contratoId,
        {
          documentoUrl: null,
          documentoPath: null,
        },
        userId
      );

      return true;
    } catch (error) {
      console.error('Error al eliminar documento de contrato:', error);
      return false;
    }
  }

  /**
   * Obtiene contratos por ID de propiedad
   * @param {string} propiedadId - ID de la propiedad
   * @returns {Promise<Array>} - Lista de contratos de la propiedad
   */
  async getByPropiedadId(propiedadId) {
    return this.getBy('propiedadId', '==', propiedadId);
  }
}

// Crear una instancia única del servicio
const contratoService = ContratoService.getInstance();

// Exportar funciones de utilidad y formateo
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

// Exportar la instancia del servicio como predeterminada
export default contratoService;
