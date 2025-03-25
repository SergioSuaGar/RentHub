<template>
  <div class="dashboard-container">
    <v-card>
      <v-toolbar flat color="primary" class="toolbar-custom">
        <v-toolbar-title class="text-white toolbar-title">Dashboard</v-toolbar-title>
        <v-select
          v-model="propiedadSeleccionada"
          :items="propiedadesActivas"
          item-title="nombre"
          item-value="id"
          label="Propiedad"
          clearable
          hide-details
          @update:model-value="onPropiedadSeleccionada"
        ></v-select>
      </v-toolbar>

      <v-card-text>
        <!-- Primera fila: Facturas Mes y Pendientes -->
        <v-row>
          <!-- Resumen de facturas -->
          <v-col cols="12" md="6" lg="6">
            <v-card class="cursor-pointer" @click="router.push('/facturas')">
              <v-card-item>
                <v-card-title>
                  <v-icon icon="mdi-cash" class="me-2" color="success"></v-icon>
                  Facturas Mes
                </v-card-title>
                <v-card-subtitle class="mt-2">
                  <span class="text-h6">{{ formatCurrency(totalCobradoMes) }}</span>
                  <span class="text-caption d-block"
                    >de {{ formatCurrency(totalEsperadoMes) }}</span
                  >
                  <v-progress-linear
                    :model-value="(totalCobradoMes / totalEsperadoMes) * 100"
                    color="success"
                    height="4"
                    class="mt-2"
                  ></v-progress-linear>
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>

          <!-- Facturas pendientes -->
          <v-col cols="12" md="6" lg="6">
            <v-card class="cursor-pointer" @click="router.push('/facturas')">
              <v-card-item>
                <v-card-title>
                  <v-icon icon="mdi-file-document-alert" class="me-2" color="warning"></v-icon>
                  Facturas Pendientes
                </v-card-title>
                <v-card-subtitle class="mt-2">
                  <span class="text-h4">{{ facturasPendientes.length }}</span>
                  <span class="text-caption ms-2">Por cobrar</span>
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>

        <!-- Segunda fila: Acciones Rápidas y Contratos Pendientes -->
        <v-row class="mt-4">
          <!-- Acciones rápidas -->
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-lightning-bolt" class="me-2"></v-icon>
                Acciones Rápidas
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    prepend-icon="mdi-file-document-plus"
                    title="Registrar Factura"
                    @click="openDialog"
                  ></v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Propiedades con contratos pendientes -->
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-file-document-alert" class="me-2"></v-icon>
                Contratos Pendientes
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    v-for="propiedad in propiedadesRenovacionPendiente"
                    :key="propiedad.id"
                    :title="propiedad.nombre"
                    :subtitle="'Pendiente de renovación'"
                    @click="router.push(`/contratos?propiedadId=${propiedad.id}`)"
                    class="cursor-pointer"
                  >
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-alert-circle</v-icon>
                    </template>
                  </v-list-item>

                  <v-list-item
                    v-for="propiedad in propiedadesAjusteIPCPendiente"
                    :key="propiedad.id + '-ipc'"
                    :title="propiedad.nombre"
                    :subtitle="'Pendiente de ajuste IPC'"
                    @click="router.push(`/contratos?propiedadId=${propiedad.id}`)"
                    class="cursor-pointer"
                  >
                    <template v-slot:prepend>
                      <v-icon color="warning">mdi-alert</v-icon>
                    </template>
                  </v-list-item>

                  <v-list-item
                    v-if="
                      !propiedadesRenovacionPendiente.length &&
                      !propiedadesAjusteIPCPendiente.length
                    "
                    title="No hay contratos pendientes"
                  ></v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tercera fila: Propiedades e Inquilinos -->
        <v-row class="mt-4">
          <!-- Widget unificado de Gastos -->
          <v-col cols="12" md="6">
            <v-card class="cursor-pointer" @click="router.push('/gastos')">
              <v-card-title class="d-flex flex-wrap align-center pa-4 gap-2">
                <div class="d-flex align-center flex-grow-1">
                  <v-icon icon="mdi-cash-multiple" size="large" color="error" class="me-2"></v-icon>
                  <span class="text-truncate">Gastos Anuales {{ añoActual }}</span>
                </div>
                <div class="flex-shrink-0 d-flex justify-sm-end justify-center w-100 w-sm-auto">
                  <span class="text-h5">{{ formatCurrency(totalGastosAnuales) }}</span>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-4">
                <v-row dense>
                  <v-col v-for="(total, tipo) in gastosPorTipo" :key="tipo" cols="6">
                    <div class="d-flex align-center justify-space-between py-2">
                      <div class="text-subtitle-2">{{ tipo }}</div>
                      <div class="text-h6">{{ formatCurrency(total) }}</div>
                    </div>
                    <v-progress-linear
                      :model-value="calcularPorcentaje(total)"
                      :color="getColorForTipo(tipo)"
                      height="4"
                      class="mb-2"
                    ></v-progress-linear>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Columna derecha con Propiedades e Inquilinos -->
          <v-col cols="12" md="6">
            <v-row>
              <!-- Resumen de propiedades -->
              <v-col cols="12">
                <v-card class="cursor-pointer" @click="router.push('/propiedades')">
                  <v-card-item>
                    <v-card-title>
                      <v-icon icon="mdi-home" class="me-2" color="primary"></v-icon>
                      Propiedades
                    </v-card-title>
                    <v-card-subtitle class="mt-2">
                      <span class="text-h4">{{ propiedadesActivas.length }}</span>
                      <span class="text-caption ms-2">Activas</span>
                    </v-card-subtitle>
                  </v-card-item>
                </v-card>
              </v-col>

              <!-- Resumen de inquilinos -->
              <v-col cols="12">
                <v-card class="cursor-pointer" @click="router.push('/inquilinos')">
                  <v-card-item>
                    <v-card-title>
                      <v-icon icon="mdi-account-group" class="me-2" color="info"></v-icon>
                      Inquilinos
                    </v-card-title>
                    <v-card-subtitle class="mt-2">
                      <span class="text-h4">{{ inquilinosActivos.length }}</span>
                      <span class="text-caption ms-2">Activos</span>
                    </v-card-subtitle>
                  </v-card-item>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Diálogo para crear factura -->
        <v-dialog v-model="dialog" max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">Nueva Factura</span>
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
                        :hint="'Introduce el importe (usar punto para decimales)'"
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
                    <v-col cols="12">
                      <v-checkbox
                        v-model="registrarOtro"
                        label="Registrar otra factura después de guardar"
                        color="primary"
                      ></v-checkbox>
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
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { collection, query, getDocs, doc, setDoc, where, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { sortProperties } from '@/config/propertyOrder';

const { user } = useAuth();
const router = useRouter();

// Variables para los datos
const propiedadSeleccionada = ref(null);
const propiedadesActivas = ref([]);
const inquilinosActivos = ref([]);
const facturasPendientes = ref([]);
const propiedades = ref([]);
const totalCobradoMes = ref(0);
const totalEsperadoMes = ref(0);
const propiedadesContratosPendientes = ref([]);
const totalGastosAnuales = ref(0);
const gastosPorTipo = ref({
  IBI: 0,
  Comunidad: 0,
  Seguro: 0,
  Legalitas: 0,
  Otros: 0,
});
const añoActual = new Date().getFullYear();
const todasLasFacturas = ref([]);
const errorMensaje = ref('');

// Variables para el formulario
const dialog = ref(false);
const form = ref(null);
const formValid = ref(false);
const saving = ref(false);
const registrarOtro = ref(false);

// Tipos de factura
const tiposFactura = ['Luz', 'Agua', 'Agua caliente', 'Cuota piso'];

// Item editado
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

// Reglas de validación
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

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0.00 €';
  return `${value.toString().replace(',', '.')} €`;
};

