<template>
  <a-layout class="vben-layout">
    <a-layout-sider 
      v-if="!isMaximize"
      v-model:collapsed="collapsed" 
      collapsible 
      :theme="isDark ? 'dark' : 'light'" 
      width="210" 
      class="vben-sider"
    >
      <div class="vben-logo">
        <thunderbolt-filled class="logo-icon" />
        <span v-if="!collapsed" class="logo-text">Thor Admin</span>
      </div>
      
      <a-menu 
        v-model:selectedKeys="selectedKeys" 
        v-model:openKeys="openKeys"
        :theme="isDark ? 'dark' : 'light'" 
        mode="inline"
        class="vben-menu"
      >
        <a-menu-item key="/monitor/realtime" @click="goTo('/monitor/realtime', '分析页')">
          <fund-outlined /><span>分析页</span>
        </a-menu-item>

        <a-sub-menu key="monitor-center">
          <template #title><span><dashboard-outlined /><span>任务监控中心</span></span></template>
          <a-menu-item key="/monitor/task" @click="goTo('/monitor/task', '任务监控')">任务监控</a-menu-item>
          <a-menu-item key="/monitor/manual" @click="goTo('/monitor/manual', '任务手工启动')">任务手工启动</a-menu-item>
          <a-menu-item key="/monitor/system" @click="goTo('/monitor/system', '系统监控')">系统监控</a-menu-item>
          <a-menu-item key="/monitor/node" @click="goTo('/monitor/node', '节点监控')">节点监控</a-menu-item>
          <a-menu-item key="/monitor/group" @click="goTo('/monitor/group', '任务组监控')">任务组监控</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="config-center">
          <template #title><span><setting-outlined /><span>任务配置中心</span></span></template>
          <a-menu-item key="/config/app" @click="goTo('/config/app', '应用系统管理')">应用系统管理</a-menu-item>
          <a-menu-item key="/config/node" @click="goTo('/config/node', '节点管理')">节点管理</a-menu-item>
          <a-menu-item key="/config/task" @click="goTo('/config/task', '任务管理')">任务管理</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header v-if="!isMaximize" class="vben-header">
        <div class="header-left">
          <menu-fold-outlined v-if="!collapsed" class="trigger" @click="collapsed = !collapsed" />
          <menu-unfold-outlined v-else class="trigger" @click="collapsed = !collapsed" />
          <a-breadcrumb class="ml-4 hidden-mobile">
            <a-breadcrumb-item>概览</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentTabTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <div class="vben-search-trigger" @click="handleSearch">
            <search-outlined class="mr-2" /><span class="search-text">搜索</span><span class="search-shortcut">Ctrl K</span>
          </div>

          <div class="action-item" title="项目配置" @click="showNotImplemented('项目配置')">
            <setting-outlined />
          </div>

          <div class="action-item theme-toggle" :title="isDark ? '切换明亮模式' : '切换暗黑模式'" @click="toggleTheme($event)">
            <div class="icon-wrapper" :class="{ 'is-dark': isDark }">
              <SunIcon class="icon-sun text-yellow-500" />
              <MoonIcon class="icon-moon text-slate-600 dark:text-slate-300" />
            </div>
          </div>

          <div class="action-item" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
            <fullscreen-outlined v-if="!isFullscreen" /><fullscreen-exit-outlined v-else />
          </div>

          <div class="action-item" title="消息通知" @click="showNotImplemented('消息通知')">
            <a-badge :count="5" dot :offset="[-2, 2]" color="#52c41a">
              <bell-outlined />
            </a-badge>
          </div>

          <a-dropdown :trigger="['click']">
            <div class="user-avatar-wrap">
              <a-avatar :size="24" style="background-color: #0960bd" src="https://vvbin.cn/next/assets/header/avatar.png" />
              <span class="user-name ml-2">管理员</span><span class="status-dot"></span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="showNotImplemented('个人资料')"><user-outlined /> 个人资料</a-menu-item>
                <a-menu-item key="settings" @click="showNotImplemented('个人设置')"><setting-outlined /> 个人设置</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout"><logout-outlined /> 退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <div v-if="!isMaximize" class="vben-multiple-tabs-container">
        <div class="vben-tabs-main">
          <a-dropdown :trigger="['contextmenu']" v-for="(tab, index) in tabList" :key="tab.path">
            <div :class="['tab-item', { active: activeKey === tab.path }]" @click="goTo(tab.path, tab.title)">
              <pushpin-filled v-if="tab.pinned" class="pinned-icon" />
              <span v-else-if="activeKey === tab.path" class="tab-dot"></span>
              {{ tab.title }}
              <close-outlined v-if="!tab.pinned && tabList.length > 1" class="close-icon" @click.stop="closeTab(tab.path)" />
            </div>
            <template #overlay>
              <a-menu class="vben-context-menu">
                <a-menu-item key="reload" @click="reloadPage(tab.path)"><reload-outlined /> 重新加载</a-menu-item>
                <a-menu-item key="blank" @click="openInNewWindow(tab.path)"><export-outlined /> 在新窗口打开</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="pin" @click="togglePin(tab.path)"><pushpin-outlined v-if="!tab.pinned" /><pushpin-filled v-else /> {{ tab.pinned ? '取消固定' : '固定标签页' }}</a-menu-item>
                <a-menu-item key="maximize" @click="toggleMaximize(tab.path)"><fullscreen-outlined /> 最大化</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="close" @click="closeTab(tab.path)" :disabled="tab.pinned || tabList.length === 1"><close-outlined /> 关闭</a-menu-item>
                <a-menu-item key="closeLeft" @click="closeLeft(tab.path, index)" :disabled="index === 0"><vertical-right-outlined /> 关闭左侧</a-menu-item>
                <a-menu-item key="closeRight" @click="closeRight(tab.path, index)" :disabled="index === tabList.length - 1"><vertical-left-outlined /> 关闭右侧</a-menu-item>
                <a-menu-item key="closeOthers" @click="closeOthers(tab.path)"><column-width-outlined /> 关闭其它</a-menu-item>
                <a-menu-item key="closeAll" @click="closeAll"><swap-outlined /> 关闭全部</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>

        <div class="vben-tabs-tools">
          <a-dropdown :trigger="['click']">
            <div class="tool-btn" title="更多操作"><appstore-outlined /></div>
            <template #overlay>
              <a-menu class="vben-context-menu">
                <a-menu-item @click="reloadPage(activeKey)"><reload-outlined /> 重新加载</a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="closeOthers(activeKey)"><column-width-outlined /> 关闭其它</a-menu-item>
                <a-menu-item @click="closeAll"><swap-outlined /> 关闭全部</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <div class="tool-btn" title="重新加载" @click="reloadPage(activeKey)"><reload-outlined /></div>
          <div class="tool-btn" title="最大化" @click="toggleMaximize(activeKey)"><fullscreen-outlined /></div>
        </div>
      </div>

      <a-layout-content :class="['vben-content-wrap', { 'is-maximized': isMaximize }]">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="routeKey" />
          </transition>
        </router-view>
        <div v-if="isMaximize" class="exit-maximize-btn" @click="isMaximize = false">
          <fullscreen-exit-outlined />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import { 
  DashboardOutlined, SettingOutlined, FundOutlined, ThunderboltFilled,
  MenuFoldOutlined, MenuUnfoldOutlined, CloseOutlined,
  PushpinOutlined, PushpinFilled, FullscreenOutlined, FullscreenExitOutlined, 
  ReloadOutlined, ExportOutlined, SearchOutlined, BellOutlined,
  VerticalRightOutlined, VerticalLeftOutlined, ColumnWidthOutlined, SwapOutlined,
  UserOutlined, LogoutOutlined, AppstoreOutlined
} from '@ant-design/icons-vue';

