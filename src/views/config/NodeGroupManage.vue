<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">节点组管理</h2>
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增节点组
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="nodeGroupList"
      :loading="loading"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '停用' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定删除该节点组吗？" @confirm="handleDelete(record)">
              <a class="text-red-500">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑 Drawer -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑节点组' : '新增节点组'"
      width="520"
      @close="resetForm"
    >
      <a-form :model="form" layout="vertical">
        <!-- 关键：必须选择应用系统 -->
        <a-form-item label="所属应用系统" required>
          <a-select
            v-model:value="form.appSystemId"
            placeholder="请选择应用系统"
            :disabled="isEdit"
          >
            <a-select-option v-for="app in appSystemList" :key="app.id" :value="app.id">
              {{ app.appName }} ({{ app.appCode }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="节点组编码" required>
          <a-input v-model:value="form.groupCode" :disabled="isEdit" />
        </a-form-item>

        <a-form-item label="节点组名称" required>
          <a-input v-model:value="form.groupName" />
        </a-form-item>

        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>

        <div class="flex justify-end gap-2 mt-4">
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" @click="handleSubmit">保存</a-button>
        </div>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const columns = [
  { title: '节点组名称', dataIndex: 'groupName', key: 'groupName' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 120 }
];

const nodeGroupList = ref<any[]>([]);
const appSystemList = ref<any[]>([]);
const loading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const form = reactive({
  appSystemId: null as number | null,
  groupCode: '',
  groupName: '',
  status: 1,
  description: ''
});

// 获取应用系统列表
const fetchAppSystems = async () => {
  try {
    const res = await axios.get(`${API_BASE}/app-system/list`);
    appSystemList.value = res.data.result || [];
  } catch (e) {
    message.error('获取应用系统失败');
  }
};

// 获取节点组列表 (真实后端)
const fetchNodeGroups = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/node-group/list`);
    nodeGroupList.value = res.data.result || [];
  } catch (e) {
    message.error('获取节点组失败');
  } finally {
    loading.value = false;
  }
};

// 新增节点组
const handleAdd = () => {
  if (appSystemList.value.length === 0) {
    message.error('目前没有应用系统，请先添加应用系统');
    return;
  }

  isEdit.value = false;
  currentId.value = null;
  Object.assign(form, {
    appSystemId: null,
    groupCode: '',
    groupName: '',
    status: 1,
    description: ''
  });
  drawerVisible.value = true;
};

// 编辑
const handleEdit = (record: any) => {
  isEdit.value = true;
  currentId.value = record.id;
  Object.assign(form, record);
  drawerVisible.value = true;
};

// 删除
const handleDelete = async (record: any) => {
  try {
    await axios.delete(`${API_BASE}/node-group/${record.id}`);
    message.success('删除成功');
    fetchNodeGroups();
  } catch (e) {
    message.error('删除失败');
  }
};

// 保存
const handleSubmit = async () => {
  if (!form.appSystemId || !form.groupCode || !form.groupName) {
    message.error('所属应用系统、节点组编码和名称不能为空');
    return;
  }

  try {
    if (isEdit.value && currentId.value) {
      await axios.put(`${API_BASE}/node-group/${currentId.value}`, form);
      message.success('更新成功');
    } else {
      await axios.post(`${API_BASE}/node-group`, form);
      message.success('新增成功');
    }
    drawerVisible.value = false;
    fetchNodeGroups();
  } catch (e: any) {
    message.error(e.response?.data?.message || '操作失败');
  }
};

const resetForm = () => {
  // drawer close 时重置
};

onMounted(() => {
  fetchAppSystems();
  fetchNodeGroups();
});
</script>