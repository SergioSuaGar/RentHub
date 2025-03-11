import { ref, onMounted } from 'vue';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc, getDoc, collection, query, where, serverTimestamp } from 'firebase/firestore';

export function useAuth() {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(true);
  const isAdmin = ref(false);
  const isPropietario = ref(false);
  const isInquilino = ref(false);

  // Verificar rol del usuario
  const checkUserRole = async (userData) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userData.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        user.value = { ...userData, uid: userDoc.id };

        // Actualizar estados de roles
        isAdmin.value = userData.rol === 'admin';
        isPropietario.value = userData.rol === 'propietario';
        isInquilino.value = userData.rol === 'inquilino';

        // Actualizar último acceso
        await setDoc(
          doc(db, 'usuarios', userDoc.id),
          {
            ultimoAcceso: serverTimestamp(),
          },
          { merge: true }
        );
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
    isAdmin,
    isPropietario,
    isInquilino,
    loginWithGoogle,
    logout,
  };
}
