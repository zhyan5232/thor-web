<template>
  <div class="p-4 h-[calc(100vh-64px)] flex flex-col">
    <div class="mb-3 flex-shrink-0">
      <h2 class="text-lg font-semibold text-slate-800">任务管理</h2>
      <p class="text-xs text-slate-500 mt-0.5">按应用系统 → 任务组 → 任务 三级结构管理</p>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">
      <!-- 左侧树形结构（与应用系统管理保持一致） -->
      <div class="w-64 flex-shrink-0">
        <a-card title="应用系统 / 任务组" :bordered="false" class="h-full">
          <a-tree
            v-model:selectedKeys="selectedKeys"
            :tree-data="treeData"
            @select="handleTreeSelect"
            :default-expand-all="true"
            class="task-tree"
          />
        </a-card>
      </div>

      <!-- 右侧内容区 -->
      <div class="flex-1 flex flex-col min-h-0">
        <a-card class="flex-1 flex flex-col min-h-0" :bordered="false">
          <!-- 任务组列表 -->
          <template v-if="currentView === 'taskGroup'">
            <div class="flex items-center justify-between mb-3 px-1">
              <div class="text-base font-medium">任务组列表 - {{ currentAppSystemName }}</div>
              <a-button type="primary" size="small" @click="handleAddTaskGroup">
                <template #icon><PlusOutlined /></template>
                新增任务组
              </a-button>
            </div>

            <a-table
              :columns="taskGroupColumns"
              :data-source="taskGroupList"
              :pagination="false"
              size="small"
              class="flex-1"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '启用' : '停用' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a @click="handleEditTaskGroup(record)">编辑</a>
                    <a @click="handleSelectTaskGroup(record)">进入任务</a>
                    <a-popconfirm title="确定删除该任务组吗？" @confirm="handleDeleteTaskGroup(record)">
                      <a class="text-red-500">删除</a>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </template>

          <!-- 任务列表 -->
          <template v-else-if="currentView === 'task'">
            <div class="flex items-center justify-between mb-3 px-1">
              <div class="text-base font-medium">任务列表 - {{ currentTaskGroupName }}</div>
              <div class="flex gap-2">
                <a-button size="small" @click="handleBatchExport">批量导出</a-button>
                <a-upload
                  :show-upload-list="false"
                  accept=".xls,.xlsx"
                  @change="handleBatchImport"
                >
                  <a-button size="small">批量导入</a-button>
                </a-upload>
                <a-button type="primary" size="small" @click="handleAddTask">
                  <template #icon><PlusOutlined /></template>
                  新增任务
                </a-button>
              </div>
            </div>

            <a-table
              :columns="taskColumns"
              :data-source="taskList"
              :pagination="{ pageSize: 10 }"
              size="small"
              class="flex-1"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '启用' : '停用' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a @click="handleEditTask(record)">编辑</a>
                    <a-popconfirm title="确定删除该任务吗？" @confirm="handleDeleteTask(record)">
                      <a class="text-red-500">删除</a>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </template>

          <div v-else class="flex items-center justify-center h-full text-gray-400">
            请在左侧选择应用系统或任务组
          </div>
        </a-card>
      </div>
    </div>

    <!-- 新增/编辑任务组 Drawer -->
    <a-drawer v-model:open="taskGroupDrawerVisible" :title="isEditTaskGroup ? '编辑任务组' : '新增任务组'" width="520">
      <a-form :model="taskGroupForm" layout="vertical">
        <a-form-item label="任务组名称" required>
          <a-input v-model:value="taskGroupForm.groupName" />
        </a-form-item>
        <a-form-item label="所属应用系统">
          <a-input v-model:value="taskGroupForm.appSystemName" disabled />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="taskGroupForm.status">
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="taskGroupForm.remark" :rows="3" />
        </a-form-item>
      </a-form>
      <div class="flex justify-end gap-2 mt-4">
        <a-button @click="taskGroupDrawerVisible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmitTaskGroup">确定</a-button>
      </div>
    </a-drawer>

    <!-- 新增/编辑任务 Drawer -->
    <a-drawer v-model:open="taskDrawerVisible" :title="isEditTask ? '编辑任务' : '新增任务'" width="720">
      <a-form :model="taskForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="任务标识" required>
              <a-input v-model:value="taskForm.taskCode" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="任务名称" required>
              <a-input v-model:value="taskForm.taskName" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="是否启用">
              <a-select v-model:value="taskForm.status">
                <a-select-option value="active">启用</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="传输方式">
              <a-select v-model:value="taskForm.transType">
                <a-select-option value="一对一">一对一</a-select-option>
                <a-select-option value="一对多">一对多</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="优先级">
              <a-input-number v-model:value="taskForm.priority" :min="0" :max="9" style="width:100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="源文件名">
          <a-input v-model:value="taskForm.sourceFileName" />
        </a-form-item>
        <a-form-item label="目标文件名">
          <a-input v-model:value="taskForm.targetFileName" />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model:value="taskForm.remark" :rows="2" />
        </a-form-item>
      </a-form>

      <div class="flex justify-end gap-2 mt-4">
        <a-button @click="taskDrawerVisible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmitTask">确定</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';

