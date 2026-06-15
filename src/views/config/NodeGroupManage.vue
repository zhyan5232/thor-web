<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">节点组管理</h1>
        <p class="text-sm text-slate-500 mt-1">管理节点组，节点组必须属于某个应用系统</p>
      </div>
      <a-button type="primary" size="large" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增节点组
      </a-button>
    </div>

    <!-- 应用系统筛选 -->
    <div class="mb-4 flex items-center gap-4">
      <span class="text-sm text-slate-600">所属应用系统：</span>
      <a-select
        v-model:value="selectedAppSystemId"
        placeholder="全部应用系统"
        style="width: 240px"
        allow-clear
        @change="fetchNodeGroupList"
      >
        <a-select-option v-for="app in appSystemList" :key="app.id" :value="app.id">
          {{ app.appName }} ({{ app.appCode }})
        </a-select-option>
      </a-select>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-6">
        <a-table
          :columns="columns"
          :data-source="nodeGroupList"
          :loading="loading"
          :pagination="{ pageSize: 10 }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 1 ? 'success' : 'error'">
                {{ record.status === 1 ? '启用' : '停用' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <div class="flex gap-3">
                <a @click="handleEdit(record)">编辑</a>
                <a-popconfirm title="确定删除该节点组吗？" @confirm="handleDelete(record)">
                  <a class="text-red-500">删除</a>
                </a-popconfirm>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 新增/编辑 Drawer -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑节点组' : '新增节点组'"
      width="560"
    >
      <a-form :model="form" layout="vertical" class="mt-2">
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
          <a-input v-model:value="form.groupCode" :disabled="isEdit" placeholder="请输入节点组编码" />
        </a-form-item>

        <a-form-item label="节点组名称" required>
          <a-input v-model:value="form.groupName" placeholder="请输入节点组名称" />
        </a-form-item>

        <a-form-item label="状态" required>
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea v-model:value="form.description" :rows="3" placeholder="可选" />
        </a-form-item>
      </a-form>

      <div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end gap-3">
        <a-button @click="drawerVisible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmit">保存</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import axios from 'axios';

// 后端接口基础地址
const API_BASE = 'http://localhost:8080/api';

// 表格列定义
const columns = [
  { title: '节点组编码', dataIndex: 'groupCode', key: 'groupCode', width: 160 },
  { title: '节点组名称', dataIndex: 'groupName', key: 'groupName', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', width: 140 }
];

// 数据
const nodeGroupList = ref<any[]>([]);
const appSystemList = ref<any[]>([]);
const loading = ref(false);
const selectedAppSystemId = ref<number | null>(null);

// Drawer 状态
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

// 表单
const form = reactive({
  appSystemId: null as number | null,
  groupCode: '',
  groupName: '',
  status: 1,
  description: ''
});

// 获取应用系统列表
const fetchAppSystemList = async () => {
  try {
    const res = await axios.get(`${API_BASE}/app-system/list`);
    appSystemList.value = res.data.result || [];
  } catch (error) {
    message.error('获取应用系统列表失败');
  }
};

// 获取节点组列表
const fetchNodeGroupList = async () => {
  loading.value = true;
  try {
    let url = `${API_BASE}/node-group/list`;
    if (selectedAppSystemId.value) {
      url += `?appSystemId=${selectedAppSystemId.value}`;
    }
    const res = await axios.get(url);
    nodeGroupList.value = res.data.result || [];
  } catch (error) {
    message.error('获取节点组列表失败');
  } finally {
    loading.value = false;
  }
};

// 新增节点组
const handleAdd = () => {
  isEdit.value = false;
  currentId.value = null;
  Object.assign(form, {
    appSystemId: selectedAppSystemId.value || null,
    groupCode: '',
    groupName: '',
    status: 1,
    description: ''
  });
  drawerVisible.value = true;
};

// 编辑节点组
const handleEdit = (record: any) => {
  isEdit.value = true;
  currentId.value = record.id;
  Object.assign(form, record);
  drawerVisible.value = true;
};

// 删除节点组
const handleDelete = async (record: any) => {
  try {
    await axios.delete(`${API_BASE}/node-group/${record.id}`);
    message.success('删除成功');
    fetchNodeGroupList();
  } catch (error) {
    message.error('删除失败');
  }
};

// 提交
const handleSubmit = async () => {
  if (!form.appSystemId || !form.groupCode || !form.groupName) {
    message.error('应用系统、节点组编码和名称不能为空');
    return;
  }

  try {
    if (isEdit.value && currentId.value) {
      await axios.put(`${API_BASE}/node-group/${currentId.value}`, form);
      message.success('编辑成功');
    } else {
      await axios.post(`${API_BASE}/node-group`, form);
      message.success('新增成功');
    }
    drawerVisible.value = false;
    fetchNodeGroupList();
  } catch (error: any) {
    message.error(error.response?.data?.message || '操作失败');
  }
};

// 页面加载
onMounted(() => {
  fetchAppSystemList();
  fetchNodeGroupList();
});
</script>