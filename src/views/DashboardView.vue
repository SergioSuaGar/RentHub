<template>
  <div>
    <v-row>
      <!-- Resumen de propiedades -->
      <v-col cols="12" md="6" lg="3">
        <v-card>
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
      <v-col cols="12" md="6" lg="3">
        <v-card>
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

      <!-- Resumen de facturas -->
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-item>
            <v-card-title>
              <v-icon icon="mdi-cash" class="me-2" color="success"></v-icon>
              Facturas Mes
            </v-card-title>
            <v-card-subtitle class="mt-2">
              <span class="text-h6">{{ formatCurrency(totalCobradoMes) }}</span>
              <span class="text-caption d-block">de {{ formatCurrency(totalEsperadoMes) }}</span>
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
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-item>
            <v-card-title>
              <v-icon icon="mdi-file-document-alert" class="me-2" color="warning"></v-icon>
              Pendientes
            </v-card-title>
            <v-card-subtitle class="mt-2">
              <span class="text-h4">{{ facturasPendientes.length }}</span>
              <span class="text-caption ms-2">Por cobrar</span>
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Actividad reciente -->
    <v-row class="mt-4">
      <!-- Acciones rápidas -->
      <v-col cols="12" md="4">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { collection, query, getDocs, doc, setDoc, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();

// Variables para los datos
const propiedadesActivas = ref([]);
const inquilinosActivos = ref([]);
const facturasPendientes = ref([]);
const propiedades = ref([]);
const totalCobradoMes = ref(0);
const totalEsperadoMes = ref(0);

// Variables para el formulario
const dialog = ref(false);
const form = ref(null);
const formValid = ref(false);
const saving = ref(false);
const registrarOtro = ref(false);

// Tipos de factura
const tiposFactura = ['Luz', 'Agua', 'Agua caliente'];

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

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0,00 €';
  return `${value.toString().replace('.', ',')} €`;
};

// Formatear importe
const formatImporte = (event) => {
  let value = event.target.value;
  value = value.replace(/[^\d,]/g, '');
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].slice(0, 2);
  }
  editedItem.value.importe = value;
};

// Cargar datos
const loadData = async () => {
  try {
    // Cargar propiedades activas
    const propiedadesQuery = query(collection(db, 'propiedades'), where('estado', '==', true));
    const propiedadesSnapshot = await getDocs(propiedadesQuery);
    propiedadesActivas.value = propiedadesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    propiedades.value = propiedadesActivas.value;

    // Cargar inquilinos activos
    const inquilinosQuery = query(collection(db, 'inquilinos'), where('estado', '==', true));
    const inquilinosSnapshot = await getDocs(inquilinosQuery);
    inquilinosActivos.value = inquilinosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Cargar facturas pendientes y calcular totales del mes
    const facturasQuery = query(collection(db, 'facturas'));
    const facturasSnapshot = await getDocs(facturasQuery);
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    let cobradoMes = 0;
    let esperadoMes = 0;

    facturasPendientes.value = facturasSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((factura) => {
        const fechaFactura = new Date(factura.fechaInicio);
        const esDelMes =
          fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;

        if (esDelMes) {
          const importe = parseFloat(factura.importe.toString().replace(',', '.'));
          esperadoMes += importe;
          if (factura.estado === 'pagada') {
            cobradoMes += importe;
          }
        }

        return factura.estado === 'pendiente';
      });

    totalCobradoMes.value = cobradoMes;
    totalEsperadoMes.value = esperadoMes;
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
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
  nextTick(() => {
    form.value?.reset();
    formValid.value = false;
  });
};

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

const saveFactura = async () => {
  if (saving.value || !formValid.value) return;

  try {
    saving.value = true;
    const itemData = {
      tipo: editedItem.value.tipo,
      propiedadId: editedItem.value.propiedadId,
      propiedadNombre: editedItem.value.propiedadNombre,
      importe: editedItem.value.importe.replace(',', '.'),
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
      editedItem.value = { ...defaultItem };
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

// Cargar datos iniciales
onMounted(async () => {
  await loadData();
});
</script>
