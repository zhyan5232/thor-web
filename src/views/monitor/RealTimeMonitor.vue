<template>
  <div class="p-4 bg-[#f0f2f5] min-h-full">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div 
        v-for="(item, index) in topCards" 
        :key="index" 
        class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow duration-300 cursor-pointer"
      >
        <div class="text-[16px] font-bold text-gray-900 mb-4">
          {{ item.title }}
        </div>
        
        <div class="flex justify-between items-center mb-4">
          <span class="text-[30px] text-gray-900 font-sans tracking-tight">
            {{ Math.floor(item.value).toLocaleString() }}
          </span>
          <component 
            :is="item.icon" 
            class="text-[44px]" 
            :two-tone-color="item.iconColor" 
          />
        </div>
        
        <div class="flex justify-between items-center text-[14px] mt-2">
          <span class="text-gray-600">{{ item.footerLabel }}</span>
          <span class="text-gray-900">{{ Math.floor(item.footerValue).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 mb-4 p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <span class="text-base font-bold text-gray-900">系统吞吐量趋势 / 任务调度频次</span>
        <a-radio-group v-model:value="timeRange" button-style="solid" size="small">
          <a-radio-button value="today">今日</a-radio-button>
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
        </a-radio-group>
      </div>
      <div ref="mainChartRef" class="w-full h-[350px]"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
        <div class="text-base font-bold text-gray-900 mb-4">节点集群健康度</div>
        <div ref="radarChartRef" class="w-full h-[300px]"></div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
        <div class="text-base font-bold text-gray-900 mb-4">全网存储资源分布</div>
        <div ref="pieChartRef" class="w-full h-[300px]"></div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
        <div class="text-base font-bold text-gray-900 mb-4">应用系统调用 TOP 6</div>
        <div ref="barChartRef" class="w-full h-[300px]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { gsap } from 'gsap';
import * as echarts from 'echarts';

// 修复点：将不存在的 CloudDownloadTwoTone 替换为 CloseCircleTwoTone
import { 
  IdcardTwoTone, 
  PieChartTwoTone, 
  CloseCircleTwoTone, 
  DashboardTwoTone 
} from '@ant-design/icons-vue';

const timeRange = ref('today');

// 严格按照 Thor 业务数据 + Vben 截图布局构造数据
const topCards = reactive([
  { 
    title: '正在传输的作业', 
    value: 0, 
    targetValue: 1284, 
    footerLabel: '系统最大承载', 
    footerValue: 5000, 
    icon: shallowRef(IdcardTwoTone),
    iconColor: '#3b82f6'
  },
  { 
    title: '成功传输的作业', 
    value: 0, 
    targetValue: 85492, 
    footerLabel: '历史总成功量', 
    footerValue: 12500000, 
    icon: shallowRef(PieChartTwoTone),
    iconColor: '#10b981' 
  },
  { 
    title: '传输失败的作业', 
    value: 0, 
    targetValue: 142, 
    footerLabel: '相比上周环比', 
    footerValue: 12, 
    icon: shallowRef(CloseCircleTwoTone), // 替换为存在的图标
    iconColor: '#ef4444' 
  },
  { 
    title: '等待就绪的作业', 
    value: 0, 
    targetValue: 35, 
    footerLabel: '平均排队时长(ms)', 
    footerValue: 412, 
    icon: shallowRef(DashboardTwoTone),
    iconColor: '#f59e0b' 
  }
]);

// 图表 Ref
const mainChartRef = ref<HTMLElement | null>(null);
const radarChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);

let charts: echarts.ECharts[] = [];

const initMainChart = () => {
  if (!mainChartRef.value) return;
  const chart = echarts.init(mainChartRef.value);
  charts.push(chart);
  
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
    legend: { data: ['上行流量 (Mbps)', '下行流量 (Mbps)'], icon: 'circle', right: 0 },
    grid: { left: '1%', right: '1%', bottom: '0%', containLabel: true },
    xAxis: [
      {
        type: 'category', boundaryGap: false,
        data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8c8c8c' }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8c8c8c' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } }
      }
    ],
    series: [
      {
        name: '上行流量 (Mbps)', type: 'line', smooth: true, showSymbol: false,
        itemStyle: { color: '#0960bd' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(9,96,189,0.3)' }, { offset: 1, color: 'rgba(9,96,189,0.05)' }
          ])
        },
        data: [120, 132, 101, 134, 90, 230, 210, 290, 230]
      },
      {
        name: '下行流量 (Mbps)', type: 'line', smooth: true, showSymbol: false,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.05)' }
          ])
        },
        data: [220, 182, 191, 234, 290, 330, 310, 410, 320]
      }
    ]
  });
};

const initRadarChart = () => {
  if (!radarChartRef.value) return;
  const chart = echarts.init(radarChartRef.value);
  charts.push(chart);

  chart.setOption({
    tooltip: {},
    radar: {
      radius: '60%',
      indicator: [
        { name: 'CPU', max: 100 }, { name: '内存', max: 100 },
        { name: '磁盘', max: 100 }, { name: '网络', max: 100 },
        { name: '并发', max: 100 }, { name: '可用', max: 100 }
      ],
      axisName: { color: '#595959' },
      splitArea: { areaStyle: { color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.1)'] } },
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      splitLine: { lineStyle: { color: '#e8e8e8' } }
    },
    series: [{
      name: '健康度', type: 'radar',
      data: [
        { value: [42, 60, 35, 12, 80, 95], name: '核心节点', itemStyle: { color: '#0960bd' }, areaStyle: { color: 'rgba(9,96,189,0.2)' } },
        { value: [60, 80, 55, 30, 60, 75], name: '边缘节点', itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.2)' } }
      ]
    }]
  });
};

const initPieChart = () => {
  if (!pieChartRef.value) return;
  const chart = echarts.init(pieChartRef.value);
  charts.push(chart);

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center', icon: 'circle', itemWidth: 10, itemHeight: 10 },
    series: [{
      name: '存储分布', type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 1048, name: '交易系统', itemStyle: { color: '#0960bd' } },
        { value: 735, name: '影像归档', itemStyle: { color: '#3b82f6' } },
        { value: 580, name: '日志备份', itemStyle: { color: '#10b981' } },
        { value: 484, name: '缓冲池', itemStyle: { color: '#f59e0b' } },
      ]
    }]
  });
};

const initBarChart = () => {
  if (!barChartRef.value) return;
  const chart = echarts.init(barChartRef.value);
  charts.push(chart);

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } }, axisLabel: { color: '#8c8c8c' } },
    yAxis: { type: 'category', data: ['核心', '支付', '风控', '总线', '柜面', '移动'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#595959' } },
    series: [{
      name: '调用次数', type: 'bar', barWidth: '40%',
      itemStyle: { borderRadius: [0, 4, 4, 0], color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#0960bd' }]) },
      data: [320, 502, 601, 834, 1090, 1330]
    }]
  });
};

const handleResize = () => {
  charts.forEach(chart => chart.resize());
};

onMounted(() => {
  topCards.forEach(card => {
    gsap.to(card, { value: card.targetValue, duration: 1.5, ease: "power2.out", snap: { value: 1 } });
  });

  setTimeout(() => {
    initMainChart();
    initRadarChart();
    initPieChart();
    initBarChart();
  }, 100);

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  charts.forEach(chart => chart.dispose());
  charts = [];
});
</script>