<template>
  <div class="p-8">
    <!-- 页面标题和描述 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ pageTitle }}</h1>
      <p class="text-gray-600 text-lg">{{ pageDescription }}</p>
    </div>

    <!-- 导航卡片区域 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">快速入口</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="card in navigationCards" 
          :key="card.path"
          @click="goTo(card.path)"
          class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div class="flex items-center gap-3 mb-3">
            <component :is="card.icon" class="text-2xl text-blue-600" />
            <span class="font-semibold text-gray-900">{{ card.title }}</span>
          </div>
          <p class="text-gray-600 text-sm">{{ card.description }}</p>
        </div>
      </div>
    </div>

    <div class="text-center mt-12">
      <a-empty description="该功能模块正在开发中，敬请期待" />
      <p class="text-gray-400 mt-2 text-sm">当前路径: {{ $route.path }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  AppstoreOutlined, ClusterOutlined, FileTextOutlined, 
  MonitorOutlined, SettingOutlined, BarChartOutlined 
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => {
  const name = route.name as string || '';
  const titles: Record<string, string> = {
    'AppConfig': '应用系统管理',
    'NodeConfig': '节点管理',
    'TaskConfig': '任务管理',
    'TaskMonitor': '任务监控',
    'SystemMonitor': '系统监控',
    default: '功能模块'
  };
  return titles[name] || titles.default;
});

const pageDescription = computed(() => {
  return '该功能模块正在开发中，以下是相关快速入口（开发中）';
});

const navigationCards = computed(() => {
  // 根据不同模块显示不同的导航卡片
  return [
    { 
      title: '任务配置', 
      description: '配置应用系统、节点和任务规则', 
      path: '/config/task', 
      icon: FileTextOutlined 
    },
    { 
      title: '任务监控', 
      description: '查看任务执行状态和历史记录', 
      path: '/monitor/task', 
      icon: MonitorOutlined 
    },
    { 
      title: '系统参数', 
      description: '管理系统全局参数和变量', 
      path: '/system/parameter', 
      icon: SettingOutlined 
    }
  ];
});

const goTo = (path: string) => {
  router.push(path);
};
</script>