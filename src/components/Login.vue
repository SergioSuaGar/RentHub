<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="p-8 bg-white rounded-lg shadow-md">
      <h1 class="mb-6 text-2xl font-bold text-center">RentHub</h1>
      <div v-if="error" class="p-4 mb-4 text-red-700 bg-red-100 rounded">
        {{ error }}
      </div>
      <button
        :disabled="loading"
        class="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50"
        @click="loginWithGoogle"
      >
        <span v-if="loading">Cargando...</span>
        <span v-else>Iniciar sesión con Google</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';

const { loginWithGoogle, error, loading } = useAuth();
</script>
