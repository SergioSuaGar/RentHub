import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase irá aquí
const firebaseConfig = {
  // Aquí deberás colocar tu configuración de Firebase
  apiKey: 'AIzaSyDI_sIpHw8oOf2Cqg-MDO8hsxXUhF3iJkE',
  authDomain: 'renthub-27b92.firebaseapp.com',
  projectId: 'renthub-27b92',
  storageBucket: 'renthub-27b92.firebasestorage.app',
  messagingSenderId: '93673419672',
  appId: '1:93673419672:web:9e0f083fdcd8e0a62f31ed',
  measurementId: 'G-H0W492HL1S',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Crear y exportar el provider de Google
export const googleProvider = new GoogleAuthProvider();

// Configuración por defecto para Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