import MoonIcon from '~icons/ion/moon-outline';
import SunIcon from '~icons/ion/sunny-outline';

const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const isMaximize = ref(false);
const isDark = ref(false);
const isFullscreen = ref(false);
const routeKey = ref(Date.now().toString());

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>(['monitor-center', 'config-center']);

interface Tab { path: string; title: string; pinned?: boolean; }
const defaultTab: Tab = { path: '/monitor/realtime', title: '分析页', pinned: true };
const tabList = ref<Tab[]>([{ ...defaultTab }]);
const activeKey = ref('/monitor/realtime');

const currentTabTitle = computed(() => {
  const current = tabList.value.find(t => t.path === activeKey.value);
  return current ? current.title : '分析页';
});

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});

const goTo = (path: string, title: string) => {
  if (!tabList.value.find(t => t.path === path)) tabList.value.push({ path, title, pinned: false });
  activeKey.value = path;
  router.push(path);
};

const handleSearch = () => message.success('搜索功能（Ctrl K）已触发！');
const showNotImplemented = (title: string) => message.info(`${title} 功能正在努力开发中...`);

// ================= Vben 完美水波纹主题切换动画 =================
const toggleTheme = (event: MouseEvent) => {
  const willDark = !isDark.value;
  
  // 浏览器兼容性降级
  // @ts-ignore
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isDark.value = willDark;
    updateTheme(willDark);
    return;
  }
  
  // 获取鼠标点击的精确坐标
  const x = event.clientX;
  const y = event.clientY;
  
  // 计算到达屏幕最远角落的距离（扩散的最大半径）
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  
  // 开启过渡截屏机制
  // @ts-ignore
  const transition = document.startViewTransition(() => {
    isDark.value = willDark;
    updateTheme(willDark);
  });
  
  // DOM 更新完成后，执行圆形扩散动画
  transition.ready.then(() => {
    document.documentElement.animate(
      { 
        clipPath: [
          `circle(0px at ${x}px ${y}px)`, 
          `circle(${endRadius}px at ${x}px ${y}px)`
        ] 
      },
      { 
        duration: 500, // 与 Vben 相同的 0.5s 平滑时长
        easing: 'ease-out', 
        // 关键所在：新生成的视图（新主题）永远在上层向外扩散
        pseudoElement: '::view-transition-new(root)' 
      }
    );
  });
};