// Formatear importe
const formatImporte = (event) => {
  let value = event.target.value;
  value = value.replace(/[^\d.]/g, '');
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2);
  }
  editedItem.value.importe = value;
};

// Cargar datos
const loadData = async (propiedadId = null) => {
  try {
    // Cargar propiedades activas
    await loadPropiedades();

    // Cargar inquilinos activos
    await loadInquilinos(propiedadId);

    // Cargar facturas pendientes y calcular totales del mes
    await loadFacturas(propiedadId);

    // Cargar propiedades con contratos pendientes
    await loadPropiedadesContratosPendientes(propiedadId);

    // Cargar gastos
    await loadGastos(propiedadId);
  } catch (error) {
    console.error('Error al cargar datos:', error);
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

    // Aplicar el orden específico
    propiedadesActivas.value = sortProperties(propiedadesData);
    propiedades.value = propiedadesActivas.value;
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
  }
};

// Cargar inquilinos activos
const loadInquilinos = async (propiedadId = null) => {
  try {
    let q = query(collection(db, 'inquilinos'), where('estado', '==', true));

    if (propiedadId) {
      q = query(q, where('propiedadId', '==', propiedadId));
    }

    const querySnapshot = await getDocs(q);
    inquilinosActivos.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al cargar inquilinos:', error);
  }
};

