import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
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
    redirect: '/monitor/realtime',
    children: [
      {
        path: 'monitor/realtime',
        name: 'RealTimeMonitor',
        meta: { title: '实时监控' },
        component: () => import('@/views/monitor/RealTimeMonitor.vue'),
      },
      {
        path: 'monitor/task',
        name: 'TaskMonitor',
        meta: { title: '任务监控' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/manual',
        name: 'TaskManual',
        meta: { title: '任务手动启动' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/system',
        name: 'SystemMonitor',
        meta: { title: '系统监控' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/node',
        name: 'NodeMonitor',
        meta: { title: '节点监控' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/group',
        name: 'TaskGroupMonitor',
        meta: { title: '任务组监控' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'monitor/auto-scan',
        name: 'AutoScanMonitor',
        meta: { title: '自动扫描监控' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'config/app',
        name: 'AppConfig',
        meta: { title: '应用系统管理' },
        component: () => import('@/views/config/AppSystemManage.vue'),
      },
      {
        path: 'config/node',
        name: 'NodeConfig',
        meta: { title: '节点管理' },
        component: () => import('@/views/config/NodeConfig.vue'),
      },
      {
        path: 'config/node-group',
        name: 'NodeGroupConfig',
        meta: { title: '节点组管理' },
        component: () => import('@/views/config/NodeGroupConfig.vue'),
      },
      {
        path: 'config/task',
        name: 'TaskConfig',
        meta: { title: '任务管理' },
        component: () => import('@/views/config/TaskConfig.vue'),
      },
      {
        path: 'config/file-format',
        name: 'FileFormatConfig',
        meta: { title: '自定义文件格式' },
        component: () => import('@/views/config/FileFormatConfig.vue'),
      },
      {
        path: 'config/trigger',
        name: 'TriggerConfig',
        meta: { title: '触发器管理' },
        component: () => import('@/views/config/TriggerConfig.vue'),
      },
      {
        path: 'system/parameter',
        name: 'SystemParameter',
        meta: { title: '系统参数管理' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'system/variable',
        name: 'SystemVariable',
        meta: { title: '系统变量管理' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'system/auth',
        name: 'SystemAuth',
        meta: { title: '授权管理' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'system/dataset',
        name: 'SystemDataset',
        meta: { title: '数据集管理' },
        component: () => import('@/views/Placeholder.vue'),
      },
      {
        path: 'system/log',
        name: 'SystemLog',
        meta: { title: '日志查看' },
        component: () => import('@/views/Placeholder.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 使用 Pinia store 进行路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.name !== 'Login' && !userStore.isLoggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;