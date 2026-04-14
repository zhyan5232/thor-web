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
    redirect: '/monitor/realtime', // 登录后默认重定向到实时监控
    children: [
      /* ================= 实时监控 (首页) ================= */
      {
        path: 'monitor/realtime',
        name: 'RealTimeMonitor',
        component: () => import('@/views/monitor/RealTimeMonitor.vue'),
      },
      /* ================= 任务监控中心 ================= */
      {
        path: 'monitor/task',
        name: 'TaskMonitor',
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/manual',
        name: 'TaskManual',
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/system',
        name: 'SystemMonitor',
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/node',
        name: 'NodeMonitor',
        component: () => import('@/views/NodeMonitor.vue'),
      },
      {
        path: 'monitor/group',
        name: 'TaskGroupMonitor',
        component: () => import('@/views/Placeholder.vue'),
      },
      /* ================= 任务配置中心 ================= */
      {
        path: 'config/app',
        name: 'AppConfig',
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'config/node',
        name: 'NodeConfig',
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'config/task',
        name: 'TaskConfig',
        component: () => import('@/views/Placeholder.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('THOR_TOKEN');
  if (to.name !== 'Login' && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;