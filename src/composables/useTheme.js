import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';

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

  return {
    isDark,
    toggleTheme,
  };
}
