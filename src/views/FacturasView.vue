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
          :sort-by="sortBy"
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

          <!-- Columna de saldo -->
          <template #[`item.saldo`]="{ item }">
            <span v-if="calcularSaldo(item) === 0">-</span>
            <span v-else :class="getSaldoClass(item)">
              {{ formatCurrency(calcularSaldo(item)) }}
            </span>
          </template>
          <template #[`footer.saldo`]>
            <span v-if="totalSaldo === 0">-</span>
            <span v-else :class="totalSaldo > 0 ? 'text-success' : 'text-error'">
              {{ formatCurrency(totalSaldo) }}
            </span>
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
                <v-col cols="12" v-if="errorMensaje">
                  <v-alert
                    type="error"
                    variant="tonal"
                    density="compact"
                    closable
                    @click:close="errorMensaje = ''"
                  >
                    {{ errorMensaje }}
                  </v-alert>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editedItem.tipo"
                    :items="tiposFactura"
                    label="Tipo de Factura *"
                    :rules="[rules.required]"
                    required
                    :hint="'Selecciona el tipo de factura'"
                    persistent-hint
                    @update:model-value="(v) => actualizarImporte()"
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
                    @update:model-value="
                      async (v) => {
                        updatePropiedadNombre(v);
                        await actualizarImporte();
                      }
                    "
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    type="date"
                    :model-value="editedItem.fechaInicio"
                    @update:model-value="
                      async (v) => {
                        editedItem.fechaInicio = v;
                        await actualizarImporte();
                      }
                    "
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
                    :model-value="editedItem.fechaFin"
                    @update:model-value="
                      async (v) => {
                        editedItem.fechaFin = v;
                        await actualizarImporte();
                      }
                    "
                    label="Fecha Fin *"
                    :rules="[rules.required]"
                    required
                    :hint="'Selecciona la fecha de fin'"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.importe"
                    label="Importe *"
                    :rules="[rules.required, rules.numeric]"
                    required
                    :hint="'Introduce el importe (usar punto para decimales)'"
                    persistent-hint
                    @input="formatImporte"
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

    <!-- Diálogo para registrar pago -->
    <v-dialog v-model="dialogPago" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Registrar Pago</v-card-title>
        <v-card-text>
          <v-form ref="formPago" v-model="formPagoValid" lazy-validation>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 mb-2">Importe a pagar:</div>
                  <div class="text-h6 mb-4">{{ formatCurrency(editedItem.importe) }}</div>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="pagoData.importePagado"
                    label="Importe Pagado *"
                    :rules="[rules.required, rules.numeric]"
                    required
                    :hint="'Introduce el importe pagado (usar punto para decimales)'"
                    persistent-hint
                    @input="formatImportePagado"
                    validate-on-blur
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    type="date"
                    v-model="pagoData.fechaPago"
                    label="Fecha de Pago *"
                    :rules="[rules.required]"
                    required
                    :hint="'Selecciona la fecha en que se realizó el pago'"
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
            @click="closeDialogPago"
            :title="'Cancelar el registro de pago'"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="confirmarPago"
            :loading="saving"
            :disabled="!formPagoValid || saving"
            :title="'Confirmar el registro de pago'"
          >
            Confirmar
          </v-btn>
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
import { useRoute } from 'vue-router';

const { user } = useAuth();
const route = useRoute();

// Variables para la tabla
const loading = ref(false);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const facturas = ref([]);
const propiedades = ref([]);
const contratosActivos = ref([]);

// Inicializar el ordenamiento según el parámetro fromWidget
const sortBy = ref(
  route.query.fromWidget === 'true'
    ? [
        { key: 'estado', order: 'desc' },
        { key: 'fechaFin', order: 'desc' },
      ]
    : [{ key: 'fechaFin', order: 'desc' }]
);

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
    sortable: true,
    headerProps: { align: 'center' },
  },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: true },
  { title: 'Propiedad', key: 'propiedadNombre', align: 'start', sortable: true },
  { title: 'Importe', key: 'importe', align: 'end', sortable: true },
  { title: 'Pagado', key: 'importePagado', align: 'end', sortable: true },
  { title: 'Saldo', key: 'saldo', align: 'end', sortable: true },
  { title: 'Fecha Inicio', key: 'fechaInicio', align: 'start', sortable: true },
  {
    title: 'Fecha Fin',
    key: 'fechaFin',
    align: 'start',
    sortable: true,
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
  numeric: (v) => {
    if (!v) return true;
    const pattern = /^\d+(?:\.\d{1,2})?$/;
    return pattern.test(v) || 'Formato inválido. Use punto para decimales (ej: 123.45)';
  },
  fechaFinValida: (v) => {
    if (!v || !editedItem.value.fechaInicio) return true;
    return (
      new Date(v) >= new Date(editedItem.value.fechaInicio) ||
      'La fecha fin debe ser posterior a la fecha inicio'
    );
  },
};

