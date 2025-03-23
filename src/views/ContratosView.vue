<template>
  <div class="contratos-container">
    <v-card>
      <v-toolbar flat color="primary" class="toolbar-custom">
        <v-toolbar-title class="text-white toolbar-title">Contratos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          variant="text"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          :title="'Añadir un nuevo contrato al sistema'"
          class="toolbar-btn"
        >
          <span class="d-none d-sm-block">Nuevo Contrato</span>
          <span class="d-sm-none">Nuevo</span>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="contratos"
          :loading="loading"
          :search="search"
          class="elevation-1"
          show-expand
          item-value="id"
          expand-on-click
        >
          <!-- Barra de búsqueda -->
          <template #top>
            <v-toolbar flat class="px-2 pb-2">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Buscar contrato..."
                single-line
                hide-details
                density="comfortable"
                variant="outlined"
                color="primary"
                bg-color="surface"
                class="search-field elevation-1"
                clearable
              ></v-text-field>
            </v-toolbar>
          </template>

          <!-- Columna de precio -->
          <template #[`item.precio`]="{ item }">
            {{ formatCurrency(item.precio) }}
          </template>

          <!-- Columna de fechas -->
          <template #[`item.fechaInicio`]="{ item }">
            {{ formatDateShort(item.fechaInicio) }}
          </template>

          <template #[`item.fechaRenovacion`]="{ item }">
            {{ formatDateShort(item.fechaRenovacion) }}
          </template>

          <!-- Columna de propiedad -->
          <template #[`item.propiedadNombre`]="{ item }">
            {{ item.propiedadNombre || 'Sin asignar' }}
          </template>

          <!-- Columna de estado de renovación -->
          <template #[`item.estadoRenovacion`]="{ item }">
            <v-chip
              :color="calcularEstadoRenovacion(item.fechaRenovacion, item.ipcAjustado).color"
              :text="calcularEstadoRenovacion(item.fechaRenovacion, item.ipcAjustado).estado"
              size="small"
              @click.stop="handleEstadoRenovacionClick(item)"
              style="cursor: pointer"
            ></v-chip>
          </template>

          <!-- Columna de estado -->
          <template #[`item.estado`]="{ item }">
            <v-chip
              :color="item.estado ? 'success' : 'error'"
              :text="item.estado ? 'Activo' : 'Inactivo'"
              size="small"
              @click.stop="toggleEstado(item)"
              style="cursor: pointer"
            ></v-chip>
          </template>

          <!-- Columna de inquilinos -->
          <template #[`item.inquilinosIds`]="{ item }">
            {{ item.inquilinosNombres.join(', ') }}
          </template>

          <!-- Columna de acciones -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              color="info"
              @click.stop="openPdfViewer(item)"
              :title="'Ver contrato'"
              class="me-2"
            >
              <v-icon>mdi-file-document-outline</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click.stop="openDialog(item)"
              :title="'Editar información del contrato'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click.stop="confirmDelete(item)"
              :title="'Eliminar contrato del sistema'"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>

          <!-- Añadir el slot para el botón de expandir -->
          <template #[`item.data-table-expand`]="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="item.expand = !item.expand"
              :title="item.expand ? 'Contraer detalles' : 'Expandir detalles'"
            >
              <v-icon>{{ item.expand ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </template>

          <!-- Fila expandible -->
          <template #expanded-row="{ item }">
            <tr>
              <td :colspan="headers.length + 1">
                <v-card flat class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="text-subtitle-1 font-weight-bold mb-2">Información Adicional</div>
                      <v-list density="compact">
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-home" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Propiedad</v-list-item-title>
                          <v-list-item-subtitle>{{ item.propiedadNombre }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-account-group" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Inquilinos</v-list-item-title>
                          <v-list-item-subtitle>{{
                            item.inquilinosNombres.join(', ')
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="text-subtitle-1 font-weight-bold mb-2">Historial</div>
                      <v-list density="compact">
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-calendar" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Fecha de Registro</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatDate(item.createdAt)
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-clock-outline" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Última Actualización</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatDate(item.updatedAt)
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Componente PdfViewer -->
    <PdfViewer v-model="showPdfViewer" :file-path="selectedPdfPath" :title="selectedPdfTitle" />

    <!-- Diálogo para crear/editar contrato -->
    <ContratoForm
      v-model:dialog="dialog"
      :contrato="editedItem"
      :contratos="contratos"
      @save="handleContratoSave"
    />

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este contrato?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="text"
            @click="closeDelete"
            :title="'Cancelar la eliminación'"
          >
            No
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteItemConfirm"
            :title="'Confirmar la eliminación del contrato'"
          >
            Sí
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Renovación -->
    <ContratoRenovacionDialog
      v-model:dialog="dialogRenovacion"
      :contrato="editedItem"
      @save="handleRenovacionSave"
    />

    <!-- Diálogo de Ajuste IPC -->
    <ContratoAjusteIPCDialog
      v-model:dialog="dialogAjusteIPC"
      :contrato="editedItem"
      @save="handleAjusteIPCSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRoute } from 'vue-router';
import FileUploader from '@/components/FileUploader.vue';
import PdfViewer from '@/components/PdfViewer.vue';
import ContratoForm from '@/components/ContratoForm.vue';
import ContratoRenovacionDialog from '@/components/ContratoRenovacionDialog.vue';
import ContratoAjusteIPCDialog from '@/components/ContratoAjusteIPCDialog.vue';

// Importar funciones del servicio de contratos
import {
  loadContratos,
  loadPropiedadesParaContratos,
  loadTodasLasPropiedades,
  loadInquilinosParaContratos,
  createContrato,
  updateContrato,
  deleteContrato,
  toggleEstadoContrato,
  renovarContrato,
  ajustarIPCContrato,
  eliminarDocumentoContrato,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatPrecio,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
  calcularNuevoPrecioIPC,
  isoToDateInput,
  dateInputToIso,
} from '@/services/contrato';

const { user } = useAuth();

// Variables para la tabla
const loading = ref(false);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const contratos = ref([]);
const propiedades = ref([]);
const inquilinos = ref([]);

// Variables para el diálogo
const dialog = ref(false);
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  propiedadId: '',
  propiedadNombre: '',
  inquilinosIds: [],
  inquilinosNombres: [],
  precio: '',
  fechaInicio: '',
  fechaRenovacion: '',
  estado: true,
  documentoUrl: null,
  documentoPath: null,
});
const defaultItem = {
  propiedadId: '',
  propiedadNombre: '',
  inquilinosIds: [],
  inquilinosNombres: [],
  precio: '',
  fechaInicio: '',
  fechaRenovacion: '',
  estado: true,
  documentoUrl: null,
  documentoPath: null,
};

// Headers de la tabla
const headers = [
  {
    title: 'Estado Renovación',
    key: 'estadoRenovacion',
    align: 'center',
    sortable: false,
    headerProps: { align: 'center' },
  },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
  { title: 'Precio', key: 'precio', align: 'end', sortable: true },
  { title: 'Fecha Inicio', key: 'fechaInicio', align: 'start', sortable: true },
  {
    title: 'Fecha Renovación',
    key: 'fechaRenovacion',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Estado',
    key: 'estado',
    align: 'center',
    sortable: false,
    headerProps: { align: 'center' },
  },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
  { title: '', key: 'data-table-expand', sortable: false, align: 'center', width: '50px' },
];

// Variables para los diálogos de renovación y ajuste IPC
const dialogRenovacion = ref(false);
const dialogAjusteIPC = ref(false);

// Reglas de validación
const form = ref(null);
const formValid = ref(false);
const saving = ref(false);

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  numeric: (v) => {
    if (!v) return true;
    const pattern = /^\d+(?:,\d{1,2})?$/;
    return pattern.test(v) || 'Formato inválido. Use coma para decimales (ej: 123,45)';
  },
  inquilinosRequired: (v) => (v && v.length > 0) || 'Debe seleccionar al menos un inquilino',
};

// Título del formulario
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nuevo Contrato' : 'Editar Contrato';
});

