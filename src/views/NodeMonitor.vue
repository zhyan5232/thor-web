<template>
  <div class="p-4">
    <a-card title="传输节点在线状态" :bordered="false">
      <a-table :columns="columns" :data-source="nodes" row-key="id">
        <template #bodyCell="{ column, text }">
          <template v-if="column.key === 'status'">
            <a-tag :color="text === 'ONLINE' ? 'green' : 'red'">{{ text }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getNodeList, ThorNode } from '@/api/node';

const nodes = ref<ThorNode[]>([]);

const columns = [
  { title: '节点名称', dataKey: 'nodeName', dataIndex: 'nodeName' },
  { title: 'IP地址', dataIndex: 'ipAddress' },
  { title: '端口', dataIndex: 'port' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '最后心跳', dataIndex: 'lastHeartbeat' },
];

onMounted(async () => {
  try {
    const data = await getNodeList();
    // 确保拿到的是数组，防止后端乱返回导致 table 崩溃
    nodes.value = data || [];
  } catch (error) {
    // 拦截掉异常，防止 Vue 报 Unhandled error
    // 注意：这里的 catch 不需要写 message.error，因为你的 src/utils/http.ts 拦截器里已经统一处理过错误弹窗了！
    console.warn('节点列表获取失败，后端服务可能未启动:', error);
  }
});
</script>