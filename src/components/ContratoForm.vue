<template>
  <v-dialog :model-value="dialogComputed" @update:model-value="updateDialog" max-width="800px">
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
                  v-model="editedItem.propiedadId"
                  :items="propiedades"
                  item-title="nombre"
                  item-value="id"
                  label="Propiedad *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona una propiedad'"
                  persistent-hint
                  @update:model-value="updatePropiedadNombre"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.inquilinosIds"
                  :items="inquilinos"
                  item-title="nombreCompleto"
                  item-value="id"
                  label="Inquilinos *"
                  :rules="[rules.required, rules.inquilinosRequired]"
                  required
                  multiple
                  chips
                  closable-chips
                  searchable
                  :hint="'Selecciona los inquilinos del contrato'"
                  persistent-hint
                  @update:model-value="updateInquilinosNombres"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.precio"
                  label="Precio *"
                  :rules="[rules.required, rules.numeric]"
                  required
                  :hint="'Introduce el precio (usar coma para decimales)'"
                  persistent-hint
                  @input="formatPrecio"
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  type="date"
                  v-model="editedItem.fechaInicio"
                  label="Fecha Inicio *"
                  :rules="[rules.required]"
                  required
                  :hint="'Selecciona la fecha de inicio'"
                  persistent-hint
                  @update:model-value="calcularFechaRenovacion"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  type="date"
                  v-model="editedItem.fechaRenovacion"
                  label="Fecha Renovación"
                  :hint="'Fecha de renovación (se calcula automáticamente)'"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-divider class="my-2"></v-divider>
                <div class="text-subtitle-1 mb-2">Documento del Contrato</div>
                <FileUploader
                  folder="contratos"
                  @upload-success="handleFileUploadSuccess"
                  @upload-error="handleFileUploadError"
                  :button-text="
                    editedItem.documentoUrl ? 'Cambiar PDF del Contrato' : 'Subir PDF del Contrato'
                  "
                />
                <div v-if="editedItem.documentoUrl" class="mt-2">
                  <v-btn
                    color="primary"
                    variant="text"
                    :href="editedItem.documentoUrl"
                    target="_blank"
                    prepend-icon="mdi-file-pdf-box"
                    class="mr-2"
                  >
                    Ver PDF
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="text"
                    @click="eliminarDocumento"
                    prepend-icon="mdi-delete"
                    :loading="eliminandoDocumento"
                  >
                    Eliminar PDF
                  </v-btn>
                </div>
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
import FileUploader from '@/components/FileUploader.vue';
import PropiedadService from '@/services/propiedad';
import InquilinoService from '@/services/inquilino';
import ContratoService from '@/services/contrato';
import { storage } from '@/services/firebase';
import { ref as storageRef, deleteObject } from 'firebase/storage';

const props = defineProps({
  contrato: {
    type: Object,
    default: () => ({}),
  },
  contratos: {
    type: Array,
    default: () => [],
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
const eliminandoDocumento = ref(false);

const editedItem = ref({ ...props.contrato });

const propiedades = ref([]);
const inquilinos = ref([]);

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  numeric: (v) => {
    if (!v) return true;
    const pattern = /^\d+(?:,\d{1,2})?$/;
    return pattern.test(v) || 'Formato inválido. Use coma para decimales (ej: 123,45)';
  },
  inquilinosRequired: (v) => (v && v.length > 0) || 'Debe seleccionar al menos un inquilino',
};

const formTitle = computed(() => {
  return props.contrato.id ? 'Editar Contrato' : 'Nuevo Contrato';
});

const loadPropiedades = async () => {
  try {
    const todasLasPropiedades = await PropiedadService.getActivas();
    const contratosActivos = props.contratos.filter((c) => c.estado);
    const propiedadesConContrato = new Set(contratosActivos.map((c) => c.propiedadId));

    if (props.contrato.id) {
      const propiedadActual = editedItem.value.propiedadId;
      propiedades.value = todasLasPropiedades.filter(
        (propiedad) => !propiedadesConContrato.has(propiedad.id) || propiedad.id === propiedadActual
      );
    } else {
      propiedades.value = todasLasPropiedades.filter(
        (propiedad) => !propiedadesConContrato.has(propiedad.id)
      );
    }
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

const loadInquilinos = async () => {
  try {
    const todosLosInquilinos = await InquilinoService.getActivos();
    const contratosActivos = props.contratos.filter((c) => c.estado);
    const inquilinosConContrato = new Set();
    contratosActivos.forEach((contrato) => {
      if (contrato.id !== editedItem.value.id) {
        contrato.inquilinosIds.forEach((id) => inquilinosConContrato.add(id));
      }
    });

    if (props.contrato.id) {
      const inquilinosActuales = new Set(editedItem.value.inquilinosIds);
      inquilinos.value = todosLosInquilinos.filter(
        (inquilino) =>
          !inquilinosConContrato.has(inquilino.id) || inquilinosActuales.has(inquilino.id)
      );
    } else {
      inquilinos.value = todosLosInquilinos.filter(
        (inquilino) => !inquilinosConContrato.has(inquilino.id)
      );
    }
  } catch (error) {
    console.error('Error al cargar inquilinos:', error);
  }
};

const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

const updateInquilinosNombres = (inquilinosIds) => {
  editedItem.value.inquilinosNombres = inquilinosIds.map((id) => {
    const inquilino = inquilinos.value.find((i) => i.id === id);
    return inquilino ? inquilino.nombreCompleto : '';
  });
};

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
  editedItem.value.precio = value;
};

const calcularFechaRenovacion = (fechaInicio) => {
  if (!fechaInicio) return;
  const fecha = new Date(fechaInicio);
  fecha.setFullYear(fecha.getFullYear() + 1);
  fecha.setDate(fecha.getDate() - 1);
  editedItem.value.fechaRenovacion = fecha.toISOString().split('T')[0];
};

const handleFileUploadSuccess = (fileData) => {
  editedItem.value.documentoUrl = fileData.url;
  editedItem.value.documentoPath = fileData.path;
};

const handleFileUploadError = (error) => {
  console.error('Error al subir el archivo:', error);
};

const eliminarDocumento = async () => {
  if (!editedItem.value.documentoPath) return;

  try {
    eliminandoDocumento.value = true;
    const fileRef = storageRef(storage, editedItem.value.documentoPath);
    await deleteObject(fileRef);
    editedItem.value.documentoUrl = null;
    editedItem.value.documentoPath = null;
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
  } finally {
    eliminandoDocumento.value = false;
  }
};

const handleSubmit = async () => {
  if (saving.value) return;

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  formValid.value = true;
  saving.value = true;

  try {
    const itemData = {
      ...editedItem.value,
      estado: editedItem.value.estado ?? true,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    };

    if (props.contrato.id) {
      await ContratoService.update(props.contrato.id, itemData);
    } else {
      itemData.createdAt = new Date().toISOString();
      itemData.createdBy = user.value.uid;
      await ContratoService.create(itemData);
    }

    emit('save');
    closeDialog();
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  updateDialog(false);
  nextTick(() => {
    editedItem.value = { ...props.contrato };
    form.value?.reset();
    formValid.value = false;
  });
};

watch(
  () => props.dialog,
  async (isOpen) => {
    if (isOpen) {
      await loadPropiedades();
      await loadInquilinos();
    }
  }
);
</script>
