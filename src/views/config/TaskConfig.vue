<template>
  <div class="h-full flex">
    <!-- 左侧任务组树 -->
    <div class="w-64 border-r bg-white p-4 overflow-auto">
      <div class="font-semibold mb-3 text-slate-700">任务组</div>
      <a-tree
        v-model:selectedKeys="selectedKeys"
        :tree-data="taskTree"
        @select="handleTreeSelect"
        default-expand-all
      />
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 p-4 overflow-auto">
      <!-- 显示任务组列表（当选中银行时） -->
      <div v-if="viewMode === 'groups'">
        <div class="flex items-center justify-between mb-4">
          <div class="text-lg font-semibold">{{ currentBankName }} - 任务组列表</div>
          <a-button type="primary" @click="handleAddGroup">
            <template #icon><PlusOutlined /></template>
            新增任务组
          </a-button>
        </div>

        <a-table
          :columns="groupColumns"
          :data-source="groupList"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a @click="handleEditGroup(record)">修改</a>
                <a-popconfirm
                  title="确定要删除该任务组吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDeleteGroup(record)"
                >
                  <a class="text-red-500">删除</a>
                </a-popconfirm>
                <a @click="handleViewTasks(record)">查看任务</a>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 显示任务列表（当选中具体任务组时） -->
      <div v-else-if="viewMode === 'tasks'">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-lg font-semibold">{{ currentGroupName }} - 任务列表</span>
            <a-button type="link" @click="backToGroups">返回任务组</a-button>
          </div>
          <a-button type="primary" @click="handleAddTask">
            <template #icon><PlusOutlined /></template>
            新增任务
          </a-button>
        </div>

        <a-table
          :columns="taskColumns"
          :data-source="filteredTaskList"
          :pagination="pagination"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <template v-if="column.key === 'action'">
              <a-space>
                <a @click="handleEditTask(record)">修改</a>
                <a-popconfirm
                  title="确定要删除该任务吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDeleteTask(record)"
                >
                  <a class="text-red-500">删除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else class="text-center text-slate-400 mt-10">
        请在左侧选择任务组或银行
      </div>
    </div>

    <!-- 新增/编辑任务组 Drawer -->
    <a-drawer v-model:open="groupDrawerVisible" :title="isEditGroup ? '编辑任务组' : '新增任务组'" width="720" @close="resetGroupForm">
      <a-tabs v-model:activeKey="groupActiveTab">
        <a-tab-pane key="basic" tab="基本信息">
          <a-form :model="groupForm" :rules="groupRules" ref="groupFormRef" layout="vertical" class="mt-4">
            <a-form-item label="所属应用系统">
              <a-input :value="currentBankName" disabled />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="任务组标识" name="groupCode">
                  <a-input v-model:value="groupForm.groupCode" placeholder="请输入任务组标识" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="任务组名称" name="groupName">
                  <a-input v-model:value="groupForm.groupName" placeholder="请输入任务组名称" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="任务组类型" name="groupType">
                  <a-select v-model:value="groupForm.groupType">
                    <a-select-option value="发送文件">发送文件</a-select-option>
                    <a-select-option value="接收文件">接收文件</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="任务组状态" name="status">
                  <a-select v-model:value="groupForm.status">
                    <a-select-option value="启用">启用</a-select-option>
                    <a-select-option value="禁用">禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="自动触发方式" name="triggerMode">
              <a-select v-model:value="groupForm.triggerMode">
                <a-select-option value="不自动触发">不自动触发</a-select-option>
                <a-select-option value="定时触发">定时触发</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="备注" name="description">
              <a-textarea v-model:value="groupForm.description" :rows="3" />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="params" tab="任务组参数">
          <div class="mt-2">
            <div class="flex justify-between mb-2">
              <a-button type="primary" size="small" @click="handleAddParam">
                <template #icon><PlusOutlined /></template>
                添加
              </a-button>
              <a-button danger size="small" @click="handleDeleteSelectedParams" :disabled="selectedParamKeys.length === 0">
                删除
              </a-button>
            </div>

            <a-table
              :columns="paramColumns"
              :data-source="paramList"
              :row-selection="{ selectedRowKeys: selectedParamKeys, onChange: onParamSelectChange }"
              row-key="id"
              size="small"
              :pagination="false"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'paramValueDisplay'">
                  {{ getParamValueDisplay(record) }}
                </template>
                <template v-if="column.key === 'action'">
                  <a @click="handleEditParam(record)">编辑</a>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>

      <div class="flex justify-end gap-2 mt-6">
        <a-button @click="resetGroupForm">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="submitGroupForm">
          {{ isEditGroup ? '更新' : '创建' }}
        </a-button>
      </div>
    </a-drawer>

    <!-- 参数编辑 Drawer -->
    <a-drawer v-model:open="paramDrawerVisible" title="编辑参数" width="520" @close="resetParamForm">
      <a-form :model="paramForm" layout="vertical">
        <a-form-item label="参数标识" name="paramCode">
          <a-input v-model:value="paramForm.paramCode" />
        </a-form-item>
        <a-form-item label="参数名称" name="paramName">
          <a-input v-model:value="paramForm.paramName" />
        </a-form-item>
        <a-form-item label="参数类型" name="paramType">
          <a-select v-model:value="paramForm.paramType">
            <a-select-option value="常量">常量</a-select-option>
            <a-select-option value="系统变量">系统变量</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="参数值" name="paramValue">
          <div class="flex gap-2">
            <a-input v-model:value="paramForm.paramValue" style="flex:1" />
            <a-button v-if="paramForm.paramType === '系统变量'" @click="showSystemVarModal">系统变量</a-button>
          </div>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="paramForm.remark" :rows="2" />
        </a-form-item>
      </a-form>

      <div class="flex justify-end gap-2 mt-4">
        <a-button @click="resetParamForm">取消</a-button>
        <a-button type="primary" @click="submitParamForm">保存</a-button>
      </div>
    </a-drawer>

    <!-- 系统变量选择弹窗 -->
    <a-modal v-model:open="systemVarModalVisible" title="选择系统变量" width="700" @ok="selectSystemVar" @cancel="systemVarModalVisible = false">
      <a-input-search v-model:value="systemVarSearch" placeholder="搜索变量名称" allow-clear class="mb-3" />
      <a-table
        :columns="systemVarColumns"
        :data-source="filteredSystemVars"
        row-key="code"
        size="small"
        :pagination="false"
        :row-selection="{ type: 'radio', selectedRowKeys: selectedSystemVarKey, onChange: onSystemVarSelect }"
        @row-click="selectSystemVarFromTable"
      />
    </a-modal>

    <!-- 新增/编辑任务 Drawer -->
    <a-drawer v-model:open="taskDrawerVisible" :title="isEditTask ? '编辑任务' : '新增任务'" width="620" @close="resetTaskForm">
      <a-form :model="taskForm" :rules="taskRules" ref="taskFormRef" layout="vertical">
        <a-form-item label="任务标识" name="taskCode">
          <a-input v-model:value="taskForm.taskCode" :disabled="isEditTask" placeholder="请输入任务标识" />
        </a-form-item>
        <a-form-item label="任务名称" name="taskName">
          <a-input v-model:value="taskForm.taskName" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="文件传输类型" name="transferType">
          <a-select v-model:value="taskForm.transferType">
            <a-select-option value="一对一">一对一</a-select-option>
            <a-select-option value="一对多">一对多</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="源文件名" name="sourceFile">
          <a-input v-model:value="taskForm.sourceFile" />
        </a-form-item>
        <a-form-item label="源节点" name="sourceNode">
          <a-input v-model:value="taskForm.sourceNode" />
        </a-form-item>
        <a-form-item label="目标节点" name="targetNode">
          <a-input v-model:value="taskForm.targetNode" />
        </a-form-item>
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="resetTaskForm">取消</a-button>
          <a-button type="primary" :loading="submitLoading" @click="submitTaskForm">
            {{ isEditTask ? '更新' : '创建' }}
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

