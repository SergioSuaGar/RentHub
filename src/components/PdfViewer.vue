<template>
  <v-dialog v-model="dialog" class="pdf-viewer-dialog" width="70%" height="70%">
    <v-card class="pdf-viewer-card">
      <v-toolbar flat color="primary" class="text-white">
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="closeDialog">
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
        <object v-else :data="pdfUrl" type="application/pdf" class="pdf-viewer">
          <p>
            Tu navegador no puede mostrar el PDF directamente.
            <a :href="pdfUrl" target="_blank">Haz clic aquí para descargarlo</a>
          </p>
        </object>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
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
      // Limpiar estado cuando se cierra el diálogo
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
  height: 85vh;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  flex: 1;
  height: calc(85vh - 64px); /* Restamos la altura del toolbar */
  overflow: hidden;
  padding: 0 !important;
  background-color: #f5f5f5;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

:deep(.v-overlay__content) {
  max-height: 85vh !important;
}

:deep(.v-card) {
  max-height: 85vh !important;
  border-radius: 4px;
  margin: 24px;
}

:deep(.v-card-text) {
  padding: 0 !important;
}
</style>
