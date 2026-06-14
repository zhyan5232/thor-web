<template>
  <div class="space-y-4">
    <!-- 顶部操作区 -->
    <div class="flex items-center justify-between">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="输入应用名称搜索"
        allow-clear
        style="width: 320px"
        @search="handleSearch"
      />
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增应用
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
        <template v-if="column.key === 'status'">
          <a-switch
            v-model:checked="record.status"
            checked-children="启用"
            un-checked-children="禁用"
            @change="(checked) => handleStatusChange(record, checked)"
          />
        </template>

        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除该应用吗？"
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
      :title="isEdit ? '编辑应用' : '新增应用'"
      width="520"
      @close="resetForm"
    >
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        layout="vertical"
      >
        <a-form-item label="应用编码" name="appCode">
          <a-input v-model:value="formState.appCode" :disabled="isEdit" placeholder="请输入应用编码" />
        </a-form-item>

        <a-form-item label="应用名称" name="appName">
          <a-input v-model:value="formState.appName" placeholder="请输入应用名称" />
        </a-form-item>

        <a-form-item label="应用描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入应用描述" />
        </a-form-item>

        <a-form-item label="负责人" name="owner">
          <a-input v-model:value="formState.owner" placeholder="请输入负责人" />
        </a-form-item>

        <a-form-item label="联系方式" name="contact">
          <a-input v-model:value="formState.contact" placeholder="请输入联系方式" />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-switch v-model:checked="formState.status" checked-children="启用" un-checked-children="禁用" />
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

interface AppSystem {
  id: number;
  appCode: string;
  appName: string;
  description: string;
  owner: string;
  contact: string;
  status: boolean;
  createTime: string;
}

const columns: TableColumnsType = [
  { title: '应用编码', dataIndex: 'appCode', key: 'appCode', width: 140 },
  { title: '应用名称', dataIndex: 'appName', key: 'appName', width: 200 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 120 },
  { title: '联系方式', dataIndex: 'contact', key: 'contact', width: 140 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' },
];

const searchKeyword = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<AppSystem | null>(null);

const formRef = ref();

const formState = reactive({
  id: 0,
  appCode: '',
  appName: '',
  description: '',
  owner: '',
  contact: '',
  status: true,
});

const appList = ref<AppSystem[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const filteredList = computed(() => {
  if (!searchKeyword.value) return appList.value;
  const keyword = searchKeyword.value.toLowerCase();
  return appList.value.filter(item =>
    item.appName.toLowerCase().includes(keyword) ||
    item.appCode.toLowerCase().includes(keyword)
  );
});

const rules = {
  appCode: [{ required: true, message: '请输入应用编码' }],
  appName: [{ required: true, message: '请输入应用名称' }],
  owner: [{ required: true, message: '请输入负责人' }],
};

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    appList.value = [
      { id: 1, appCode: 'APP001', appName: '核心交易系统', description: '负责核心交易流水处理', owner: '张三', contact: '13800138000', status: true, createTime: '2025-12-01 10:30:00' },
      { id: 2, appCode: 'APP002', appName: '影像归档系统', description: '客户图像与文档归档管理', owner: '李四', contact: '13900139000', status: true, createTime: '2025-12-05 14:20:00' },
      { id: 3, appCode: 'APP003', appName: '风控中心', description: '风险控制与审批流程', owner: '王五', contact: '13700137000', status: false, createTime: '2025-12-10 09:15:00' },
    ];
    pagination.total = appList.value.length;
    loading.value = false;
  }, 300);
};

const handleSearch = () => { pagination.current = 1; };

const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  drawerVisible.value = true;
};

const handleEdit = (record: AppSystem) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formState, record);
  drawerVisible.value = true;
};

const handleDelete = (record: AppSystem) => {
  appList.value = appList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleStatusChange = (record: AppSystem, checked: boolean) => {
  record.status = checked;
  message.success(`应用已${checked ? '启用' : '禁用'}`);
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (isEdit.value && currentRecord.value) {
      const index = appList.value.findIndex(item => item.id === currentRecord.value!.id);
      if (index !== -1) {
        appList.value[index] = { ...formState, id: currentRecord.value.id, createTime: currentRecord.value.createTime };
      }
      message.success('编辑成功');
    } else {
      const newApp: AppSystem = { ...formState, id: Date.now(), createTime: new Date().toLocaleString() };
      appList.value.unshift(newApp);
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
  Object.assign(formState, { id: 0, appCode: '', appName: '', description: '', owner: '', contact: '', status: true });
  currentRecord.value = null;
  isEdit.value = false;
};

onMounted(() => { loadData(); });
</script>