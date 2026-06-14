<template>
  <div class="space-y-6">
    <!-- 顶部统计卡片 - Shadcn 风格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div 
        v-for="(item, index) in topCards" 
        :key="index" 
        class="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-sm font-medium text-slate-500 mb-1">{{ item.title }}</div>
            <div class="text-4xl font-semibold text-slate-900 tracking-tighter">
              {{ Math.floor(item.value).toLocaleString() }}
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="item.iconBg">
            <component :is="item.icon" class="text-3xl" :style="{ color: item.iconColor }" />
          </div>
        </div>
        
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">{{ item.footerLabel }}</span>
          <span class="font-medium text-slate-700">{{ Math.floor(item.footerValue).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 主图表区域 -->
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-5">
        <div>
          <div class="text-lg font-semibold text-slate-900">系统吞吐量趋势</div>
          <div class="text-sm text-slate-500 mt-0.5">上行 / 下行流量实时监控</div>
        </div>
        <a-radio-group v-model:value="timeRange" button-style="solid" size="middle">
          <a-radio-button value="today">今日</a-radio-button>
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
        </a-radio-group>
      </div>
      <div ref="mainChartRef" class="w-full h-[380px]"></div>
    </div>

    <!-- 三列图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- 节点集群健康度 -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div class="mb-5">
          <div class="text-lg font-semibold text-slate-900">节点集群健康度</div>
          <div class="text-sm text-slate-500 mt-0.5">核心与边缘节点状态</div>
        </div>
        <div ref="radarChartRef" class="w-full h-[320px]"></div>
      </div>

      <!-- 存储分布 -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div class="mb-5">
          <div class="text-lg font-semibold text-slate-900">全网存储资源分布</div>
          <div class="text-sm text-slate-500 mt-0.5">按应用系统维度</div>
        </div>
        <div ref="pieChartRef" class="w-full h-[320px]"></div>
      </div>

      <!-- TOP 调用 -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div class="mb-5">
          <div class="text-lg font-semibold text-slate-900">应用系统调用 TOP 6</div>
          <div class="text-sm text-slate-500 mt-0.5">近期调用频次排行</div>
        </div>
        <div ref="barChartRef" class="w-full h-[320px]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { gsap } from 'gsap';
import * as echarts from 'echarts';

import { 
  IdcardTwoTone, 
  PieChartTwoTone, 
  CloseCircleTwoTone, 
  DashboardTwoTone 
} from '@ant-design/icons-vue';

const timeRange = ref('today');

// 统计卡片数据
const topCards = reactive([
  { 
    title: '正在传输的作业', 
    value: 0, 
    targetValue: 1284, 
    footerLabel: '系统最大承载', 
    footerValue: 5000, 
    icon: shallowRef(IdcardTwoTone),
    iconColor: '#0f172a',
    iconBg: 'bg-slate-100'
  },
  { 
    title: '成功传输的作业', 
    value: 0, 
    targetValue: 85492, 
    footerLabel: '历史总成功量', 
    footerValue: 12500000, 
    icon: shallowRef(PieChartTwoTone),
    iconColor: '#10b981',
    iconBg: 'bg-emerald-100'
  },
  { 
    title: '传输失败的作业', 
    value: 0, 
    targetValue: 142, 
    footerLabel: '相比上周环比', 
    footerValue: 12, 
    icon: shallowRef(CloseCircleTwoTone),
    iconColor: '#ef4444',
    iconBg: 'bg-red-100'
  },
  { 
    title: '等待就绪的作业', 
    value: 0, 
    targetValue: 35, 
    footerLabel: '平均排队时长(ms)', 
    footerValue: 412, 
    icon: shallowRef(DashboardTwoTone),
    iconColor: '#f59e0b',
    iconBg: 'bg-amber-100'
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
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['上行流量 (Mbps)', '下行流量 (Mbps)'], icon: 'circle', right: 0, top: 0 },
    grid: { left: '2%', right: '2%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: [
      {
        type: 'category', boundaryGap: false,
        data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#64748b', fontSize: 12 }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#64748b', fontSize: 12 },
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
      }
    ],
    series: [
      {
        name: '上行流量 (Mbps)', type: 'line', smooth: true, showSymbol: false,
        itemStyle: { color: '#0f172a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(15,23,42,0.12)' }, { offset: 1, color: 'rgba(15,23,42,0.02)' }
          ])
        },
        data: [120, 132, 101, 134, 90, 230, 210, 290, 230]
      },
      {
        name: '下行流量 (Mbps)', type: 'line', smooth: true, showSymbol: false,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.15)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }
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
      radius: '65%',
      indicator: [
        { name: 'CPU', max: 100 }, { name: '内存', max: 100 },
        { name: '磁盘', max: 100 }, { name: '网络', max: 100 },
        { name: '并发', max: 100 }, { name: '可用', max: 100 }
      ],
      axisName: { color: '#475569', fontSize: 12 },
      splitArea: { areaStyle: { color: ['rgba(248,250,252,0.6)','rgba(226,232,240,0.3)'] } },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitLine: { lineStyle: { color: '#e2e8f0' } }
    },
    series: [{
      name: '健康度', type: 'radar',
      data: [
        { value: [42, 60, 35, 12, 80, 95], name: '核心节点', itemStyle: { color: '#0f172a' }, areaStyle: { color: 'rgba(15,23,42,0.12)' } },
        { value: [60, 80, 55, 30, 60, 75], name: '边缘节点', itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.12)' } }
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
    legend: { bottom: '0%', left: 'center', icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#475569' } },
    series: [{
      name: '存储分布', type: 'pie', radius: ['48%', '72%'], center: ['50%', '48%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      data: [
        { value: 1048, name: '交易系统', itemStyle: { color: '#0f172a' } },
        { value: 735, name: '影像归档', itemStyle: { color: '#64748b' } },
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
    grid: { left: '3%', right: '4%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
    yAxis: { type: 'category', data: ['核心', '支付', '风控', '总线', '柜面', '移动'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#475569', fontSize: 13 } },
    series: [{
      name: '调用次数', type: 'bar', barWidth: '55%',
      itemStyle: { borderRadius: [0, 6, 6, 0], color: '#0f172a' },
      data: [320, 502, 601, 834, 1090, 1330]
    }]
  });
};

const handleResize = () => {
  charts.forEach(chart => chart.resize());
};

onMounted(() => {
  topCards.forEach(card => {
    gsap.to(card, { value: card.targetValue, duration: 1.6, ease: "power2.out", snap: { value: 1 } });
  });

  setTimeout(() => {
    initMainChart();
    initRadarChart();
    initPieChart();
    initBarChart();
  }, 120);

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  charts.forEach(chart => chart.dispose());
  charts = [];
});
</script>