const updateTheme = (dark: boolean) => {
  const html = document.documentElement;
  if (dark) html.classList.add('dark');
  else html.classList.remove('dark');
};

const toggleFullscreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); isFullscreen.value = true; } else { document.exitFullscreen(); isFullscreen.value = false; } };
const handleLogout = () => { localStorage.removeItem('THOR_TOKEN'); message.success('已退出登录'); router.push('/login'); };
const togglePin = (path: string) => { const i = tabList.value.findIndex(t => t.path === path); if (i > -1) { tabList.value[i].pinned = !tabList.value[i].pinned; if (tabList.value[i].pinned) { const t = tabList.value.splice(i, 1)[0]; tabList.value.unshift(t); } } };
const toggleMaximize = (path: string) => { if (activeKey.value !== path) { const t = tabList.value.find(x => x.path === path); if (t) goTo(path, t.title); } isMaximize.value = true; };
const reloadPage = (path: string) => { if (activeKey.value !== path) { const t = tabList.value.find(x => x.path === path); if (t) goTo(path, t.title); } routeKey.value = Date.now().toString(); };
const closeTab = (path: string) => { const i = tabList.value.findIndex(t => t.path === path); if (i !== -1 && !tabList.value[i].pinned) { tabList.value.splice(i, 1); if (activeKey.value === path) { const next = tabList.value[Math.max(i - 1, 0)]; goTo(next.path, next.title); } } };
const openInNewWindow = (path: string) => { const { href } = router.resolve(path); window.open(href, '_blank'); };
const closeLeft = (path: string, index: number) => { tabList.value = tabList.value.filter((t, i) => t.pinned || i >= index); if (!tabList.value.find(t => t.path === activeKey.value)) goTo(path, tabList.value[0].title); };
const closeRight = (path: string, index: number) => { tabList.value = tabList.value.filter((t, i) => t.pinned || i <= index); if (!tabList.value.find(t => t.path === activeKey.value)) goTo(path, tabList.value[tabList.value.length - 1].title); };
const closeOthers = (path: string) => { tabList.value = tabList.value.filter(t => t.pinned || t.path === path); if (activeKey.value !== path) goTo(path, tabList.value.find(t => t.path === path)!.title); };
const closeAll = () => { tabList.value = tabList.value.filter(t => t.pinned); if (tabList.value.length === 0) tabList.value = [{ ...defaultTab }]; goTo(tabList.value[tabList.value.length - 1].path, tabList.value[tabList.value.length - 1].title); };

