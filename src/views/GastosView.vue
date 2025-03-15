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
          @click="openDialog()"
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

          <!-- Columna de importes -->
          <template #[`item.costeCuota`]="{ item }">
            {{ formatCurrency(item.costeCuota) }}
          </template>

          <template #[`item.importeTotal`]="{ item }">
            {{ formatCurrency(item.importeTotal) }}
          </template>

          <!-- Columna de fecha -->
          <template #[`item.fecha`]="{ item }">
            {{ formatDateShort(item.fecha) }}
          </template>

          <!-- Columna de acciones -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click.stop="openDialog(item)"
              :title="'Editar información del gasto'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click.stop="confirmDelete(item)"
              :title="'Eliminar gasto del sistema'"
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
                            <v-icon icon="mdi-tag" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Tipo</v-list-item-title>
                          <v-list-item-subtitle>{{ item.tipo }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-text" class="me-2"></v-icon>
                          </template>
                          <v-list-item-title>Concepto</v-list-item-title>
                          <v-list-item-subtitle>{{ item.concepto }}</v-list-item-subtitle>
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

    <!-- Diálogo para crear/editar gasto -->
    <v-dialog v-model="dialog" max-width="600px">
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
                    :items="tiposGasto"
                    label="Tipo de Gasto *"
                    :rules="[rules.required]"
                    required
                    :hint="'Selecciona el tipo de gasto'"
                    persistent-hint
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
                    @update:model-value="updatePropiedadNombre"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    type="date"
                    v-model="editedItem.fecha"
                    label="Fecha *"
                    :rules="[rules.required]"
                    required
                    :hint="'Selecciona la fecha'"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.concepto"
                    label="Concepto *"
                    :rules="[rules.required]"
                    required
                    :hint="'Introduce el concepto del gasto'"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.costeCuota"
                    label="Coste por Cuota *"
                    :rules="[rules.required, rules.numeric]"
                    required
                    :hint="'Introduce el coste por cuota (usar coma para decimales)'"
                    persistent-hint
                    @input="formatCosteCuota"
                    validate-on-blur
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.cantidadCuotas"
                    label="Cantidad de Cuotas *"
                    type="number"
                    :rules="[rules.required, rules.entero]"
                    required
                    :hint="'Introduce el número de cuotas'"
                    persistent-hint
                    @input="calcularImporteTotal"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.importeTotal"
                    label="Importe Total *"
                    :rules="[rules.required, rules.numeric]"
                    required
                    :hint="'Importe total (editable)'"
                    persistent-hint
                    @input="formatImporteTotal"
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

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este gasto?</v-card-title>
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
            :title="'Confirmar la eliminación del gasto'"
          >
            Sí
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { collection, query, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();

// Variables para la tabla
const loading = ref(false);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const gastos = ref([]);
const propiedades = ref([]);

// Tipos de gasto
const tiposGasto = ['IBI', 'Comunidad', 'Seguro', 'Legalitas'];

// Variables para el diálogo
const dialog = ref(false);
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  tipo: '',
  propiedadId: '',
  propiedadNombre: '',
  fecha: '',
  concepto: '',
  costeCuota: '',
  cantidadCuotas: '',
  importeTotal: '',
});
const defaultItem = {
  tipo: '',
  propiedadId: '',
  propiedadNombre: '',
  fecha: '',
  concepto: '',
  costeCuota: '',
  cantidadCuotas: '',
  importeTotal: '',
};

// Headers de la tabla
const headers = [
  { title: '', key: 'data-table-expand', sortable: false, align: 'center', width: '50px' },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: true },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
  { title: 'Fecha', key: 'fecha', align: 'start', sortable: true },
  { title: 'Concepto', key: 'concepto', align: 'start', sortable: true },
  { title: 'Coste/Cuota', key: 'costeCuota', align: 'end', sortable: true },
  { title: 'Nº Cuotas', key: 'cantidadCuotas', align: 'end', sortable: true },
  { title: 'Total', key: 'importeTotal', align: 'end', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
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
  entero: (v) => {
    if (!v) return true;
    return (Number.isInteger(Number(v)) && Number(v) > 0) || 'Debe ser un número entero positivo';
  },
};

