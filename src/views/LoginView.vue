<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <v-card class="mx-auto pa-6" max-width="400">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold mb-2">RentHub</h1>
        <p class="text-gray-600">Gestión de alquileres simplificada</p>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <v-card-text class="text-center">
        <v-btn
          block
          color="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
          prepend-icon="mdi-google"
        >
          Iniciar sesión con Google
        </v-btn>

        <p class="mt-6 text-sm text-gray-600">
          Al iniciar sesión, aceptas nuestros términos y condiciones de uso.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const router = useRouter();
const { loginWithGoogle, error, loading, user } = useAuth();

// Observar cambios en el usuario
watch(user, (newUser) => {
  if (newUser) {
    router.push('/');
  }
});

const handleLogin = async () => {
  try {
    await loginWithGoogle();
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
}
</style>
