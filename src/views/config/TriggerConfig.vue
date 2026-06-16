<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="输入触发器名称搜索"
        allow-clear
        style="width: 320px"
        @search="handleSearch"
      />
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增触发器
      </a-button>
    </div>

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
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除该触发器吗？"
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

    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑触发器' : '新增触发器'"
      width="560"
      @close="resetForm"
    >
      <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="触发器名称" name="triggerName">
          <a-input v-model:value="formState.triggerName" placeholder="请输入触发器名称" />
        </a-form-item>

        <a-form-item label="触发类型" name="triggerType">
          <a-select v-model:value="formState.triggerType">
            <a-select-option value="schedule">定时触发</a-select-option>
            <a-select-option value="file_arrival">文件到达触发</a-select-option>
            <a-select-option value="manual">手动触发</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="formState.triggerType === 'schedule'" label="Cron表达式" name="cronExpression">
          <a-input v-model:value="formState.cronExpression" placeholder="例如：0 0 * * *" />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status">
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="备注" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" />
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

interface Trigger {
  id: number;
  triggerName: string;
  triggerType: string;
  cronExpression: string;
  status: 'active' | 'inactive';
  description: string;
  createTime: string;
}

const columns: TableColumnsType = [
  { title: '触发器名称', dataIndex: 'triggerName', key: 'triggerName', width: 180 },
  { title: '触发类型', dataIndex: 'triggerType', key: 'triggerType', width: 140 },
  { title: 'Cron表达式', dataIndex: 'cronExpression', key: 'cronExpression', width: 160 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

const searchKeyword = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<Trigger | null>(null);

const formRef = ref();

const formState = reactive({
  id: 0,
  triggerName: '',
  triggerType: 'schedule',
  cronExpression: '',
  status: 'active' as const,
  description: '',
});

const triggerList = ref<Trigger[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const filteredList = computed(() => {
  if (!searchKeyword.value) return triggerList.value;
  const kw = searchKeyword.value.toLowerCase();
  return triggerList.value.filter(item => item.triggerName.toLowerCase().includes(kw));
});

const rules = {
  triggerName: [{ required: true, message: '请输入触发器名称' }],
};

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    triggerList.value = [
      { id: 1, triggerName: '每日凌晨全量同步', triggerType: 'schedule', cronExpression: '0 0 * * *', status: 'active', description: '每天凌晨执行全量文件同步', createTime: '2025-12-01 09:00:00' },
      { id: 2, triggerName: '文件到达触发', triggerType: 'file_arrival', cronExpression: '', status: 'active', description: '当指定目录有新文件到达时触发', createTime: '2025-12-05 11:30:00' },
      { id: 3, triggerName: '手动触发测试', triggerType: 'manual', cronExpression: '', status: 'inactive', description: '手动执行的测试触发器', createTime: '2025-12-08 14:00:00' },
    ];
    pagination.total = triggerList.value.length;
    loading.value = false;
  }, 300);
};

const handleSearch = () => { pagination.current = 1; };

const handleTableChange = (pag: any) => { pagination.current = pag.current; };

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  drawerVisible.value = true;
};

const handleEdit = (record: Trigger) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formState, record);
  drawerVisible.value = true;
};

const handleDelete = (record: Trigger) => {
  triggerList.value = triggerList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (isEdit.value && currentRecord.value) {
      const index = triggerList.value.findIndex(item => item.id === currentRecord.value!.id);
      if (index !== -1) {
        triggerList.value[index] = { ...formState, id: currentRecord.value.id, createTime: currentRecord.value.createTime };
      }
      message.success('编辑成功');
    } else {
      const newTrigger: Trigger = {
        ...formState,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
      };
      triggerList.value.unshift(newTrigger);
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
    triggerName: '',
    triggerType: 'schedule',
    cronExpression: '',
    status: 'active',
    description: '',
  });
  currentRecord.value = null;
  isEdit.value = false;
};

onMounted(() => {
  loadData();
});
</script>