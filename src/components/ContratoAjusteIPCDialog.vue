<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Ajustar Precio por IPC</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid" lazy-validation>
          <v-container>
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">Precio Actual:</div>
                <div class="text-h6 mb-4">{{ formatCurrency(precioActual) }}</div>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="incrementoIPC"
                  label="Incremento IPC (%) *"
                  :rules="[rules.required, rules.numeric]"
                  required
                  :hint="'Introduce el porcentaje de incremento del IPC'"
                  persistent-hint
                  @input="calcularNuevoPrecio"
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="nuevoPrecio"
                  label="Nuevo Precio *"
                  :rules="[rules.required, rules.numeric]"
                  required
                  :hint="'Puedes ajustar manualmente el nuevo precio'"
                  persistent-hint
                  @input="formatPrecio"
                  validate-on-blur
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
          @click="ajustarIPC"
          :loading="saving"
          :disabled="!formValid || !nuevoPrecio"
        >
          Ajustar Precio
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

const { user } = useAuth();

const form = ref(null);
const formValid = ref(false);
const saving = ref(false);

const precioActual = ref('');
const incrementoIPC = ref('');
const nuevoPrecio = ref('');

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  numeric: (v) => {
    if (!v) return true;
    const pattern = /^\d+(?:,\d{1,2})?$/;
    return pattern.test(v) || 'Formato inválido. Use coma para decimales (ej: 123,45)';
  },
};

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0,00 €';
  return `${value} €`;
};

// Formatear precio
const formatPrecio = (event) => {
  let value = event.target.value;
  value = value.replace(/[^\d,]/g, '');
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }
  if (parts.length === 2 && /^0*$/.test(parts[1])) {
    value = parts[0];
  }
  nuevoPrecio.value = value;
};

// Calcular nuevo precio con IPC
const calcularNuevoPrecio = () => {
  if (!precioActual.value || !incrementoIPC.value) {
    nuevoPrecio.value = '';
    return;
  }
  const precio = parseFloat(precioActual.value.replace(',', '.'));
  const incremento = parseFloat(incrementoIPC.value.replace(',', '.'));
  const nuevoValor = precio * (1 + incremento / 100);

  let precioFormateado = nuevoValor.toFixed(2).replace('.', ',');

  if (precioFormateado.endsWith(',00')) {
    precioFormateado = precioFormateado.slice(0, -3);
  }

  nuevoPrecio.value = precioFormateado;
};

// Función para ajustar IPC
const ajustarIPC = async () => {
  if (!formValid.value) return;

  try {
    saving.value = true;
    const precioAjustado = nuevoPrecio.value.replace(',', '.');

    await ContratoService.update(props.contrato.id, {
      precio: precioAjustado,
      ipcAjustado: true,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    });

    emit('save');
    closeDialog();
  } catch (error) {
    console.error('Error al ajustar IPC:', error);
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  emit('update:dialog', false);
};

// Inicializar datos al abrir el diálogo
watch(
  () => props.dialog,
  (isOpen) => {
    if (isOpen) {
      precioActual.value = props.contrato.precio.toString().replace('.', ',');
      incrementoIPC.value = '';
      nuevoPrecio.value = '';
    }
  }
);
</script>
