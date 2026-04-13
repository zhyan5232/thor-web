<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">THOR SYSTEM</div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="node-list" @click="$router.push('/nodes')">
          <database-outlined />
          <span>节点监控</span>
        </a-menu-item>
        <a-menu-item key="task-cfg" @click="$router.push('/tasks')">
          <setting-outlined />
          <span>任务配置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 24px">
        <div class="header-content">Thor 分布式调度控制中心</div>
      </a-layout-header>

      <a-layout-content style="margin: 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DatabaseOutlined, SettingOutlined } from '@ant-design/icons-vue';
const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(['node-list']);
</script>

<style scoped>
.logo { height: 32px; margin: 16px; background: rgba(255, 255, 255, 0.3); color: white; text-align: center; line-height: 32px; font-weight: bold; }
</style>