/**
 * Servicio de utilidades para gestionar documentos en Firebase Storage
 * Proporciona funciones para subir, eliminar y manipular archivos
 */

import { storage } from '@/services/firebase';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * Sube un archivo a Firebase Storage
 * @param {File} file - Archivo a subir
 * @param {string} path - Ruta donde guardar el archivo
 * @param {Function} onProgress - Callback para seguir el progreso de la subida
 * @returns {Promise<Object>} - Objeto con la URL y la ruta del archivo
 */
export const uploadFile = (file, path, onProgress = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se ha proporcionado ningún archivo'));
      return;
    }

    const filePath = `${path}/${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calcular y reportar progreso si se proporciona callback
        if (onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Error al subir archivo:', error);
        reject(error);
      },
      async () => {
        try {
          // Obtener URL de descarga
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: filePath,
          });
        } catch (error) {
          console.error('Error al obtener URL de descarga:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Elimina un archivo de Firebase Storage
 * @param {string} filePath - Ruta del archivo a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const deleteFile = async (filePath) => {
  if (!filePath) return Promise.resolve(false);

  try {
    const fileRef = storageRef(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

/**
 * Obtiene la URL de descarga de un archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<string|null>} - URL de descarga o null si hay error
 */
export const getFileUrl = async (filePath) => {
  if (!filePath) return Promise.resolve(null);

  try {
    const fileRef = storageRef(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error al obtener URL del archivo:', error);
    return null;
  }
};

/**
 * Verifica si un archivo existe en Firebase Storage
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<boolean>} - true si el archivo existe
 */
export const fileExists = async (filePath) => {
  if (!filePath) return Promise.resolve(false);

  try {
    await getDownloadURL(storageRef(storage, filePath));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el nombre del archivo de una ruta
 * @param {string} filePath - Ruta completa del archivo
 * @returns {string} - Nombre del archivo
 */
export const getFileName = (filePath) => {
  if (!filePath) return '';
  return filePath.split('/').pop() || '';
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} fileName - Nombre del archivo
 * @returns {string} - Extensión del archivo
 */
export const getFileExtension = (fileName) => {
  if (!fileName) return '';
  return fileName.split('.').pop().toLowerCase() || '';
};

/**
 * Comprueba si la extensión del archivo es válida
 * @param {string} fileName - Nombre del archivo
 * @param {Array} allowedExtensions - Array de extensiones permitidas
 * @returns {boolean} - true si la extensión es válida
 */
export const isValidFileExtension = (fileName, allowedExtensions = []) => {
  if (!fileName || !allowedExtensions.length) return false;

  const extension = getFileExtension(fileName);
  return allowedExtensions.includes(extension);
};

/**
 * Convierte el tamaño de un archivo a un formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};