interface TaskGroup {
  id: number;
  groupCode: string;
  groupName: string;
  groupType: string;
  status: string;
  triggerMode: string;
  description: string;
  bankId: number;
  params?: any[];
}

interface Task {
  id: number;
  taskCode: string;
  taskName: string;
  transferType: string;
  sourceFile: string;
  sourceNode: string;
  targetNode: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  createTime: string;
  groupId: number;
}

interface Param {
  id: number;
  paramCode: string;
  paramName: string;
  paramType: string;
  paramValue: string;
  remark: string;
}

// 左侧树
const taskTree = ref([
  {
    title: '张家口银行',
    key: 'bank-1',
    children: [
      { title: '2023年结-总账', key: 'group-1' },
      { title: '2024年结-总账', key: 'group-2' },
      { title: '2025年结-总账', key: 'group-3' },
    ]
  }
]);

const selectedKeys = ref<(string | number)[]>([]);
const viewMode = ref<'groups' | 'tasks' | null>(null);
const currentBankName = ref('');
const currentGroupName = ref('');
const currentGroupId = ref<number | null>(null);

// 任务组数据
const groupList = ref<TaskGroup[]>([
  { id: 1, groupCode: 'TG001', groupName: '2023年结-总账', groupType: '发送文件', status: '启用', triggerMode: '不自动触发', description: '2023年度总账任务组', bankId: 1, params: [] },
  { id: 2, groupCode: 'TG002', groupName: '2024年结-总账', groupType: '发送文件', status: '启用', triggerMode: '不自动触发', description: '2024年度总账任务组', bankId: 1, params: [] },
]);

