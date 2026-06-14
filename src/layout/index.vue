<template>
  <a-layout class="min-h-screen">
    <!-- 顶部 Header -->
    <a-layout-header class="bg-white border-b px-6 flex items-center justify-between h-16 shadow-sm">
      <!-- Logo 区域 - 匹配登录页闪电图标风格 -->
      <div class="flex items-center gap-3 cursor-pointer" @click="goToHome">
        <ThunderboltFilled 
          class="text-[28px]" 
          style="color: #38bdf8; filter: drop-shadow(0 0 8px rgba(0, 210, 255, 0.5));" 
        />
        <div class="flex items-baseline">
          <span class="text-[22px] font-semibold tracking-tight text-slate-900">Thor</span>
          <span class="ml-2 text-[13px] font-medium text-slate-500 tracking-[1px]">分布式文件传输平台</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <a-dropdown>
          <a class="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors">
            <a-avatar :src="userStore.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thor'" :size="32" />
            <span class="font-medium text-sm">{{ userStore.username || 'Admin' }}</span>
          </a>
          <template #overlay>
            <a-menu @click="handleLogout">
              <a-menu-item key="logout">退出登录</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout>
      <!-- 侧边菜单 -->
      <a-layout-sider 
        v-model:collapsed="collapsed" 
        collapsible 
        width="260" 
        class="bg-white border-r shadow-sm"
      >
        <SidebarMenu :collapsed="collapsed" />
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout class="flex flex-col">
        <TabsView />

        <div class="bg-white border-b px-6 py-3 flex items-center justify-between">
          <a-breadcrumb class="text-[13px]">
            <a-breadcrumb-item>
              <router-link to="/monitor/realtime" class="flex items-center text-slate-500 hover:text-slate-700">
                <HomeOutlined class="mr-1 text-sm" />
                <span>首页</span>
              </router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentPageTitle">
              <span class="font-medium text-slate-700">{{ currentPageTitle }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <a-layout-content class="p-6 bg-slate-50 overflow-auto flex-1">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useTabsStore } from '@/stores/tabs';
import SidebarMenu from './components/SidebarMenu.vue';
import TabsView from '@/components/TabsView.vue';
import { ThunderboltFilled, HomeOutlined } from '@ant-design/icons-vue';

const collapsed = ref(false);
const userStore = useUserStore();
const tabsStore = useTabsStore();
const router = useRouter();
const route = useRoute();

const currentPageTitle = computed(() => {
  return (route.meta.title as string) || (route.name as string) || '';
});

watch(() => route.fullPath, (newPath) => {
  if (!newPath || newPath === '/') return;

  const title = (route.meta.title as string) || 
                (route.name as string) || 
                newPath.split('/').pop() || 'Untitled';

  tabsStore.addTab({
    key: newPath,
    title: title,
    closable: newPath !== '/monitor/realtime'
  });
}, { immediate: true });

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

const goToHome = () => {
  router.push('/monitor/realtime');
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

:deep(.ant-layout-sider) { background: #fff !important; border-right: 1px solid #e2e8f0; }
:deep(.ant-layout-sider-trigger) { background: #fff !important; border-top: 1px solid #e2e8f0; color: #475569 !important; }
:deep(.ant-layout-header) { background: #fff !important; border-bottom: 1px solid #e2e8f0; }
:deep(.ant-layout) { background: #f8fafc; }
</style>