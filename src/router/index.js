import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../services/firebase';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  /*   {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/propiedades',
    name: 'propiedades',
    component: () => import('../views/PropiedadesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/inquilinos',
    name: 'inquilinos',
    component: () => import('../views/InquilinosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/pagos',
    name: 'pagos',
    component: () => import('../views/PagosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/documentos',
    name: 'documentos',
    component: () => import('../views/DocumentosView.vue'),
    meta: { requiresAuth: true },
  },
  // Rutas para inquilinos
  {
    path: '/mi-vivienda',
    name: 'mi-vivienda',
    component: () => import('../views/inquilino/MiViviendaView.vue'),
    meta: { requiresAuth: true, role: 'inquilino' },
  },
  {
    path: '/mis-pagos',
    name: 'mis-pagos',
    component: () => import('../views/inquilino/MisPagosView.vue'),
    meta: { requiresAuth: true, role: 'inquilino' },
  },
  {
    path: '/mis-documentos',
    name: 'mis-documentos',
    component: () => import('../views/inquilino/MisDocumentosView.vue'),
    meta: { requiresAuth: true, role: 'inquilino' },
  }, */
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Protección de rutas
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    next('/login');
  } else if (to.path === '/login' && user) {
    next('/');
  } else {
    next();
  }
});

export default router;
