import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export function useAppTheme() {
  const theme = useTheme();
  const isDark = ref(localStorage.getItem('theme') === 'dark');

  // Inicializar el tema
  theme.global.name.value = isDark.value ? 'dark' : 'light';

  // Observar cambios en el tema
  watch(isDark, (newValue) => {
    theme.global.name.value = newValue ? 'dark' : 'light';
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  });

  // Función para alternar el tema
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // Función para establecer el tema desde las preferencias del usuario
  const setThemeFromUserPreferences = (userSettings) => {
    if (userSettings?.theme) {
      isDark.value = userSettings.theme === 'dark';
    }
  };

  // Función para guardar el tema en Firestore
  const saveThemeToFirestore = async (userId) => {
    if (userId) {
      try {
        await setDoc(
          doc(db, 'usuarios', userId),
          {
            settings: {
              theme: isDark.value ? 'dark' : 'light',
            },
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error al guardar el tema:', error);
      }
    }
  };

  return {
    isDark,
    toggleTheme,
    setThemeFromUserPreferences,
    saveThemeToFirestore,
  };
}
