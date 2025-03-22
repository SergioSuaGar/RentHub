import { ref } from 'vue';

export default function usePdfLoader(storageService) {
  const loading = ref(false);
  const error = ref(null);
  const pdfUrl = ref(null);
  const canRetry = ref(false);

  const loadPdf = async (filePath) => {
    if (!filePath) {
      error.value = 'No hay documento adjunto para este contrato.';
      canRetry.value = false;
      return;
    }

    loading.value = true;
    error.value = null;
    canRetry.value = false;

    try {
      const url = await storageService.getDownloadURL(filePath);
      pdfUrl.value = url;
    } catch (err) {
      console.error('Error al cargar el PDF:', err);
      if (err.code === 'storage/object-not-found') {
        error.value = 'El documento no se encuentra disponible.';
      } else {
        error.value = 'Error al cargar el documento. Por favor, inténtelo de nuevo.';
        canRetry.value = true;
      }
    } finally {
      loading.value = false;
    }
  };

  const retryLoad = (filePath) => {
    if (filePath) {
      loadPdf(filePath);
    }
  };

  return {
    loading,
    error,
    pdfUrl,
    canRetry,
    loadPdf,
    retryLoad,
  };
}
