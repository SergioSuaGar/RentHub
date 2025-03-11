import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import PendingView from '../views/PendingView.vue';

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

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (requiresAuth && !user) {
        resolve(next('/login'));
      } else if (!requiresAuth && user) {
        resolve(next('/'));
      } else if (user) {
        // Verificar el rol del usuario
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        const userData = userDoc.data();

        if (!userData || !userData.rol) {
          if (to.path !== '/pending') {
            resolve(next('/pending'));
          } else {
            resolve(next());
          }
        } else if (requiredRoles && !requiredRoles.includes(userData.rol)) {
          // Si el usuario no tiene el rol requerido, redirigir según su rol
          switch (userData.rol) {
            case 'inquilino':
              resolve(next('/mi-vivienda'));
              break;
            case 'propietario':
            case 'admin':
              resolve(next('/'));
              break;
            default:
              resolve(next('/pending'));
          }
        } else {
          resolve(next());
        }
      } else {
        resolve(next());
      }
    });
  });
});

export default router;
