<template>
  <v-dialog :model-value="dialogComputed" @update:model-value="updateDialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">¿Estás seguro de eliminar este inquilino?</v-card-title>
      <v-card-text v-if="inquilinoConContratos">
        <v-alert type="warning" title="¡Atención!" variant="tonal" density="compact">
          Este inquilino tiene contratos asociados. Al eliminarlo, estos contratos quedarán sin este
          inquilino asignado.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          variant="text"
          @click="closeDialog"
          :title="'Cancelar la eliminación'"
        >
          No
        </v-btn>
        <v-btn
          color="error"
          variant="text"
          @click="confirmDelete"
          :loading="deleting"
          :title="'Confirmar la eliminación del inquilino'"
        >
          Sí
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

const props = defineProps({
  dialog: Boolean,
  inquilino: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:dialog', 'delete']);

// Computed property para manejar v-model bidireccional
const dialogComputed = computed({
  get: () => props.dialog,
  set: (value) => emit('update:dialog', value),
});

// Función auxiliar para actualizar el diálogo
const updateDialog = (value) => {
  emit('update:dialog', value);
};

const deleting = ref(false);
const inquilinoConContratos = ref(false);

// Verificar si el inquilino tiene contratos asociados
const verificarContratos = async () => {
  if (!props.inquilino.id) return;

  try {
    const q = query(
      collection(db, 'contratos'),
      where('inquilinosIds', 'array-contains', props.inquilino.id)
    );
    const snapshot = await getDocs(q);
    inquilinoConContratos.value = !snapshot.empty;
  } catch (error) {
    console.error('Error al verificar contratos:', error);
  }
};

const closeDialog = () => {
  emit('update:dialog', false);
};

const confirmDelete = async () => {
  try {
    deleting.value = true;
    emit('delete', props.inquilino);
  } catch (error) {
    console.error('Error al eliminar:', error);
  } finally {
    deleting.value = false;
  }
};

// Observar cambios en dialog y en inquilino
watch([() => props.dialog, () => props.inquilino], async ([isOpen, inquilino]) => {
  if (isOpen && inquilino?.id) {
    await verificarContratos();
  }
});
</script>
