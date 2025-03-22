<template>
  <v-dialog :model-value="dialogComputed" @update:model-value="updateDialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">¿Estás seguro de eliminar esta propiedad?</v-card-title>
      <v-card-text v-if="propiedadConInquilinos">
        <v-alert type="warning" title="¡Atención!" variant="tonal" density="compact">
          Esta propiedad tiene inquilinos asociados. Al eliminarla, estos inquilinos quedarán sin
          propiedad asignada.
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
          :title="'Confirmar la eliminación de la propiedad'"
        >
          Sí
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  dialog: Boolean,
  propiedad: {
    type: Object,
    default: () => ({}),
  },
  inquilinos: {
    type: Array,
    default: () => [],
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

// Verificar si la propiedad tiene inquilinos asociados
const propiedadConInquilinos = computed(() => {
  return props.inquilinos.some((inquilino) => inquilino.propiedadId === props.propiedad.id);
});

const closeDialog = () => {
  emit('update:dialog', false);
};

const confirmDelete = async () => {
  try {
    deleting.value = true;
    emit('delete', props.propiedad);
  } catch (error) {
    console.error('Error al eliminar:', error);
  } finally {
    deleting.value = false;
  }
};
</script>
