import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tipos para nuestras entidades
export interface Propiedad {
  id: string;
  direccion: string;
  descripcion: string;
  metros: number;
  habitaciones: number;
  estado: 'disponible' | 'ocupada';
}

export interface Inquilino {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  fechaInicio: Date;
  fechaFin?: Date;
  propiedadId: string;
}

export interface Pago {
  id: string;
  propiedadId: string;
  inquilinoId: string;
  tipo: 'alquiler' | 'agua' | 'luz';
  cantidad: number;
  fecha: Date;
  estado: 'pendiente' | 'pagado';
}

export interface Factura {
  id: string;
  tipo: 'Luz' | 'Agua' | 'Agua caliente' | 'Cuota piso';
  propiedadId: string;
  propiedadNombre: string;
  importe: number;
  importePagado?: number;
  fechaPago?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'pendiente' | 'pagada';
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Contrato {
  id: string;
  propiedadId: string;
  propiedadNombre: string;
  inquilinosIds: string[];
  inquilinosNombres: string[];
  precio: number;
  fechaInicio: string;
  fechaRenovacion: string;
  ipcAjustado: boolean;
  estado: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'propietario' | 'inquilino';
}

export interface Gasto {
  id?: string;
  tipo: string;
  propiedadId: string;
  propiedadNombre: string;
  fecha: string;
  concepto: string;
  costeCuota: string;
  cantidadCuotas: string;
  importeTotal: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Configuración de Firebase
const firebaseConfig = {
  // Aquí necesitarás poner tus credenciales de Firebase
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_AUTH_DOMAIN',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_STORAGE_BUCKET',
  messagingSenderId: 'TU_MESSAGING_SENDER_ID',
  appId: 'TU_APP_ID',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configuración por defecto para Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
