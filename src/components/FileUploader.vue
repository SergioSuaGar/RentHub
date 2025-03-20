<template>
  <div class="file-uploader">
    <input type="file" ref="fileInput" accept=".pdf" class="hidden" @change="handleFileChange" />
    <v-btn
      :loading="uploading"
      :disabled="uploading"
      color="primary"
      @click="triggerFileInput"
      class="mb-2"
    >
      <v-icon start>mdi-upload</v-icon>
      {{ buttonText }}
    </v-btn>
    <div v-if="currentFile" class="text-body-2 text-grey">
      {{ currentFile.name }}
    </div>
    <v-progress-linear v-if="uploading" v-model="uploadProgress" color="primary" height="20">
      <template v-slot:default> {{ Math.ceil(uploadProgress) }}% </template>
    </v-progress-linear>
    <div v-if="errorMessage" class="text-error mt-2">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { storage } from '@/services/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const props = defineProps({
  folder: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: 'Subir PDF',
  },
});

const emit = defineEmits(['upload-success', 'upload-error']);

const fileInput = ref(null);
const currentFile = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const errorMessage = ref('');

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    errorMessage.value = 'Por favor, selecciona un archivo PDF';
    return;
  }

  currentFile.value = file;
  errorMessage.value = '';
  await uploadFile(file);
};

const uploadFile = async (file) => {
  try {
    uploading.value = true;
    uploadProgress.value = 0;

    // Crear una referencia única usando timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fileRef = storageRef(storage, `${props.folder}/${fileName}`);

    // Iniciar la subida
    const uploadTask = uploadBytesResumable(fileRef, file);

    // Monitorear el progreso
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        errorMessage.value = 'Error al subir el archivo: ' + error.message;
        emit('upload-error', error);
        uploading.value = false;
      },
      async () => {
        // Subida completada exitosamente
        const downloadURL = await getDownloadURL(fileRef);
        emit('upload-success', {
          url: downloadURL,
          name: file.name,
          path: `${props.folder}/${fileName}`,
        });
        uploading.value = false;
        currentFile.value = null;
      }
    );
  } catch (error) {
    errorMessage.value = 'Error al subir el archivo: ' + error.message;
    emit('upload-error', error);
    uploading.value = false;
  }
};
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
