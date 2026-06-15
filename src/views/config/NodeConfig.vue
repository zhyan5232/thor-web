<template>
  <div class="p-4 h-[calc(100vh-64px)] flex flex-col">
    <!-- 页面标题 -->
    <div class="mb-3 flex-shrink-0">
      <h2 class="text-lg font-semibold text-slate-800">节点管理</h2>
      <p class="text-xs text-slate-500 mt-0.5">管理节点组下的节点信息</p>
    </div>

    <div class="flex gap-3 flex-1 min-h-0">
      <!-- 左侧节点组 -->
      <div class="w-52 flex-shrink-0">
        <a-card title="节点组" class="h-full" :bordered="false" body-style="padding: 8px 12px;">
          <div class="space-y-0.5">
            <div
              v-for="group in nodeGroups"
              :key="group.id"
              class="px-3 py-2 rounded-md cursor-pointer text-sm transition-all"
              :class="selectedGroupId === group.id 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'hover:bg-slate-50 text-slate-600'"
              @click="selectGroup(group)"
            >
              {{ group.groupName }}
            </div>
          </div>
        </a-card>
      </div>

      <!-- 右侧内容区 -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- 查询区域 -->
        <a-card class="mb-3 flex-shrink-0" :bordered="false" body-style="padding: 12px 16px;">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-x-3 gap-y-2 items-end">
            <div>
              <div class="text-[11px] text-slate-500 mb-0.5">节点名称 / IP</div>
              <a-input-search v-model:value="searchKeyword" placeholder="请输入节点名称或IP" allow-clear size="small" />
            </div>
            <div>
              <div class="text-[11px] text-slate-500 mb-0.5">节点类型</div>
              <a-select v-model:value="nodeTypeFilter" placeholder="全部" allow-clear size="small" style="width: 100%">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="normal">一般节点</a-select-option>
                <a-select-option value="sync">同步节点</a-select-option>
              </a-select>
            </div>
            <div>
              <div class="text-[11px] text-slate-500 mb-0.5">状态</div>
              <a-select v-model:value="statusFilter" placeholder="全部" allow-clear size="small" style="width: 100%">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="active">启动</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
              </a-select>
            </div>
            <div class="md:col-span-2 flex gap-2">
              <a-button type="primary" size="small" @click="handleSearch">查询</a-button>
              <a-button size="small" @click="resetFilters">重置</a-button>
            </div>
          </div>
        </a-card>

        <!-- 操作栏 + 表格 -->
        <a-card class="flex-1 flex flex-col min-h-0" :bordered="false" body-style="padding: 0; display: flex; flex-direction: column;">
          <!-- 操作栏 -->
          <div class="flex justify-between items-center px-4 py-2 border-b flex-shrink-0">
            <a-button type="primary" size="small" :disabled="!selectedGroupId" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新增节点
            </a-button>
            <div class="text-xs text-slate-500">
              当前节点组：{{ currentGroupName || '未选择' }}
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="flex-1 min-h-0 p-1">
            <a-table
              :columns="columns"
              :data-source="filteredList"
              :pagination="pagination"
              :loading="loading"
              row-key="id"
              size="small"
              @change="handleTableChange"
              class="h-full"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'nodeType'">
                  {{ getNodeTypeText(record.nodeType) }}
                </template>
                <template v-if="column.key === 'transferType'">
                  {{ getTransferTypeText(record.transferType) }}
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'" size="small">
                    {{ record.status === 'active' ? '启动' : '停用' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space size="small">
                    <a @click="handleEdit(record)">编辑</a>
                    <a-popconfirm title="确定要删除该节点吗？" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)">
                      <a class="text-red-500">删除</a>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType } from 'ant-design-vue';

interface Node {
  id: number;
  nodeName: string;
  ip: string;
  port: number;
  nodeType: 'normal' | 'sync';
  nodeGroupId?: number;
  transferType?: 'self' | 'proxy';
  status: 'active' | 'inactive';
  createTime: string;
}

