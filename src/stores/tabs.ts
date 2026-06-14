import { defineStore } from 'pinia';

interface TabItem {
  key: string;        // 路由 path
  title: string;      // 显示的标签名称
  closable?: boolean;
}

interface TabsState {
  tabs: TabItem[];
  activeKey: string;
}

export const useTabsStore = defineStore('tabs', {
  state: (): TabsState => ({
    tabs: [
      { key: '/monitor/realtime', title: '实时监控', closable: false }
    ],
    activeKey: '/monitor/realtime'
  }),

  actions: {
    // 添加或激活标签
    addTab(tab: TabItem) {
      const exists = this.tabs.findIndex(t => t.key === tab.key);
      if (exists === -1) {
        this.tabs.push(tab);
      }
      this.activeKey = tab.key;
    },

    // 关闭标签
    closeTab(key: string) {
      if (this.tabs.length === 1) return; // 至少保留一个标签

      const index = this.tabs.findIndex(t => t.key === key);
      if (index === -1) return;

      const isActive = this.activeKey === key;
      this.tabs.splice(index, 1);

      // 如果关闭的是当前激活标签，则切换到前一个
      if (isActive) {
        const newIndex = Math.max(0, index - 1);
        this.activeKey = this.tabs[newIndex].key;
      }
    },

    // 关闭其他标签
    closeOthers(key: string) {
      this.tabs = this.tabs.filter(t => t.key === key || !t.closable);
      this.activeKey = key;
    },

    // 关闭全部标签（保留首页）
    closeAll() {
      this.tabs = this.tabs.filter(t => !t.closable);
      if (this.tabs.length > 0) {
        this.activeKey = this.tabs[0].key;
      }
    },

    // 切换标签
    switchTab(key: string) {
      this.activeKey = key;
    }
  }
});