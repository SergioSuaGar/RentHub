<template>
  <v-dialog :model-value="dialogComputed" @update:model-value="updateDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ formTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="formValid" @submit.prevent="handleSubmit" lazy-validation>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.tipo"
                  :items="tiposFactura"
                  label="Tipo de Factura *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona el tipo de factura'"
                  persistent-hint
                  @update:model-value="(v) => actualizarImporte()"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.propiedadId"
                  :items="propiedades"
                  item-title="nombre"
                  item-value="id"
                  label="Propiedad *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona una propiedad'"
                  persistent-hint
                  @update:model-value="
                    async (v) => {
                      updatePropiedadNombre(v);
                      await actualizarImporte();
                    }
                  "
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  type="date"
                  :model-value="editedItem.fechaInicio"
                  @update:model-value="
                    async (v) => {
                      editedItem.fechaInicio = v;
                      await actualizarImporte();
                    }
                  "
                  label="Fecha Inicio *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona la fecha de inicio'"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  type="date"
                  :model-value="editedItem.fechaFin"
                  @update:model-value="
                    async (v) => {
                      editedItem.fechaFin = v;
                      await actualizarImporte();
                    }
                  "
                  label="Fecha Fin *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona la fecha de fin'"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.importe"
                  label="Importe *"
                  :rules="[rules.required, rules.numeric]"
                  required
                  :hint="'Introduce el importe (usar coma para decimales)'"
                  persistent-hint
                  @input="formatImporte"
                  validate-on-blur
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
          :title="'Cancelar la operación actual'"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="handleSubmit"
          :loading="saving"
          :disabled="!formValid || saving"
          :title="'Guardar los cambios realizados'"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';
import {
  loadPropiedades,
  loadContratosActivos,
  calcularImporteProporcional,
} from '@/services/factura';

const props = defineProps({
  dialog: Boolean,
  factura: {
    type: Object,
    default: () => ({
      tipo: '',
      propiedadId: '',
      propiedadNombre: '',
      importe: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'pendiente',
    }),
  },
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

const editedItem = ref({ ...props.factura });
const defaultItem = {
  tipo: '',
  propiedadId: '',
  propiedadNombre: '',
  importe: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'pendiente',
};

const tiposFactura = ['Luz', 'Agua', 'Agua caliente', 'Cuota piso'];
const propiedades = ref([]);
const contratosActivos = ref([]);

const form = ref(null);
const formValid = ref(false);
const saving = ref(false);

// Función para cargar las propiedades
const cargarPropiedades = async () => {
  try {
    propiedades.value = await loadPropiedades();
    console.log('Propiedades cargadas:', propiedades.value);
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  numeric: (v) => {
    if (!v) return true;
    const pattern = /^\d+(?:,\d{1,2})?$/;
    return pattern.test(v) || 'Formato inválido. Use coma para decimales (ej: 123,45)';
  },
  fechaFinValida: (v) => {
    if (!v || !editedItem.value.fechaInicio) return true;
    return (
      new Date(v) >= new Date(editedItem.value.fechaInicio) ||
      'La fecha fin debe ser posterior a la fecha inicio'
    );
  },
};

const formTitle = computed(() => {
  return props.factura?.id ? 'Editar Factura' : 'Nueva Factura';
});

const formatImporte = (event) => {
  let value = event.target.value;
  value = value.replace(/[^\d,]/g, '');
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }
  editedItem.value.importe = value;
};

// Cargar contratos activos
const obtenerContratosActivos = async () => {
  try {
    contratosActivos.value = await loadContratosActivos();
    console.log('Contratos activos cargados:', contratosActivos.value);
  } catch (error) {
    console.error('Error al cargar contratos activos:', error);
  }
};

const actualizarImporte = async () => {
  if (editedItem.value.tipo === 'Cuota piso') {
    if (contratosActivos.value.length === 0) {
      await obtenerContratosActivos();
    }

    if (editedItem.value.propiedadId) {
      const contratoActivo = contratosActivos.value.find(
        (c) => c.propiedadId === editedItem.value.propiedadId
      );

      if (contratoActivo && editedItem.value.fechaInicio && editedItem.value.fechaFin) {
        editedItem.value.importe = calcularImporteProporcional(
          contratoActivo.precio,
          editedItem.value.fechaInicio,
          editedItem.value.fechaFin
        );
      }
    }
  }
};

const isoToDateInput = (isoDate) => {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
};

const dateInputToIso = (inputDate) => {
  if (!inputDate) return '';
  return new Date(inputDate).toISOString();
};

const openDialog = async () => {
  editedItem.value = { ...props.factura };
  await cargarPropiedades();
  nextTick(async () => {
    form.value?.resetValidation();
    if (props.factura?.id) {
      formValid.value = true;
      if (props.factura.tipo === 'Cuota piso') {
        await obtenerContratosActivos();
      }
    }
  });
};

const closeDialog = () => {
  emit('update:dialog', false);
  editedItem.value = { ...defaultItem };
  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

const handleSubmit = async () => {
  if (saving.value) return;

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  formValid.value = true;
  await saveFactura();
};

const saveFactura = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      ...editedItem.value,
      fechaInicio: editedItem.value.fechaInicio,
      fechaFin: editedItem.value.fechaFin,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    };

    emit('save', itemData);
    closeDialog();
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    saving.value = false;
  }
};

const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

watch(
  () => props.dialog,
  (val) => {
    if (val) openDialog();
  }
);

// Observar cambios en la factura
watch(
  () => props.factura,
  (newFactura) => {
    console.log('Factura actualizada:', newFactura);
    editedItem.value = { ...defaultItem, ...newFactura };
  },
  { deep: true, immediate: true }
);
</script>
