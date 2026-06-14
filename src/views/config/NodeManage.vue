 <template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">节点管理</h2>
        <p class="text-muted-foreground">管理分布式文件传输节点</p>
      </div>
      <a-button type="primary" @click="showAddModal" class="flex items-center gap-2">
        <PlusOutlined />
        新增节点
      </a-button>
    </div>

    <!-- 搜索区 -->
    <a-card class="shadow-sm">
      <div class="flex gap-4">
        <a-input-search v-model:value="searchForm.keyword" placeholder="搜索节点名称 / IP" style="width: 320px" @search="handleSearch" />
        <a-select v-model:value="searchForm.status" placeholder="状态" style="width: 120px" @change="handleSearch">
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="online">在线</a-select-option>
          <a-select-option value="offline">离线</a-select-option>
          <a-select-option value="disabled">禁用</a-select-option>
        </a-select>
        <a-button @click="resetSearch">重置</a-button>
      </div>
    </a-card>

    <!-- 表格 -->
    <a-card class="shadow-sm">
      <a-table :columns="columns" :data-source="dataSource" :loading="loading" row-key="id" :pagination="pagination" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'online' ? 'green' : record.status === 'offline' ? 'orange' : 'red'">
              {{ record.statusText }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editNode(record)">编辑</a-button>
              <a-button type="link" size="small" danger @click="deleteNode(record)">删除</a-button>
              <a-button type="link" size="small" @click="testConnection(record)">测试连接</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑 Drawer -->
    <a-drawer v-model:open="drawerVisible" :title="isEdit ? '编辑节点' : '新增节点'" width="600">
      <a-form :model="form" layout="vertical" :rules="rules" ref="formRef">
        <a-form-item label="节点编码" name="nodeCode" required>
          <a-input v-model:value="form.nodeCode" placeholder="例如: NODE-001" />
        </a-form-item>
        <a-form-item label="节点名称" name="nodeName" required>
          <a-input v-model:value="form.nodeName" placeholder="请输入节点名称" />
        </a-form-item>
        <a-form-item label="节点类型" name="nodeType" required>
          <a-select v-model:value="form.nodeType">
            <a-select-option value="source">源节点</a-select-option>
            <a-select-option value="target">目标节点</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="IP地址" name="ip" required>
          <a-input v-model:value="form.ip" placeholder="192.168.1.100" />
        </a-form-item>
        <a-form-item label="端口" name="port" required>
          <a-input-number v-model:value="form.port" :min="1" :max="65535" style="width: 100%" />
        </a-form-item>
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="form.username" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
      </a-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <a-button @click="closeDrawer">取消</a-button>
          <a-button type="primary" @click="saveNode">保存</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';

const dataSource = ref([]);
const loading = ref(false);
const drawerVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const form = ref({
  id: '',
  nodeCode: '',
  nodeName: '',
  nodeType: 'target',
  ip: '',
  port: 22,
  username: '',
  description: ''
});

const columns = [
  { title: '节点编码', dataIndex: 'nodeCode', key: 'nodeCode' },
  { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName' },
  { title: '类型', dataIndex: 'nodeType', key: 'nodeType' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
  { title: '端口', dataIndex: 'port', key: 'port' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 220 }
];

const searchForm = ref({ keyword: '', status: '' });
const pagination = ref({ current: 1, pageSize: 10, total: 0 });

// Mock data
onMounted(() => {
  loadData();
});

const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    dataSource.value = [
      {
        id: 1,
        nodeCode: 'NODE-001',
        nodeName: '北京生产节点',
        nodeType: 'source',
        ip: '10.0.0.101',
        port: 22,
        status: 'online',
        statusText: '在线'
      },
      {
        id: 2,
        nodeCode: 'NODE-002',
        nodeName: '上海备份节点',
        nodeType: 'target',
        ip: '10.0.1.55',
        port: 22,
        status: 'offline',
        statusText: '离线'
      }
    ];
    loading.value = false;
  }, 300);
};

const showAddModal = () => {
  isEdit.value = false;
  form.value = { id: '', nodeCode: '', nodeName: '', nodeType: 'target', ip: '', port: 22, username: '', description: '' };
  drawerVisible.value = true;
};

const editNode = (record) => {
  isEdit.value = true;
  form.value = { ...record };
  drawerVisible.value = true;
};

const saveNode = () => {
  // TODO: call API
  drawerVisible.value = false;
  loadData();
};

const closeDrawer = () => {
  drawerVisible.value = false;
};

const deleteNode = (record) => {
  if (confirm(`确定删除节点 ${record.nodeName} 吗？`)) {
    loadData();
  }
};

const testConnection = (record) => {
  alert(`正在测试节点 ${record.nodeName} 连接...`);
};

const handleSearch = () => loadData();

const resetSearch = () => {
  searchForm.value = { keyword: '', status: '' };
  loadData();
};

const handleTableChange = (pag) => {
  pagination.value = pag;
  loadData();
};
</script>

<style scoped>
/* Additional styles if needed */
</style>