// 任务数据
const taskList = ref<Task[]>([
  { id: 1, taskCode: 'NJ_BMS_BALANCE', taskName: 'NJ_BMS_BALANCE', transferType: '一对一', sourceFile: 'BMS_BALANCE_#DATE#.dat', sourceNode: 'NBMS1', targetNode: 'GLS_NN', status: 'success', createTime: '2025-12-10 08:00:00', groupId: 1 },
  { id: 2, taskCode: 'NJ_BMS_HEX', taskName: 'NJ_BMS_HEX', transferType: '一对一', sourceFile: 'BMS_HEX_#DATE#_001.dat', sourceNode: 'NBMS1', targetNode: 'GLS_NN', status: 'success', createTime: '2025-12-10 08:05:00', groupId: 1 },
]);

// 参数相关
const paramList = ref<Param[]>([]);
const selectedParamKeys = ref<number[]>([]);
const paramDrawerVisible = ref(false);
const paramForm = reactive({ id: 0, paramCode: '', paramName: '', paramType: '常量', paramValue: '', remark: '' });
const systemVarModalVisible = ref(false);
const systemVarSearch = ref('');
const selectedSystemVarKey = ref<string[]>([]);

const systemVarColumns = [
  { title: '标识', dataIndex: 'code', key: 'code' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '值', dataIndex: 'value', key: 'value' },
];

const systemVars = ref([
  { code: 'DATE', name: '业务日期', value: 'SELECT FILE_DATE FROM ...' },
  { code: 'EASD', name: 'EASD', value: 'SELECT FILE_DATE FROM ...' },
  { code: 'ODSOATE', name: 'ODSOATE', value: 'SELECT FILE_DATE FROM ...' },
  { code: 'SYSDATE', name: '系统日期', value: 'select to_char(sysdate-1,\'yyyy...\' )' },
]);

const filteredSystemVars = computed(() => {
  if (!systemVarSearch.value) return systemVars.value;
  const kw = systemVarSearch.value.toLowerCase();
  return systemVars.value.filter(v => v.name.toLowerCase().includes(kw) || v.code.toLowerCase().includes(kw));
});

// 任务列表筛选
const searchKeyword = ref('');
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

const filteredTaskList = computed(() => {
  if (!currentGroupId.value) return [];
  let result = taskList.value.filter(t => t.groupId === currentGroupId.value);
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    result = result.filter(t => t.taskName.toLowerCase().includes(kw) || t.taskCode.toLowerCase().includes(kw));
  }
  return result;
});

