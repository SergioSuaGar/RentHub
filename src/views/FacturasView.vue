<template>
  <div class="facturas-container">
    <v-card>
      <v-toolbar flat color="primary" density="compact">
        <v-toolbar-title class="text-white">Facturas</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          variant="text"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          :title="'Añadir una nueva factura al sistema'"
        >
          Nueva Factura
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

          <!-- Columna de fechas -->
          <template #[`item.fechaInicio`]="{ item }">
            {{ formatDate(item.fechaInicio) }}
          </template>

          <template #[`item.fechaFin`]="{ item }">
            {{ formatDate(item.fechaFin) }}
          </template>

          <!-- Columna de acciones -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="openDialog(item)"
              :title="'Editar información de la factura'"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(item)"
              :title="'Eliminar factura del sistema'"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Diálogo para crear/editar factura -->
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
                    :items="tiposFactura"
                    label="Tipo de Factura *"
                    :rules="[rules.required]"
                    required
                    :hint="'Selecciona el tipo de factura'"
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
                <v-col cols="12" sm="6">
                  <v-text-field
                    type="date"
                    v-model="editedItem.fechaInicio"
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
                    v-model="editedItem.fechaFin"
                    label="Fecha Fin *"
                    :rules="[rules.required, rules.fechaFinValida]"
                    required
                    :hint="'Selecciona la fecha de fin'"
                    persistent-hint
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
        <v-card-title class="text-h5">¿Estás seguro de eliminar esta factura?</v-card-title>
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
            :title="'Confirmar la eliminación de la factura'"
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
const facturas = ref([]);
const propiedades = ref([]);

// Tipos de factura
const tiposFactura = ['Luz', 'Agua', 'Agua caliente'];

// Variables para el diálogo
const dialog = ref(false);
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  tipo: '',
  propiedadId: null,
  propiedadNombre: '',
  importe: '',
  fechaInicio: '',
  fechaFin: '',
});
const defaultItem = {
  tipo: '',
  propiedadId: null,
  propiedadNombre: '',
  importe: '',
  fechaInicio: '',
  fechaFin: '',
};

// Headers de la tabla
const headers = [
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: true },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
  { title: 'Importe', key: 'importe', align: 'end', sortable: true },
  { title: 'Fecha Inicio', key: 'fechaInicio', align: 'start', sortable: true },
  { title: 'Fecha Fin', key: 'fechaFin', align: 'start', sortable: true },
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

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0,00 €';
  return `${value} €`;
};

// Formatear fecha
const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-ES');
};

// Formatear importe
const formatImporte = (event) => {
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
  editedItem.value.importe = value;
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

// Cargar facturas
const loadFacturas = async () => {
  loading.value = true;
  try {
    const q = query(collection(db, 'facturas'));
    const querySnapshot = await getDocs(q);
    facturas.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const propiedad = propiedades.value.find((p) => p.id === data.propiedadId);
      return {
        id: doc.id,
        ...data,
        propiedadNombre: propiedad ? propiedad.nombre : '',
      };
    });
    totalItems.value = facturas.value.length;
  } catch (error) {
    console.error('Error al cargar facturas:', error);
  } finally {
    loading.value = false;
  }
};

// Abrir diálogo
const openDialog = (item) => {
  editedIndex.value = item ? facturas.value.indexOf(item) : -1;
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
  await saveFactura();
};

// Guardar factura
const saveFactura = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      ...editedItem.value,
      updatedAt: new Date(),
      updatedBy: user.value.uid,
    };

    if (editedIndex.value > -1) {
      await setDoc(doc(db, 'facturas', editedItem.value.id), itemData, { merge: true });
      Object.assign(facturas.value[editedIndex.value], itemData);
    } else {
      itemData.createdAt = new Date();
      itemData.createdBy = user.value.uid;
      const docRef = doc(collection(db, 'facturas'));
      await setDoc(docRef, itemData);
      const newItem = { ...itemData, id: docRef.id };
      facturas.value.push(newItem);
      totalItems.value++;
    }
    closeDialog();
    await loadFacturas();
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    saving.value = false;
  }
};

// Confirmar eliminación
const confirmDelete = (item) => {
  editedIndex.value = facturas.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

// Cerrar diálogo de eliminación
const closeDelete = () => {
  dialogDelete.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

// Eliminar factura
const deleteItemConfirm = async () => {
  try {
    await deleteDoc(doc(db, 'facturas', editedItem.value.id));
    facturas.value.splice(editedIndex.value, 1);
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
  await loadFacturas();
});
</script>

<style scoped>
.facturas-container {
  padding: 1rem;
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
