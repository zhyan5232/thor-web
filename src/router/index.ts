import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/index.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/',
    component: Layout,
    redirect: '/nodes',
    children: [
      {
        path: 'nodes',
        name: 'NodeMonitor',
        component: () => import('@/views/NodeMonitor.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫：如果没有 Token，强制跳登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('THOR_TOKEN');
  if (to.name !== 'Login' && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;