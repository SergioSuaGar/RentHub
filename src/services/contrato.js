import { db, storage } from '@/services/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { sortProperties } from '@/config/propertyOrder';

const contratosCollection = collection(db, 'contratos');

// Cargar contratos
export const loadContratos = async () => {
  try {
    const q = query(collection(db, 'contratos'));
    const querySnapshot = await getDocs(q);
    const contratos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return contratos;
  } catch (error) {
    console.error('Error al cargar contratos:', error);
    return [];
  }
};

// Cargar propiedades activas para contratos
export const loadPropiedadesParaContratos = async (editando = false, propiedadIdActual = null) => {
  try {
    // Primero obtenemos todas las propiedades activas
    const q = query(collection(db, 'propiedades'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    const todasLasPropiedades = sortProperties(
      querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    // Obtenemos los contratos activos
    const contratosData = await loadContratos();
    const contratosActivos = contratosData.filter((c) => c.estado);
    const propiedadesConContrato = new Set(contratosActivos.map((c) => c.propiedadId));

    if (editando && propiedadIdActual) {
      // Si estamos editando, incluimos la propiedad del contrato actual
      return todasLasPropiedades.filter(
        (propiedad) =>
          !propiedadesConContrato.has(propiedad.id) || propiedad.id === propiedadIdActual
      );
    } else if (!editando) {
      // Si es nuevo contrato, solo mostramos propiedades sin contrato activo
      return todasLasPropiedades.filter((propiedad) => !propiedadesConContrato.has(propiedad.id));
    }

    // Si solo queremos todas las propiedades, las devolvemos todas
    return todasLasPropiedades;
  } catch (error) {
    console.error('Error al cargar propiedades para contratos:', error);
    return [];
  }
};

// Cargar inquilinos activos para contratos
export const loadInquilinosParaContratos = async (editando = false, inquilinosIdsActuales = []) => {
  try {
    // Obtenemos todos los inquilinos activos
    const q = query(collection(db, 'inquilinos'), where('estado', '==', true));
    const querySnapshot = await getDocs(q);
    const todosLosInquilinos = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        nombreCompleto: `${data.nombre} ${data.apellidos}`,
      };
    });

    // Obtenemos los contratos activos
    const contratosData = await loadContratos();
    const contratosActivos = contratosData.filter((c) => c.estado);

    // Creamos un conjunto de inquilinos que ya tienen contratos
    const inquilinosConContrato = new Set();
    contratosActivos.forEach((contrato) => {
      if (!editando || (editando && inquilinosIdsActuales.length > 0)) {
        // No excluir inquilinos del contrato actual si estamos editando
        contrato.inquilinosIds.forEach((id) => {
          // Solo añadimos si no es uno de los inquilinos actuales
          if (!inquilinosIdsActuales.includes(id)) {
            inquilinosConContrato.add(id);
          }
        });
      }
    });

    if (editando && inquilinosIdsActuales.length > 0) {
      // Si estamos editando, incluimos los inquilinos del contrato actual
      return todosLosInquilinos.filter(
        (inquilino) =>
          !inquilinosConContrato.has(inquilino.id) || inquilinosIdsActuales.includes(inquilino.id)
      );
    } else if (!editando) {
      // Si es nuevo contrato, solo mostramos inquilinos sin contrato activo
      return todosLosInquilinos.filter((inquilino) => !inquilinosConContrato.has(inquilino.id));
    }

    // Si solo queremos todos los inquilinos, los devolvemos todos
    return todosLosInquilinos;
  } catch (error) {
    console.error('Error al cargar inquilinos para contratos:', error);
    return [];
  }
};