// Cargar facturas pendientes y calcular totales del mes
const loadFacturas = async (propiedadId = null) => {
  try {
    let q = query(collection(db, 'facturas'));

    if (propiedadId) {
      q = query(q, where('propiedadId', '==', propiedadId));
    }

    const facturasSnapshot = await getDocs(q);
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    let cobradoMes = 0;
    let esperadoMes = 0;

    // Guardar todas las facturas para la verificación de duplicados
    todasLasFacturas.value = facturasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    facturasPendientes.value = todasLasFacturas.value.filter((factura) => {
      const fechaFactura = new Date(factura.fechaInicio);
      const esDelMes =
        fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;

      if (esDelMes) {
        const importe = parseFloat(factura.importe.toString().replace(',', '.'));
        esperadoMes += importe;
        if (factura.estado === 'pagada' && factura.importePagado) {
          const importePagado = parseFloat(factura.importePagado.toString().replace(',', '.'));
          cobradoMes += importePagado;
        }
      }

      return factura.estado === 'pendiente';
    });

    totalCobradoMes.value = cobradoMes;
    totalEsperadoMes.value = Number(esperadoMes.toFixed(2));
  } catch (error) {
    console.error('Error al cargar facturas:', error);
  }
};

// Cargar propiedades con contratos pendientes
const loadPropiedadesContratosPendientes = async (propiedadId = null) => {
  try {
    let q = query(collection(db, 'contratos'), where('estado', '==', true));

    if (propiedadId) {
      q = query(q, where('propiedadId', '==', propiedadId));
    }

    const querySnapshot = await getDocs(q);

    const contratos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const propiedadesIds = [...new Set(contratos.map((contrato) => contrato.propiedadId))];

    const propiedadesPromises = propiedadesIds.map(async (propiedadId) => {
      const propiedadDoc = await getDoc(doc(db, 'propiedades', propiedadId));
      return {
        id: propiedadDoc.id,
        ...propiedadDoc.data(),
      };
    });

    const propiedades = await Promise.all(propiedadesPromises);

    propiedadesContratosPendientes.value = propiedades
      .filter((propiedad) => propiedad)
      .map((propiedad) => {
        const contratosPropiedad = contratos.filter(
          (contrato) => contrato.propiedadId === propiedad.id
        );

        const pendienteRenovacion = contratosPropiedad.some((contrato) => {
          const fechaRenovacion = contrato.fechaRenovacion
            ? new Date(contrato.fechaRenovacion)
            : null;
          const hoy = new Date();
          return fechaRenovacion && fechaRenovacion <= hoy;
        });

        const pendienteAjusteIPC = contratosPropiedad.some(
          (contrato) => contrato.ipcAjustado === false
        );

        return {
          ...propiedad,
          pendienteRenovacion,
          pendienteAjusteIPC,
        };
      });
  } catch (error) {
    console.error('Error al cargar propiedades con contratos pendientes:', error);
  }
};

// Propiedades computadas
const propiedadesRenovacionPendiente = computed(() => {
  return propiedadesContratosPendientes.value.filter((propiedad) => propiedad.pendienteRenovacion);
});

const propiedadesAjusteIPCPendiente = computed(() => {
  return propiedadesContratosPendientes.value.filter((propiedad) => propiedad.pendienteAjusteIPC);
});

