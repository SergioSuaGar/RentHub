<template>
  <div class="facturas-container">
    <v-card>
      <v-toolbar flat color="primary" class="toolbar-custom">
        <v-toolbar-title class="text-white toolbar-title">Facturas</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          variant="text"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          :title="'Añadir una nueva factura al sistema'"
          class="toolbar-btn"
        >
          <span class="d-none d-sm-block">Nueva Factura</span>
          <span class="d-sm-none">Nueva</span>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="facturas"
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
                label="Buscar factura..."
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

          <!-- Columna de importe -->
          <template #[`item.importe`]="{ item }">
            {{ formatCurrency(item.importe) }}
          </template>

          <!-- Columna de importe pagado -->
          <template #[`item.importePagado`]="{ item }">
            {{ item.estado === 'pagada' ? formatCurrency(item.importePagado) : '-' }}
          </template>

          <!-- Columna de fechas -->
          <template #[`item.fechaInicio`]="{ item }">
            {{ formatDateShort(item.fechaInicio) }}
          </template>

          <template #[`item.fechaFin`]="{ item }">
            {{ formatDateShort(item.fechaFin) }}
          </template>

          <!-- Columna de estado -->
          <template #[`item.estado`]="{ item }">
            <v-chip
              :color="item.estado === 'pagada' ? 'success' : 'warning'"
              :text="item.estado === 'pagada' ? 'Pagada' : 'Pendiente'"
              size="small"
              class="cursor-pointer"
              @click.stop="toggleEstado(item)"
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
              :title="'Editar información de la factura'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click.stop="confirmDelete(item)"
              :title="'Eliminar factura del sistema'"
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
                        <v-list-item v-if="item.estado === 'pagada'">
                          <template v-slot:prepend>
                            <v-icon icon="mdi-calendar-check" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Fecha de Pago</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatDateShort(item.fechaPago)
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-home" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Propiedad</v-list-item-title>
                          <v-list-item-subtitle>{{ item.propiedadNombre }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-tag" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Tipo</v-list-item-title>
                          <v-list-item-subtitle>{{ item.tipo }}</v-list-item-subtitle>
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

    <!-- Reemplazar el diálogo de creación/edición con FacturaFormDialog -->
    <FacturaFormDialog v-model:dialog="dialog" :factura="editedItem" @save="handleFacturaSave" />

    <!-- Reemplazar el diálogo de confirmación de eliminación con FacturaDeleteDialog -->
    <FacturaDeleteDialog
      v-model:dialog="dialogDelete"
      :factura="editedItem"
      @delete="deleteItemConfirm"
    />

    <!-- Reemplazar el diálogo de registro de pago con FacturaPagoDialog -->
    <FacturaPagoDialog v-model:dialog="dialogPago" :factura="editedItem" @save="handlePagoSave" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { collection, query, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';
import { sortProperties } from '@/config/propertyOrder';
import FacturaFormDialog from '@/components/FacturaFormDialog.vue';
import FacturaDeleteDialog from '@/components/FacturaDeleteDialog.vue';
import FacturaPagoDialog from '@/components/FacturaPagoDialog.vue';
import {
  loadFacturas,
  loadPropiedades,
  loadContratosActivos,
  createFactura,
  updateFactura,
  deleteFactura,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatImporte,
  formatImportePagado,
  calcularImporteProporcional,
} from '@/services/factura';

const { user } = useAuth();

// Variables para la tabla
const loading = ref(false);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const facturas = ref([]);
const propiedades = ref([]);
const contratosActivos = ref([]);

// Tipos de factura
const tiposFactura = ['Luz', 'Agua', 'Agua caliente', 'Cuota piso'];

// Variables para el diálogo
const dialog = ref(false);
const dialogDelete = ref(false);
const dialogPago = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  tipo: '',
  propiedadId: '',
  propiedadNombre: '',
  importe: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'pendiente',
});
const defaultItem = {
  tipo: '',
  propiedadId: '',
  propiedadNombre: '',
  importe: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'pendiente',
};

// Headers de la tabla
const headers = [
  {
    title: 'Estado',
    key: 'estado',
    align: 'center',
    sortable: false,
    headerProps: { align: 'center' },
  },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: true },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
  { title: 'Importe', key: 'importe', align: 'end', sortable: true },
  { title: 'Pagado', key: 'importePagado', align: 'end', sortable: true },
  { title: 'Fecha Inicio', key: 'fechaInicio', align: 'start', sortable: true },
  { title: 'Fecha Fin', key: 'fechaFin', align: 'start', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
  { title: '', key: 'data-table-expand', sortable: false, align: 'center', width: '50px' },
];

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
  fechaFinValida: (v) => {
    if (!v || !editedItem.value.fechaInicio) return true;
    return (
      new Date(v) >= new Date(editedItem.value.fechaInicio) ||
      'La fecha fin debe ser posterior a la fecha inicio'
    );
  },
};