// Título del formulario
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nuevo Gasto' : 'Editar Gasto';
});

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0 €';
  return `${value} €`;
};

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return 'No disponible';

  // Si es un objeto Timestamp de Firestore
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Si es una cadena de fecha ISO
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return 'No disponible';
};

// Formatear fecha corta
const formatDateShort = (timestamp) => {
  if (!timestamp) return 'No disponible';

  // Si es un objeto Timestamp de Firestore
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si es una cadena de fecha ISO
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return 'No disponible';
};

// Formatear coste cuota
const formatCosteCuota = (event) => {
  let value = event.target.value;
  // Permitir solo números y una coma
  value = value.replace(/[^\d,]/g, '');
  // Asegurar solo una coma
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  // Limitar a dos decimales
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }
  editedItem.value.costeCuota = value;
  calcularImporteTotal();
};

// Formatear importe total
const formatImporteTotal = (event) => {
  let value = event.target.value;
  // Permitir solo números y una coma
  value = value.replace(/[^\d,]/g, '');
  // Asegurar solo una coma
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  // Limitar a dos decimales
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }
  editedItem.value.importeTotal = value;
};

// Calcular importe total
const calcularImporteTotal = () => {
  if (editedItem.value.costeCuota && editedItem.value.cantidadCuotas) {
    const coste = parseFloat(editedItem.value.costeCuota.replace(',', '.'));
    const cantidad = parseInt(editedItem.value.cantidadCuotas);
    if (!isNaN(coste) && !isNaN(cantidad)) {
      const total = (coste * cantidad).toFixed(2).replace('.', ',');
      editedItem.value.importeTotal = total;
    }
  }
};

// Cargar propiedades activas
const loadPropiedades = async () => {
  try {
    const q = query(collection(db, 'propiedades'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    propiedades.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

// Cargar gastos
const loadGastos = async () => {
  loading.value = true;
  try {
    const q = query(collection(db, 'gastos'));
    const querySnapshot = await getDocs(q);
    gastos.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const propiedad = propiedades.value.find((p) => p.id === data.propiedadId);
      return {
        id: doc.id,
        ...data,
        propiedadNombre: propiedad ? propiedad.nombre : '',
      };
    });
    totalItems.value = gastos.value.length;
  } catch (error) {
    console.error('Error al cargar gastos:', error);
  } finally {
    loading.value = false;
  }
};

// Abrir diálogo
const openDialog = (item) => {
  editedIndex.value = item ? gastos.value.indexOf(item) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
  nextTick(() => {
    form.value?.resetValidation();
    if (item) {
      formValid.value = true;
    }
  });
};

// Cerrar diálogo
const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

// Manejar el envío del formulario
const handleSubmit = async () => {
  if (saving.value) return;

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  formValid.value = true;
  await saveGasto();
};

// Guardar gasto
const saveGasto = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      ...editedItem.value,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    };

    if (editedIndex.value > -1) {
      await setDoc(doc(db, 'gastos', editedItem.value.id), itemData, { merge: true });
      Object.assign(gastos.value[editedIndex.value], itemData);
    } else {
      itemData.createdAt = new Date().toISOString();
      itemData.createdBy = user.value.uid;
      const docRef = doc(collection(db, 'gastos'));
      await setDoc(docRef, itemData);
      const newItem = { ...itemData, id: docRef.id };
      gastos.value.push(newItem);
      totalItems.value++;
    }
    closeDialog();
    await loadGastos();
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    saving.value = false;
  }
};

// Confirmar eliminación
const confirmDelete = (item) => {
  editedIndex.value = gastos.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

// Cerrar diálogo de eliminación
const closeDelete = () => {
  dialogDelete.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

// Eliminar gasto
const deleteItemConfirm = async () => {
  try {
    await deleteDoc(doc(db, 'gastos', editedItem.value.id));
    gastos.value.splice(editedIndex.value, 1);
    closeDelete();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

// Actualizar el nombre de la propiedad cuando se seleccione
const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

// Cargar datos iniciales
onMounted(async () => {
  await loadPropiedades();
  await loadGastos();
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
