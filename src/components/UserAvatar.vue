<!-- UserAvatar.vue -->
<template>
  <v-avatar :size="size" :class="['user-avatar', sizeClass]">
    <v-img v-if="photoURL" :src="photoURL" :alt="displayName || 'Usuario'" cover />
    <div v-else class="initial-avatar" :style="avatarStyle">
      <template v-if="initials">{{ initials }}</template>
      <v-icon v-else :size="iconSize" color="white">mdi-account</v-icon>
    </div>
  </v-avatar>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  photoURL: {
    type: String,
    default: null,
  },
  displayName: {
    type: String,
    default: '',
  },
  size: {
    type: [Number, String],
    default: 40,
  },
});

// Generar iniciales del nombre
const initials = computed(() => {
  if (!props.displayName) return '';
  return props.displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Calcular tamaño del icono basado en el tamaño del avatar
const iconSize = computed(() => {
  const size = parseInt(props.size);
  return Math.max(16, Math.floor(size * 0.6));
});

// Generar un color basado en el nombre o usar un color por defecto
const backgroundColor = computed(() => {
  if (!props.displayName) return '#9E9E9E'; // Color gris por defecto

  const colors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
  ];

  let hash = 0;
  for (let i = 0; i < props.displayName.length; i++) {
    hash = props.displayName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
});

const sizeClass = computed(() => {
  const size = parseInt(props.size);
  if (size <= 32) return 'small';
  if (size >= 48) return 'large';
  return 'medium';
});

const avatarStyle = computed(() => ({
  backgroundColor: backgroundColor.value,
}));
</script>

<style scoped>
.user-avatar {
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
  cursor: pointer;
}

.initial-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
}

.user-avatar.small .initial-avatar {
  font-size: 14px;
}

.user-avatar.medium .initial-avatar {
  font-size: 16px;
}

.user-avatar.large .initial-avatar {
  font-size: 20px;
}
</style>
