<template>
  <v-dialog :model-value="dialog" @update:model-value="updateDialog" max-width="500px">
    <v-card>
      <v-card-title class="error white--text">Eliminar Gasto</v-card-title>
      <v-card-text>
        <p class="pt-4">¿Está seguro de que desea eliminar este gasto?</p>
        <p class="font-weight-bold">{{ gastoInfo }}</p>
        <p class="error--text" v-if="error">{{ error }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="cerrarDialogo">Cancelar</v-btn>
        <v-btn color="error" text @click="eliminarGasto" :loading="loading"> Eliminar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { deleteGasto } from '@/services/gasto';
import { formatCurrency } from '@/services/utils/format-utils';
import { formatDate } from '@/services/utils/date-utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  gasto: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'deleted', 'close']);

const loading = ref(false);
const error = ref('');

// Computed properties
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Función auxiliar para actualizar el diálogo
const updateDialog = (value) => {
  emit('update:modelValue', value);
};

const gastoInfo = computed(() => {
  if (!props.gasto) return '';

  return `${props.gasto.concepto} - ${formatCurrency(props.gasto.importeTotal)} - ${formatDate(props.gasto.fecha)}`;
});

// Methods
const cerrarDialogo = () => {
  emit('update:modelValue', false);
  error.value = '';
  emit('close');
};

const eliminarGasto = async () => {
  if (!props.gasto || !props.gasto.id) return;

  loading.value = true;
  error.value = '';

  try {
    const result = await deleteGasto(props.gasto.id);

    if (result) {
      cerrarDialogo();
      emit('deleted', props.gasto.id);
    } else {
      error.value = 'No se pudo eliminar el gasto. Por favor, inténtelo de nuevo.';
    }
  } catch (err) {
    console.error('Error al eliminar el gasto:', err);
    error.value = 'Error al eliminar el gasto: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
};
</script>
