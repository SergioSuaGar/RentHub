<template>
  <v-dialog :model-value="dialogComputed" @update:model-value="updateDialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Renovar Contrato</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid" lazy-validation>
          <v-container>
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">Fecha Actual de Renovación:</div>
                <div class="text-h6 mb-4">{{ formatDateShort(fechaRenovacionActual) }}</div>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  type="date"
                  v-model="nuevaFechaRenovacion"
                  label="Nueva Fecha de Renovación *"
                  :rules="[rules.required, rules.fechaValida]"
                  required
                  :hint="'Selecciona la nueva fecha de renovación'"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="closeDialog"> Cancelar </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="renovarContrato"
          :loading="saving"
          :disabled="!formValid || saving"
        >
          Renovar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import ContratoService from '@/services/contrato';

const props = defineProps({
  contrato: {
    type: Object,
    required: true,
  },
  dialog: Boolean,
});

const emit = defineEmits(['update:dialog', 'save']);

// Computed property para manejar v-model bidireccional
const dialogComputed = computed({
  get: () => props.dialog,
  set: (value) => emit('update:dialog', value),
});

// Función auxiliar para actualizar el diálogo
const updateDialog = (value) => {
  emit('update:dialog', value);
};

const { user } = useAuth();

const form = ref(null);
const formValid = ref(false);
const saving = ref(false);
const fechaRenovacionActual = ref('');
const nuevaFechaRenovacion = ref('');

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  fechaValida: (v) => {
    if (!v) return true;
    return new Date(v) > new Date() || 'La fecha debe ser posterior a hoy';
  },
};

// Formatear fecha
const formatDateShort = (timestamp) => {
  if (!timestamp) return 'No disponible';

  // Si es un objeto Timestamp de Firestore
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si es una cadena de fecha ISO
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return 'No disponible';
};

// Función para renovar contrato
const renovarContrato = async () => {
  if (!formValid.value) return;

  try {
    saving.value = true;
    await ContratoService.renovarContrato(
      props.contrato.id,
      nuevaFechaRenovacion.value,
      user.value.uid
    );
    emit('save');
    closeDialog();
  } catch (error) {
    console.error('Error al renovar contrato:', error);
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  updateDialog(false);
};

// Inicializar datos al abrir el diálogo
watch(
  () => props.dialog,
  (isOpen) => {
    if (isOpen && props.contrato) {
      fechaRenovacionActual.value = props.contrato.fechaRenovacion;

      // Calcular fecha sugerida (1 año desde la fecha de renovación actual)
      const fechaActual = new Date(props.contrato.fechaRenovacion);
      fechaActual.setFullYear(fechaActual.getFullYear() + 1);
      nuevaFechaRenovacion.value = fechaActual.toISOString().split('T')[0];
    }
  }
);
</script>
