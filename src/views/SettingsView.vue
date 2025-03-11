<template>
  <div class="settings-container">
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="6" class="mx-auto">
          <v-card class="pa-4">
            <v-card-title class="text-h5 mb-4">
              <v-icon icon="mdi-cog" class="mr-2" />
              Ajustes
            </v-card-title>

            <v-card-text>
              <v-list>
                <!-- Ajuste del tema -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon
                      :icon="
                        theme === 'light' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'
                      "
                    />
                  </template>
                  <v-list-item-title>Tema</v-list-item-title>
                  <template v-slot:append>
                    <v-switch
                      v-model="isDarkTheme"
                      :loading="loading"
                      @update:model-value="toggleTheme"
                      hide-details
                      inset
                    />
                  </template>
                </v-list-item>

                <v-divider class="my-2" />

                <!-- Aquí puedes añadir más ajustes en el futuro -->
              </v-list>
            </v-card-text>

            <!-- Mostrar error si existe -->
            <v-alert v-if="error" type="error" variant="tonal" class="mt-4" closable>
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
import { useSettings } from '../composables/useSettings';

const { theme, loading, error, toggleTheme } = useSettings();

const isDarkTheme = computed({
  get: () => theme.value === 'dark',
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
