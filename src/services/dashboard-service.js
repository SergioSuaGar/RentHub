/**
 * Servicio para Dashboard
 * Proporciona funcionalidades específicas para el dashboard
 * incluyendo carga de datos, estadísticas y resúmenes
 */

import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FirestoreService } from './firestore-service';
import { formatCurrency as formatCurrencyUtil } from './utils/format-utils';
import { sortProperties } from '@/config/propertyOrder';

class DashboardService extends FirestoreService {
  constructor() {
    super('dashboard');
    if (DashboardService.instance) {
      return DashboardService.instance;
    }
    DashboardService.instance = this;
  }

  /**
   * Carga todos los datos necesarios para el dashboard
   * @param {string} propiedadId - ID de la propiedad para filtrar (opcional)
   * @returns {Promise<Object>} - Objeto con todos los datos del dashboard
   */
  async loadDashboardData(propiedadId = null) {
    try {
      const propiedades = await this.loadPropiedadesActivas();
      const inquilinos = await this.loadInquilinosActivos(propiedadId);
      const facturas = await this.loadFacturasYTotales(propiedadId);
      const contratos = await this.loadContratosPendientes(propiedadId);
      const gastos = await this.loadGastosResumen(propiedadId);

      return {
        propiedades,
        inquilinos,
        facturas,
        contratos,
        gastos,
      };
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      throw error;
    }
  }

  /**
   * Carga propiedades activas
   * @returns {Promise<Array>} - Lista de propiedades activas
   */
  async loadPropiedadesActivas() {
    try {
      const q = query(collection(db, 'propiedades'), where('estado', '==', true));
      const querySnapshot = await getDocs(q);
      const propiedadesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Aplicar orden específico
      return sortProperties(propiedadesData);
    } catch (error) {
      console.error('Error al cargar propiedades activas:', error);
      throw error;
    }
  }

  /**
   * Carga inquilinos activos, opcionalmente filtrados por propiedad
   * @param {string} propiedadId - ID de la propiedad para filtrar (opcional)
   * @returns {Promise<Array>} - Lista de inquilinos activos
   */
  async loadInquilinosActivos(propiedadId = null) {
    try {
      let q = query(collection(db, 'inquilinos'), where('estado', '==', true));

      if (propiedadId) {
        q = query(q, where('propiedadId', '==', propiedadId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al cargar inquilinos activos:', error);
      throw error;
    }
  }

  /**
   * Carga facturas y calcula totales del mes actual
   * @param {string} propiedadId - ID de la propiedad para filtrar (opcional)
   * @returns {Promise<Object>} - Objeto con facturas pendientes y totales
   */
  async loadFacturasYTotales(propiedadId = null) {
    try {
      let q = query(collection(db, 'facturas'));

      if (propiedadId) {
        q = query(q, where('propiedadId', '==', propiedadId));
      }

      const facturasSnapshot = await getDocs(q);
      const mesActual = new Date().getMonth();
      const añoActual = new Date().getFullYear();

      let totalCobradoMes = 0;
      let totalEsperadoMes = 0;

      const facturasPendientes = facturasSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((factura) => {
          const fechaFactura = new Date(factura.fechaInicio);
          const esDelMes =
            fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;

          if (esDelMes) {
            const importe = parseFloat(factura.importe.toString().replace(',', '.'));
            totalEsperadoMes += importe;
            if (factura.estado === 'pagada' && factura.importePagado) {
              const importePagado = parseFloat(factura.importePagado.toString().replace(',', '.'));
              totalCobradoMes += importePagado;
            }
          }

          return factura.estado === 'pendiente';
        });

      return {
        pendientes: facturasPendientes,
        totalCobradoMes,
        totalEsperadoMes,
      };
    } catch (error) {
      console.error('Error al cargar facturas y totales:', error);
      throw error;
    }
  }

  /**
   * Carga propiedades con contratos pendientes de renovación o ajuste IPC
   * @param {string} propiedadId - ID de la propiedad para filtrar (opcional)
   * @returns {Promise<Object>} - Objeto con propiedades pendientes de renovación y ajuste IPC
   */
  async loadContratosPendientes(propiedadId = null) {
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

      const propiedadesConContrato = propiedades
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

      const propiedadesRenovacionPendiente = propiedadesConContrato.filter(
        (propiedad) => propiedad.pendienteRenovacion
      );

      const propiedadesAjusteIPCPendiente = propiedadesConContrato.filter(
        (propiedad) => propiedad.pendienteAjusteIPC
      );

      return {
        propiedadesRenovacionPendiente,
        propiedadesAjusteIPCPendiente,
      };
    } catch (error) {
      console.error('Error al cargar propiedades con contratos pendientes:', error);
      throw error;
    }
  }

  /**
   * Carga y resume los gastos anuales, opcionalmente filtrados por propiedad
   * @param {string} propiedadId - ID de la propiedad para filtrar (opcional)
   * @returns {Promise<Object>} - Objeto con total anual y gastos por tipo
   */
  async loadGastosResumen(propiedadId = null) {
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

      const añoActual = new Date().getFullYear();

      gastosSnapshot.docs.forEach((doc) => {
        const gasto = doc.data();
        const fechaGasto = new Date(gasto.fecha);

        if (fechaGasto.getFullYear() === añoActual) {
          const importeTotal = parseFloat(gasto.importeTotal.replace(',', '.'));
          totalAnual += importeTotal;

          if (gasto.tipo in porTipo) {
            porTipo[gasto.tipo] += importeTotal;
          } else {
            porTipo.Otros += importeTotal;
          }
        }
      });

      return {
        totalAnual,
        porTipo,
      };
    } catch (error) {
      console.error('Error al cargar resumen de gastos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un color según el tipo de gasto
   * @param {string} tipo - Tipo de gasto
   * @returns {string} - Color asignado
   */
  getColorForTipo(tipo) {
    const colores = {
      IBI: 'error',
      Comunidad: 'primary',
      Seguro: 'success',
      Legalitas: 'warning',
      Otros: 'purple',
    };
    return colores[tipo] || 'grey';
  }

  /**
   * Calcula el porcentaje que representa un valor sobre un total
   * @param {number} valor - Valor para calcular su porcentaje
   * @param {number} total - Total sobre el que calcular
   * @returns {number} - Porcentaje calculado
   */
  calcularPorcentaje(valor, total) {
    if (!total || valor === 0) return 0;
    return (valor / total) * 100;
  }
}

// Instancia singleton
const dashboardService = new DashboardService();

// Funciones de utilidad exportadas para uso en componentes
export const formatCurrency = formatCurrencyUtil;
export const getColorForTipo = dashboardService.getColorForTipo;
export const calcularPorcentaje = dashboardService.calcularPorcentaje;

export default dashboardService;
