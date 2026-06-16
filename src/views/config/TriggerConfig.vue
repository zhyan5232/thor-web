<template>
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
</template>

<script setup lang="ts">
// ... 其他代码保持不变 ...
</script>