// 从应用系统管理同步的应用系统数据（后续可改为从 AppSystemManage 共享）
const appSystems = ref([
  { id: 1, appName: '张家口银行', appCode: 'ZJKYH' },
  { id: 2, appName: 'ODS', appCode: 'ODS' },
  { id: 3, appName: '核心交易系统', appCode: 'CORE' },
]);

// 构建树形数据（应用系统 + 任务组）
const treeData = ref(
  appSystems.value.map(app => ({
    key: `app-${app.id}`,
    title: app.appName,
    children: [
      { key: `tg-${app.id}-1`, title: '2026_NEW_TEST' },
      { key: `tg-${app.id}-2`, title: '默认任务组' },
    ]
  }))
);

// 状态
const selectedKeys = ref<string[]>([]);
const currentView = ref<'taskGroup' | 'task' | ''>('');
const currentAppSystemName = ref('');
const currentTaskGroupName = ref('');
const currentTaskGroupId = ref('');

// 任务组列表
const taskGroupList = ref<any[]>([
  { id: 'tg-1', groupName: '2026_NEW_TEST', status: 'active', remark: '' },
  { id: 'tg-2', groupName: '默认任务组', status: 'active', remark: '' },
]);

// 任务列表
const taskList = ref<any[]>([
  { id: 1, taskCode: 'S0110', taskName: 'S0110', status: 'active', transType: '一对一', priority: 4 },
  { id: 2, taskCode: 'S0110_OK', taskName: 'S0110_OK', status: 'active', transType: '一对一', priority: 4 },
]);

// 表格列
const taskGroupColumns = [
  { title: '任务组名称', dataIndex: 'groupName', key: 'groupName' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 160 },
];

const taskColumns = [
  { title: '任务标识', dataIndex: 'taskCode', key: 'taskCode', width: 120 },
  { title: '任务名称', dataIndex: 'taskName', key: 'taskName', width: 160 },
  { title: '传输方式', dataIndex: 'transType', key: 'transType', width: 100 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 },
];

// Drawer 状态
const taskGroupDrawerVisible = ref(false);
const isEditTaskGroup = ref(false);
const taskGroupForm = reactive({ id: '', groupName: '', appSystemName: '', status: 'active', remark: '' });

const taskDrawerVisible = ref(false);
const isEditTask = ref(false);
const taskForm = reactive({ id: 0, taskCode: '', taskName: '', status: 'active', transType: '一对一', priority: 4, sourceFileName: '', targetFileName: '', remark: '' });

