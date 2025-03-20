<template>
  <div class="pending-container">
    <v-card class="mx-auto pa-6" max-width="600">
      <div class="text-center mb-6">
        <v-icon icon="mdi-account-clock" size="64" color="warning"></v-icon>
        <h1 class="text-h4 font-weight-bold mt-4">Cuenta en revisión</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">
          Tu cuenta está pendiente de aprobación por un administrador.
        </p>
      </div>

      <v-divider class="mb-6"></v-divider>

      <div class="text-body-1">
        <p class="mb-4">
          Para garantizar la seguridad de la aplicación, un administrador necesita verificar y
          asignar los permisos adecuados a tu cuenta.
        </p>
        <p class="mb-4">Este proceso puede tardar hasta 24 horas.</p>
        <p>
          Si tienes alguna pregunta o necesitas acelerar el proceso, por favor contacta con el
          administrador.
        </p>
      </div>

      <v-card-actions class="mt-6">
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="handleLogout">Cerrar sesión</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const { logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.pending-container {
  max-width: 100%;
  padding: 2rem;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .pending-container {
    padding: 1rem;
  }
}
</style>
