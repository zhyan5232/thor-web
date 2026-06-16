<template>
  <a-form :model="form" layout="vertical">
    <!-- 执行方式 -->
    <a-form-item label="执行方式" required>
      <a-select v-model:value="form.execType" @change="onExecTypeChange">
        <a-select-option value="执行时间">执行时间</a-select-option>
        <a-select-option value="间隔时间">间隔时间</a-select-option>
      </a-select>
    </a-form-item>

    <!-- 执行时间模式 -->
    <a-row v-if="form.execType === '执行时间'" :gutter="16">
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
    </a-row>

    <!-- 间隔时间模式 -->
    <a-row v-else :gutter="16">
      <a-col :span="8">
        <a-form-item label="间隔时间" required>
          <a-input-number v-model:value="form.intervalValue" :min="1" style="width:100%" @change="generateCron" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="单位" required>
          <a-select v-model:value="form.intervalUnit" @change="generateCron">
            <a-select-option value="秒">秒</a-select-option>
            <a-select-option value="分">分</a-select-option>
            <a-select-option value="时">时</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Cron 表达式预览 -->
    <a-form-item label="Cron 表达式">
      <a-input v-model:value="form.cronExpression" disabled />
    </a-form-item>

    <a-form-item label="描述">
      <a-textarea v-model:value="form.description" :rows="3" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const form = reactive({
  execType: '执行时间',
  execTime: '09:00:00',
  intervalValue: 1,
  intervalUnit: '分',
  cronExpression: '',
  description: ''
});

function onExecTypeChange() {
  form.cronExpression = '';
  if (form.execType === '执行时间') {
    form.intervalValue = 1;
    form.intervalUnit = '分';
  } else {
    form.execTime = '';
  }
  generateCron();
}

function generateCron() {
  if (form.execType === '执行时间' && form.execTime) {
    const [hour, minute, second] = form.execTime.split(':');
    form.cronExpression = `${second} ${minute} ${hour} * * ?`;
  } else if (form.execType === '间隔时间' && form.intervalValue && form.intervalUnit) {
    let cron = '';
    const value = form.intervalValue;
    if (form.intervalUnit === '秒') {
      cron = `0/${value} * * * * ?`;
    } else if (form.intervalUnit === '分') {
      cron = `0 0/${value} * * * ?`;
    } else if (form.intervalUnit === '时') {
      cron = `0 0 0/${value} * * ?`;
    }
    form.cronExpression = cron;
  }
}

// 初始化生成一次
setTimeout(() => {
  generateCron();
}, 100);
</script>