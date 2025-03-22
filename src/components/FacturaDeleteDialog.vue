<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">¿Estás seguro de eliminar esta factura?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          variant="text"
          @click="closeDialog"
          :title="'Cancelar la eliminación'"
        >
          No
        </v-btn>
        <v-btn
          color="error"
          variant="text"
          @click="deleteFactura"
          :title="'Confirmar la eliminación de la factura'"
        >
          Sí
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

const props = defineProps({
  dialog: Boolean,
  factura: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:dialog', 'delete']);

const closeDialog = () => {
  emit('update:dialog', false);
};

const deleteFactura = async () => {
  try {
    await deleteDoc(doc(db, 'facturas', props.factura.id));
    emit('delete');
    closeDialog();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};
</script>