// Variables para el visor de PDF
const showPdfViewer = ref(false);
const selectedPdfPath = ref('');
const selectedPdfTitle = ref('');

// Cargar contratos
const loadContratosData = async () => {
  loading.value = true;
  try {
    // Cargar todas las propiedades sin filtrar
    propiedades.value = await loadTodasLasPropiedades();
    console.log('Propiedades cargadas:', propiedades.value);

    // Luego cargar contratos
    const contratosData = await loadContratos();
    console.log('Contratos data cargada:', contratosData);

    // Mapear contratos y asignar nombres de propiedades
    contratos.value = contratosData.map((contrato) => {
      // Buscar la propiedad correspondiente
      const propiedad = propiedades.value.find((p) => p.id === contrato.propiedadId);
      console.log(
        `Contrato ID: ${contrato.id}, PropiedadID: ${contrato.propiedadId}, 
                   Propiedad encontrada:`,
        propiedad
      );

      // Asignar el nombre de la propiedad o un valor por defecto
      const propiedadNombre = propiedad ? propiedad.nombre : 'Sin asignar';

      return {
        ...contrato,
        propiedadNombre,
      };
    });

    console.log('Contratos procesados:', contratos.value);
    totalItems.value = contratos.value.length;

    // Después cargar inquilinos disponibles para el formulario
    await loadInquilinosData();
  } catch (error) {
    console.error('Error al cargar contratos:', error);
  } finally {
    loading.value = false;
  }
};