interface NodeGroup {
  id: number;
  groupName: string;
}

const columns: TableColumnsType = [
  { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName', width: 160 },
  { title: '节点服务(IP)', dataIndex: 'ip', key: 'ip', width: 140 },
  { title: '节点端口', dataIndex: 'port', key: 'port', width: 100 },
  { title: '节点类型', dataIndex: 'nodeType', key: 'nodeType', width: 100 },
  { title: '传输处理类型', dataIndex: 'transferType', key: 'transferType', width: 130 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

const searchKeyword = ref('');
const statusFilter = ref('');
const nodeTypeFilter = ref('');
const loading = ref(false);
const submitLoading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<Node | null>(null);
const selectedGroupId = ref<number | null>(null);

const formRef = ref();

const formState = reactive({ nodeName: '', ip: '', port: 5001, nodeType: 'normal', transferType: 'self', status: 'active' });

const nodeList = ref<Node[]>([]);

const nodeGroups = ref<NodeGroup[]>([
  { id: 1, groupName: '核心交易节点组' },
  { id: 2, groupName: '影像归档节点组' },
]);

const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

const currentGroupName = computed(() => nodeGroups.value.find(g => g.id === selectedGroupId.value)?.groupName || '');

const filteredList = computed(() => {
  let result = nodeList.value;
  if (selectedGroupId.value) result = result.filter(item => item.nodeGroupId === selectedGroupId.value);
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    result = result.filter(item => item.nodeName.toLowerCase().includes(kw) || item.ip.toLowerCase().includes(kw));
  }
  if (statusFilter.value) result = result.filter(item => item.status === statusFilter.value);
  if (nodeTypeFilter.value) result = result.filter(item => item.nodeType === nodeTypeFilter.value);
  return result;
});

const getNodeTypeText = (type: string) => type === 'normal' ? '一般节点' : '同步节点';
const getTransferTypeText = (type?: string) => type === 'self' ? '自己传输处理' : type === 'proxy' ? '代理传输处理' : '-';

const selectGroup = (group: NodeGroup) => { selectedGroupId.value = group.id; pagination.current = 1; };

const resetFilters = () => { searchKeyword.value = ''; statusFilter.value = ''; nodeTypeFilter.value = ''; };

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    nodeList.value = [
      { id: 1, nodeName: 'ABSD', ip: '10.150.32.33', port: 5001, nodeType: 'normal', nodeGroupId: 1, transferType: 'self', status: 'active', createTime: '2025-12-01' },
      { id: 2, nodeName: 'AMLRQ', ip: '10.150.5.15', port: 5001, nodeType: 'normal', nodeGroupId: 1, transferType: 'self', status: 'active', createTime: '2025-12-03' },
      { id: 3, nodeName: 'AMLS', ip: '200.1.1.183', port: 5001, nodeType: 'normal', nodeGroupId: 2, transferType: 'self', status: 'inactive', createTime: '2025-12-05' },
    ];
    pagination.total = nodeList.value.length;
    loading.value = false;
  }, 200);
};

const handleSearch = () => { pagination.current = 1; };

const handleTableChange = (pag: any) => { pagination.current = pag.current; };

const handleAdd = () => {
  if (!selectedGroupId.value) { message.warning('请先选择节点组'); return; }
  isEdit.value = false; resetForm(); drawerVisible.value = true;
};

const handleEdit = (record: Node) => { isEdit.value = true; currentRecord.value = record; Object.assign(formState, record); drawerVisible.value = true; };

const handleDelete = (record: Node) => { nodeList.value = nodeList.value.filter(item => item.id !== record.id); message.success('删除成功'); };

const handleSubmit = async () => { drawerVisible.value = false; message.success(isEdit.value ? '编辑成功' : '新增成功'); resetForm(); };

const resetForm = () => { formRef.value?.resetFields(); currentRecord.value = null; isEdit.value = false; };

onMounted(() => { loadData(); });
</script>