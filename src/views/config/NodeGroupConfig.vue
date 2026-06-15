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
          <a-popover placement="right" trigger="hover">
            <template #content>
              <div v-if="getNodeNames(record.nodeIds).length > 0" class="min-w-[180px]">
                <div v-for="name in getNodeNames(record.nodeIds)" :key="name" class="py-0.5">
                  {{ name }}
                </div>
              </div>
              <div v-else class="text-gray-400">暂无节点</div>
            </template>
            <span class="cursor-pointer text-blue-600 hover:underline">
              {{ record.nodeIds?.length || 0 }} 个节点
            </span>
          </a-popover>
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

    <!-- 新增/编辑抽屉 -->
    <a-drawer v-model:open="drawerVisible" :title="isEdit ? '编辑节点组' : '新增节点组'" width="620" @close="resetForm">
      <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="节点组名称" name="groupName">
          <a-input v-model:value="formState.groupName" placeholder="请输入节点组名称" />
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入描述" />
        </a-form-item>

        <!-- 关联节点 -->
        <a-form-item label="关联节点">
          <div class="flex items-center gap-2">
            <a-button @click="showNodeModal">关联节点</a-button>
            <span v-if="formState.nodeIds.length > 0" class="text-sm text-gray-500">
              已选择 {{ formState.nodeIds.length }} 个节点
            </span>
          </div>
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

    <!-- 关联节点弹窗（美化竖版样式） -->
    <a-modal
      v-model:open="nodeModalVisible"
      title="关联节点"
      width="480"
      @ok="confirmNodeSelection"
      @cancel="nodeModalVisible = false"
      ok-text="确认"
      cancel-text="取消"
    >
      <div class="max-h-[420px] overflow-auto pr-1">
        <div class="space-y-1">
          <div
            v-for="node in availableNodes"
            :key="node.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-50"
            @click="toggleNodeSelection(node.id)"
          >
            <a-checkbox
              :checked="tempSelectedNodeIds.includes(node.id)"
              @change="toggleNodeSelection(node.id)"
              @click.stop
            />
            <div class="flex-1 text-sm">
              <div class="font-medium text-slate-700">{{ node.nodeName }}</div>
              <div class="text-xs text-slate-400">{{ node.nodeCode }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
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
  { title: '关联节点', key: 'nodeCount', width: 140 },
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

// 临时选中节点（用于弹窗）
const tempSelectedNodeIds = ref<number[]>([]);
const nodeModalVisible = ref(false);

const groupList = ref<NodeGroup[]>([]);

const availableNodes = ref<NodeOption[]>([
  { id: 1, nodeCode: 'NODE001', nodeName: '核心交易中心节点' },
  { id: 2, nodeCode: 'NODE002', nodeName: '影像归档执行节点01' },
  { id: 3, nodeCode: 'NODE003', nodeName: '风控审批执行节点01' },
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

// 获取节点名称
const getNodeNames = (nodeIds: number[]) => {
  if (!nodeIds || nodeIds.length === 0) return [];
  return nodeIds
    .map(id => availableNodes.value.find(n => n.id === id)?.nodeName)
    .filter(Boolean) as string[];
};

// 切换节点选中状态
const toggleNodeSelection = (nodeId: number) => {
  const index = tempSelectedNodeIds.value.indexOf(nodeId);
  if (index > -1) {
    tempSelectedNodeIds.value.splice(index, 1);
  } else {
    tempSelectedNodeIds.value.push(nodeId);
  }
};

// 打开关联节点弹窗
const showNodeModal = () => {
  tempSelectedNodeIds.value = [...formState.nodeIds];
  nodeModalVisible.value = true;
};

// 确认关联节点
const confirmNodeSelection = () => {
  formState.nodeIds = [...tempSelectedNodeIds.value];
  nodeModalVisible.value = false;
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