<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="primary white--text"> Nueva Factura </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid" @submit.prevent="guardarFactura" lazy-validation>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.tipo"
                  :items="tiposFactura"
                  label="Tipo de Factura *"
                  :rules="[(v) => !!v || 'El tipo es obligatorio']"
                  required
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.propiedadId"
                  :items="propiedades"
                  item-text="nombre"
                  item-value="id"
                  label="Propiedad *"
                  :rules="[(v) => !!v || 'La propiedad es obligatoria']"
                  required
                  outlined
                  dense
                  @update:model-value="updatePropiedadNombre"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.importe"
                  label="Importe *"
                  :rules="[
                    (v) => !!v || 'El importe es obligatorio',
                    (v) => /^[0-9]+([,.][0-9]{1,2})?$/.test(v) || 'Formato de importe inválido',
                  ]"
                  required
                  outlined
                  dense
                  @input="formatImporte"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  ref="menuFechaInicio"
                  v-model="menuFechaInicio"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="fechaInicioFormateada"
                      label="Fecha Inicio *"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[(v) => !!v || 'La fecha es obligatoria']"
                      outlined
                      dense
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedItem.fechaInicio"
                    @change="menuFechaInicio = false"
                    locale="es-ES"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  ref="menuFechaFin"
                  v-model="menuFechaFin"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="fechaFinFormateada"
                      label="Fecha Fin *"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[
                        (v) => !!v || 'La fecha es obligatoria',
                        (v) =>
                          !editedItem.fechaInicio ||
                          new Date(editedItem.fechaFin) >= new Date(editedItem.fechaInicio) ||
                          'Debe ser posterior a la fecha inicio',
                      ]"
                      outlined
                      dense
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedItem.fechaFin"
                    @change="menuFechaFin = false"
                    locale="es-ES"
                  ></v-date-picker>
                </v-menu>
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
        <v-btn color="blue darken-1" text @click="cerrarDialogo"> Cancelar </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="guardarFactura"
          :loading="saving"
          :disabled="!formValid || saving"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { auth } from '@/services/firebase';
import facturaService from '@/services/factura-service';
import propiedadService from '@/services/propiedad-service';
import { formatDate } from '@/services/utils/date-utils';
import { formatPrecio } from '@/services/utils/format-utils';

export default {
  name: 'FacturaForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'saved', 'close'],

  setup(props, { emit }) {
    // Referencias y estados
    const form = ref(null);
    const formValid = ref(false);
    const saving = ref(false);
    const propiedades = ref([]);
    const tiposFactura = ['Alquiler', 'Luz', 'Agua', 'Gas', 'Internet', 'Comunidad', 'Otros'];
    const registrarOtro = ref(false);
    const menuFechaInicio = ref(false);
    const menuFechaFin = ref(false);

    // Item editado
    const editedItem = ref({
      tipo: '',
      propiedadId: '',
      propiedadNombre: '',
      importe: '',
      fechaInicio: new Date().toISOString().substr(0, 10),
      fechaFin: '',
      estado: 'pendiente',
    });

    // Item por defecto para resetear
    const defaultItem = {
      tipo: '',
      propiedadId: '',
      propiedadNombre: '',
      importe: '',
      fechaInicio: new Date().toISOString().substr(0, 10),
      fechaFin: '',
      estado: 'pendiente',
    };

    // Computed properties
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    const fechaInicioFormateada = computed(() => {
      return editedItem.value.fechaInicio ? formatDate(editedItem.value.fechaInicio) : '';
    });

    const fechaFinFormateada = computed(() => {
      return editedItem.value.fechaFin ? formatDate(editedItem.value.fechaFin) : '';
    });

    // Watch para cargar propiedades cuando se abre el diálogo
    watch(
      () => props.modelValue,
      async (newValue) => {
        if (newValue) {
          await cargarPropiedades();
          // Inicializar fechas
          if (!editedItem.value.fechaFin) {
            const fechaInicio = new Date(editedItem.value.fechaInicio);
            const fechaFin = new Date(fechaInicio);
            fechaFin.setMonth(fechaFin.getMonth() + 1);
            fechaFin.setDate(fechaFin.getDate() - 1);
            editedItem.value.fechaFin = fechaFin.toISOString().substr(0, 10);
          }
        }
      }
    );

    // Métodos
    const cargarPropiedades = async () => {
      try {
        propiedades.value = await propiedadService.loadPropiedadesActivas();
      } catch (error) {
        console.error('Error al cargar propiedades:', error);
      }
    };

    const updatePropiedadNombre = (propiedadId) => {
      const propiedad = propiedades.value.find((p) => p.id === propiedadId);
      editedItem.value.propiedadNombre = propiedad ? propiedad.nombre : '';
    };

    const formatImporte = (event) => {
      let value = event.target.value;
      // Permitir solo números y una coma o punto
      value = value.replace(/[^\d,.]/g, '');
      // Convertir punto a coma para consistencia
      value = value.replace('.', ',');
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

    const cerrarDialogo = () => {
      dialog.value = false;
      resetForm();
      emit('close');
    };

    const resetForm = () => {
      // Reiniciar el formulario a valores predeterminados
      Object.assign(editedItem.value, defaultItem);
      // Reiniciar banderas
      registrarOtro.value = false;
      // Reiniciar validación si existe referencia al formulario
      if (form.value) {
        form.value.resetValidation();
        formValid.value = false;
      }
    };

    const guardarFactura = async () => {
      if (saving.value) return;

      // Validar formulario
      const isValid = form.value?.validate();
      if (!isValid) {
        formValid.value = false;
        return;
      }

      saving.value = true;

      try {
        const userId = auth.currentUser?.uid;

        if (!userId) {
          console.error('Usuario no autenticado');
          saving.value = false;
          return;
        }

        // Preparar datos de la factura
        const facturaData = {
          tipo: editedItem.value.tipo,
          propiedadId: editedItem.value.propiedadId,
          propiedadNombre: editedItem.value.propiedadNombre,
          importe: editedItem.value.importe.replace(',', '.'),
          fechaInicio: new Date(editedItem.value.fechaInicio).toISOString(),
          fechaFin: new Date(editedItem.value.fechaFin).toISOString(),
          estado: 'pendiente',
        };

        // Crear la factura
        const nuevaFactura = await facturaService.createFactura(facturaData, userId);

        if (registrarOtro.value) {
          // Mantener algunos valores para la próxima factura
          const tipo = editedItem.value.tipo;
          const propiedadId = editedItem.value.propiedadId;
          const propiedadNombre = editedItem.value.propiedadNombre;

          // Resetear formulario pero preservar valores seleccionados
          resetForm();

          // Restaurar valores mantenidos
          editedItem.value.tipo = tipo;
          editedItem.value.propiedadId = propiedadId;
          editedItem.value.propiedadNombre = propiedadNombre;

          // Reiniciar validación
          form.value.resetValidation();
        } else {
          // Cerrar diálogo
          cerrarDialogo();
        }

        // Emitir evento de guardado
        emit('saved', nuevaFactura);
      } catch (error) {
        console.error('Error al guardar factura:', error);
      } finally {
        saving.value = false;
      }
    };

    return {
      form,
      formValid,
      saving,
      dialog,
      editedItem,
      propiedades,
      tiposFactura,
      registrarOtro,
      menuFechaInicio,
      menuFechaFin,
      fechaInicioFormateada,
      fechaFinFormateada,
      updatePropiedadNombre,
      formatImporte,
      cerrarDialogo,
      guardarFactura,
    };
  },
};
</script>
