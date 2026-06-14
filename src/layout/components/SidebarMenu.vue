<template>
  <div class="sidebar-menu-wrapper">
    <!-- 移除顶部Logo区域，只保留菜单 -->
    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      :inlineCollapsed="collapsed"
      :open-keys="openKeys"
      @click="handleClick"
      class="border-0 pt-2"
    >
      <!-- 实时监控 -->
      <a-menu-item key="/monitor/realtime">
        <template #icon><DashboardOutlined /></template>
        实时监控
      </a-menu-item>

      <!-- 任务配置 -->
      <a-sub-menu key="task-config">
        <template #icon><FileTextOutlined /></template>
        <template #title>任务配置</template>
        <a-menu-item key="/config/app">应用系统管理</a-menu-item>
        <a-menu-item key="/config/node">节点管理</a-menu-item>
        <a-menu-item key="/config/node-group">节点组管理</a-menu-item>
        <a-menu-item key="/config/task">任务管理</a-menu-item>
        <a-menu-item key="/config/file-format">自定义文件格式</a-menu-item>
        <a-menu-item key="/config/trigger">触发器管理</a-menu-item>
      </a-sub-menu>

      <!-- 任务监控 -->
      <a-sub-menu key="task-monitor">
        <template #icon><MonitorOutlined /></template>
        <template #title>任务监控</template>
        <a-menu-item key="/monitor/manual">任务手动启动</a-menu-item>
        <a-menu-item key="/monitor/system">系统监控</a-menu-item>
        <a-menu-item key="/monitor/node">节点监控</a-menu-item>
        <a-menu-item key="/monitor/group">任务组监控</a-menu-item>
        <a-menu-item key="/monitor/auto-scan">自动扫描监控</a-menu-item>
      </a-sub-menu>

      <!-- 系统管理 -->
      <a-sub-menu key="system">
        <template #icon><SettingOutlined /></template>
        <template #title>系统管理</template>
        <a-menu-item key="/system/parameter">系统参数管理</a-menu-item>
        <a-menu-item key="/system/variable">系统变量管理</a-menu-item>
        <a-menu-item key="/system/auth">授权管理</a-menu-item>
        <a-menu-item key="/system/dataset">数据集管理</a-menu-item>
        <a-menu-item key="/system/log">日志查看</a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  MonitorOutlined, 
  SettingOutlined 
} from '@ant-design/icons-vue';

const props = defineProps({
  collapsed: { type: Boolean, default: false }
});

const route = useRoute();
const router = useRouter();
const selectedKeys = ref([route.path]);
const openKeys = ref(['task-config', 'task-monitor', 'system']);

watch(() => route.path, (val) => { selectedKeys.value = [val]; });

const handleClick = ({ key }: { key: string }) => { router.push(key); };
</script>

<style scoped>
.sidebar-menu-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>