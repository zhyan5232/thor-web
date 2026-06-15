<template>
  <div class="p-4">
    <div class="flex justify-between mb-4">
      <h2 class="text-lg font-semibold">触发器管理</h2>
      <a-button type="primary" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        新增触发器
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="triggerList"
      :pagination="{ pageSize: 10 }"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定删除该触发器？" @confirm="handleDelete(record)">
              <a class="text-red-500">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑触发器 Drawer -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? '编辑触发器' : '新增触发器'"
      width="620"
      @close="resetForm"
    >
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="触发器名称" required>
              <a-input v-model:value="form.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="定义类型" required>
              <a-select v-model:value="form.defineType">
                <a-select-option value="配置">配置</a-select-option>
                <a-select-option value="自定义">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="执行频率" required>
              <a-select v-model:value="form.frequency" @change="generateCron">
                <a-select-option value="每天">每天</a-select-option>
                <a-select-option value="旬初">旬初</a-select-option>
                <a-select-option value="月初">月初</a-select-option>
                <a-select-option value="月末">月末</a-select-option>
                <a-select-option value="季初">季初</a-select-option>
                <a-select-option value="季末">季末</a-select-option>
                <a-select-option value="年初">年初</a-select-option>
                <a-select-option value="半年末">半年末</a-select-option>
                <a-select-option value="年末">年末</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="执行方式" required>
              <a-select v-model:value="form.execType">
                <a-select-option value="执行时间">执行时间</a-select-option>
                <a-select-option value="间隔时间">间隔时间</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="执行时间" required>
              <a-time-picker
                v-model:value="form.execTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                @change="generateCron"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开始时间" required>
              <a-date-picker v-model:value="form.startTime" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker v-model:value="form.endTime" format="YYYY-MM-DD" value-format="YYYY-MM-DD" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="克隆表达式" required>
              <a-input v-model:value="form.cronExpression" disabled />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="描述">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
      </a-form>

      <div class="flex justify-end gap-2 mt-4">
        <a-button @click="drawerVisible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmit">保存</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';

// 表格列
const columns = [
  { title: '触发器名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '定义类型', dataIndex: 'defineType', key: 'defineType', width: 100 },
  { title: '执行频率', dataIndex: 'frequency', key: 'frequency', width: 100 },
  { title: '执行方式', dataIndex: 'execType', key: 'execType', width: 100 },
  { title: '执行时间', dataIndex: 'execTime', key: 'execTime', width: 120 },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 120 },
  { title: '克隆表达式', dataIndex: 'cronExpression', key: 'cronExpression', width: 180 },
  { title: '操作', key: 'action', width: 120 }
];

// 触发器列表
const triggerList = ref<any[]>([
  {
    id: 1,
    name: '每天00:10启动',
    defineType: '配置',
    frequency: '每天',
    execType: '执行时间',
    execTime: '00:10:00',
    startTime: getToday(),
    endTime: '',
    cronExpression: '00 10 00 * * ? *',
    description: '每天执行'
  }
]);

// 获取今天日期 YYYY-MM-DD
function getToday() {
  const d = new Date();
  return d.getFullYear() + '-' + 
         String(d.getMonth() + 1).padStart(2, '0') + '-' + 
         String(d.getDate()).padStart(2, '0');
}

// Drawer 状态
const drawerVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

// 表单
const form = reactive({
  name: '',
  defineType: '配置',
  frequency: '每天',
  execType: '执行时间',
  execTime: '00:10:00',
  startTime: getToday(),
  endTime: '',
  cronExpression: '',
  description: ''
});

// 自动生成Cron表达式
const generateCron = () => {
  if (!form.execTime) return;

  const timeParts = form.execTime.split(':');
  const hour = timeParts[0];
  const minute = timeParts[1];
  const second = timeParts[2] || '00';

  let cron = '';

  switch (form.frequency) {
    case '每天':
      cron = `${second} ${minute} ${hour} * * ? *`;
      break;
    case '月初':
      cron = `${second} ${minute} ${hour} 1 * ? *`;
      break;
    case '月末':
      cron = `${second} ${minute} ${hour} L * ? *`;
      break;
    case '旬初':
      cron = `${second} ${minute} ${hour} 1-10 * ? *`;
      break;
    case '季初':
      cron = `${second} ${minute} ${hour} 1 1,4,7,10 ? *`;
      break;
    case '季末':
      cron = `${second} ${minute} ${hour} L 3,6,9,12 ? *`;
      break;
    case '年初':
      cron = `${second} ${minute} ${hour} 1 1 ? *`;
      break;
    case '半年末':
      cron = `${second} ${minute} ${hour} L 6,12 ? *`;
      break;
    case '年末':
      cron = `${second} ${minute} ${hour} L 12 ? *`;
      break;
    default:
      cron = `${second} ${minute} ${hour} * * ? *`;
  }

  form.cronExpression = cron;
};

// 新增
const handleAdd = () => {
  isEdit.value = false;
  currentId.value = null;
  Object.assign(form, {
    name: '',
    defineType: '配置',
    frequency: '每天',
    execType: '执行时间',
    execTime: '00:10:00',
    startTime: getToday(),
    endTime: '',
    cronExpression: '',
    description: ''
  });
  generateCron();
  drawerVisible.value = true;
};

// 编辑
const handleEdit = (record: any) => {
  isEdit.value = true;
  currentId.value = record.id;
  Object.assign(form, record);
  drawerVisible.value = true;
};

// 删除
const handleDelete = (record: any) => {
  triggerList.value = triggerList.value.filter(item => item.id !== record.id);
  message.success('删除成功');
};

// 保存
const handleSubmit = () => {
  if (!form.name || !form.execTime) {
    message.error('触发器名称和执行时间不能为空');
    return;
  }

  if (isEdit.value && currentId.value) {
    const index = triggerList.value.findIndex(item => item.id === currentId.value);
    if (index !== -1) {
      triggerList.value[index] = { ...form, id: currentId.value };
    }
    message.success('编辑成功');
  } else {
    triggerList.value.unshift({ ...form, id: Date.now() });
    message.success('新增成功');
  }

  drawerVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    defineType: '配置',
    frequency: '每天',
    execType: '执行时间',
    execTime: '00:10:00',
    startTime: getToday(),
    endTime: '',
    cronExpression: '',
    description: ''
  });
};
</script>