// 树选择
const handleTreeSelect = (keys: string[], info: any) => {
  if (!keys.length) return;
  const key = keys[0];

  if (key.startsWith('app-')) {
    currentView.value = 'taskGroup';
    currentAppSystemName.value = info.node.title;
    currentTaskGroupName.value = '';
    taskGroupList.value = [
      { id: 'tg-1', groupName: '2026_NEW_TEST', status: 'active', remark: '' },
      { id: 'tg-2', groupName: '默认任务组', status: 'active', remark: '' },
    ];
  } else if (key.startsWith('tg-')) {
    currentView.value = 'task';
    currentTaskGroupName.value = info.node.title;
    currentTaskGroupId.value = key;
    taskList.value = [
      { id: 1, taskCode: 'S0110', taskName: 'S0110', status: 'active', transType: '一对一', priority: 4 },
      { id: 2, taskCode: 'S0110_OK', taskName: 'S0110_OK', status: 'active', transType: '一对一', priority: 4 },
    ];
  }
};

// 任务组操作
const handleAddTaskGroup = () => {
  isEditTaskGroup.value = false;
  Object.assign(taskGroupForm, { id: '', groupName: '', appSystemName: currentAppSystemName.value, status: 'active', remark: '' });
  taskGroupDrawerVisible.value = true;
};

const handleEditTaskGroup = (record: any) => {
  isEditTaskGroup.value = true;
  Object.assign(taskGroupForm, record);
  taskGroupDrawerVisible.value = true;
};

const handleDeleteTaskGroup = (record: any) => {
  taskGroupList.value = taskGroupList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleSelectTaskGroup = (record: any) => {
  currentView.value = 'task';
  currentTaskGroupName.value = record.groupName;
  currentTaskGroupId.value = record.id;
  taskList.value = [
    { id: 1, taskCode: 'S0110', taskName: 'S0110', status: 'active', transType: '一对一', priority: 4 },
    { id: 2, taskCode: 'S0110_OK', taskName: 'S0110_OK', status: 'active', transType: '一对一', priority: 4 },
  ];
};

const handleSubmitTaskGroup = () => {
  if (!taskGroupForm.groupName) {
    message.error('请输入任务组名称');
    return;
  }
  if (isEditTaskGroup.value) {
    const index = taskGroupList.value.findIndex(item => item.id === taskGroupForm.id);
    if (index !== -1) taskGroupList.value[index] = { ...taskGroupForm };
    message.success('编辑成功');
  } else {
    taskGroupList.value.unshift({ ...taskGroupForm, id: 'tg-' + Date.now() });
    message.success('新增成功');
  }
  taskGroupDrawerVisible.value = false;
};

// 任务操作
const handleAddTask = () => {
  isEditTask.value = false;
  Object.assign(taskForm, { id: 0, taskCode: '', taskName: '', status: 'active', transType: '一对一', priority: 4, sourceFileName: '', targetFileName: '', remark: '' });
  taskDrawerVisible.value = true;
};

const handleEditTask = (record: any) => {
  isEditTask.value = true;
  Object.assign(taskForm, record);
  taskDrawerVisible.value = true;
};

const handleDeleteTask = (record: any) => {
  taskList.value = taskList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

const handleSubmitTask = () => {
  if (!taskForm.taskCode || !taskForm.taskName) {
    message.error('任务标识和任务名称不能为空');
    return;
  }
  if (isEditTask.value) {
    const index = taskList.value.findIndex(item => item.id === taskForm.id);
    if (index !== -1) taskList.value[index] = { ...taskForm };
    message.success('编辑成功');
  } else {
    taskList.value.unshift({ ...taskForm, id: Date.now() });
    message.success('新增成功');
  }
  taskDrawerVisible.value = false;
};

// 批量导入
const handleBatchImport = (info: any) => {
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 导入成功（模拟）`);
  }
};

// 批量导出
const handleBatchExport = () => {
  message.info('批量导出功能开发中...');
};
</script>

<style scoped>
.task-tree .ant-tree-node-content-wrapper {
  padding: 2px 8px;
}
</style>