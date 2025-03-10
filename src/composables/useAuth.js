import { ref } from 'vue';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);

  // Escuchar cambios en el estado de autenticación
  onAuthStateChanged(auth, async (userData) => {
    if (userData) {
      const userDoc = await getDoc(doc(db, 'usuarios', userData.uid));
      if (userDoc.exists()) {
        user.value = { ...userDoc.data(), uid: userData.uid };
      } else {
        // Crear nuevo usuario con rol por defecto
        const newUser = {
          uid: userData.uid,
          email: userData.email,
          nombre: userData.displayName,
          rol: 'propietario', // Por defecto, asignamos rol de propietario
        };
        await setDoc(doc(db, 'usuarios', userData.uid), newUser);
        user.value = newUser;
      }
    } else {
      user.value = null;
    }
    loading.value = false;
  });

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    try {
      loading.value = true;
      error.value = null;
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      error.value = e.message;
      loading.value = false;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      await signOut(auth);
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    error,
    loading,
    loginWithGoogle,
    logout,
  };
}
