<template>
  <div class="space-y-4">
    <!-- 顶部操作区 -->
    <div class="flex items-center justify-between">
      <div class="flex gap-3">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="输入节点名称、编码或IP搜索"
          allow-clear
          style="width: 320px"
          @search="handleSearch"
        />
        <a-select
          v-model:value="statusFilter"
          placeholder="状态筛选"
          allow-clear
          style="width: 140px"
          @change="handleFilterChange"
        >
          <a-select-option value="">所有</a-select-option>
          <a-select-option value="online">在线</a-select-option>
          <a-select-option value="offline">离线</a-select-option>
        </a-select>
      </div>
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增节点
      </a-button>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredList"
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'address'">
          {{ record.ip }}:{{ record.port }}
        </template>

        <template v-if="column.key === 'nodeType'">
          {{ getNodeTypeText(record.nodeType) }}
        </template>

        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除该节点吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a class="text-red-500">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑 Drawer -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑节点' : '新增节点'"
      width="560"
      @close="resetForm"
    >
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        layout="vertical"
      >
        <a-form-item label="节点编码" name="nodeCode">
          <a-input v-model:value="formState.nodeCode" :disabled="isEdit" placeholder="请输入节点编码" />
        </a-form-item>

        <a-form-item label="节点名称" name="nodeName">
          <a-input v-model:value="formState.nodeName" placeholder="请输入节点名称" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="IP 地址" name="ip">
              <a-input v-model:value="formState.ip" placeholder="请输入IP地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="端口" name="port">
              <a-input-number v-model:value="formState.port" :min="1" :max="65535" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="节点类型" name="nodeType">
          <a-select v-model:value="formState.nodeType" placeholder="请选择节点类型">
            <a-select-option value="center">中心节点</a-select-option>
            <a-select-option value="execution">执行节点</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="所属应用系统" name="appId">
          <a-select v-model:value="formState.appId" placeholder="请选择所属应用">
            <a-select-option v-for="app in appOptions" :key="app.id" :value="app.id">
              {{ app.appName }} ({{ app.appCode }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status" placeholder="请选择状态">
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入节点描述" />
        </a-form-item>

        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="resetForm">取消</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </a-button>
        </div>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType } from 'ant-design-vue';

interface Node {
  id: number;
  nodeCode: string;
  nodeName: string;
  ip: string;
  port: number;
  nodeType: 'center' | 'execution';
  appId: number;
  appName?: string;
  status: 'online' | 'offline';
  description: string;
  createTime: string;
}

interface AppOption {
  id: number;
  appCode: string;
  appName: string;
}

const columns: TableColumnsType = [
  { title: '节点编码', dataIndex: 'nodeCode', key: 'nodeCode', width: 130 },
  { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName', width: 180 },
  { title: 'IP:端口', key: 'address', width: 160 },
  { title: '节点类型', dataIndex: 'nodeType', key: 'nodeType', width: 100 },
  { title: '所属应用', dataIndex: 'appName', key: 'appName', width: 160 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

const searchKeyword = ref('');
const statusFilter = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<Node | null>(null);

const formRef = ref();

const formState = reactive({
  id: 0,
  nodeCode: '',
  nodeName: '',
  ip: '',
  port: 8080,
  nodeType: 'center' as const,
  appId: 0,
  status: 'online' as const,
  description: '',
});

const nodeList = ref<Node[]>([]);

const appOptions = ref<AppOption[]>([
  { id: 1, appCode: 'CORE01', appName: '核心交易系统' },
  { id: 2, appCode: 'IMAGE01', appName: '影像归档系统' },
  { id: 3, appCode: 'RISK01', appName: '风控审批系统' },
]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const filteredList = computed(() => {
  let result = nodeList.value;

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    result = result.filter(item =>
      item.nodeName.toLowerCase().includes(kw) || item.nodeCode.toLowerCase().includes(kw) || item.ip.toLowerCase().includes(kw)
    );
  }

  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value);
  }

  return result;
});

const rules = {
  nodeCode: [{ required: true, message: '请输入节点编码' }],
  nodeName: [{ required: true, message: '请输入节点名称' }],
  ip: [{ required: true, message: '请输入IP地址' }],
};

const getNodeTypeText = (type: string) => {
  return type === 'center' ? '中心节点' : '执行节点';
};

const getStatusColor = (status: string) => {
  return status === 'online' ? 'green' : 'red';
};

const getStatusText = (status: string) => {
  return status === 'online' ? '在线' : '离线';
};

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    nodeList.value = [
      {
        id: 1,
        nodeCode: 'NODE001',
        nodeName: '核心交易中心节点',
        ip: '10.0.1.10',
        port: 8080,
        nodeType: 'center',
        appId: 1,
        appName: '核心交易系统',
        status: 'online',
        description: '核心交易系统中心节点，负责心跳管理和任务分发',
        createTime: '2025-12-01 09:30:00',
      },
      {
        id: 2,
        nodeCode: 'NODE002',
        nodeName: '影像归档执行节点01',
        ip: '10.0.1.20',
        port: 8080,
        nodeType: 'execution',
        appId: 2,
        appName: '影像归档系统',
        status: 'online',
        description: '影像归档执行节点，通过心跳与中心节点保持连接',
        createTime: '2025-12-03 14:15:00',
      },
      {
        id: 3,
        nodeCode: 'NODE003',
        nodeName: '风控审批执行节点01',
        ip: '10.0.1.30',
        port: 8080,
        nodeType: 'execution',
        appId: 3,
        appName: '风控审批系统',
        status: 'offline',
        description: '风控审批执行节点，当前离线',
        createTime: '2025-12-05 11:00:00',
      },
    ];
    pagination.total = nodeList.value.length;
    loading.value = false;
  }, 300);
};

const handleSearch = () => { pagination.current = 1; };

const handleFilterChange = () => { pagination.current = 1; };

const handleTableChange = (pag: any) => { pagination.current = pag.current; };

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  drawerVisible.value = true;
};

const handleEdit = (record: Node) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formState, {
    ...record,
    port: record.port || 8080,
  });
  drawerVisible.value = true;
};

const handleDelete = (record: Node) => {
  nodeList.value = nodeList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    const selectedApp = appOptions.value.find(a => a.id === formState.appId);

    if (isEdit.value && currentRecord.value) {
      const index = nodeList.value.findIndex(item => item.id === currentRecord.value!.id);
      if (index !== -1) {
        nodeList.value[index] = {
          ...formState,
          id: currentRecord.value.id,
          createTime: currentRecord.value.createTime,
          appName: selectedApp?.appName,
        };
      }
      message.success('编辑成功');
    } else {
      const newNode: Node = {
        ...formState,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        appName: selectedApp?.appName,
      };
      nodeList.value.unshift(newNode);
      message.success('新增成功');
    }

    drawerVisible.value = false;
    resetForm();
  } catch (error) {
    console.log('Validation failed:', error);
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  Object.assign(formState, {
    id: 0,
    nodeCode: '',
    nodeName: '',
    ip: '',
    port: 8080,
    nodeType: 'center',
    appId: 0,
    status: 'online',
    description: '',
  });
  currentRecord.value = null;
  isEdit.value = false;
};

onMounted(() => {
  loadData();
});
</script>