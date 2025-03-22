<!-- Template -->
<template>
  <div class="gastos-container">
    <v-card>
      <v-toolbar flat color="primary" class="toolbar-custom">
        <v-toolbar-title class="text-white toolbar-title">Gastos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          variant="text"
          prepend-icon="mdi-plus"
          @click="abrirDialogoNuevo"
          :title="'Añadir un nuevo gasto al sistema'"
          class="toolbar-btn"
        >
          <span class="d-none d-sm-block">Nuevo Gasto</span>
          <span class="d-sm-none">Nuevo</span>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="gastos"
          :loading="loading"
          :search="search"
          :sort-by="[{ key: 'fecha', order: 'desc' }]"
          class="elevation-1"
          show-expand
          item-value="id"
        >
          <!-- Barra de búsqueda -->
          <template v-slot:top>
            <v-toolbar flat class="px-2 pb-2">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Buscar gasto..."
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

          <!-- Columna de tipo -->
          <template v-slot:[`item.tipo`]="{ item }">
            <v-chip :color="getTipoColor(item.tipo)" text-color="white">
              {{ item.tipo }}
            </v-chip>
          </template>

          <!-- Columna de propiedad -->
          <template v-slot:[`item.propiedadNombre`]="{ item }">
            {{ item.propiedadNombre || 'Sin propiedad' }}
          </template>

          <!-- Columna de fecha -->
          <template v-slot:[`item.fecha`]="{ item }">
            {{ formatDate(item.fecha) }}
          </template>

          <!-- Columna de importe -->
          <template v-slot:[`item.importeTotal`]="{ item }">
            {{ formatCurrency(item.importeTotal) }}
          </template>

          <!-- Columna de acciones -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="editarGasto(item)"
              :title="'Editar información del gasto'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="abrirDialogoEliminar(item)"
              :title="'Eliminar gasto del sistema'"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>

          <!-- Fila expandible -->
          <template v-slot:expanded-row="{ item }">
            <tr>
              <td :colspan="headers.length">
                <v-card flat class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="text-subtitle-1 font-weight-bold mb-2">Información Adicional</div>
                      <v-list density="compact">
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-information" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Concepto</v-list-item-title>
                          <v-list-item-subtitle>{{ item.concepto }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="item.costePorCuota">
                          <template v-slot:prepend>
                            <v-icon icon="mdi-cash" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Coste por cuota</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatCurrency(item.costePorCuota)
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="item.numeroCuotas > 1">
                          <template v-slot:prepend>
                            <v-icon icon="mdi-numeric" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Número de cuotas</v-list-item-title>
                          <v-list-item-subtitle>{{ item.numeroCuotas }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col v-if="item.notas" cols="12" md="6">
                      <div class="text-subtitle-1 font-weight-bold mb-2">Notas</div>
                      <v-list density="compact">
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-note-text" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Información Adicional</v-list-item-title>
                          <v-list-item-subtitle>{{ item.notas }}</v-list-item-subtitle>
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

    <!-- Formulario de gasto (componente extraído) -->
    <GastoFormDialog
      v-model="dialogForm"
      :edited-item="editedItem"
      :is-editing="editIndex !== -1"
      @saved="gastoGuardado"
      @close="cerrarDialogoForm"
    />

    <!-- Diálogo de eliminación (componente extraído) -->
    <GastoDeleteDialog
      v-model="dialogDelete"
      :gasto="editedItem"
      @deleted="gastoEliminado"
      @close="cerrarDialogoEliminar"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { auth } from '@/services/firebase';
import gastoService, { formatCurrency, formatDate } from '@/services/gasto-service';
import propiedadService from '@/services/propiedad-service';
import GastoFormDialog from '@/components/GastoFormDialog.vue';
import GastoDeleteDialog from '@/components/GastoDeleteDialog.vue';

// Variables para la tabla
const loading = ref(false);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const gastos = ref([]);
const dialogForm = ref(false);
const dialogDelete = ref(false);
const editIndex = ref(-1);

// Item editado
const editedItem = reactive({
  tipo: '',
  propiedadId: null,
  fecha: new Date().toISOString().substr(0, 10),
  concepto: '',
  costePorCuota: '',
  numeroCuotas: 1,
  importeTotal: '',
  notas: '',
});

// Item por defecto
const defaultItem = {
  tipo: '',
  propiedadId: null,
  fecha: new Date().toISOString().substr(0, 10),
  concepto: '',
  costePorCuota: '',
  numeroCuotas: 1,
  importeTotal: '',
  notas: '',
};

// Cabeceras de la tabla
const headers = [
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: true },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
  { title: 'Fecha', key: 'fecha', align: 'start', sortable: true },
  { title: 'Concepto', key: 'concepto', align: 'start', sortable: true },
  { title: 'Importe Total', key: 'importeTotal', align: 'end', sortable: true },
  { title: 'Acciones', key: 'actions', align: 'center', sortable: false },
];

// Colores para los tipos de gastos
const tipoColors = {
  Comunidad: 'orange',
  IBI: 'red',
  Seguro: 'blue',
  Luz: 'yellow darken-3',
  Agua: 'blue-grey',
  Gas: 'deep-orange',
  Reparación: 'deep-purple',
  Mantenimiento: 'teal',
  Otros: 'grey',
};

// Métodos
const cargarGastos = async () => {
  try {
    loading.value = true;
    // Cargar propiedades para mostrar nombres
    const propiedades = await propiedadService.loadPropiedades();

    // Cargar gastos con propiedades
    gastos.value = await gastoService.loadGastosConPropiedades(propiedades);
  } catch (error) {
    console.error('Error al cargar gastos:', error);
  } finally {
    loading.value = false;
  }
};

const abrirDialogoNuevo = () => {
  // Usar el objeto defaultItem para inicializar editedItem
  Object.assign(editedItem, defaultItem);
  editIndex.value = -1;
  dialogForm.value = true;
};

const editarGasto = (item) => {
  editIndex.value = gastos.value.indexOf(item);
  // Copiar el item para editarlo
  Object.assign(editedItem, item);
  dialogForm.value = true;
};

const cerrarDialogoForm = () => {
  dialogForm.value = false;
};

const gastoGuardado = (gasto) => {
  // Si es una edición, actualizar el array de gastos
  if (editIndex.value > -1) {
    Object.assign(gastos.value[editIndex.value], gasto);
  } else {
    // Si es nuevo, añadirlo al array
    gastos.value.push(gasto);
  }
  // Reiniciar el índice y cerrar el diálogo
  editIndex.value = -1;
  dialogForm.value = false;
};

const abrirDialogoEliminar = (item) => {
  // Copiar el item para eliminarlo
  Object.assign(editedItem, item);
  dialogDelete.value = true;
};

const cerrarDialogoEliminar = () => {
  dialogDelete.value = false;
};

const gastoEliminado = (gastoId) => {
  // Eliminar el gasto del array
  const index = gastos.value.findIndex((g) => g.id === gastoId);
  if (index > -1) {
    gastos.value.splice(index, 1);
  }
  dialogDelete.value = false;
};

const getTipoColor = (tipo) => {
  return tipoColors[tipo] || 'grey';
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarGastos();
});
</script>

<style scoped>
.gastos-container {
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
