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
  const data = await getNodeList();
  nodes.value = data;
});
</script>