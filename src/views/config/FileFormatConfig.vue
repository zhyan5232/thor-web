<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="输入格式名称搜索"
        allow-clear
        style="width: 320px"
        @search="handleSearch"
      />
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增格式
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
              title="确定要删除该格式吗？"
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
      :title="isEdit ? '编辑文件格式' : '新增文件格式'"
      width="560"
      @close="resetForm"
    >
      <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="格式名称" name="formatName">
          <a-input v-model:value="formState.formatName" placeholder="请输入格式名称" />
        </a-form-item>

        <a-form-item label="分隔符" name="delimiter">
          <a-input v-model:value="formState.delimiter" placeholder="例如：, | ;" />
        </a-form-item>

        <a-form-item label="文件编码" name="encoding">
          <a-select v-model:value="formState.encoding">
            <a-select-option value="UTF-8">UTF-8</a-select-option>
            <a-select-option value="GBK">GBK</a-select-option>
            <a-select-option value="GB2312">GB2312</a-select-option>
          </a-select>
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

interface FileFormat {
  id: number;
  formatName: string;
  delimiter: string;
  encoding: string;
  status: 'active' | 'inactive';
  description: string;
  createTime: string;
}

const columns: TableColumnsType = [
  { title: '格式名称', dataIndex: 'formatName', key: 'formatName', width: 180 },
  { title: '分隔符', dataIndex: 'delimiter', key: 'delimiter', width: 120 },
  { title: '编码', dataIndex: 'encoding', key: 'encoding', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

const searchKeyword = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<FileFormat | null>(null);

const formRef = ref();

const formState = reactive({
  id: 0,
  formatName: '',
  delimiter: ',',
  encoding: 'UTF-8',
  status: 'active' as const,
  description: '',
});

const formatList = ref<FileFormat[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const filteredList = computed(() => {
  if (!searchKeyword.value) return formatList.value;
  const kw = searchKeyword.value.toLowerCase();
  return formatList.value.filter(item => item.formatName.toLowerCase().includes(kw));
});

const rules = {
  formatName: [{ required: true, message: '请输入格式名称' }],
};

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    formatList.value = [
      { id: 1, formatName: '标准CSV格式', delimiter: ',', encoding: 'UTF-8', status: 'active', description: '标准逗号分隔CSV文件', createTime: '2025-12-01 10:00:00' },
      { id: 2, formatName: '固定长度格式', delimiter: '|', encoding: 'GBK', status: 'active', description: '银行流水固定长度文件', createTime: '2025-12-05 14:30:00' },
      { id: 3, formatName: 'JSON格式', delimiter: '', encoding: 'UTF-8', status: 'inactive', description: 'JSON格式文件', createTime: '2025-12-08 09:15:00' },
    ];
    pagination.total = formatList.value.length;
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

const handleEdit = (record: FileFormat) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formState, record);
  drawerVisible.value = true;
};

const handleDelete = (record: FileFormat) => {
  formatList.value = formatList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (isEdit.value && currentRecord.value) {
      const index = formatList.value.findIndex(item => item.id === currentRecord.value!.id);
      if (index !== -1) {
        formatList.value[index] = { ...formState, id: currentRecord.value.id, createTime: currentRecord.value.createTime };
      }
      message.success('编辑成功');
    } else {
      const newFormat: FileFormat = {
        ...formState,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
      };
      formatList.value.unshift(newFormat);
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
    formatName: '',
    delimiter: ',',
    encoding: 'UTF-8',
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