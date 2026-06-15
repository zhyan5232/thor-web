<template>
  <div class="p-4 h-[calc(100vh-64px)] flex flex-col">
    <div class="mb-3 flex-shrink-0">
      <h2 class="text-lg font-semibold text-slate-800">任务管理</h2>
      <p class="text-xs text-slate-500 mt-0.5">按应用系统 → 任务组 → 任务 三级结构管理</p>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">
      <!-- 左侧树 -->
      <div class="w-64 flex-shrink-0">
        <a-card title="应用系统 / 任务组" :bordered="false" class="h-full">
          <a-tree
            v-model:selectedKeys="selectedKeys"
            :tree-data="treeData"
            @select="handleTreeSelect"
            :default-expand-all="true"
          />
        </a-card>
      </div>

      <!-- 右侧内容 -->
      <div class="flex-1 flex flex-col min-h-0">
        <a-card class="flex-1 flex flex-col min-h-0" :bordered="false">
          <!-- 任务组列表 - 参考老FEX样式 -->
          <template v-if="currentView === 'taskGroup'">
            <div class="flex items-center justify-between mb-3 px-1">
              <div class="text-base font-medium">任务组列表 - {{ currentAppSystemName }}</div>
              <div class="flex gap-2">
                <a-button type="primary" size="small" @click="handleAddTaskGroup">
                  <template #icon><PlusOutlined /></template>
                  新增任务组
                </a-button>
              </div>
            </div>

            <a-table
              :columns="taskGroupColumns"
              :data-source="taskGroupList"
              size="small"
              :pagination="false"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'isTemplate'">
                  <a-tag :color="record.isTemplate ? 'blue' : 'default'">
                    {{ record.isTemplate ? '是' : '否' }}
                  </a-tag>
                </template>
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
            <div class="flex justify-between mb-3 px-1">
              <div class="text-base font-medium">任务列表 - {{ currentTaskGroupName }}</div>
              <div class="flex gap-2">
                <a-button size="small" @click="handleBatchExport">批量导出</a-button>
                <a-upload :show-upload-list="false" accept=".xls,.xlsx" @change="handleBatchImport">
                  <a-button size="small">批量导入</a-button>
                </a-upload>
                <a-button type="primary" size="small" @click="handleAddTask">新增任务</a-button>
              </div>
            </div>
            <a-table :columns="taskColumns" :data-source="taskList" size="small" :pagination="{ pageSize: 10 }">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">{{ record.status === 'active' ? '启用' : '停用' }}</a-tag>
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

    <!-- 任务组向导 Drawer -->
    <a-drawer v-model:open="taskGroupDrawerVisible" :title="isEditTaskGroup ? '编辑任务组' : '新增任务组'" width="720" @close="resetTaskGroupWizard">
      <a-steps :current="currentStep" size="small" class="mb-4">
        <a-step title="基本信息" />
        <a-step title="任务组参数" />
      </a-steps>

      <!-- Step 1: 基本信息 -->
      <div v-if="currentStep === 0">
        <a-form :model="taskGroupForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="所属应用系统">
                <a-input v-model:value="taskGroupForm.appSystemName" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="任务组标识" required>
                <a-input v-model:value="taskGroupForm.groupCode" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="任务组名称" required>
                <a-input v-model:value="taskGroupForm.groupName" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="任务类型" required>
                <a-select v-model:value="taskGroupForm.taskType">
                  <a-select-option value="发送文件">发送文件</a-select-option>
                  <a-select-option value="接受文件">接受文件</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="任务组状态" required>
                <a-select v-model:value="taskGroupForm.status">
                  <a-select-option value="active">启用</a-select-option>
                  <a-select-option value="inactive">停用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="自动触发方式">
                <a-select v-model:value="taskGroupForm.triggerType">
                  <a-select-option value="不自动触发">不自动触发</a-select-option>
                  <a-select-option value="触发器触发">触发器触发</a-select-option>
                  <a-select-option value="依赖触发">依赖触发</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="备注">
            <a-textarea v-model:value="taskGroupForm.remark" :rows="3" />
          </a-form-item>
        </a-form>
      </div>

      <!-- Step 2: 任务组参数 -->
      <div v-else>
        <div class="flex justify-between mb-2">
          <div class="font-medium">任务组参数</div>
          <a-button type="primary" size="small" @click="showParamForm = true; resetCurrentParam()">
            <template #icon><PlusOutlined /></template>
            添加参数
          </a-button>
        </div>

        <a-table :columns="paramColumns" :data-source="paramList" size="small" :pagination="false" class="mb-4">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a @click="editParam(index, record)">编辑</a>
                <a-popconfirm title="删除该参数？" @confirm="deleteParam(index)">
                  <a class="text-red-500">删除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>

        <a-card v-if="showParamForm" size="small" class="mb-3">
          <a-form layout="vertical">
            <a-row :gutter="12">
              <a-col :span="8">
                <a-form-item label="参数标识" required>
                  <a-input v-model:value="currentParam.paramCode" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="参数名称" required>
                  <a-input v-model:value="currentParam.paramName" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="参数类型" required>
                  <a-select v-model:value="currentParam.paramType" @change="onParamTypeChange">
                    <a-select-option value="常量">常量</a-select-option>
                    <a-select-option value="SQL">SQL</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row v-if="currentParam.paramType === '常量'" :gutter="12">
              <a-col :span="24">
                <a-form-item label="参数值">
                  <a-input v-model:value="currentParam.paramValue" style="width: 70%" />
                  <a-button style="margin-left: 8px" @click="openSystemVarModal">系统变量</a-button>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row v-else :gutter="12">
              <a-col :span="12">
                <a-form-item label="数据源">
                  <a-select v-model:value="currentParam.dataSource" placeholder="选择数据源">
                    <a-select-option value="ODS">ODS</a-select-option>
                    <a-select-option value="核心交易库">核心交易库</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="参数值 (SQL)">
                  <a-textarea v-model:value="currentParam.paramValue" :rows="2" placeholder="输入SQL语句" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="备注">
              <a-input v-model:value="currentParam.remark" />
            </a-form-item>

            <div class="flex justify-end gap-2">
              <a-button @click="cancelParamForm">取消</a-button>
              <a-button type="primary" @click="saveParam">保存参数</a-button>
            </div>
          </a-form>
        </a-card>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-between mt-6">
        <div>
          <a-button v-if="currentStep === 1" @click="currentStep = 0">上一步</a-button>
        </div>
        <div class="flex gap-2">
          <a-button @click="taskGroupDrawerVisible = false">取消</a-button>
          <a-button v-if="currentStep === 0" type="primary" @click="goToParamStep">下一步</a-button>
          <a-button v-else type="primary" @click="handleSubmitTaskGroup">保存</a-button>
        </div>
      </div>
    </a-drawer>

    <!-- 系统变量弹窗 -->
    <a-modal v-model:open="systemVarModalVisible" title="参数值" width="720" @ok="confirmSystemVar" ok-text="确定" cancel-text="取消">
      <div class="mb-3">
        <a-input-search v-model:value="systemVarSearch" placeholder="变量名称" enter-button="搜索" @search="filterSystemVars" />
      </div>
      <a-table
        :columns="systemVarColumns"
        :data-source="filteredSystemVars"
        :row-selection="{ type: 'radio', selectedRowKeys: selectedSystemVarKeys, onChange: onSystemVarSelect }"
        :pagination="{ pageSize: 8 }"
        size="small"
        row-key="id"
      />
    </a-modal>

    <!-- 任务 Drawer -->
    <a-drawer v-model:open="taskDrawerVisible" title="新增/编辑任务" width="720">
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
            <a-form-item label="状态">
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
      </a-form>
      <div class="flex justify-end gap-2 mt-4">
        <a-button @click="taskDrawerVisible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmitTask">确定</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';

