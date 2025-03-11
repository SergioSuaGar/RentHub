<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import { useAuth } from './composables/useAuth';

const route = useRoute();
const { user } = useAuth();

// Determinar si la ruta actual requiere el layout principal
const useMainLayout = computed(() => {
  return user.value && !['login'].includes(route.name);
});
</script>

<template>
  <MainLayout v-if="useMainLayout">
    <router-view />
  </MainLayout>
  <router-view v-else />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
