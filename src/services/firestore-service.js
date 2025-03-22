/**
 * Servicio base para operaciones con Firestore
 * Proporciona métodos CRUD genéricos para colecciones de Firestore
 */

import { db } from '@/services/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Clase base para servicios de Firestore
 * Proporciona operaciones CRUD genéricas para cualquier colección
 */
export class FirestoreService {
  /**
   * Constructor del servicio
   * @param {string} collectionName - Nombre de la colección en Firestore
   */
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  /**
   * Obtiene todos los documentos de la colección
   * @param {Array} orderByFields - Campos para ordenar (opcional)
   * @param {Array} whereConditions - Condiciones de filtrado (opcional)
   * @param {number} limitCount - Límite de resultados (opcional)
   * @returns {Promise<Array>} - Lista de documentos
   */
  async getAll(orderByFields = [], whereConditions = [], limitCount = null) {
    try {
      let q = this.collectionRef;

      // Aplicar condiciones where si existen
      if (whereConditions.length > 0) {
        whereConditions.forEach((condition) => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }

      // Aplicar ordenamiento si existe
      if (orderByFields.length > 0) {
        orderByFields.forEach((field) => {
          q = query(q, orderBy(field.field, field.direction || 'asc'));
        });
      }

      // Aplicar límite si existe
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener documentos de ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un documento por su ID
   * @param {string} id - ID del documento
   * @returns {Promise<Object|null>} - Documento o null si no existe
   */
  async getById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener documento ${id} de ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo documento
   * @param {Object} data - Datos del documento
   * @param {string} userId - ID del usuario que crea el documento
   * @returns {Promise<Object>} - Documento creado con su ID
   */
  async create(data, userId = null) {
    try {
      // Añadir metadatos de auditoría
      const dataWithMetadata = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(userId ? { createdBy: userId } : {}),
      };

      const docRef = await addDoc(this.collectionRef, dataWithMetadata);

      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error(`Error al crear documento en ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un documento existente
   * @param {string} id - ID del documento a actualizar
   * @param {Object} data - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza el documento
   * @returns {Promise<Object>} - Documento actualizado
   */
  async update(id, data, userId = null) {
    try {
      const docRef = doc(db, this.collectionName, id);

      // Añadir metadatos de auditoría
      const dataWithMetadata = {
        ...data,
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      };

      await updateDoc(docRef, dataWithMetadata);

      return {
        id,
        ...data,
      };
    } catch (error) {
      console.error(`Error al actualizar documento ${id} en ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un campo específico de un documento
   * @param {string} id - ID del documento a actualizar
   * @param {string} field - Campo a actualizar
   * @param {any} value - Nuevo valor
   * @param {string} userId - ID del usuario que realiza la actualización
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  async updateField(id, field, value, userId = null) {
    try {
      const docRef = doc(db, this.collectionName, id);

      // Preparar datos a actualizar
      const updateData = {
        [field]: value,
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      };

      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error(`Error al actualizar campo ${field} en documento ${id}:`, error);
      return false;
    }
  }

  /**
   * Elimina un documento
   * @param {string} id - ID del documento a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error al eliminar documento ${id} de ${this.collectionName}:`, error);
      return false;
    }
  }

  /**
   * Obtiene documentos por un campo específico
   * @param {string} field - Campo para filtrar
   * @param {any} value - Valor a buscar
   * @param {string} operator - Operador de comparación (==, >, <, etc.)
   * @returns {Promise<Array>} - Lista de documentos que cumplen la condición
   */
  async getByField(field, value, operator = '==') {
    try {
      const q = query(this.collectionRef, where(field, operator, value));

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener documentos por campo ${field}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene documentos con paginación
   * @param {number} pageSize - Tamaño de página
   * @param {Object} lastDocument - Último documento de la página anterior
   * @param {Array} orderByFields - Campos para ordenar
   * @param {Array} whereConditions - Condiciones de filtrado
   * @returns {Promise<Object>} - Objeto con documentos y último documento
   */
  async getPaginated(pageSize = 10, lastDocument = null, orderByFields = [], whereConditions = []) {
    try {
      let q = this.collectionRef;

      // Aplicar condiciones where si existen
      if (whereConditions.length > 0) {
        whereConditions.forEach((condition) => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }

      // Aplicar ordenamiento - necesario para la paginación
      if (orderByFields.length > 0) {
        orderByFields.forEach((field) => {
          q = query(q, orderBy(field.field, field.direction || 'asc'));
        });
      } else {
        // Ordenamiento por defecto si no se especifica
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Aplicar cursor si existe
      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      // Aplicar límite
      q = query(q, limit(pageSize));

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Obtener el último documento para la siguiente página
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        documents,
        lastDocument: lastVisible,
        hasMore: documents.length === pageSize,
      };
    } catch (error) {
      console.error(`Error al obtener documentos paginados de ${this.collectionName}:`, error);
      throw error;
    }
  }
}
