<template>
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar elevation="1">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title>RentHub</v-app-bar-title>
      </template>

      <template v-slot:append>
        <UserMenu v-if="user" />
      </template>
    </v-app-bar>

    <!-- Menú lateral -->
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent>
      <v-list density="compact" nav>
        <!-- Menú para propietarios -->
        <template v-if="user?.rol === 'propietario'">
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
        </template>

        <!-- Menú para inquilinos -->
        <template v-if="user?.rol === 'inquilino'">
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
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
import { useAuth } from '@/composables/useAuth';
import UserMenu from '@/components/UserMenu.vue';
import { useAppTheme } from '@/composables/useTheme';

const { user } = useAuth();
const { isDark } = useAppTheme();

const drawer = ref(true);
const rail = ref(false);

const items = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/',
  },
  {
    title: 'Propiedades',
    icon: 'mdi-home',
    to: '/propiedades',
  },
  {
    title: 'Inquilinos',
    icon: 'mdi-account-group',
    to: '/inquilinos',
  },
  {
    title: 'Pagos',
    icon: 'mdi-cash',
    to: '/pagos',
  },
  {
    title: 'Documentos',
    icon: 'mdi-file-document',
    to: '/documentos',
  },
];
</script>

<style scoped>
.v-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.v-app-bar {
  border-bottom: 1px solid rgb(var(--v-border-color)) !important;
}

.v-navigation-drawer {
  border-right: 1px solid rgb(var(--v-border-color)) !important;
}
</style>
