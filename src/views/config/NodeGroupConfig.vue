<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="输入节点组名称搜索"
        allow-clear
        style="width: 320px"
        @search="handleSearch"
      />
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增节点组
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
        <template v-if="column.key === 'nodeCount'">
          {{ record.nodeIds?.length || 0 }} 个节点
        </template>

        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除该节点组吗？"
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
      :title="isEdit ? '编辑节点组' : '新增节点组'"
      width="620"
      @close="resetForm"
    >
      <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="节点组名称" name="groupName">
          <a-input v-model:value="formState.groupName" placeholder="请输入节点组名称" />
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入描述" />
        </a-form-item>

        <a-form-item label="包含节点" name="nodeIds">
          <a-select
            v-model:value="formState.nodeIds"
            mode="multiple"
            placeholder="请选择节点"
            style="width: 100%"
          >
            <a-select-option v-for="node in availableNodes" :key="node.id" :value="node.id">
              {{ node.nodeName }} ({{ node.nodeCode }})
            </a-select-option>
          </a-select>
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

interface NodeGroup {
  id: number;
  groupName: string;
  description: string;
  nodeIds: number[];
  status: 'active' | 'inactive';
  createTime: string;
}

interface NodeOption {
  id: number;
  nodeCode: string;
  nodeName: string;
}

const columns: TableColumnsType = [
  { title: '节点组名称', dataIndex: 'groupName', key: 'groupName', width: 200 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '包含节点', key: 'nodeCount', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

const searchKeyword = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<NodeGroup | null>(null);

const formRef = ref();

const formState = reactive({
  id: 0,
  groupName: '',
  description: '',
  nodeIds: [] as number[],
  status: true,
});

const groupList = ref<NodeGroup[]>([]);

const availableNodes = ref<NodeOption[]>([
  { id: 1, nodeCode: 'NODE001', nodeName: '中心节点-北京' },
  { id: 2, nodeCode: 'NODE002', nodeName: '执行节点-上海' },
  { id: 3, nodeCode: 'NODE003', nodeName: '执行节点-广州' },
]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const filteredList = computed(() => {
  if (!searchKeyword.value) return groupList.value;
  const kw = searchKeyword.value.toLowerCase();
  return groupList.value.filter(item => item.groupName.toLowerCase().includes(kw));
});

const rules = {
  groupName: [{ required: true, message: '请输入节点组名称' }],
};

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    groupList.value = [
      {
        id: 1,
        groupName: '核心交易节点组',
        description: '包含中心节点和执行节点，用于核心交易场景',
        nodeIds: [1, 2],
        status: 'active',
        createTime: '2025-12-01 10:00:00',
      },
      {
        id: 2,
        groupName: '影像归档节点组',
        description: '影像归档相关执行节点',
        nodeIds: [3],
        status: 'active',
        createTime: '2025-12-05 15:30:00',
      },
    ];
    pagination.total = groupList.value.length;
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

const handleEdit = (record: NodeGroup) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formState, {
    ...record,
    status: record.status === 'active',
  });
  drawerVisible.value = true;
};

const handleDelete = (record: NodeGroup) => {
  groupList.value = groupList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (isEdit.value && currentRecord.value) {
      const index = groupList.value.findIndex(item => item.id === currentRecord.value!.id);
      if (index !== -1) {
        groupList.value[index] = {
          ...formState,
          id: currentRecord.value.id,
          createTime: currentRecord.value.createTime,
          status: formState.status ? 'active' : 'inactive',
        };
      }
      message.success('编辑成功');
    } else {
      const newGroup: NodeGroup = {
        ...formState,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        status: formState.status ? 'active' : 'inactive',
      };
      groupList.value.unshift(newGroup);
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
    groupName: '',
    description: '',
    nodeIds: [],
    status: true,
  });
  currentRecord.value = null;
  isEdit.value = false;
};

onMounted(() => {
  loadData();
});
</script>