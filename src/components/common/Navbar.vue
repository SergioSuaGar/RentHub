<script setup>
import { ref } from 'vue';
const isMenuOpen = ref(false);
</script>

<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold">RentHub</h1>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="#" class="nav-link">Dashboard</a>
            <a href="#" class="nav-link">Propiedades</a>
            <a href="#" class="nav-link">Inquilinos</a>
            <a href="#" class="nav-link">Pagos</a>
            <a href="#" class="nav-link">Documentos</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  @apply inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900;
}
</style>
