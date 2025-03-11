<template>
  <div class="settings-container">
    <v-container>
      <v-row>
        <v-col cols="12" sm="10" md="8" lg="6" class="mx-auto">
          <v-card>
            <v-toolbar flat density="comfortable">
              <v-toolbar-title class="text-h6">
                <v-icon icon="mdi-cog" class="mr-2" />
                Ajustes
              </v-toolbar-title>
            </v-toolbar>

            <v-divider></v-divider>

            <v-list>
              <!-- Ajuste del tema -->
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" />
                </template>
                <v-list-item-title>Tema</v-list-item-title>
                <template v-slot:append>
                  <v-switch v-model="isDarkTheme" hide-details inset density="comfortable" />
                </template>
              </v-list-item>

              <v-divider></v-divider>

              <!-- Aquí puedes añadir más ajustes en el futuro -->
            </v-list>

            <!-- Mostrar error si existe -->
            <v-alert v-if="error" type="error" variant="tonal" class="ma-4" closable>
              {{ error }}
            </v-alert>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppTheme } from '@/composables/useTheme';

const { isDark, toggleTheme } = useAppTheme();

// Crear un computed con getter y setter para manejar el cambio de tema
const isDarkTheme = computed({
  get: () => isDark.value,
  set: () => toggleTheme(),
});
</script>

<style scoped>
.settings-container {
  max-width: 100%;
  padding: 2rem;
}

@media (max-width: 600px) {
  .settings-container {
    padding: 1rem;
  }
}
</style>
