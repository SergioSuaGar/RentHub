<template>
  <v-dialog v-model="dialog" class="pdf-viewer-dialog" width="70%" height="70%">
    <v-card class="pdf-viewer-card">
      <v-toolbar flat color="primary" class="text-white">
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="closeDialog" :title="'Cerrar'">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-0 pdf-container">
        <div v-if="loading" class="d-flex justify-center align-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div v-else-if="error" class="d-flex flex-column justify-center align-center pa-4">
          <v-icon color="error" size="48" class="mb-2">mdi-alert-circle</v-icon>
          <div class="text-error text-body-1 text-center">{{ error }}</div>
          <v-btn color="primary" variant="text" class="mt-4" @click="retryLoad" v-if="canRetry">
            Reintentar
          </v-btn>
        </div>
        <div v-else class="pdf-viewer-container">
          <iframe :src="viewerUrl" class="pdf-viewer" frameborder="0" allowfullscreen></iframe>
          <div class="pdf-actions">
            <v-btn
              color="primary"
              variant="text"
              :href="pdfUrl"
              target="_blank"
              prepend-icon="mdi-download"
              class="mt-2"
            >
              Descargar PDF
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

const props = defineProps({
  modelValue: Boolean,
  filePath: String,
  title: {
    type: String,
    default: 'Visor de PDF',
  },
});

const emit = defineEmits(['update:modelValue']);

const dialog = ref(false);
const loading = ref(false);
const error = ref(null);
const pdfUrl = ref(null);
const canRetry = ref(false);

// URL para el visor de Google Docs
const viewerUrl = computed(() => {
  if (!pdfUrl.value) return '';
  // Usar el visor de Google Docs
  return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl.value)}&embedded=true`;
});

watch(
  () => props.modelValue,
  async (newVal) => {
    dialog.value = newVal;
    if (newVal && props.filePath) {
      await loadPdf();
    }
  }
);

watch(
  () => dialog.value,
  (newVal) => {
    emit('update:modelValue', newVal);
    if (!newVal) {
      pdfUrl.value = null;
      error.value = null;
      canRetry.value = false;
    }
  }
);

const loadPdf = async () => {
  if (!props.filePath) {
    error.value = 'No hay documento adjunto para este contrato.';
    canRetry.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  canRetry.value = false;

  try {
    const storage = getStorage();
    const fileRef = storageRef(storage, props.filePath);
    const url = await getDownloadURL(fileRef);
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

const retryLoad = () => {
  if (props.filePath) {
    loadPdf();
  }
};

const closeDialog = () => {
  dialog.value = false;
};
</script>

<style scoped>
.pdf-viewer-dialog {
  margin: 0;
}

.pdf-viewer-card {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  flex: 1;
  height: calc(70vh - 64px);
  overflow: hidden;
  padding: 0 !important;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.pdf-viewer-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-viewer {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-actions {
  display: flex;
  justify-content: center;
  padding: 8px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

:deep(.v-card) {
  max-height: 70vh !important;
  border-radius: 4px;
  margin: 24px;
}

:deep(.v-card-text) {
  padding: 0 !important;
}
</style>
