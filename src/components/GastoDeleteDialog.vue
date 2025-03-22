<template>
  <v-dialog v-model="dialog" max-width="500px">
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

<script>
import { ref, computed } from 'vue';
import gastoService from '@/services/gasto-service';
import { formatCurrency, formatDate } from '@/services/utils/format-utils';

export default {
  name: 'GastoDeleteDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    gasto: {
      type: Object,
      required: true,
    },
  },

  emits: ['update:modelValue', 'deleted', 'close'],

  setup(props, { emit }) {
    const loading = ref(false);
    const error = ref('');

    // Computed properties
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    const gastoInfo = computed(() => {
      if (!props.gasto) return '';

      return `${props.gasto.concepto} - ${formatCurrency(props.gasto.importeTotal)} - ${formatDate(props.gasto.fecha)}`;
    });

    // Methods
    const cerrarDialogo = () => {
      dialog.value = false;
      error.value = '';
      emit('close');
    };

    const eliminarGasto = async () => {
      if (!props.gasto || !props.gasto.id) return;

      loading.value = true;
      error.value = '';

      try {
        const result = await gastoService.deleteGasto(props.gasto.id);

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

    return {
      dialog,
      loading,
      error,
      gastoInfo,
      cerrarDialogo,
      eliminarGasto,
    };
  },
};
</script>
