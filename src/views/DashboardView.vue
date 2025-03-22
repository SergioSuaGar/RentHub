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
          @update:model-value="filtrarDatos"
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
                  <span class="text-h6">{{
                    formatCurrency(dashboardData.facturas.totalCobradoMes)
                  }}</span>
                  <span class="text-caption d-block"
                    >de {{ formatCurrency(dashboardData.facturas.totalEsperadoMes) }}</span
                  >
                  <v-progress-linear
                    :model-value="calcularPorcentajeFacturas"
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
                  Pendientes
                </v-card-title>
                <v-card-subtitle class="mt-2">
                  <span class="text-h4">{{ dashboardData.facturas.pendientes.length }}</span>
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
                    @click="abrirFormularioFactura"
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
                    <template #prepend>
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
                    <template #prepend>
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
                  <span class="text-h5">{{ formatCurrency(dashboardData.gastos.totalAnual) }}</span>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-4">
                <v-row dense>
                  <v-col v-for="(total, tipo) in dashboardData.gastos.porTipo" :key="tipo" cols="6">
                    <div class="d-flex align-center justify-space-between py-2">
                      <div class="text-subtitle-2">{{ tipo }}</div>
                      <div class="text-h6">{{ formatCurrency(total) }}</div>
                    </div>
                    <v-progress-linear
                      :model-value="calcularPorcentajeGasto(total)"
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
                      <span class="text-h4">{{ dashboardData.inquilinos.length }}</span>
                      <span class="text-caption ms-2">Activos</span>
                    </v-card-subtitle>
                  </v-card-item>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Componente para crear factura -->
        <factura-form
          v-model="dialogFactura"
          @saved="facturaGuardada"
          @close="cerrarFormularioFactura"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import dashboardService, { formatCurrency } from '@/services/dashboard-service';
import FacturaForm from '@/components/dashboard/FacturaForm.vue';

export default {
  name: 'DashboardView',

  components: {
    FacturaForm,
  },

  setup() {
    const router = useRouter();
    const propiedadSeleccionada = ref(null);
    const propiedadesActivas = ref([]);
    const dialogFactura = ref(false);
    const loading = ref(false);
    const añoActual = new Date().getFullYear();

    // Datos del dashboard
    const dashboardData = reactive({
      propiedades: [],
      inquilinos: [],
      facturas: {
        pendientes: [],
        totalCobradoMes: 0,
        totalEsperadoMes: 0,
      },
      contratos: {
        propiedadesRenovacionPendiente: [],
        propiedadesAjusteIPCPendiente: [],
      },
      gastos: {
        totalAnual: 0,
        porTipo: {
          IBI: 0,
          Comunidad: 0,
          Seguro: 0,
          Legalitas: 0,
          Otros: 0,
        },
      },
    });

    // Computed properties
    const propiedadesRenovacionPendiente = computed(() => {
      return dashboardData.contratos.propiedadesRenovacionPendiente;
    });

    const propiedadesAjusteIPCPendiente = computed(() => {
      return dashboardData.contratos.propiedadesAjusteIPCPendiente;
    });

    const calcularPorcentajeFacturas = computed(() => {
      if (!dashboardData.facturas.totalEsperadoMes) return 0;
      return (
        (dashboardData.facturas.totalCobradoMes / dashboardData.facturas.totalEsperadoMes) * 100
      );
    });

    // Métodos
    const cargarDatos = async () => {
      try {
        loading.value = true;

        // Cargar datos del dashboard
        const datos = await dashboardService.loadDashboardData();

        // Actualizar variables reactivas
        propiedadesActivas.value = datos.propiedades;

        // Actualizar datos del dashboard
        dashboardData.propiedades = datos.propiedades;
        dashboardData.inquilinos = datos.inquilinos;
        dashboardData.facturas = datos.facturas;
        dashboardData.contratos.propiedadesRenovacionPendiente =
          datos.contratos.propiedadesRenovacionPendiente;
        dashboardData.contratos.propiedadesAjusteIPCPendiente =
          datos.contratos.propiedadesAjusteIPCPendiente;
        dashboardData.gastos = datos.gastos;
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        loading.value = false;
      }
    };

    const filtrarDatos = async () => {
      try {
        loading.value = true;

        // Cargar datos filtrados del dashboard
        const datos = await dashboardService.loadDashboardData(propiedadSeleccionada.value);

        // Actualizar datos del dashboard manteniendo las propiedades activas
        dashboardData.inquilinos = datos.inquilinos;
        dashboardData.facturas = datos.facturas;
        dashboardData.contratos.propiedadesRenovacionPendiente =
          datos.contratos.propiedadesRenovacionPendiente;
        dashboardData.contratos.propiedadesAjusteIPCPendiente =
          datos.contratos.propiedadesAjusteIPCPendiente;
        dashboardData.gastos = datos.gastos;
      } catch (error) {
        console.error('Error al filtrar datos:', error);
      } finally {
        loading.value = false;
      }
    };

    const calcularPorcentajeGasto = (valor) => {
      return dashboardService.calcularPorcentaje(valor, dashboardData.gastos.totalAnual);
    };

    const getColorForTipo = (tipo) => {
      return dashboardService.getColorForTipo(tipo);
    };

    // Gestión del formulario de factura
    const abrirFormularioFactura = () => {
      dialogFactura.value = true;
    };

    const cerrarFormularioFactura = () => {
      dialogFactura.value = false;
    };

    const facturaGuardada = async () => {
      // Recargar datos para reflejar la nueva factura
      await cargarDatos();
    };

    // Cargar datos iniciales
    onMounted(async () => {
      await cargarDatos();
    });

    return {
      router,
      propiedadSeleccionada,
      propiedadesActivas,
      dialogFactura,
      loading,
      dashboardData,
      añoActual,
      propiedadesRenovacionPendiente,
      propiedadesAjusteIPCPendiente,
      calcularPorcentajeFacturas,
      formatCurrency,
      filtrarDatos,
      calcularPorcentajeGasto,
      getColorForTipo,
      abrirFormularioFactura,
      cerrarFormularioFactura,
      facturaGuardada,
    };
  },
};
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}
</style>
