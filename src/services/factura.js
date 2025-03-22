import { collection, query, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { sortProperties } from '@/config/propertyOrder';
// Importar funciones de formateo del servicio centralizado
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatImporte,
  formatImportePagado,
} from '@/services/format';
// Importar funciones de utilidades de fecha
import { calcularDiasEntreFechas, obtenerUltimoDiaMes } from '@/services/date-utils';
// Importar funciones de utilidades matemáticas
import { calcularImporteProporcionalPorDias } from '@/services/math-utils';

// Cargar facturas
export const loadFacturas = async () => {
  try {
    const q = query(collection(db, 'facturas'));
    const querySnapshot = await getDocs(q);
    const facturas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return facturas;
  } catch (error) {
    console.error('Error al cargar facturas:', error);
    return [];
  }
};

// Cargar propiedades activas
export const loadPropiedades = async () => {
  try {
    const q = query(collection(db, 'propiedades'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    const propiedadesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return sortProperties(propiedadesData);
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
    return [];
  }
};

// Cargar contratos activos
export const loadContratosActivos = async () => {
  try {
    const q = query(collection(db, 'contratos'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    const contratosActivos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return contratosActivos;
  } catch (error) {
    console.error('Error al cargar contratos activos:', error);
    return [];
  }
};

// Crear factura
export const createFactura = async (facturaData, user) => {
  try {
    facturaData.createdAt = new Date().toISOString();
    facturaData.createdBy = user.uid;
    const docRef = doc(collection(db, 'facturas'));
    await setDoc(docRef, facturaData);
    return { ...facturaData, id: docRef.id };
  } catch (error) {
    console.error('Error al crear factura:', error);
    return null;
  }
};

// Actualizar factura
export const updateFactura = async (facturaId, facturaData, user) => {
  try {
    facturaData.updatedAt = new Date().toISOString();
    facturaData.updatedBy = user.uid;
    await setDoc(doc(db, 'facturas', facturaId), facturaData, { merge: true });
    return facturaData;
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    return null;
  }
};

// Eliminar factura
export const deleteFactura = async (facturaId) => {
  try {
    await deleteDoc(doc(db, 'facturas', facturaId));
    return true;
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    return false;
  }
};

// Exportar las funciones de formateo del servicio centralizado
export { formatCurrency, formatDate, formatDateShort, formatImporte, formatImportePagado };

// Exportar las funciones de utilidades de fecha
export { calcularDiasEntreFechas, obtenerUltimoDiaMes };

// Exportar funciones de utilidades matemáticas
export { calcularImporteProporcionalPorDias };

// Calcular importe proporcional
export const calcularImporteProporcional = (precio, fechaInicio, fechaFin) => {
  if (!precio || !fechaInicio || !fechaFin) return '';

  // Obtener el último día del mes utilizando la función del servicio date-utils
  const ultimoDiaMes = obtenerUltimoDiaMes(fechaInicio);

  // Calcular días ocupados utilizando la función del servicio date-utils
  const diasOcupados = calcularDiasEntreFechas(fechaInicio, fechaFin);

  // Utilizar la función del servicio math-utils para calcular el importe proporcional
  return calcularImporteProporcionalPorDias(precio, diasOcupados, ultimoDiaMes);
};
