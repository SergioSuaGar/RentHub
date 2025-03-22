<!-- Template -->
<template>
  <v-container fluid>
    <v-toolbar flat class="my-2">
      <v-toolbar-title>Gastos</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" dark class="mb-2" @click="abrirDialogoNuevo">
        <v-icon>mdi-plus</v-icon>
        Nuevo Gasto
      </v-btn>
    </v-toolbar>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="gastos"
        :search="search"
        sort-by="fecha"
        :sort-desc="true"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, -1],
          'items-per-page-text': 'Elementos por página',
        }"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #top>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
        </template>

        <template #item.tipo="{ item }">
          <v-chip :color="getTipoColor(item.tipo)" text-color="white">
            {{ item.tipo }}
          </v-chip>
        </template>

        <template #item.propiedadNombre="{ item }">
          {{ item.propiedadNombre || 'Sin propiedad' }}
        </template>

        <template #item.fecha="{ item }">
          {{ formatDate(item.fecha) }}
        </template>

        <template #item.importeTotal="{ item }">
          {{ formatCurrency(item.importeTotal) }}
        </template>

        <template #item.actions="{ item }">
          <v-icon small class="mr-2" @click="editarGasto(item)"> mdi-pencil </v-icon>
          <v-icon small @click="abrirDialogoEliminar(item)"> mdi-delete </v-icon>
        </template>

        <template #expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <v-card flat class="pa-3">
              <v-row>
                <v-col cols="12" sm="4"> <strong>Concepto:</strong> {{ item.concepto }} </v-col>
                <v-col cols="12" sm="4">
                  <strong>Coste por cuota:</strong> {{ formatCurrency(item.costePorCuota) }}
                </v-col>
                <v-col cols="12" sm="4">
                  <strong>Número de cuotas:</strong> {{ item.numeroCuotas }}
                </v-col>
              </v-row>
              <v-row v-if="item.notas">
                <v-col cols="12"> <strong>Notas:</strong> {{ item.notas }} </v-col>
              </v-row>
            </v-card>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <!-- Formulario de gasto (componente extraído) -->
    <gasto-form-dialog
      v-model="dialogForm"
      :edited-item="editedItem"
      :is-editing="editIndex !== -1"
      @saved="gastoGuardado"
      @close="cerrarDialogoForm"
    />

    <!-- Diálogo de eliminación (componente extraído) -->
    <gasto-delete-dialog
      v-model="dialogDelete"
      :gasto="editedItem"
      @deleted="gastoEliminado"
      @close="cerrarDialogoEliminar"
    />
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { auth } from '@/services/firebase';
import gastoService, { formatCurrency, formatDate } from '@/services/gasto-service';
import propiedadService from '@/services/propiedad-service';
import GastoFormDialog from '@/components/GastoFormDialog.vue';
import GastoDeleteDialog from '@/components/GastoDeleteDialog.vue';

export default {
  name: 'GastosView',

  components: {
    GastoFormDialog,
    GastoDeleteDialog,
  },

  setup() {
    // Estado
    const gastos = ref([]);
    const dialogForm = ref(false);
    const dialogDelete = ref(false);
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
    const editIndex = ref(-1);
    const search = ref('');

    // Cabeceras de la tabla
    const headers = [
      { text: 'Tipo', value: 'tipo', sortable: true },
      { text: 'Propiedad', value: 'propiedadNombre', sortable: true },
      { text: 'Fecha', value: 'fecha', sortable: true },
      { text: 'Concepto', value: 'concepto', sortable: true },
      { text: 'Importe Total', value: 'importeTotal', sortable: true },
      { text: 'Acciones', value: 'actions', sortable: false },
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
        // Cargar propiedades para mostrar nombres
        const propiedades = await propiedadService.loadPropiedades();

        // Cargar gastos con propiedades
        gastos.value = await gastoService.loadGastosConPropiedades(propiedades);
      } catch (error) {
        console.error('Error al cargar gastos:', error);
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

    return {
      gastos,
      headers,
      search,
      dialogForm,
      dialogDelete,
      editedItem,
      editIndex,
      formatCurrency,
      formatDate,
      abrirDialogoNuevo,
      editarGasto,
      cerrarDialogoForm,
      gastoGuardado,
      abrirDialogoEliminar,
      cerrarDialogoEliminar,
      gastoEliminado,
      getTipoColor,
    };
  },
};
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