watch(() => route.path, (newPath) => { selectedKeys.value = [newPath]; activeKey.value = newPath; }, { immediate: true });
</script>

<style lang="less">
/* === 全局 View Transition API 控制，保证新视图永远覆写旧视图 === */
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 9999; } /* 确保扩散的水波纹层级最高 */

/* === 完善的全局暗黑模式样式覆盖 === */
html.dark {
  .vben-layout { background-color: #000; }
  .vben-sider { border-right-color: #303030; }
  .vben-sider .ant-layout-sider-children { background: #141414; }
  .vben-logo { border-bottom-color: #303030; .logo-text { color: #e5e7eb; } }
  .vben-header { background-color: #141414; border-bottom-color: #303030; .trigger { color: #e5e7eb; &:hover { color: #0960bd; } } }
  .header-right {
    .vben-search-trigger { background: #303030; &:hover { background: #434343; } .search-text { color: #e5e7eb; } .search-shortcut { border-color: #555; color: #aaa; } }
    .action-item { color: #e5e7eb; &:hover { background: #303030; } }
    .user-avatar-wrap { &:hover { background: #303030; } .user-name { color: #e5e7eb; } }
  }
  .ant-breadcrumb-link, .ant-breadcrumb-separator { color: #a6a6a6; }
  .ant-breadcrumb > span:last-child .ant-breadcrumb-link { color: #e5e7eb; }
  .vben-multiple-tabs-container { background-color: #141414; border-bottom-color: #303030; box-shadow: none; }
  .vben-tabs-main .tab-item { background: #1f1f1f; border-color: #303030; color: #a6a6a6; }
  .vben-tabs-main .tab-item:hover { color: #0960bd; }
  .vben-tabs-main .tab-item.active { background: #141414; color: #0960bd; border-color: #0960bd; }
  .vben-tabs-tools { border-left-color: #303030; }
  .vben-tabs-tools .tool-btn { border-right-color: #303030; color: #a6a6a6; &:hover { background: #303030; color: #0960bd; } }
  .vben-content-wrap { background-color: #000; }
}
</style>

<style scoped lang="less">
/* === Vben 图标平滑翻转动画 (重点实现区) === */
.theme-toggle {
  .icon-wrapper {
    position: relative;
    width: 1.2em; height: 1.2em;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    svg {
      position: absolute;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* 优雅的缓动曲线 */
    }
    .icon-sun { transform: translateY(0) rotate(0deg); opacity: 1; }
    .icon-moon { transform: translateY(-100%) rotate(-90deg); opacity: 0; }
    
    &.is-dark {
      .icon-sun { transform: translateY(100%) rotate(90deg); opacity: 0; }
      .icon-moon { transform: translateY(0) rotate(0deg); opacity: 1; }
    }
  }
}

/* --- 白天基础样式保持不变 --- */
.vben-layout { min-height: 100vh; background-color: #f0f2f5; transition: background-color 0.3s; }
.vben-sider { border-right: 1px solid #f0f0f0; box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05); z-index: 10; .vben-logo { height: 48px; display: flex; align-items: center; padding-left: 16px; border-bottom: 1px solid #f0f0f0; .logo-icon { font-size: 24px; color: #0960bd; margin-right: 8px; } .logo-text { font-size: 16px; font-weight: 700; color: #000000d9; white-space: nowrap; } } .vben-menu { border-right: none; } }
.vben-header { height: 48px; padding: 0 16px; background: #fff; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; line-height: 48px; .header-left { display: flex; align-items: center; .trigger { font-size: 16px; cursor: pointer; transition: color 0.3s; &:hover { color: #0960bd; } } } .header-right { display: flex; align-items: center; .vben-search-trigger { display: flex; align-items: center; background: #f6f6f6; border-radius: 4px; padding: 0 12px; height: 32px; cursor: pointer; margin-right: 12px; transition: all 0.3s; &:hover { background: #eeeeee; } .search-text { color: #666; font-size: 13px; } .search-shortcut { margin-left: 12px; font-size: 11px; padding: 1px 4px; border: 1px solid #d9d9d9; border-radius: 3px; color: #999; line-height: 1; } } .action-item { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: pointer; font-size: 16px; color: #333; transition: background 0.3s; border-radius: 4px; &:hover { background: #f6f6f6; } } .user-avatar-wrap { display: flex; align-items: center; padding: 0 8px; height: 36px; cursor: pointer; position: relative; transition: background 0.3s; border-radius: 4px; &:hover { background: #f6f6f6; } .user-name { font-size: 13px; color: #333; } .status-dot { position: absolute; bottom: 6px; left: 24px; width: 8px; height: 8px; background: #52c41a; border: 1.5px solid #fff; border-radius: 50%; } } } }
.vben-multiple-tabs-container { height: 34px; background: #fff; border-bottom: 1px solid #d9d9d9; display: flex; align-items: center; justify-content: space-between; padding: 0; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03); z-index: 5; .vben-tabs-main { flex: 1; display: flex; align-items: center; padding-left: 10px; gap: 4px; overflow: hidden; .tab-item { height: 26px; line-height: 24px; padding: 0 10px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 2px; font-size: 12px; color: #595959; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; &:hover { color: #0960bd; } &.active { background: #fff; color: #0960bd; border-color: #0960bd; } .tab-dot { width: 6px; height: 6px; background: #0960bd; border-radius: 50%; margin-right: 6px; } .pinned-icon { margin-right: 6px; font-size: 10px; transform: rotate(-45deg); color: #0960bd; } .close-icon { margin-left: 6px; font-size: 10px; border-radius: 50%; padding: 2px; transition: all 0.2s; &:hover { background: #ff4d4f; color: #fff; } } user-select: none; } } .vben-tabs-tools { display: flex; align-items: center; border-left: 1px solid #f0f0f0; padding: 0 4px; .tool-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; font-size: 14px; transition: background 0.3s; border-right: 1px solid #f0f0f0; &:last-child { border-right: none; } &:hover { background: #f6f6f6; color: #0960bd; } } } }
:deep(.vben-context-menu) { min-width: 160px; .ant-dropdown-menu-item { font-size: 13px !important; padding: 6px 16px; display: flex; align-items: center; color: #333; .anticon { margin-right: 8px; font-size: 14px; } } }
.vben-content-wrap { position: relative; padding: 16px; height: calc(100vh - 82px); overflow: auto; background: transparent; &.is-maximized { height: 100vh; padding: 24px; z-index: 9999; } .exit-maximize-btn { position: fixed; top: 20px; right: 20px; width: 40px; height: 40px; background: rgba(0, 0, 0, 0.45); color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; cursor: pointer; z-index: 10000; transition: all 0.3s; backdrop-filter: blur(4px); &:hover { background: #0960bd; transform: scale(1.1); } } }
.hidden-mobile { @media (max-width: 768px) { display: none; } }
</style>