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
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.nombre"
                  :label="'Nombre *'"
                  :rules="[rules.required, rules.maxLength(100)]"
                  counter="100"
                  required
                  :hint="'Introduce el nombre de la propiedad'"
                  persistent-hint
                  @keydown.enter.prevent
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
import { useAuth } from '@/composables/useAuth';
import propiedadService from '@/services/propiedad-service';

const props = defineProps({
  dialog: Boolean,
  propiedad: {
    type: Object,
    default: () => ({
      nombre: '',
      estado: true,
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

const editedItem = ref({ ...props.propiedad });
const defaultItem = {
  nombre: '',
  estado: true,
};

// Reglas de validación
const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  maxLength: (max) => (v) => (v && v.length <= max) || `Máximo ${max} caracteres`,
};

// Título del formulario
const formTitle = computed(() => {
  return props.propiedad.id ? 'Editar Propiedad' : 'Nueva Propiedad';
});

const openDialog = () => {
  editedItem.value = { ...props.propiedad };
  nextTick(() => {
    form.value?.resetValidation();
    if (props.propiedad?.id) {
      formValid.value = true;
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
  await savePropiedad();
};

const savePropiedad = async () => {
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
