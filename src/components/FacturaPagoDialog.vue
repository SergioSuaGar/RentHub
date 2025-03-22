<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Registrar Pago</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid" lazy-validation>
          <v-container>
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">Importe a pagar:</div>
                <div class="text-h6 mb-4">{{ formatCurrency(factura.importe) }}</div>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="pagoData.importePagado"
                  label="Importe Pagado *"
                  :rules="[rules.required, rules.numeric]"
                  required
                  :hint="'Introduce el importe pagado (usar coma para decimales)'"
                  persistent-hint
                  @input="formatImportePagado"
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  type="date"
                  v-model="pagoData.fechaPago"
                  label="Fecha de Pago *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona la fecha en que se realizó el pago'"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          variant="text"
          @click="closeDialog"
          :title="'Cancelar el registro de pago'"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="confirmarPago"
          :loading="saving"
          :disabled="!formValid || saving"
          :title="'Confirmar el registro de pago'"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  dialog: Boolean,
  factura: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:dialog', 'save']);

const { user } = useAuth();

const form = ref(null);
const formValid = ref(false);
const saving = ref(false);

const pagoData = ref({
  importePagado: '',
  fechaPago: new Date().toISOString().split('T')[0],
});

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  numeric: (v) => {
    if (!v) return true;
    const pattern = /^\d+(?:,\d{1,2})?$/;
    return pattern.test(v) || 'Formato inválido. Use coma para decimales (ej: 123,45)';
  },
};

const formatCurrency = (value) => {
  if (!value) return '0 €';
  return `${value} €`;
};

const formatImportePagado = (event) => {
  let value = event.target.value;
  value = value.replace(/[^\d,]/g, '');
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }
  pagoData.value.importePagado = value;
};

const openDialog = () => {
  pagoData.value = {
    importePagado: props.factura.importe.toString().replace('.', ','),
    fechaPago: new Date().toISOString().split('T')[0],
  };
  nextTick(() => {
    form.value?.resetValidation();
  });
};

const closeDialog = () => {
  emit('update:dialog', false);
  pagoData.value = {
    importePagado: '',
    fechaPago: new Date().toISOString().split('T')[0],
  };
  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

const confirmarPago = async () => {
  if (saving.value) return;

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  formValid.value = true;
  await registrarPago();
};

const registrarPago = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    await setDoc(
      doc(db, 'facturas', props.factura.id),
      {
        estado: 'pagada',
        importePagado: pagoData.value.importePagado.replace(',', '.'),
        fechaPago: new Date(pagoData.value.fechaPago).toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      },
      { merge: true }
    );
    emit('save');
    closeDialog();
  } catch (error) {
    console.error('Error al registrar pago:', error);
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.dialog,
  (val) => {
    if (val) openDialog();
  }
);
</script>
