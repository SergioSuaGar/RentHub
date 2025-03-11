<template>
  <div>
    <v-row>
      <!-- Resumen de propiedades -->
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-item>
            <v-card-title>
              <v-icon icon="mdi-home" class="me-2" color="primary"></v-icon>
              Propiedades
            </v-card-title>
            <v-card-subtitle class="mt-2">
              <span class="text-h4">0</span>
              <span class="text-caption ms-2">Total</span>
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Resumen de inquilinos -->
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-item>
            <v-card-title>
              <v-icon icon="mdi-account-group" class="me-2" color="info"></v-icon>
              Inquilinos
            </v-card-title>
            <v-card-subtitle class="mt-2">
              <span class="text-h4">0</span>
              <span class="text-caption ms-2">Activos</span>
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Resumen de pagos -->
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-item>
            <v-card-title>
              <v-icon icon="mdi-cash" class="me-2" color="success"></v-icon>
              Pagos
            </v-card-title>
            <v-card-subtitle class="mt-2">
              <span class="text-h4">0€</span>
              <span class="text-caption ms-2">Este mes</span>
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Pagos pendientes -->
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-item>
            <v-card-title>
              <v-icon icon="mdi-alert" class="me-2" color="warning"></v-icon>
              Pendientes
            </v-card-title>
            <v-card-subtitle class="mt-2">
              <span class="text-h4">0</span>
              <span class="text-caption ms-2">Por cobrar</span>
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Actividad reciente -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-clock-outline" class="me-2"></v-icon>
            Actividad Reciente
          </v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                prepend-icon="mdi-information"
                title="Bienvenido a RentHub"
                subtitle="Comienza añadiendo tus propiedades y gestionando tus alquileres de manera eficiente."
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Acciones rápidas -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-lightning-bolt" class="me-2"></v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                prepend-icon="mdi-home-plus"
                title="Añadir Propiedad"
                @click="() => {}"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-account-plus"
                title="Registrar Inquilino"
                @click="() => {}"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-cash-plus"
                title="Registrar Pago"
                @click="() => {}"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// Aquí irá la lógica del dashboard
</script>
