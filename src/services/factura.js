import { collection, query, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { sortProperties } from '@/config/propertyOrder';

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

// Formatear moneda
export const formatCurrency = (value) => {
  if (!value) return '0 €';
  return `${value} €`;
};

// Formatear fecha
export const formatDate = (timestamp) => {
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

// Formatear fecha corta
export const formatDateShort = (timestamp) => {
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
export const formatImporte = (value) => {
  if (!value) return '';
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
  return value;
};

// Formatear importe pagado
export const formatImportePagado = (value) => {
  if (!value) return '';
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
  return value;
};

// Calcular importe proporcional
export const calcularImporteProporcional = (precio, fechaInicio, fechaFin) => {
  if (!precio || !fechaInicio || !fechaFin) return '';

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // Obtener el último día del mes
  const ultimoDiaMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate();

  // Calcular días ocupados (fin - inicio)
  const diasOcupados = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));

  // Convertir el precio a número
  const precioNumerico = parseFloat(precio.toString().replace(',', '.'));

  // Calcular el precio por día basado en los días reales del mes
  const precioDiario = precioNumerico / ultimoDiaMes;

  // Calcular el importe total
  const importeCalculado = precioDiario * diasOcupados;

  // Redondear a 2 decimales y formatear
  let importeFormateado = importeCalculado.toFixed(2).replace('.', ',');

  // Eliminar decimales si son ceros
  if (importeFormateado.endsWith(',00')) {
    importeFormateado = importeFormateado.slice(0, -3);
  }

  return importeFormateado;
};
