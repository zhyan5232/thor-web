<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">应用系统管理</h1>
        <p class="text-sm text-slate-500 mt-1">管理所有需要进行文件传输的上游应用系统</p>
      </div>
      <a-button type="primary" size="large" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增应用系统
      </a-button>
    </div>

    <!-- 主要内容卡片 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-6">
        <a-table
          :columns="columns"
          :data-source="appSystemList"
          :loading="loading"
          :pagination="{ pageSize: 10, showSizeChanger: true }"
          size="middle"
          class="app-system-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 1 ? 'success' : 'error'" class="px-3 py-0.5">
                {{ record.status === 1 ? '启用' : '停用' }}
              </a-tag>
            </template>

            <template v-if="column.key === 'action'">
              <div class="flex gap-3">
                <a @click="handleEdit(record)" class="text-blue-600 hover:text-blue-700">编辑</a>
                <a-popconfirm
                  title="确定要删除该应用系统吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDelete(record)"
                >
                  <a class="text-red-500 hover:text-red-600">删除</a>
                </a-popconfirm>
              </template>
            </div>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 新增/编辑 Drawer -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑应用系统' : '新增应用系统'"
      width="560"
      :body-style="{ paddingBottom: '80px' }"
    >
      <a-form :model="form" layout="vertical" class="mt-2">
        <a-form-item label="应用系统编码" required>
          <a-input v-model:value="form.appCode" :disabled="isEdit" placeholder="请输入唯一编码（如 CBS、ERP）" />
        </a-form-item>

        <a-form-item label="应用系统名称" required>
          <a-input v-model:value="form.appName" placeholder="请输入应用系统显示名称" />
        </a-form-item>

        <a-form-item label="状态" required>
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea
            v-model:value="form.description"
            :rows="4"
            placeholder="请输入应用系统描述信息（可选）"
          />
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
  { title: '应用系统编码', dataIndex: 'appCode', key: 'appCode', width: 180 },
  { title: '应用系统名称', dataIndex: 'appName', key: 'appName', width: 220 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
];

// 数据
const appSystemList = ref<any[]>([]);
const loading = ref(false);

// Drawer 状态
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

// 表单
const form = reactive({
  appCode: '',
  appName: '',
  status: 1,
  description: ''
});

// 获取应用系统列表
const fetchAppSystemList = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/app-system/list`);
    appSystemList.value = res.data.result || [];
  } catch (error) {
    message.error('获取应用系统列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 新增应用系统
const handleAdd = () => {
  isEdit.value = false;
  currentId.value = null;
  Object.assign(form, { appCode: '', appName: '', status: 1, description: '' });
  drawerVisible.value = true;
};

// 编辑应用系统
const handleEdit = (record: any) => {
  isEdit.value = true;
  currentId.value = record.id;
  Object.assign(form, record);
  drawerVisible.value = true;
};

// 删除应用系统
const handleDelete = async (record: any) => {
  try {
    await axios.delete(`${API_BASE}/app-system/${record.id}`);
    message.success('删除成功');
    fetchAppSystemList();
  } catch (error) {
    message.error('删除失败');
  }
};

// 提交（新增或编辑）
const handleSubmit = async () => {
  if (!form.appCode || !form.appName) {
    message.error('应用系统编码和名称不能为空');
    return;
  }

  try {
    if (isEdit.value && currentId.value) {
      await axios.put(`${API_BASE}/app-system/${currentId.value}`, form);
      message.success('编辑成功');
    } else {
      await axios.post(`${API_BASE}/app-system`, form);
      message.success('新增成功');
    }
    drawerVisible.value = false;
    fetchAppSystemList();
  } catch (error: any) {
    message.error(error.response?.data?.message || '操作失败');
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchAppSystemList();
});
</script>

<style scoped>
.app-system-table {
  .ant-table-thead > tr > th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #334155;
  }
}
</style>