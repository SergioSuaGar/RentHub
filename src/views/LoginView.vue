<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-overlay"></div>
      <v-card class="login-card mx-auto" max-width="95%" width="400" elevation="8">
        <div class="brand-section text-center">
          <div class="brand-icon">
            <v-icon icon="mdi-home" size="40" color="primary"></v-icon>
          </div>
          <h1 class="brand-title">RentHub</h1>
          <p class="brand-subtitle">Gestión de alquileres</p>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable density="compact">
          {{ error }}
        </v-alert>

        <div class="login-section">
          <v-btn
            block
            color="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
            elevation="2"
          >
            <v-icon start icon="mdi-google" class="me-2"></v-icon>
            Acceder con Google
          </v-btn>
        </div>
      </v-card>
    </div>
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
.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh; /* Para navegadores modernos */
  overflow: hidden;
}

.login-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #4a4e69 0%, #9a8c98 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.8;
  pointer-events: none;
}

.login-card {
  position: relative;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px !important;
  z-index: 1;
  padding: 2rem;
}

.brand-section {
  margin-bottom: 2rem;
}

.brand-icon {
  background: rgba(74, 78, 105, 0.1);
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.brand-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: #666;
  font-size: 1rem;
}

.login-section {
  padding: 0 0.5rem;
}

.login-button {
  margin-bottom: 0;
  height: 48px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
  text-transform: none !important;
  border-radius: 12px !important;
  transition: all 0.2s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 78, 105, 0.2) !important;
}

/* Estilos específicos para móvil */
@media (max-width: 600px) {
  .login-card {
    margin: 1rem;
    padding: 1.5rem !important;
  }

  .brand-title {
    font-size: 1.5rem;
  }

  .brand-subtitle {
    font-size: 0.875rem;
  }

  .brand-icon {
    width: 56px;
    height: 56px;
  }

  .login-button {
    height: 44px !important;
  }
}
</style>
