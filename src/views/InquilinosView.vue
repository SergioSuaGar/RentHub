<template>
  <div class="inquilinos-container">
    <v-card>
      <v-toolbar flat color="primary" class="toolbar-custom">
        <v-toolbar-title class="text-white toolbar-title">Inquilinos</v-toolbar-title>
        <v-btn
          color="white"
          variant="text"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          :title="'Añadir un nuevo inquilino al sistema'"
          class="toolbar-btn"
        >
          <span class="d-none d-sm-block">Nuevo Inquilino</span>
          <span class="d-sm-none">Nuevo</span>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="inquilinos"
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
                label="Buscar inquilino..."
                single-line
                hide-details
                density="comfortable"
                variant="outlined"
                color="primary"
                bg-color="surface"
                class="search-field elevation-1"
                clearable
                :title="'Buscar inquilinos por nombre, apellidos, teléfono o DNI'"
              ></v-text-field>
            </v-toolbar>
          </template>

          <!-- Columna de estado -->
          <template #[`item.estado`]="{ item }">
            <v-chip
              :color="item.estado ? 'success' : 'error'"
              :text="item.estado ? 'Activo' : 'Inactivo'"
              size="small"
              class="cursor-pointer"
              @click.stop="toggleEstado(item)"
              :title="item.estado ? 'Hacer click para desactivar' : 'Hacer click para activar'"
            ></v-chip>
          </template>

          <!-- Columna de acciones -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click.stop="openDialog(item)"
              :title="'Editar información del inquilino'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="isAdmin"
              icon
              variant="text"
              size="small"
              color="error"
              @click.stop="confirmDelete(item)"
              :title="'Eliminar inquilino del sistema'"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
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
                            <v-icon icon="mdi-phone" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Teléfono</v-list-item-title>
                          <v-list-item-subtitle>{{
                            item.telefono || 'No especificado'
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-card-account-details" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>DNI</v-list-item-title>
                          <v-list-item-subtitle>{{ item.dni }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-home" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Propiedad</v-list-item-title>
                          <v-list-item-subtitle>{{
                            item.propiedadNombre || 'Sin asignar'
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
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Usar el componente InquilinoFormDialog -->
    <InquilinoFormDialog v-model:dialog="dialog" :inquilino="editedItem" @save="handleSave" />

    <!-- Usar el componente InquilinoDeleteDialog -->
    <InquilinoDeleteDialog
      v-model:dialog="dialogDelete"
      :inquilino="editedItem"
      @delete="deleteItemConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import InquilinoFormDialog from '@/components/InquilinoFormDialog.vue';
import InquilinoDeleteDialog from '@/components/InquilinoDeleteDialog.vue';
import inquilinoService from '@/services/inquilino-service';
import propiedadService from '@/services/propiedad-service';
import { formatDate } from '@/services/utils/date-utils';

const { user, isAdmin } = useAuth();

// Variables para la tabla
const loading = ref(false);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const inquilinos = ref([]);
const propiedades = ref([]);

// Variables para el diálogo
const dialog = ref(false);
const dialogDelete = ref(false);
const editedItem = ref({
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  dni: '',
  estado: true,
  propiedadId: null,
  propiedadNombre: '',
});
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

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'nombre', align: 'start', sortable: true },
  { title: 'Apellidos', key: 'apellidos', align: 'start', sortable: true },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
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

// Cargar propiedades activas
const loadPropiedades = async () => {
  try {
    propiedades.value = await propiedadService.getActivas();
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

// Cargar inquilinos
const loadInquilinos = async () => {
  loading.value = true;
  try {
    const inquilinosData = await inquilinoService.loadInquilinos();

    // Enriquecer con el nombre de la propiedad
    inquilinos.value = inquilinosData.map((inquilino) => {
      // Buscar el nombre de la propiedad si existe
      const propiedad = propiedades.value.find((p) => p.id === inquilino.propiedadId);
      return {
        ...inquilino,
        estado: inquilino.estado ?? true,
        propiedadNombre: propiedad ? propiedad.nombre : '',
      };
    });

    totalItems.value = inquilinos.value.length;
  } catch (error) {
    console.error('Error al cargar inquilinos:', error);
  } finally {
    loading.value = false;
  }
};

// Abrir diálogo
const openDialog = (item) => {
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

// Confirmar eliminación
const confirmDelete = (item) => {
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

// Manejar el envío del formulario
const handleSave = async (inquilinoData) => {
  try {
    if (inquilinoData.id) {
      await inquilinoService.updateInquilino(inquilinoData.id, inquilinoData, user.value);
    } else {
      await inquilinoService.createInquilino(inquilinoData, user.value);
    }
    // Recargar datos para actualizar la lista
    await loadPropiedades();
    await loadInquilinos();
  } catch (error) {
    console.error('Error al guardar:', error);
  }
};

// Eliminar inquilino
const deleteItemConfirm = async (inquilino) => {
  try {
    await inquilinoService.deleteInquilino(inquilino.id);
    // Recargar datos para actualizar la lista
    await loadInquilinos();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

// Cambiar estado
const toggleEstado = async (item) => {
  try {
    const newEstado = !item.estado;
    await inquilinoService.toggleEstadoInquilino(item.id, newEstado, user.value);
    // Actualizar el estado en la vista
    item.estado = newEstado;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};

// Cargar datos iniciales
onMounted(async () => {
  await loadPropiedades();
  await loadInquilinos();
});
</script>

<style scoped>
.inquilinos-container {
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}
</style>