// Obtener un contrato por ID
export const getContratoById = async (id) => {
  try {
    const docRef = doc(contratosCollection, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener contrato por ID:', error);
    return null;
  }
};

// Crear un nuevo contrato
export const createContrato = async (contratoData, userId) => {
  try {
    contratoData.createdAt = new Date().toISOString();
    contratoData.createdBy = userId;
    contratoData.updatedAt = new Date().toISOString();
    contratoData.updatedBy = userId;

    const docRef = doc(collection(db, 'contratos'));
    await setDoc(docRef, contratoData);
    return { ...contratoData, id: docRef.id };
  } catch (error) {
    console.error('Error al crear contrato:', error);
    return null;
  }
};

// Actualizar un contrato existente
export const updateContrato = async (contratoId, contratoData, userId) => {
  try {
    contratoData.updatedAt = new Date().toISOString();
    contratoData.updatedBy = userId;

    await setDoc(doc(db, 'contratos', contratoId), contratoData, { merge: true });
    return contratoData;
  } catch (error) {
    console.error('Error al actualizar contrato:', error);
    return null;
  }
};

// Eliminar un contrato
export const deleteContrato = async (contratoId) => {
  try {
    await deleteDoc(doc(db, 'contratos', contratoId));
    return true;
  } catch (error) {
    console.error('Error al eliminar contrato:', error);
    return false;
  }
};

// Cambiar el estado de un contrato
export const toggleEstadoContrato = async (contratoId, nuevoEstado, userId) => {
  try {
    await updateContrato(
      contratoId,
      {
        estado: nuevoEstado,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      },
      userId
    );
    return true;
  } catch (error) {
    console.error('Error al cambiar estado de contrato:', error);
    return false;
  }
};

// Renovar un contrato
export const renovarContrato = async (contratoId, nuevaFechaRenovacion, userId) => {
  try {
    await updateContrato(
      contratoId,
      {
        fechaRenovacion: nuevaFechaRenovacion,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      },
      userId
    );
    return true;
  } catch (error) {
    console.error('Error al renovar contrato:', error);
    return false;
  }
};

// Ajustar el IPC de un contrato
export const ajustarIPCContrato = async (contratoId, nuevoPrecio, userId) => {
  try {
    await updateContrato(
      contratoId,
      {
        precio: nuevoPrecio,
        ipcAjustado: true,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      },
      userId
    );
    return true;
  } catch (error) {
    console.error('Error al ajustar IPC de contrato:', error);
    return false;
  }
};

// Eliminar documento asociado a un contrato
export const eliminarDocumentoContrato = async (contratoId, documentoPath, userId) => {
  try {
    if (!documentoPath) return false;

    const fileRef = storageRef(storage, documentoPath);
    await deleteObject(fileRef);

    await updateContrato(
      contratoId,
      {
        documentoUrl: null,
        documentoPath: null,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      },
      userId
    );

    return true;
  } catch (error) {
    console.error('Error al eliminar documento de contrato:', error);
    return false;
  }
};

// Formatear moneda
export const formatCurrency = (value) => {
  if (!value) return '0,00 €';
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

// Formatear precio
export const formatPrecio = (value) => {
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

// Calcular fecha de renovación
export const calcularFechaRenovacion = (fechaInicio) => {
  if (!fechaInicio) return '';
  const fecha = new Date(fechaInicio);
  fecha.setFullYear(fecha.getFullYear() + 1);
  fecha.setDate(fecha.getDate() - 1); // Restar un día para que sea el día anterior al año
  return fecha.toISOString().split('T')[0];
};

// Calcular el estado de renovación de un contrato
export const calcularEstadoRenovacion = (fechaRenovacion, ipcAjustado = true) => {
  if (!fechaRenovacion) return { estado: 'Vigente', color: 'success' };

  const fechaRenovacionObj = new Date(fechaRenovacion);
  const hoy = new Date();

  // Establecer las horas a 0 para comparar solo fechas
  fechaRenovacionObj.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  // Si la fecha de renovación es menor o igual a hoy
  if (fechaRenovacionObj <= hoy) {
    return { estado: 'Pendiente de Renovación', color: 'error' };
  }

  // Si el IPC no ha sido ajustado después de la última renovación
  if (!ipcAjustado) {
    return { estado: 'Pendiente de Ajuste IPC', color: 'warning' };
  }

  return { estado: 'Vigente', color: 'success' };
};

// Calcular nuevo precio con IPC
export const calcularNuevoPrecioIPC = (precioActual, incrementoIPC) => {
  if (!precioActual || !incrementoIPC) return '';

  const precio = parseFloat(precioActual.replace(',', '.'));
  const incremento = parseFloat(incrementoIPC.replace(',', '.'));
  const nuevoPrecio = precio * (1 + incremento / 100);

  // Convertir a string con 2 decimales y reemplazar punto por coma
  let precioFormateado = nuevoPrecio.toFixed(2).replace('.', ',');

  // Eliminar decimales si son ceros
  if (precioFormateado.endsWith(',00')) {
    precioFormateado = precioFormateado.slice(0, -3);
  }

  return precioFormateado;
};

// Función para convertir fecha ISO a formato de entrada (YYYY-MM-DD)
export const isoToDateInput = (isoDate) => {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
};

// Función para convertir fecha de entrada a ISO
export const dateInputToIso = (inputDate) => {
  if (!inputDate) return '';
  return new Date(inputDate).toISOString();
};

// Obtener contratos por ID de propiedad
export const getByPropiedadId = async (propiedadId) => {
  try {
    const q = query(contratosCollection, where('propiedadId', '==', propiedadId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener contratos por propiedadId:', error);
    return [];
  }
};

// Para compatibilidad con el código existente, mantenemos la exportación por defecto
export default {
  getAll: loadContratos,
  getById: getContratoById,
  create: createContrato,
  update: updateContrato,
  delete: deleteContrato,
  getByPropiedadId,
};
