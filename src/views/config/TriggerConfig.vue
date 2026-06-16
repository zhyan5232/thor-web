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