// Título del formulario
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nueva Factura' : 'Editar Factura';
});

// Actualizar importe cuando cambie el tipo, propiedad o fechas
const actualizarImporte = async () => {
  if (editedItem.value.tipo === 'Cuota piso') {
    // Cargar contratos activos si no se han cargado aún
    if (contratosActivos.value.length === 0) {
      contratosActivos.value = await loadContratosActivos();
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

// Cargar datos iniciales
onMounted(async () => {
  propiedades.value = await loadPropiedades();
  facturas.value = await loadFacturas();
  totalItems.value = facturas.value.length;
});

// Funciones para gestionar los diálogos
const openDialog = (item = null) => {
  editedIndex.value = item ? facturas.value.indexOf(item) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

const confirmDelete = (item) => {
  editedIndex.value = facturas.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const toggleEstado = async (item) => {
  if (item.estado === 'pendiente') {
    // Si está pendiente, abrir diálogo de pago
    editedIndex.value = facturas.value.indexOf(item);
    editedItem.value = { ...item };
    dialogPago.value = true;
  } else if (item.estado === 'pagada') {
    // Si está pagada, cambiar a pendiente directamente
    try {
      loading.value = true;

      // Preparar los datos de actualización
      const datosActualizacion = {
        estado: 'pendiente',
        // Eliminar campos relacionados con el pago
        importePagado: '',
        fechaPago: '',
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      };

      // Actualizar en Firestore
      await setDoc(doc(db, 'facturas', item.id), datosActualizacion, { merge: true });

      // Actualizar en el array local
      const index = facturas.value.indexOf(item);
      if (index !== -1) {
        Object.assign(facturas.value[index], {
          ...item,
          ...datosActualizacion,
        });
      }

      loading.value = false;
    } catch (error) {
      console.error('Error al cambiar estado de factura:', error);
      loading.value = false;
    }
  }
};

// Funciones para manejar los eventos de los diálogos
const handleFacturaSave = async (factura) => {
  try {
    loading.value = true;

    let facturaGuardada;

    // Si es una nueva factura
    if (editedIndex.value === -1) {
      // Preparar datos para crear
      const facturaData = {
        ...factura,
        createdAt: new Date().toISOString(),
        createdBy: user.value.uid,
      };

      // Guardar en Firestore
      facturaGuardada = await createFactura(facturaData, user.value.uid);

      if (facturaGuardada) {
        facturas.value.unshift(facturaGuardada);
      }
    } else {
      // Es una edición, actualizar en Firestore
      facturaGuardada = await updateFactura(factura.id, factura, user.value.uid);

      if (facturaGuardada) {
        // Actualizar en el array local
        Object.assign(facturas.value[editedIndex.value], facturaGuardada);
      }
    }

    dialog.value = false;
    loading.value = false;
  } catch (error) {
    console.error('Error al guardar factura:', error);
    loading.value = false;
  }
};

const deleteItemConfirm = async () => {
  try {
    loading.value = true;

    const facturaId = facturas.value[editedIndex.value].id;

    // Eliminar la factura de Firestore
    const eliminada = await deleteFactura(facturaId);

    if (eliminada) {
      // Eliminar la factura del array
      facturas.value.splice(editedIndex.value, 1);
    }

    dialogDelete.value = false;
    loading.value = false;
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    loading.value = false;
  }
};

const handlePagoSave = async (factura) => {
  try {
    loading.value = true;

    if (!factura) {
      console.error('Error: No se ha recibido la factura actualizada');
      loading.value = false;
      return;
    }

    // Ya tenemos la factura actualizada del componente hijo
    // Actualizar la factura en el array si tenemos el índice
    if (editedIndex.value !== -1 && facturas.value[editedIndex.value]) {
      Object.assign(facturas.value[editedIndex.value], factura);
    } else {
      // En caso de que no tengamos el índice, buscar la factura por ID
      const index = facturas.value.findIndex((f) => f.id === factura.id);
      if (index !== -1) {
        Object.assign(facturas.value[index], factura);
      }
    }

    dialogPago.value = false;
    loading.value = false;
  } catch (error) {
    console.error('Error al registrar pago:', error);
    loading.value = false;
  }
};
</script>

<style scoped>
.facturas-container {
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
