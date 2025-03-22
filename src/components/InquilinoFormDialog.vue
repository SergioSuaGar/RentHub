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
                <v-text-field
                  v-model="editedItem.nombre"
                  :label="'Nombre *'"
                  :rules="[rules.required, rules.maxLength(50)]"
                  counter="50"
                  required
                  :hint="'Introduce el nombre del inquilino'"
                  persistent-hint
                  @keydown.enter.prevent
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.apellidos"
                  :label="'Apellidos *'"
                  :rules="[rules.required, rules.maxLength(100)]"
                  counter="100"
                  required
                  :hint="'Introduce los apellidos del inquilino'"
                  persistent-hint
                  @keydown.enter.prevent
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.telefono"
                  :label="'Teléfono *'"
                  :rules="[rules.required, rules.telefono]"
                  required
                  :hint="'Introduce un número de teléfono válido'"
                  persistent-hint
                  @keydown.enter.prevent
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.dni"
                  :label="'DNI *'"
                  :rules="[rules.required, rules.dni]"
                  required
                  :hint="'Formato: 12345678A'"
                  persistent-hint
                  @keydown.enter.prevent
                  maxlength="9"
                  counter="9"
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.propiedadId"
                  :items="propiedades"
                  item-title="nombre"
                  item-value="id"
                  label="Propiedad"
                  :hint="'Selecciona una propiedad para el inquilino'"
                  persistent-hint
                  clearable
                  @update:model-value="updatePropiedadNombre"
                ></v-select>
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
import { useAuth } from '@/composables/useAuth';
import propiedadService from '@/services/propiedad-service';
import inquilinoService from '@/services/inquilino-service';

const props = defineProps({
  dialog: Boolean,
  inquilino: {
    type: Object,
    default: () => ({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      dni: '',
      estado: true,
      propiedadId: null,
      propiedadNombre: '',
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

const form = ref(null);
const formValid = ref(false);
const saving = ref(false);
const propiedades = ref([]);
const dniOriginal = ref('');

const editedItem = ref({ ...props.inquilino });
const defaultItem = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  dni: '',
  estado: true,
  propiedadId: null,
  propiedadNombre: '',
};

// Reglas de validación
const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  maxLength: (max) => (v) => (v && v.length <= max) || `Máximo ${max} caracteres`,
  telefono: (v) => {
    if (!v) return true;
    const pattern = /^[0-9]{9}$/;
    return pattern.test(v) || 'El teléfono debe tener 9 dígitos';
  },
  dni: (v) => {
    if (!v) return true;

    const dniRegex = /^[0-9]{8}[A-Z]$/;
    if (!dniRegex.test(v)) {
      return 'El DNI debe tener 8 números seguidos de una letra mayúscula';
    }

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(v.substring(0, 8));
    const letter = v.charAt(8);
    const calculatedLetter = letters.charAt(number % 23);

    return letter === calculatedLetter || 'La letra del DNI no es válida';
  },
};

// Título del formulario
const formTitle = computed(() => {
  return props.inquilino.id ? 'Editar Inquilino' : 'Nuevo Inquilino';
});

// Cargar propiedades
const loadPropiedades = async () => {
  try {
    propiedades.value = await propiedadService.loadPropiedadesActivas();
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

// Actualizar el nombre de la propiedad cuando se seleccione
const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

const openDialog = async () => {
  editedItem.value = { ...props.inquilino };
  dniOriginal.value = props.inquilino.dni || '';
  await loadPropiedades();

  nextTick(() => {
    form.value?.resetValidation();
    if (props.inquilino?.id) {
      formValid.value = true;
    }
  });
};

const closeDialog = () => {
  emit('update:dialog', false);
  editedItem.value = { ...defaultItem };
  dniOriginal.value = '';

  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

const verificarDniExistente = async () => {
  // Verificar solo si el DNI ha cambiado o es un nuevo inquilino
  if (editedItem.value.dni && editedItem.value.dni !== dniOriginal.value) {
    const existe = await inquilinoService.verificarDniExistente(
      editedItem.value.dni,
      props.inquilino.id
    );
    if (existe) {
      form.value?.setErrors({
        dni: ['Este DNI ya está registrado en el sistema'],
      });
      return false;
    }
  }
  return true;
};

const handleSubmit = async () => {
  if (saving.value) return;

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  const dniUnico = await verificarDniExistente();
  if (!dniUnico) {
    formValid.value = false;
    return;
  }

  formValid.value = true;
  await saveInquilino();
};

const saveInquilino = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      ...editedItem.value,
      estado: editedItem.value.estado ?? true,
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

// Observar cambios en dialog para inicializar el formulario
watch(
  () => props.dialog,
  (val) => {
    if (val) openDialog();
  }
);
</script>
