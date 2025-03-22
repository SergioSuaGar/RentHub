/**
 * Servicio base para operaciones CRUD en Firestore
 * Proporciona una capa de abstracción para interactuar con Firestore
 * y gestionar documentos de manera consistente en toda la aplicación
 */

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Clase base para servicios que interactúan con Firestore
 * Proporciona métodos genéricos para realizar operaciones CRUD
 */
export class FirestoreService {
  /**
   * Crea una nueva instancia del servicio para una colección específica
   * @param {string} collectionName - Nombre de la colección en Firestore
   */
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  /**
   * Obtiene todos los documentos de la colección, con opción de filtrado
   * @param {Object} options - Opciones de consulta
   * @param {Array} options.whereClause - Array de cláusulas where [campo, operador, valor]
   * @param {Array} options.orderByField - Campo para ordenar los resultados
   * @param {string} options.orderDirection - Dirección de ordenación ('asc' o 'desc')
   * @param {number} options.limitTo - Número máximo de documentos a recuperar
   * @returns {Promise<Array>} - Array de documentos
   */
  async getAll(options = {}) {
    try {
      let q = this.collectionRef;

      // Aplicar filtros where si se especifican
      if (options.whereClause && options.whereClause.length) {
        options.whereClause.forEach((clause) => {
          if (clause.length === 3) {
            q = query(q, where(clause[0], clause[1], clause[2]));
          }
        });
      }

      // Aplicar ordenación si se especifica
      if (options.orderByField) {
        const direction = options.orderDirection === 'desc' ? 'desc' : 'asc';
        q = query(q, orderBy(options.orderByField, direction));
      }

      // Aplicar límite si se especifica
      if (options.limitTo && typeof options.limitTo === 'number') {
        q = query(q, limit(options.limitTo));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener documentos de ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Obtiene un documento por su ID
   * @param {string} id - ID del documento
   * @returns {Promise<Object|null>} - Documento encontrado o null
   */
  async getById(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data(),
        };
      }
      return null;
    } catch (error) {
      console.error(`Error al obtener documento de ${this.collectionName} por ID:`, error);
      return null;
    }
  }

  /**
   * Obtiene documentos por un campo específico
   * @param {string} field - Campo a filtrar
   * @param {string} operator - Operador de comparación ('==', '>', '<', etc.)
   * @param {any} value - Valor a comparar
   * @returns {Promise<Array>} - Array de documentos que coinciden
   */
  async getBy(field, operator, value) {
    try {
      const q = query(this.collectionRef, where(field, operator, value));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener documentos de ${this.collectionName} por ${field}:`, error);
      return [];
    }
  }

  /**
   * Crea un nuevo documento
   * @param {Object} data - Datos del documento
   * @param {string} userId - ID del usuario que crea el documento
   * @returns {Promise<Object|null>} - Documento creado o null
   */
  async create(data, userId) {
    try {
      // Añadir metadatos
      const timestamp = new Date().toISOString();
      const docData = {
        ...data,
        createdAt: timestamp,
        createdBy: userId,
        updatedAt: timestamp,
        updatedBy: userId,
      };

      // Crear documento con ID generado automáticamente
      const docRef = doc(this.collectionRef);
      await setDoc(docRef, docData);

      return {
        id: docRef.id,
        ...docData,
      };
    } catch (error) {
      console.error(`Error al crear documento en ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Actualiza un documento existente
   * @param {string} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza el documento
   * @param {boolean} merge - Si se deben combinar los datos (true) o reemplazar (false)
   * @returns {Promise<Object|null>} - Documento actualizado o null
   */
  async update(id, data, userId, merge = true) {
    try {
      // Añadir metadatos de actualización
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      };

      await setDoc(doc(this.collectionRef, id), updateData, { merge });

      return {
        id,
        ...updateData,
      };
    } catch (error) {
      console.error(`Error al actualizar documento en ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Elimina un documento
   * @param {string} id - ID del documento a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id) {
    try {
      await deleteDoc(doc(this.collectionRef, id));
      return true;
    } catch (error) {
      console.error(`Error al eliminar documento de ${this.collectionName}:`, error);
      return false;
    }
  }

  /**
   * Actualiza un campo específico de un documento
   * @param {string} id - ID del documento
   * @param {string} field - Campo a actualizar
   * @param {any} value - Nuevo valor
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async updateField(id, field, value, userId) {
    try {
      const updateData = {
        [field]: value,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      };

      await setDoc(doc(this.collectionRef, id), updateData, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error al actualizar campo de ${this.collectionName}:`, error);
      return false;
    }
  }
}
