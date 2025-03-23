<template>
  <v-dialog :model-value="dialog" @update:model-value="updateDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="primary white--text">
        {{ isEditing ? 'Editar Gasto' : 'Nuevo Gasto' }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid" lazy-validation>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.tipo"
                :items="tiposGasto"
                label="Tipo de gasto*"
                :rules="[(v) => !!v || 'El tipo es obligatorio']"
                outlined
                dense
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.propiedadId"
                :items="propiedades"
                item-title="nombre"
                item-value="id"
                label="Propiedad*"
                :rules="[(v) => !!v || 'La propiedad es obligatoria']"
                outlined
                dense
                required
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-menu
                ref="menuFecha"
                v-model="menuFecha"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="fechaFormateada"
                    label="Fecha*"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    :rules="[(v) => !!v || 'La fecha es obligatoria']"
                    outlined
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="editedItem.fecha"
                  @change="guardarFecha"
                  locale="es-ES"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.concepto"
                label="Concepto*"
                :rules="[(v) => !!v || 'El concepto es obligatorio']"
                outlined
                dense
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="costePorCuota"
                label="Coste por cuota*"
                :rules="[
                  (v) => !!v || 'El coste es obligatorio',
                  (v) => /^[0-9]+([,.][0-9]{1,2})?$/.test(v) || 'Formato de precio inválido',
                ]"
                @input="calcularImporteTotal"
                outlined
                dense
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="editedItem.numeroCuotas"
                label="Número de cuotas*"
                type="number"
                min="1"
                :rules="[
                  (v) => !!v || 'El número de cuotas es obligatorio',
                  (v) => v > 0 || 'Debe ser mayor que 0',
                ]"
                @input="calcularImporteTotal"
                outlined
                dense
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="importeTotal"
                label="Importe total*"
                :rules="[
                  (v) => !!v || 'El importe es obligatorio',
                  (v) => /^[0-9]+([,.][0-9]{1,2})?$/.test(v) || 'Formato de precio inválido',
                ]"
                outlined
                dense
                readonly
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.notas"
                label="Notas"
                rows="3"
                outlined
                dense
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="cerrarDialogo">Cancelar</v-btn>
        <v-btn color="blue darken-1" text @click="guardarGasto" :disabled="!formValid">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { useAuth } from '@/composables/useAuth';
import propiedadService from '@/services/propiedad-service';
import { createGasto, updateGasto } from '@/services/gasto';
import { formatDate } from '@/services/utils/date-utils';
import { formatPrecio } from '@/services/utils/format-utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editedItem: {
    type: Object,
    default: () => ({
      tipo: '',
      propiedadId: null,
      fecha: new Date().toISOString().substr(0, 10),
      concepto: '',
      costePorCuota: '',
      numeroCuotas: 1,
      importeTotal: '',
      notas: '',
    }),
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const { user } = useAuth();
const form = ref(null);
const formValid = ref(false);
const propiedades = ref([]);
const menuFecha = ref(false);

// Definir los tipos de gasto disponibles
const tiposGasto = [
  'Comunidad',
  'IBI',
  'Seguro',
  'Luz',
  'Agua',
  'Gas',
  'Reparación',
  'Mantenimiento',
  'Otros',
];

// Computed properties
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Función auxiliar para actualizar el diálogo
const updateDialog = (value) => {
  emit('update:modelValue', value);
};

const fechaFormateada = computed(() => {
  return props.editedItem.fecha ? formatDate(props.editedItem.fecha) : '';
});

const costePorCuota = computed({
  get: () => formatPrecio(props.editedItem.costePorCuota || ''),
  set: (value) => {
    props.editedItem.costePorCuota = value;
    calcularImporteTotal();
  },
});

const importeTotal = computed({
  get: () => formatPrecio(props.editedItem.importeTotal || ''),
  set: (value) => {
    props.editedItem.importeTotal = value;
  },
});

// Métodos
const cargarPropiedades = async () => {
  try {
    propiedades.value = await propiedadService.loadPropiedadesActivas();
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

const guardarFecha = () => {
  menuFecha.value = false;
};

const calcularImporteTotal = () => {
  const coste = parseFloat(props.editedItem.costePorCuota?.toString().replace(',', '.') || 0);
  const numCuotas = parseInt(props.editedItem.numeroCuotas || 1);

  if (!isNaN(coste) && !isNaN(numCuotas)) {
    props.editedItem.importeTotal = (coste * numCuotas).toFixed(2).replace('.', ',');
  }
};

const cerrarDialogo = () => {
  dialog.value = false;
  emit('close');
};

const guardarGasto = async () => {
  if (form.value.validate()) {
    try {
      const userId = user.value.uid;

      if (!userId) {
        console.error('Usuario no autenticado');
        return;
      }

      // Preparar datos del gasto con el formato adecuado
      const gastoData = {
        ...props.editedItem,
        costePorCuota: props.editedItem.costePorCuota.toString().replace(',', '.'),
        importeTotal: props.editedItem.importeTotal.toString().replace(',', '.'),
        fecha: props.editedItem.fecha || new Date().toISOString().substr(0, 10),
        createdAt: props.isEditing ? props.editedItem.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let result;
      if (props.isEditing) {
        // Actualizar gasto existente
        const gastoId = props.editedItem.id;
        result = await updateGasto(gastoId, gastoData, userId);
      } else {
        // Crear nuevo gasto
        result = await createGasto(gastoData, userId);
      }

      if (result) {
        cerrarDialogo();
        emit('saved', result);
      }
    } catch (error) {
      console.error('Error al guardar el gasto:', error);
    }
  }
};

// Observar cambios en el diálogo para inicializar
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue) {
      await cargarPropiedades();
    }
  }
);

// Observar cambios en editedItem
watch(
  () => props.editedItem,
  () => {
    calcularImporteTotal();
  },
  { deep: true }
);
</script>
