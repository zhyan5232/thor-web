<template>
  <div>
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
          <a-input-number v-model:value="form.intervalValue" :min="0" style="width:100%" @change="generateCron" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';

// TODO: 完整的 form、methods、generateCron 等逻辑需要从你本地最新版本补充
// 这里保留基本结构以便编译通过

const form = reactive({
  execType: '执行时间',
  execTime: '',
  intervalValue: 1,
  intervalUnit: '分'
});

function generateCron() {
  // TODO: 实现 cron 生成逻辑
  console.log('generateCron called');
}

function onExecTypeChange() {
  // TODO: 重置相关字段
}

onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped>
/* 样式可后续补充 */
</style>