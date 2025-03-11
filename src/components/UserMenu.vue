<template>
  <div class="user-menu">
    <v-menu location="bottom end" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <UserAvatar
            :photo-URL="user?.photoURL || null"
            :display-name="user?.nombre || ''"
            size="32"
          />
        </v-btn>
      </template>

      <v-card min-width="280" class="user-menu-card">
        <v-list>
          <v-list-item class="user-profile-item">
            <template v-slot:prepend>
              <UserAvatar
                :photo-URL="user?.photoURL || null"
                :display-name="user?.nombre || ''"
                size="48"
              />
            </template>
            <v-list-item-title class="text-subtitle-1 font-weight-medium">
              {{ user?.nombre || 'Usuario' }}
            </v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item to="/settings" prepend-icon="mdi-cog">
            <v-list-item-title>Ajustes</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="handleLogout" color="error">
            <template v-slot:prepend>
              <v-icon icon="mdi-logout" color="error" />
            </template>
            <v-list-item-title class="text-error">Cerrar sesión</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item density="compact" class="version-item">
            <v-list-item-subtitle class="text-caption text-center">
              Versión {{ appVersion }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import UserAvatar from '@/components/UserAvatar.vue';

const router = useRouter();
const { user, logout } = useAuth();
const appVersion = ref('1.0.0'); // Versión de la aplicación

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.user-menu {
  margin-left: auto;
}

.user-menu-card {
  overflow: hidden;
}

.user-profile-item {
  padding: 16px;
}

.version-item {
  background-color: transparent !important;
}

.version-item :deep(.v-list-item__content) {
  opacity: 0.7;
}
</style>
