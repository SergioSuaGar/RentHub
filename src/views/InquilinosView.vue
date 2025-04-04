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

    <!-- Diálogo para crear/editar inquilino -->
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

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar este inquilino?</v-card-title>
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
            :title="'Confirmar la eliminación del inquilino'"
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
import { sortProperties } from '@/config/propertyOrder';

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
const editedIndex = ref(-1);
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

// Reglas de validación
const form = ref(null);
const formValid = ref(false);
const saving = ref(false);

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
  return editedIndex.value === -1 ? 'Nuevo Inquilino' : 'Editar Inquilino';
});

// Cargar propiedades activas
const loadPropiedades = async () => {
  try {
    const q = query(collection(db, 'propiedades'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    const propiedadesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    propiedades.value = sortProperties(propiedadesData);
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

// Modificar loadInquilinos para incluir los nombres de las propiedades
const loadInquilinos = async () => {
  loading.value = true;
  try {
    const q = query(collection(db, 'inquilinos'));
    const querySnapshot = await getDocs(q);
    inquilinos.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Buscar el nombre de la propiedad si existe
      const propiedad = propiedades.value.find((p) => p.id === data.propiedadId);
      return {
        id: doc.id,
        ...data,
        estado: data.estado ?? true,
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
  editedIndex.value = item ? inquilinos.value.indexOf(item) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
  // Resetear validación y establecer como válido si estamos editando
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
  if (saving.value) return; // Evitar múltiples envíos

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  formValid.value = true;
  await saveInquilino();
};

// Guardar inquilino
const saveInquilino = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      ...editedItem.value,
      estado: editedItem.value.estado ?? true,
      updatedAt: new Date(),
      updatedBy: user.value.uid,
    };

    if (editedIndex.value > -1) {
      await setDoc(doc(db, 'inquilinos', editedItem.value.id), itemData, { merge: true });
      Object.assign(inquilinos.value[editedIndex.value], itemData);
    } else {
      itemData.createdAt = new Date();
      itemData.createdBy = user.value.uid;
      const docRef = doc(collection(db, 'inquilinos'));
      await setDoc(docRef, itemData);
      const newItem = { ...itemData, id: docRef.id };
      inquilinos.value.push(newItem);
      totalItems.value++;
    }
    closeDialog();
    await loadInquilinos();
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    saving.value = false;
  }
};

// Confirmar eliminación
const confirmDelete = (item) => {
  editedIndex.value = inquilinos.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

// Cerrar diálogo de eliminación
const closeDelete = () => {
  dialogDelete.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

// Eliminar inquilino
const deleteItemConfirm = async () => {
  try {
    await deleteDoc(doc(db, 'inquilinos', editedItem.value.id));
    inquilinos.value.splice(editedIndex.value, 1);
    closeDelete();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

// Cambiar estado
const toggleEstado = async (item) => {
  try {
    const newEstado = !item.estado;
    await setDoc(
      doc(db, 'inquilinos', item.id),
      { estado: newEstado, updatedAt: new Date(), updatedBy: user.value.uid },
      { merge: true }
    );
    item.estado = newEstado;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};

// Actualizar el nombre de la propiedad cuando se seleccione
const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

// Modificar la función formatDate para manejar Timestamp de Firestore
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

// Modificar onMounted para cargar también las propiedades
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
