<template>
  <div class="tabs-wrapper bg-white border-b select-none">
    <div class="flex items-center h-11 px-2 gap-1 overflow-x-auto">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item group flex items-center px-4 py-1.5 rounded-t-lg text-sm cursor-pointer transition-all"
        :class="{
          'bg-white border border-b-0 border-gray-200 text-gray-900 shadow-sm': activeKey === tab.key,
          'text-gray-600 hover:bg-gray-100': activeKey !== tab.key
        }"
        @click="switchToTab(tab.key)"
        @contextmenu.prevent="showContextMenu($event, tab)"
      >
        <span class="mr-2 whitespace-nowrap">{{ tab.title }}</span>

        <!-- 关闭按钮 -->
        <span
          v-if="tab.closable !== false"
          class="ml-1 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 opacity-60 group-hover:opacity-100 transition-opacity"
          @click.stop="closeTab(tab.key)"
        >
          ×
        </span>
      </div>
    </div>

    <!-- 自定义右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenuVisible"
        class="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl py-1 text-sm min-w-[160px]"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
        @click="contextMenuVisible = false"
      >
        <div class="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" @click="closeCurrent">关闭当前</div>
        <div class="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" @click="closeOthers">关闭其他</div>
        <div class="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" @click="closeAll">关闭全部</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTabsStore } from '@/stores/tabs';
import { useRouter } from 'vue-router';

const tabsStore = useTabsStore();
const router = useRouter();

const tabs = computed(() => tabsStore.tabs);
const activeKey = computed(() => tabsStore.activeKey);

const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const currentTab = ref<any>(null);

const switchToTab = (key: string) => {
  tabsStore.switchTab(key);
  router.push(key);
};

const closeTab = (key: string) => {
  tabsStore.closeTab(key);
  if (tabsStore.activeKey === key && tabsStore.tabs.length > 0) {
    router.push(tabsStore.activeKey);
  }
};

const showContextMenu = (e: MouseEvent, tab: any) => {
  currentTab.value = tab;
  contextMenuPosition.value = { x: e.clientX, y: e.clientY };
  contextMenuVisible.value = true;

  // 点击其他地方自动关闭菜单
  const closeMenu = () => {
    contextMenuVisible.value = false;
    document.removeEventListener('click', closeMenu);
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu, { once: true });
  }, 0);
};

const closeCurrent = () => {
  if (!currentTab.value) return;
  closeTab(currentTab.value.key);
};

const closeOthers = () => {
  if (!currentTab.value) return;
  tabsStore.closeOthers(currentTab.value.key);
};

const closeAll = () => {
  tabsStore.closeAll();
  if (tabsStore.tabs.length > 0) {
    router.push(tabsStore.activeKey);
  }
};
</script>

<style scoped>
.tab-item {
  border-bottom: 2px solid transparent;
  transition: all 0.1s;
}
.tab-item:hover {
  background-color: #f8fafc;
}
.tab-item[style*="active"] {
  border-bottom-color: #0960bd;
}
</style>