// 树形数据
const treeData = ref([
  { key: 'app-1', title: '张家口银行', children: [{ key: 'tg-1', title: '2026_NEW_TEST' }, { key: 'tg-2', title: '默认任务组' }] },
  { key: 'app-2', title: 'ODS', children: [] }
]);

// 状态
const selectedKeys = ref<string[]>([]);
const currentView = ref<'taskGroup' | 'task' | ''>('');
const currentAppSystemName = ref('');
const currentTaskGroupName = ref('');

// 任务组列表 - 参考老FEX丰富字段
const taskGroupList = ref<any[]>([
  { id: 'tg-1', groupCode: '2026_NEW_TEST', groupName: '2026_NEW_TEST', isTemplate: false, status: 'active', taskType: '发送文件', triggerType: '不自动触发' },
  { id: 'tg-2', groupCode: 'DEFAULT', groupName: '默认任务组', isTemplate: false, status: 'active', taskType: '发送文件', triggerType: '不自动触发' },
]);

// 任务列表
const taskList = ref<any[]>([]);

// 任务组表格列 - 参考老FEX图2
const taskGroupColumns = [
  { title: '任务组标识', dataIndex: 'groupCode', key: 'groupCode', width: 140 },
  { title: '任务组名称', dataIndex: 'groupName', key: 'groupName', width: 180 },
  { title: '是否配置模板', dataIndex: 'isTemplate', key: 'isTemplate', width: 120 },
  { title: '任务组状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '任务组类型', dataIndex: 'taskType', key: 'taskType', width: 120 },
  { title: '触发方式', dataIndex: 'triggerType', key: 'triggerType', width: 120 },
  { title: '操作', key: 'action', width: 160 }
];

const taskColumns = [
  { title: '任务标识', dataIndex: 'taskCode', key: 'taskCode', width: 120 },
  { title: '任务名称', dataIndex: 'taskName', key: 'taskName', width: 160 },
  { title: '传输方式', dataIndex: 'transType', key: 'transType', width: 100 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
];

// 向导状态
const taskGroupDrawerVisible = ref(false);
const isEditTaskGroup = ref(false);
const currentStep = ref(0);
const showParamForm = ref(false);

// 任务组基本信息
const taskGroupForm = reactive({ id: '', groupCode: '', groupName: '', appSystemName: '', taskType: '发送文件', status: 'active', triggerType: '不自动触发', remark: '' });

// 参数列表
const paramList = ref<any[]>([]);
const paramColumns = [
  { title: '参数标识', dataIndex: 'paramCode', key: 'paramCode' },
  { title: '参数名称', dataIndex: 'paramName', key: 'paramName' },
  { title: '参数类型', dataIndex: 'paramType', key: 'paramType', width: 100 },
  { title: '参数值', dataIndex: 'paramValue', key: 'paramValue' },
  { title: '操作', key: 'action', width: 100 }
];

// 当前参数
const currentParam = reactive({ paramCode: '', paramName: '', paramType: '常量', dataSource: '', paramValue: '', remark: '' });

// 系统变量弹窗
const systemVarModalVisible = ref(false);
const systemVarSearch = ref('');
const selectedSystemVarKeys = ref<any[]>([]);
const systemVars = ref([
  { id: 1, code: 'CX', name: 'VVV', value: '20100917', remark: '' },
  { id: 2, code: 'DATE', name: 'ODSDATE44', value: "SELECT FILE_DATE FROM DAT...", remark: '' },
  { id: 3, code: 'EASD', name: 'SDAS', value: "SELECT TO_CHAR(SYSDATE,'Y...", remark: '' },
  { id: 4, code: 'ODSDATE', name: 'ODSDATE65', value: "SELECT FILE_DATE FROM DAT...", remark: '' },
  { id: 5, code: 'TO', name: 'TO', value: "SELECT TO_CHAR(SYSDATE,'Y...", remark: '' },
]);

const filteredSystemVars = computed(() => {
  if (!systemVarSearch.value) return systemVars.value;
  const keyword = systemVarSearch.value.toLowerCase();
  return systemVars.value.filter(v => v.code.toLowerCase().includes(keyword) || v.name.toLowerCase().includes(keyword));
});

const systemVarColumns = [
  { title: '标识', dataIndex: 'code', key: 'code' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '值', dataIndex: 'value', key: 'value', ellipsis: true },
  { title: '备注', dataIndex: 'remark', key: 'remark' }
];

// 任务表单
const taskDrawerVisible = ref(false);
const isEditTask = ref(false);
const taskForm = reactive({ id: 0, taskCode: '', taskName: '', status: 'active', transType: '一对一', priority: 4, sourceFileName: '', targetFileName: '' });

// 重置向导
const resetTaskGroupWizard = () => {
  currentStep.value = 0;
  showParamForm.value = false;
  paramList.value = [];
  Object.assign(taskGroupForm, { id: '', groupCode: '', groupName: '', appSystemName: '', taskType: '发送文件', status: 'active', triggerType: '不自动触发', remark: '' });
};

// 新增任务组
const handleAddTaskGroup = () => {
  isEditTaskGroup.value = false;
  resetTaskGroupWizard();
  taskGroupForm.appSystemName = currentAppSystemName.value;
  taskGroupDrawerVisible.value = true;
};

// 编辑任务组
const handleEditTaskGroup = (record: any) => {
  isEditTaskGroup.value = true;
  resetTaskGroupWizard();
  Object.assign(taskGroupForm, record);
  taskGroupDrawerVisible.value = true;
};

// 下一步
const goToParamStep = () => {
  if (!taskGroupForm.groupCode || !taskGroupForm.groupName) {
    message.error('请填写任务组标识和名称');
    return;
  }
  currentStep.value = 1;
};

// 参数类型切换
const onParamTypeChange = (val: string) => {
  if (val === '常量') currentParam.dataSource = '';
};

// 打开系统变量弹窗
const openSystemVarModal = () => {
  systemVarSearch.value = '';
  selectedSystemVarKeys.value = [];
  systemVarModalVisible.value = true;
};

// 选择系统变量
const onSystemVarSelect = (keys: any[]) => {
  selectedSystemVarKeys.value = keys;
};

// 确认选择系统变量
const confirmSystemVar = () => {
  if (selectedSystemVarKeys.value.length === 0) {
    message.warning('请选择一个系统变量');
    return;
  }
  const selected = systemVars.value.find(v => v.id === selectedSystemVarKeys.value[0]);
  if (selected) {
    currentParam.paramValue = `$${selected.code}$`;
    message.success(`已选择系统变量: $${selected.code}$`);
  }
  systemVarModalVisible.value = false;
};

// 过滤系统变量
const filterSystemVars = () => {};

// 保存参数
const saveParam = () => {
  if (!currentParam.paramCode || !currentParam.paramName) {
    message.error('参数标识和名称不能为空');
    return;
  }
  paramList.value.push({ ...currentParam });
  message.success('参数保存成功');
  showParamForm.value = false;
  resetCurrentParam();
};

// 编辑参数
const editParam = (index: number, record: any) => {
  Object.assign(currentParam, record);
  showParamForm.value = true;
};

// 删除参数
const deleteParam = (index: number) => {
  paramList.value.splice(index, 1);
};

// 重置当前参数
const resetCurrentParam = () => {
  Object.assign(currentParam, { paramCode: '', paramName: '', paramType: '常量', dataSource: '', paramValue: '', remark: '' });
  selectedSystemVarKeys.value = [];
};

// 取消参数表单
const cancelParamForm = () => {
  showParamForm.value = false;
  resetCurrentParam();
};

// 提交任务组
const handleSubmitTaskGroup = () => {
  if (isEditTaskGroup.value) {
    message.success('任务组更新成功');
  } else {
    taskGroupList.value.unshift({ ...taskGroupForm, id: 'tg-' + Date.now() });
    message.success('任务组创建成功');
  }
  taskGroupDrawerVisible.value = false;
  resetTaskGroupWizard();
};

// 删除任务组
const handleDeleteTaskGroup = (record: any) => { taskGroupList.value = taskGroupList.value.filter(i => i.id !== record.id); };

// 选择任务组
const handleSelectTaskGroup = (record: any) => { currentView.value = 'task'; currentTaskGroupName.value = record.groupName; };

// 任务相关
const handleAddTask = () => { isEditTask.value = false; taskDrawerVisible.value = true; };
const handleEditTask = (record: any) => { isEditTask.value = true; Object.assign(taskForm, record); taskDrawerVisible.value = true; };
const handleDeleteTask = (record: any) => { taskList.value = taskList.value.filter(i => i.id !== record.id); };
const handleSubmitTask = () => { taskDrawerVisible.value = false; message.success('任务保存成功'); };
const handleBatchImport = () => { message.success('导入成功（模拟）'); };
const handleBatchExport = () => { message.info('导出功能开发中'); };

const handleTreeSelect = (keys: string[], info: any) => {
  if (!keys.length) return;
  const key = keys[0];
  if (key.startsWith('app-')) {
    currentView.value = 'taskGroup';
    currentAppSystemName.value = info.node.title;
  } else {
    currentView.value = 'task';
    currentTaskGroupName.value = info.node.title;
  }
};
</script>