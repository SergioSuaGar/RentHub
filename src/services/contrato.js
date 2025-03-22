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
// Importar funciones de formateo del servicio centralizado
import { formatCurrency, formatDate, formatDateShort, formatPrecio } from '@/services/format';
// Importar funciones de utilidades de fecha
import {
  isoToDateInput,
  dateInputToIso,
  calcularFechaRenovacion,
  calcularEstadoRenovacion,
} from '@/services/date-utils';
// Importar funciones de utilidades matemáticas
import { calcularNuevoPrecioIPC } from '@/services/math-utils';

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

// Exportar las funciones de formateo del servicio centralizado
export { formatCurrency, formatDate, formatDateShort, formatPrecio };

// Exportar las funciones de utilidades de fecha
export { isoToDateInput, dateInputToIso, calcularFechaRenovacion, calcularEstadoRenovacion };

// Exportar funciones de utilidades matemáticas
export { calcularNuevoPrecioIPC };

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
