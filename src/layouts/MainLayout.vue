<template>
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar color="primary" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>RentHub</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="user" icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Menú lateral -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-if="user"
          :prepend-avatar="user.photoURL"
          :title="user.nombre"
          :subtitle="user.email"
        ></v-list-item>
        <v-divider></v-divider>

        <!-- Menú para propietarios -->
        <template v-if="user?.rol === 'propietario'">
          <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard"> Dashboard </v-list-item>
          <v-list-item to="/propiedades" prepend-icon="mdi-home"> Propiedades </v-list-item>
          <v-list-item to="/inquilinos" prepend-icon="mdi-account-group"> Inquilinos </v-list-item>
          <v-list-item to="/pagos" prepend-icon="mdi-cash"> Pagos </v-list-item>
          <v-list-item to="/documentos" prepend-icon="mdi-file-document"> Documentos </v-list-item>
        </template>

        <!-- Menú para inquilinos -->
        <template v-if="user?.rol === 'inquilino'">
          <v-list-item to="/mi-vivienda" prepend-icon="mdi-home"> Mi Vivienda </v-list-item>
          <v-list-item to="/mis-pagos" prepend-icon="mdi-cash"> Mis Pagos </v-list-item>
          <v-list-item to="/mis-documentos" prepend-icon="mdi-file-document">
            Mis Documentos
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main class="bg-grey-lighten-3">
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const drawer = ref(false);
const router = useRouter();
const { user, logout } = useAuth();

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.v-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
