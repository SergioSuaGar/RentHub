import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import PendingView from '../views/PendingView.vue';
import SettingsView from '../views/SettingsView.vue';
import InquilinosView from '../views/InquilinosView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/pending',
      name: 'pending',
      component: PendingView,
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, roles: ['admin', 'propietario'] },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/inquilinos',
      name: 'inquilinos',
      component: InquilinosView,
      meta: { requiresAuth: true, roles: ['admin', 'propietario'] },
    },
    {
      path: '/propiedades',
      name: 'propiedades',
      component: () => import('@/views/PropiedadesView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Propiedades',
      },
    },
    /*     {
      path: '/admin/usuarios',
      name: 'usuarios',
      component: () => import('../views/admin/UsersView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/mi-vivienda',
      name: 'mi-vivienda',
      component: () => import('../views/tenant/MyPropertyView.vue'),
      meta: { requiresAuth: true, roles: ['inquilino'] },
    },
    {
      path: '/mis-pagos',
      name: 'mis-pagos',
      component: () => import('../views/tenant/MyPaymentsView.vue'),
      meta: { requiresAuth: true, roles: ['inquilino'] },
    },
    {
      path: '/mis-documentos',
      name: 'mis-documentos',
      component: () => import('../views/tenant/MyDocumentsView.vue'),
      meta: { requiresAuth: true, roles: ['inquilino'] },
    }, */
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles;

  // Si la ruta no requiere autenticación y no hay usuario, permitir
  if (!requiresAuth) {
    return next();
  }

  // Esperar a que el estado de autenticación se estabilice
  const user = auth.currentUser;

  // Si la ruta requiere autenticación y no hay usuario
  if (requiresAuth && !user) {
    return next('/login');
  }

  // Si hay usuario, verificar roles
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      const userData = userDoc.data();

      if (!userData || !userData.rol) {
        return to.path !== '/pending' ? next('/pending') : next();
      }

      if (requiredRoles && !requiredRoles.includes(userData.rol)) {
        // Redirigir según el rol
        switch (userData.rol) {
          case 'inquilino':
            return next('/mi-vivienda');
          case 'propietario':
          case 'admin':
            return next('/');
          default:
            return next('/pending');
        }
      }
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return next('/login');
    }
  }

  return next();
});

export default router;
