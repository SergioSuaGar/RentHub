import { ref, watch } from 'vue';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';

export function useSettings() {
  const { user } = useAuth();
  const theme = ref('light');
  const loading = ref(false);
  const error = ref(null);

  // Cargar ajustes del usuario
  const loadSettings = async () => {
    if (!user.value?.uid) return;

    try {
      loading.value = true;
      const settingsDoc = await getDoc(doc(db, 'usuarios', user.value.uid));

      if (settingsDoc.exists() && settingsDoc.data().settings) {
        const settings = settingsDoc.data().settings;
        theme.value = settings.theme || 'light';
      }
    } catch (e) {
      console.error('Error al cargar ajustes:', e);
      error.value = 'Error al cargar los ajustes';
    } finally {
      loading.value = false;
    }
  };

  // Guardar ajustes del usuario
  const saveSettings = async () => {
    if (!user.value?.uid) return;

    try {
      loading.value = true;
      await setDoc(
        doc(db, 'usuarios', user.value.uid),
        {
          settings: {
            theme: theme.value,
          },
        },
        { merge: true }
      );
    } catch (e) {
      console.error('Error al guardar ajustes:', e);
      error.value = 'Error al guardar los ajustes';
    } finally {
      loading.value = false;
    }
  };

  // Cambiar tema
  const toggleTheme = async () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    await saveSettings();
  };

  // Observar cambios en el usuario para cargar sus ajustes
  watch(
    () => user.value?.uid,
    async (newUid) => {
      if (newUid) {
        await loadSettings();
      }
    },
    { immediate: true }
  );

  // Aplicar tema al documento
  watch(
    theme,
    (newTheme) => {
      document.documentElement.setAttribute('data-theme', newTheme);
    },
    { immediate: true }
  );

  return {
    theme,
    loading,
    error,
    toggleTheme,
    loadSettings,
    saveSettings,
  };
}