// Mensaje de error para facturas duplicadas
const errorMensaje = ref('');

// Título del formulario
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nueva Factura' : 'Editar Factura';
});

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0 €';

  // Convertir a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Formatear el número con el signo adecuado
  const absValue = Math.abs(numValue);
  const signo = numValue < 0 ? '-' : '';

  // Convertir a string con punto para decimales
  let formattedValue = absValue.toString();
  if (formattedValue.includes('.')) {
    // Si tiene decimales, asegurar 2 decimales y usar punto
    formattedValue = absValue.toFixed(2);
    // Si termina en .00 quitar los decimales
    if (formattedValue.endsWith('.00')) {
      formattedValue = formattedValue.substring(0, formattedValue.length - 3);
    }
  }

  return `${signo}${formattedValue} €`;
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

// Añadir la función formatDateShort después de la función formatDate
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

// Formatear importe
const formatImporte = (event) => {
  let value = event.target.value;
  // Permitir solo números y un punto
  value = value.replace(/[^\d.]/g, '');
  // Asegurar solo un punto
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  // Limitar a dos decimales
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2);
  }
  editedItem.value.importe = value;
};

// Variables para el diálogo de pago
const formPago = ref(null);
const formPagoValid = ref(false);
const pagoData = ref({
  importePagado: '',
  fechaPago: new Date().toISOString().split('T')[0],
});

// Formatear importe pagado
const formatImportePagado = (event) => {
  let value = event.target.value;
  // Permitir solo números y un punto
  value = value.replace(/[^\d.]/g, '');
  // Asegurar solo un punto
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  // Limitar a dos decimales
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2);
  }
  pagoData.value.importePagado = value;
};

// Cargar contratos activos
const loadContratosActivos = async () => {
  try {
    const q = query(collection(db, 'contratos'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    contratosActivos.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al cargar contratos activos:', error);
  }
};

// Calcular importe proporcional
const calcularImporteProporcional = (precio, fechaInicio, fechaFin) => {
  if (!precio || !fechaInicio || !fechaFin) return '';

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // Obtener el último día del mes
  const ultimoDiaMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate();

  // Calcular días ocupados (fin - inicio)
  const diasOcupados = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));

  // Convertir el precio a número
  const precioNumerico = parseFloat(precio);

  // Calcular el precio por día basado en los días reales del mes
  const precioDiario = precioNumerico / ultimoDiaMes;

  // Calcular el importe total
  const importeCalculado = precioDiario * diasOcupados;

  // Redondear a 2 decimales y formatear
  let importeFormateado = importeCalculado.toFixed(2);

  // Eliminar decimales si son ceros
  if (importeFormateado.endsWith('.00')) {
    importeFormateado = importeFormateado.slice(0, -3);
  }

  return importeFormateado;
};