// Cargar inquilinos
const loadInquilinosData = async () => {
  try {
    const isEditing = editedIndex.value > -1;
    const currentInquilinosIds = isEditing ? editedItem.value.inquilinosIds : [];
    inquilinos.value = await loadInquilinosParaContratos(isEditing, currentInquilinosIds);
  } catch (error) {
    console.error('Error al cargar inquilinos:', error);
  }
};

// Función para abrir el visor de PDF
const openPdfViewer = (item) => {
  if (!item.documentoPath) {
    // Si no hay documento, mostrar un mensaje
    alert('No hay documento adjunto para este contrato');
    return;
  }
  selectedPdfPath.value = item.documentoPath;
  selectedPdfTitle.value = `Contrato - ${item.propiedadNombre}`;
  showPdfViewer.value = true;
};

// Abrir diálogo
const openDialog = (item) => {
  editedIndex.value = item ? contratos.value.indexOf(item) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

// Manejar el guardado del contrato desde el formulario
const handleContratoSave = async () => {
  await loadContratosData();
};

// Actualizar el nombre de la propiedad cuando se seleccione
const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

// Actualizar los nombres de los inquilinos cuando se seleccionen
const updateInquilinosNombres = (inquilinosIds) => {
  editedItem.value.inquilinosNombres = inquilinosIds.map((id) => {
    const inquilino = inquilinos.value.find((i) => i.id === id);
    return inquilino ? inquilino.nombreCompleto : '';
  });
};

// Cambiar estado
const toggleEstado = async (item) => {
  try {
    const newEstado = !item.estado;
    const success = await toggleEstadoContrato(item.id, newEstado, user.value.uid);
    if (success) {
      item.estado = newEstado;
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};

// Confirmar eliminación
const confirmDelete = (item) => {
  editedIndex.value = contratos.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

// Cerrar diálogo de eliminación
const closeDelete = () => {
  dialogDelete.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

// Eliminar contrato
const deleteItemConfirm = async () => {
  try {
    const success = await deleteContrato(contratos.value[editedIndex.value].id);
    if (success) {
      contratos.value.splice(editedIndex.value, 1);
      closeDelete();
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

// Función para manejar el clic en el estado de renovación
const handleEstadoRenovacionClick = (item) => {
  const estado = calcularEstadoRenovacion(item.fechaRenovacion, item.ipcAjustado).estado;

  if (estado === 'Pendiente de Renovación') {
    // Abrir diálogo de renovación
    editedItem.value = { ...item };
    dialogRenovacion.value = true;
  } else if (estado === 'Pendiente de Ajuste IPC') {
    // Abrir diálogo de ajuste IPC
    editedItem.value = { ...item };
    dialogAjusteIPC.value = true;
  }
};

// Manejar el guardado de la renovación desde el diálogo
const handleRenovacionSave = async () => {
  await loadContratosData();
};

// Manejar el guardado del ajuste IPC desde el diálogo
const handleAjusteIPCSave = async () => {
  await loadContratosData();
};

const eliminandoDocumento = ref(false);

// Manejar la subida exitosa del archivo
const handleFileUploadSuccess = (fileData) => {
  editedItem.value.documentoUrl = fileData.url;
  editedItem.value.documentoPath = fileData.path;
};

// Manejar error en la subida del archivo
const handleFileUploadError = (error) => {
  console.error('Error al subir el archivo:', error);
  // Aquí podrías mostrar un mensaje de error al usuario
};

// Eliminar documento
const eliminarDocumento = async () => {
  if (!editedItem.value.documentoPath) return;

  try {
    eliminandoDocumento.value = true;
    const success = await eliminarDocumentoContrato(
      editedItem.value.id,
      editedItem.value.documentoPath,
      user.value.uid
    );

    if (success) {
      editedItem.value.documentoUrl = null;
      editedItem.value.documentoPath = null;
    }
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
  } finally {
    eliminandoDocumento.value = false;
  }
};

// Cargar datos iniciales
onMounted(async () => {
  await loadContratosData();
});
</script>

<style scoped>
.contratos-container {
  padding: 1rem;
}

.toolbar-custom {
  min-height: 56px !important;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-title {
  font-size: 1.25rem;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.toolbar-btn {
  flex-shrink: 0;
}

.v-data-table {
  border-radius: 8px;
}

.search-field {
  max-width: 300px;
  border-radius: 8px;
}

.search-field :deep(.v-field__input) {
  min-height: 44px !important;
}

.search-field :deep(.v-field__append-inner) {
  padding-inline-start: 8px;
}

.search-field :deep(.v-field__clearable) {
  padding-inline-start: 0;
}

.search-field :deep(.v-field__outline__start),
.search-field :deep(.v-field__outline__end) {
  opacity: 0.12;
}

.search-field :deep(.v-field--focused .v-field__outline__start),
.search-field :deep(.v-field--focused .v-field__outline__end) {
  opacity: 0.2;
}
</style>
