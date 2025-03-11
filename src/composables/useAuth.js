import { ref, onMounted } from 'vue';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(true);

  // Inicializar el estado de autenticación
  onMounted(() => {
    onAuthStateChanged(auth, async (userData) => {
      loading.value = true;
      if (userData) {
        try {
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
              photoURL: userData.photoURL,
            };
            await setDoc(doc(db, 'usuarios', userData.uid), newUser);
            user.value = newUser;
          }
        } catch (e) {
          console.error('Error al obtener datos del usuario:', e);
          error.value = 'Error al cargar los datos del usuario';
        }
      } else {
        user.value = null;
      }
      loading.value = false;
    });
  });

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    try {
      loading.value = true;
      error.value = null;
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Error de autenticación:', e);
      error.value = 'Error al iniciar sesión con Google';
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
      error.value = 'Error al cerrar sesión';
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