// 表格列定义
const groupColumns: TableColumnsType = [
  { title: '任务组名称', dataIndex: 'groupName', key: 'groupName', width: 200 },
  { title: '任务组类型', dataIndex: 'groupType', key: 'groupType', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
];

const taskColumns: TableColumnsType = [
  { title: '任务标识', dataIndex: 'taskCode', key: 'taskCode', width: 140 },
  { title: '任务名称', dataIndex: 'taskName', key: 'taskName', width: 200 },
  { title: '文件传输类型', dataIndex: 'transferType', key: 'transferType', width: 120 },
  { title: '源文件名', dataIndex: 'sourceFile', key: 'sourceFile', width: 200 },
  { title: '源节点', dataIndex: 'sourceNode', key: 'sourceNode', width: 120 },
  { title: '目标节点', dataIndex: 'targetNode', key: 'targetNode', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

const paramColumns: TableColumnsType = [
  { title: '参数标识', dataIndex: 'paramCode', key: 'paramCode' },
  { title: '参数名称', dataIndex: 'paramName', key: 'paramName' },
  { title: '参数类型', dataIndex: 'paramType', key: 'paramType' },
  { title: '参数值', key: 'paramValueDisplay', width: 200 },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'action', width: 80 },
];

// Drawer 状态
const groupDrawerVisible = ref(false);
const taskDrawerVisible = ref(false);
const isEditGroup = ref(false);
const isEditTask = ref(false);
const submitLoading = ref(false);
const groupActiveTab = ref('basic');

const groupFormRef = ref();
const taskFormRef = ref();

const groupForm = reactive({
  id: 0,
  groupCode: '',
  groupName: '',
  groupType: '发送文件',
  status: '启用',
  triggerMode: '不自动触发',
  description: '',
});

const taskForm = reactive({
  id: 0,
  taskCode: '',
  taskName: '',
  transferType: '一对一',
  sourceFile: '',
  sourceNode: '',
  targetNode: '',
  groupId: 0,
});

const groupRules = {
  groupCode: [{ required: true, message: '请输入任务组标识' }],
  groupName: [{ required: true, message: '请输入任务组名称' }],
};

const taskRules = {
  taskCode: [{ required: true, message: '请输入任务标识' }],
  taskName: [{ required: true, message: '请输入任务名称' }],
};

// 状态辅助函数
const getStatusColor = (status: string) => {
  if (status === 'success') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'running') return 'blue';
  return 'orange';
};

const getStatusText = (status: string) => {
  if (status === 'pending') return '待执行';
  if (status === 'running') return '执行中';
  if (status === 'success') return '成功';
  return '失败';
};

// 树选择处理
const handleTreeSelect = (keys: (string | number)[], info: any) => {
  if (keys.length === 0) return;
  const key = keys[0] as string;

  if (key.startsWith('bank')) {
    viewMode.value = 'groups';
    currentBankName.value = info.node.title;
    currentGroupId.value = null;
  } else if (key.startsWith('group')) {
    viewMode.value = 'tasks';
    currentGroupId.value = parseInt(key.split('-')[1]);
    currentGroupName.value = info.node.title;
  }
};

// 返回任务组列表
const backToGroups = () => {
  viewMode.value = 'groups';
  currentGroupId.value = null;
};

// 参数相关
const onParamSelectChange = (keys: number[]) => {
  selectedParamKeys.value = keys;
};

const handleAddParam = () => {
  paramForm.id = 0;
  paramForm.paramCode = '';
  paramForm.paramName = '';
  paramForm.paramType = '常量';
  paramForm.paramValue = '';
  paramForm.remark = '';
  paramDrawerVisible.value = true;
};

const handleEditParam = (record: Param) => {
  Object.assign(paramForm, record);
  paramDrawerVisible.value = true;
};

const handleDeleteSelectedParams = () => {
  paramList.value = paramList.value.filter(p => !selectedParamKeys.value.includes(p.id));
  selectedParamKeys.value = [];
  message.success('删除成功');
};

const submitParamForm = () => {
  if (paramForm.id === 0) {
    paramList.value.push({ ...paramForm, id: Date.now() });
  } else {
    const index = paramList.value.findIndex(p => p.id === paramForm.id);
    if (index !== -1) paramList.value[index] = { ...paramForm };
  }
  paramDrawerVisible.value = false;
  message.success('保存成功');
};

const resetParamForm = () => {
  paramDrawerVisible.value = false;
};

const showSystemVarModal = () => {
  systemVarSearch.value = '';
  selectedSystemVarKey.value = [];
  systemVarModalVisible.value = true;
};

const onSystemVarSelect = (keys: string[]) => {
  selectedSystemVarKey.value = keys;
};

const selectSystemVarFromTable = (record: any) => {
  // 选择系统变量后自动填充
  paramForm.paramCode = record.code;
  paramForm.paramName = record.name;
  paramForm.paramValue = record.code; // 只存标识，不存SQL
  systemVarModalVisible.value = false;
};

const selectSystemVar = () => {
  if (selectedSystemVarKey.value.length > 0) {
    const selected = systemVars.value.find(v => v.code === selectedSystemVarKey.value[0]);
    if (selected) {
      paramForm.paramCode = selected.code;
      paramForm.paramName = selected.name;
      paramForm.paramValue = selected.code; // 只存标识，不存SQL
    }
  }
  systemVarModalVisible.value = false;
};

// 获取参数值展示内容
const getParamValueDisplay = (record: Param) => {
  if (record.paramType === '系统变量') {
    return record.paramCode; // 只显示标识
  }
  return record.paramValue;
};

// 任务组 CRUD
const handleAddGroup = () => {
  isEditGroup.value = false;
  groupForm.id = 0;
  groupForm.groupCode = '';
  groupForm.groupName = '';
  groupForm.groupType = '发送文件';
  groupForm.status = '启用';
  groupForm.triggerMode = '不自动触发';
  groupForm.description = '';
  paramList.value = [];
  groupActiveTab.value = 'basic';
  groupDrawerVisible.value = true;
};

const handleEditGroup = (record: TaskGroup) => {
  isEditGroup.value = true;
  groupForm.id = record.id;
  groupForm.groupCode = record.groupCode;
  groupForm.groupName = record.groupName;
  groupForm.groupType = record.groupType;
  groupForm.status = record.status;
  groupForm.triggerMode = record.triggerMode;
  groupForm.description = record.description;
  paramList.value = record.params || [];
  groupActiveTab.value = 'basic';
  groupDrawerVisible.value = true;
};

const handleDeleteGroup = (record: TaskGroup) => {
  groupList.value = groupList.value.filter(g => g.id !== record.id);
  taskList.value = taskList.value.filter(t => t.groupId !== record.id);
  message.success('删除成功');
};

const submitGroupForm = async () => {
  try {
    await groupFormRef.value?.validate();
    submitLoading.value = true;

    if (isEditGroup.value) {
      const index = groupList.value.findIndex(g => g.id === groupForm.id);
      if (index !== -1) {
        groupList.value[index] = { ...groupForm, params: [...paramList.value] };
      }
      message.success('更新成功');
    } else {
      const newGroup: TaskGroup = {
        id: Date.now(),
        groupCode: groupForm.groupCode,
        groupName: groupForm.groupName,
        groupType: groupForm.groupType,
        status: groupForm.status,
        triggerMode: groupForm.triggerMode,
        description: groupForm.description,
        bankId: 1,
        params: [...paramList.value]
      };
      groupList.value.push(newGroup);
      message.success('新增成功');
    }
    groupDrawerVisible.value = false;
  } finally {
    submitLoading.value = false;
  }
};

const resetGroupForm = () => {
  groupDrawerVisible.value = false;
  groupFormRef.value?.resetFields();
};

// 任务 CRUD
const handleAddTask = () => {
  isEditTask.value = false;
  taskForm.id = 0;
  taskForm.taskCode = '';
  taskForm.taskName = '';
  taskForm.transferType = '一对一';
  taskForm.sourceFile = '';
  taskForm.sourceNode = '';
  taskForm.targetNode = '';
  taskForm.groupId = currentGroupId.value || 0;
  taskDrawerVisible.value = true;
};

const handleEditTask = (record: Task) => {
  isEditTask.value = true;
  Object.assign(taskForm, record);
  taskDrawerVisible.value = true;
};

const handleDeleteTask = (record: Task) => {
  taskList.value = taskList.value.filter(t => t.id !== record.id);
  message.success('删除成功');
};

const submitTaskForm = async () => {
  try {
    await taskFormRef.value?.validate();
    submitLoading.value = true;

    if (isEditTask.value) {
      const index = taskList.value.findIndex(t => t.id === taskForm.id);
      if (index !== -1) taskList.value[index] = { ...taskForm };
      message.success('更新成功');
    } else {
      const newTask: Task = {
        ...taskForm,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        status: 'pending'
      };
      taskList.value.unshift(newTask);
      message.success('新增成功');
    }
    taskDrawerVisible.value = false;
  } finally {
    submitLoading.value = false;
  }
};

const resetTaskForm = () => {
  taskDrawerVisible.value = false;
  taskFormRef.value?.resetFields();
};

onMounted(() => {
  selectedKeys.value = ['bank-1'];
  viewMode.value = 'groups';
  currentBankName.value = '张家口银行';
});
</script>