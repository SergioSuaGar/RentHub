import { ref, onMounted } from 'vue';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAppTheme } from './useTheme';

export function useAuth() {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(true);
  const isAdmin = ref(false);
  const isPropietario = ref(false);
  const isInquilino = ref(false);
  const isPending = ref(false);
  const { setThemeFromUserPreferences } = useAppTheme();

  // Actualizar último acceso
  const updateLastAccess = async (userId) => {
    try {
      await setDoc(
        doc(db, 'usuarios', userId),
        { ultimoAcceso: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.error('Error al actualizar último acceso:', e);
    }
  };

  // Verificar rol del usuario
  const checkUserRole = async (userData) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userData.uid));

      if (userDoc.exists()) {
        const userDataFromDb = userDoc.data();
        user.value = { ...userDataFromDb, uid: userDoc.id };

        // Actualizar estados de roles
        isAdmin.value = userDataFromDb.rol === 'admin';
        isPropietario.value = userDataFromDb.rol === 'propietario';
        isInquilino.value = userDataFromDb.rol === 'inquilino';
        isPending.value = userDataFromDb.rol === 'pending';

        // Cargar preferencias del tema
        if (userDataFromDb.settings) {
          setThemeFromUserPreferences(userDataFromDb.settings);
        }

        // Actualizar último acceso de forma asíncrona
        updateLastAccess(userDoc.id);
      } else {
        // Nuevo usuario - crear registro pendiente
        const newUser = {
          uid: userData.uid,
          email: userData.email,
          nombre: userData.displayName,
          rol: 'pending',
          photoURL: userData.photoURL,
          fechaRegistro: serverTimestamp(),
          ultimoAcceso: serverTimestamp(),
          settings: {
            theme: 'light', // tema por defecto para nuevos usuarios
          },
        };

        // Crear usuario en la colección de usuarios
        await setDoc(doc(db, 'usuarios', userData.uid), newUser);

        // Crear solicitud pendiente
        await setDoc(doc(db, 'roles_pendientes', userData.uid), {
          uid: userData.uid,
          email: userData.email,
          nombre: userData.displayName,
          fechaSolicitud: serverTimestamp(),
          estado: 'pendiente',
        });

        user.value = newUser;
        isPending.value = true;
      }
    } catch (e) {
      console.error('Error al verificar rol:', e);
      error.value = 'Error al verificar los permisos de usuario';
    }
  };

  // Inicializar el estado de autenticación
  onMounted(() => {
    onAuthStateChanged(auth, async (userData) => {
      loading.value = true;
      if (userData) {
        await checkUserRole(userData);
      } else {
        user.value = null;
        isAdmin.value = false;
        isPropietario.value = false;
        isInquilino.value = false;
        isPending.value = false;
      }
      loading.value = false;
    });
  });

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    try {
      loading.value = true;
      error.value = null;
      const result = await signInWithPopup(auth, googleProvider);
      await checkUserRole(result.user);
      return result;
    } catch (e) {
      console.error('Error en login:', e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      await signOut(auth);
      user.value = null;
      isAdmin.value = false;
      isPropietario.value = false;
      isInquilino.value = false;
      isPending.value = false;
    } catch (e) {
      console.error('Error en logout:', e);
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    error,
    loading,
    isAdmin,
    isPropietario,
    isInquilino,
    isPending,
    loginWithGoogle,
    logout,
  };
}