// Manejar cambio de propiedad seleccionada
const onPropiedadSeleccionada = async () => {
  await loadData(propiedadSeleccionada.value);
  await loadPropiedadesContratosPendientes(propiedadSeleccionada.value);
};

// Funciones del formulario
const openDialog = () => {
  editedItem.value = { ...defaultItem };
  dialog.value = true;
  nextTick(() => {
    form.value?.resetValidation();
  });
};

const closeDialog = () => {
  dialog.value = false;
  editedItem.value = { ...defaultItem };
  registrarOtro.value = false;
  errorMensaje.value = '';
  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

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

const saveFactura = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      tipo: editedItem.value.tipo,
      propiedadId: editedItem.value.propiedadId,
      propiedadNombre: editedItem.value.propiedadNombre,
      importe: editedItem.value.importe,
      fechaInicio: new Date(editedItem.value.fechaInicio).toISOString(),
      fechaFin: new Date(editedItem.value.fechaFin).toISOString(),
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
      createdBy: user.value.uid,
      updatedAt: new Date().toISOString(),
      updatedBy: user.value.uid,
    };

    const docRef = doc(collection(db, 'facturas'));
    await setDoc(docRef, itemData);

    if (registrarOtro.value) {
      // Mantener los valores de los campos específicos
      const tipo = editedItem.value.tipo;
      const fechaInicio = editedItem.value.fechaInicio;
      const fechaFin = editedItem.value.fechaFin;

      // Resetear el formulario
      editedItem.value = { ...defaultItem };

      // Restaurar los valores mantenidos
      editedItem.value.tipo = tipo;
      editedItem.value.fechaInicio = fechaInicio;
      editedItem.value.fechaFin = fechaFin;

      form.value?.resetValidation();
      formValid.value = false;
    } else {
      closeDialog();
    }

    await loadData();
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    saving.value = false;
  }
};

const updatePropiedadNombre = (propiedadId) => {
  const propiedad = propiedades.value.find((p) => p.id === propiedadId);
  editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
};

// Añadir función para cargar gastos
const loadGastos = async (propiedadId = null) => {
  try {
    let q = query(collection(db, 'gastos'));

    if (propiedadId) {
      q = query(q, where('propiedadId', '==', propiedadId));
    }

    const gastosSnapshot = await getDocs(q);
    let totalAnual = 0;
    const porTipo = {
      IBI: 0,
      Comunidad: 0,
      Seguro: 0,
      Legalitas: 0,
      Otros: 0,
    };

    gastosSnapshot.docs.forEach((doc) => {
      const gasto = doc.data();
      const fechaGasto = new Date(gasto.fecha);

      if (fechaGasto.getFullYear() === añoActual) {
        const importeTotal = parseFloat(gasto.importeTotal.replace(',', '.'));
        totalAnual += importeTotal;

        if (gasto.tipo in porTipo) {
          porTipo[gasto.tipo] += importeTotal;
        }
      }
    });

    totalGastosAnuales.value = totalAnual;
    gastosPorTipo.value = porTipo;
  } catch (error) {
    console.error('Error al cargar gastos:', error);
  }
};

// Añadir función para obtener color según tipo de gasto
const getColorForTipo = (tipo) => {
  const colores = {
    IBI: 'error',
    Comunidad: 'primary',
    Seguro: 'success',
    Legalitas: 'warning',
    Otros: 'purple',
  };
  return colores[tipo] || 'grey';
};

// Añadir función para calcular porcentaje
const calcularPorcentaje = (total) => {
  if (!totalGastosAnuales.value || total === 0) return 0;
  return (total / totalGastosAnuales.value) * 100;
};

// Verificar factura duplicada
const verificarFacturaDuplicada = (tipo, propiedadId, fechaFin) => {
  if (!tipo || !propiedadId || !fechaFin) return false;

  // Obtener el mes y año de la fecha fin
  const fecha = new Date(fechaFin);
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();

  // Buscar facturas del mismo tipo, propiedad y mes
  return todasLasFacturas.value.some((factura) => {
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

// Cargar datos iniciales
onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.dashboard-container {
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
</style>
