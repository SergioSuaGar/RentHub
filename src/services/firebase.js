import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase irá aquí
const firebaseConfig = {
  // Aquí deberás colocar tu configuración de Firebase
  apiKey: 'AIzaSyA4EixMgXn9U9QZdSuFuBGRdRylSS280CY',
  authDomain: 'cardinal-4f706.firebaseapp.com',
  projectId: 'cardinal-4f706',
  storageBucket: 'cardinal-4f706.firebasestorage.app',
  messagingSenderId: '297667802866',
  appId: '1:297667802866:web:0988bb3c8d5acf6acf026b',
  measurementId: 'G-HK3LLN1BTQ',
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
