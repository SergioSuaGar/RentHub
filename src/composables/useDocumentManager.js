/**
 * Composable para gestionar documentos (archivos) en Firebase Storage
 * Proporciona funcionalidad para subir, eliminar y gestionar documentos
 * integrado con los servicios de Firebase
 */

import { ref, computed } from 'vue';
import {
  uploadFile,
  deleteFile,
  getFileUrl,
  getFileName,
  isValidFileExtension,
  formatFileSize,
} from '@/services/utils/document-utils';

/**
 * Hook para gestionar documentos
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.allowedExtensions - Extensiones de archivo permitidas
 * @param {number} options.maxSizeInMB - Tamaño máximo del archivo en MB
 * @param {string} options.storagePath - Ruta base en Storage para guardar archivos
 * @param {Object} options.entityService - Servicio para actualizar la entidad relacionada
 * @returns {Object} - Funciones y estado para gestionar documentos
 */
export function useDocumentManager(options = {}) {
  const {
    allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    maxSizeInMB = 5,
    storagePath = 'documents',
    entityService = null,
  } = options;

  // Estado
  const uploading = ref(false);
  const deleting = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref(null);
  const fileInfo = ref(null);
  const maxSizeInBytes = computed(() => maxSizeInMB * 1024 * 1024);

  /**
   * Valida un archivo antes de subirlo
   * @param {File} file - Archivo a validar
   * @returns {boolean} - true si el archivo es válido
   */
  const validateFile = (file) => {
    uploadError.value = null;

    // Validar tamaño
    if (file.size > maxSizeInBytes.value) {
      uploadError.value = `El archivo excede el tamaño máximo de ${maxSizeInMB}MB`;
      return false;
    }

    // Validar extensión
    if (!isValidFileExtension(file.name, allowedExtensions)) {
      uploadError.value = `Tipo de archivo no permitido. Extensiones válidas: ${allowedExtensions.join(', ')}`;
      return false;
    }

    return true;
  };

  /**
   * Sube un archivo a Firebase Storage
   * @param {File} file - Archivo a subir
   * @param {string} customPath - Ruta personalizada (opcional)
   * @returns {Promise<Object|null>} - Información del archivo subido o null si hay error
   */
  const uploadDocument = async (file, customPath = null) => {
    if (!file) return null;
    if (!validateFile(file)) return null;

    uploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;

    try {
      const path = customPath || `${storagePath}/${Date.now()}`;

      const result = await uploadFile(file, path, (progress) => {
        uploadProgress.value = progress;
      });

      fileInfo.value = {
        name: getFileName(result.path),
        url: result.url,
        path: result.path,
        size: formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified),
      };

      return fileInfo.value;
    } catch (error) {
      console.error('Error al subir documento:', error);
      uploadError.value = error.message || 'Error al subir el archivo';
      return null;
    } finally {
      uploading.value = false;
    }
  };

  /**
   * Elimina un documento
   * @param {string} filePath - Ruta del documento a eliminar
   * @param {string} entityId - ID de la entidad asociada (si aplica)
   * @param {string} userId - ID del usuario que elimina el documento
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  const deleteDocument = async (filePath, entityId = null, userId = null) => {
    if (!filePath) return false;

    deleting.value = true;
    uploadError.value = null;

    try {
      const success = await deleteFile(filePath);

      if (success && entityId && userId && entityService) {
        // Actualizar la entidad para eliminar referencias al documento
        await entityService.updateField(entityId, 'documentoUrl', null, userId);
        await entityService.updateField(entityId, 'documentoPath', null, userId);
      }

      fileInfo.value = null;
      return success;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      uploadError.value = error.message || 'Error al eliminar el archivo';
      return false;
    } finally {
      deleting.value = false;
    }
  };

  /**
   * Obtiene la URL de un documento
   * @param {string} filePath - Ruta del documento
   * @returns {Promise<string|null>} - URL del documento o null
   */
  const getDocumentUrl = async (filePath) => {
    if (!filePath) return null;

    try {
      return await getFileUrl(filePath);
    } catch (error) {
      console.error('Error al obtener URL del documento:', error);
      return null;
    }
  };

  /**
   * Resetea el estado del gestor de documentos
   */
  const reset = () => {
    uploading.value = false;
    deleting.value = false;
    uploadProgress.value = 0;
    uploadError.value = null;
    fileInfo.value = null;
  };

  // Valores y funciones expuestas por el composable
  return {
    // Estado
    uploading,
    deleting,
    uploadProgress,
    uploadError,
    fileInfo,

    // Getters computados
    maxSizeInBytes,

    // Métodos
    validateFile,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    reset,
  };
}