// Actualizar importe cuando cambie el tipo, propiedad o fechas
const actualizarImporte = async () => {
  if (editedItem.value.tipo === 'Cuota piso') {
    // Cargar contratos activos si no se han cargado aún
    if (contratosActivos.value.length === 0) {
      await loadContratosActivos();
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

// Función para convertir fecha ISO a formato de entrada (YYYY-MM-DD)
const isoToDateInput = (isoDate) => {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
};

// Función para convertir fecha de entrada a ISO
const dateInputToIso = (inputDate) => {
  if (!inputDate) return '';
  return new Date(inputDate).toISOString();
};

// Verificar factura duplicada
const verificarFacturaDuplicada = (tipo, propiedadId, fechaFin) => {
  if (!tipo || !propiedadId || !fechaFin) return false;

  // Obtener el mes y año de la fecha fin
  const fecha = new Date(fechaFin);
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();

  // Buscar facturas del mismo tipo, propiedad y mes
  return facturas.value.some((factura) => {
    // Si estamos editando, ignorar la factura actual
    if (editedIndex.value > -1 && factura.id === editedItem.value.id) return false;

    // Comprobar si coincide tipo y propiedad
    const mismoPropiedadYTipo = factura.tipo === tipo && factura.propiedadId === propiedadId;

    if (mismoPropiedadYTipo) {
      // Comprobar si es del mismo mes
      const fechaFinFactura = new Date(factura.fechaFin);
      return fechaFinFactura.getMonth() === mes && fechaFinFactura.getFullYear() === año;
    }

    return false;
  });
};

// Abrir diálogo
const openDialog = (item) => {
  editedIndex.value = item ? facturas.value.indexOf(item) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
  nextTick(async () => {
    form.value?.resetValidation();
    if (item) {
      formValid.value = true;
      // Si estamos editando una factura de tipo 'Cuota piso', cargamos los contratos
      if (item.tipo === 'Cuota piso') {
        await loadContratosActivos();
      }
    }
  });
};

// Cerrar diálogo
const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  errorMensaje.value = '';
  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

// Manejar el envío del formulario
const handleSubmit = async () => {
  if (saving.value) return;

  // Resetear mensaje de error
  errorMensaje.value = '';

  const isValid = await form.value?.validate();

  if (!isValid) {
    formValid.value = false;
    return;
  }

  // Verificar si ya existe una factura similar
  const hayDuplicado = verificarFacturaDuplicada(
    editedItem.value.tipo,
    editedItem.value.propiedadId,
    editedItem.value.fechaFin
  );

  if (hayDuplicado) {
    errorMensaje.value = `Ya existe una factura de ${editedItem.value.tipo} para esta propiedad en el mismo mes`;
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
      fechaInicio: editedItem.value.fechaInicio,
      fechaFin: editedItem.value.fechaFin,
      fechaPago: editedItem.value.estado === 'pagada' ? editedItem.value.fechaPago : null,
      importePagado: editedItem.value.estado === 'pagada' ? editedItem.value.importePagado : null,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    };

    if (editedIndex.value > -1) {
      await setDoc(doc(db, 'facturas', editedItem.value.id), itemData, { merge: true });
      Object.assign(facturas.value[editedIndex.value], itemData);
    } else {
      itemData.createdAt = new Date().toISOString();
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

// Abrir diálogo de pago
const openDialogPago = (item) => {
  editedItem.value = { ...item };
  pagoData.value = {
    importePagado: item.importe,
    fechaPago: new Date().toISOString().split('T')[0],
  };
  dialogPago.value = true;
  nextTick(() => {
    formPago.value?.resetValidation();
  });
};

// Cerrar diálogo de pago
const closeDialogPago = () => {
  dialogPago.value = false;
  editedItem.value = { ...defaultItem };
  pagoData.value = {
    importePagado: '',
    fechaPago: new Date().toISOString().split('T')[0],
  };
  nextTick(() => {
    formPago.value?.reset();
    formPagoValid.value = false;
  });
};

// Confirmar pago
const confirmarPago = async () => {
  if (saving.value) return;

  const isValid = await formPago.value?.validate();

  if (!isValid) {
    formPagoValid.value = false;
    return;
  }

  formPagoValid.value = true;
  await registrarPago();
};

// Registrar pago
const registrarPago = async () => {
  if (saving.value || !formPagoValid.value) return;

  try {
    saving.value = true;
    await setDoc(
      doc(db, 'facturas', editedItem.value.id),
      {
        estado: 'pagada',
        importePagado: pagoData.value.importePagado,
        fechaPago: new Date(pagoData.value.fechaPago).toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      },
      { merge: true }
    );
    editedItem.value.estado = 'pagada';
    closeDialogPago();
    await loadFacturas();
  } catch (error) {
    console.error('Error al registrar pago:', error);
  } finally {
    saving.value = false;
  }
};

// Cambiar estado
const toggleEstado = async (item) => {
  try {
    if (item.estado === 'pendiente') {
      // Si está pendiente, abrir el diálogo de pago
      openDialogPago(item);
    } else {
      // Si está pagada, marcar como pendiente directamente
      const updateData = {
        estado: 'pendiente',
        fechaPago: null,
        importePagado: null,
        updatedAt: new Date().toISOString(),
        updatedBy: user.value.uid,
      };

      await setDoc(doc(db, 'facturas', item.id), updateData, { merge: true });
      Object.assign(item, updateData);
      await loadFacturas();
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};

// Calcular saldo
const calcularSaldo = (item) => {
  if (item.estado === 'pendiente') {
    return -parseFloat(item.importe);
  }

  if (item.estado === 'pagada' && item.importePagado) {
    const importePagado = parseFloat(item.importePagado);
    const importe = parseFloat(item.importe);
    return importePagado - importe;
  }

  return 0;
};

// Obtener clase CSS para el saldo
const getSaldoClass = (item) => {
  const saldo = calcularSaldo(item);
  if (saldo === 0) return '';
  return saldo > 0 ? 'text-success' : 'text-error';
};

// Total Saldo
const totalSaldo = computed(() => {
  return facturas.value.reduce((total, factura) => {
    if (factura.estado === 'pagada' && factura.importePagado) {
      const importePagado = parseFloat(factura.importePagado);
      const importe = parseFloat(factura.importe);
      return total + (importePagado - importe);
    }
    return total;
  }, 0);
});

// Cargar datos iniciales
onMounted(async () => {
  await loadPropiedades();
  await loadFacturas();

  // Aplicar filtro desde la URL si existe
  if (route.query.search) {
    search.value = decodeURIComponent(route.query.search);
  }
});
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
