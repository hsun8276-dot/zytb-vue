<template>
  <div class="dashboard">
    <!-- 标题行 -->
    <div class="title-row">
      <div class="title-left">
        <el-icon :size="22" class="title-icon"><Odometer /></el-icon>
        <h2>仪表板</h2>
        <div class="title-divider"></div>
        <el-icon :size="16" color="#909399"><HomeFilled /></el-icon>
        <span class="crumb-sep">›</span>
        <span class="crumb">仪表板</span>
      </div>
    </div>

    <!-- 统计卡 -->
    <div class="stat-row">
      <div class="stat-card" v-for="c in cards" :key="c.label">
        <div class="stat-icon" :style="{ background: c.color }">
          <el-icon :size="26"><component :is="c.icon" /></el-icon>
        </div>
        <div class="stat-text">
          <div class="stat-label">{{ c.label }}</div>
          <div class="stat-num">{{ c.value }}<span class="stat-unit">{{ c.unit }}</span></div>
        </div>
      </div>
    </div>

    <!-- 地图 + 更新历史 -->
    <div class="content-row">
      <el-card shadow="never" class="map-card">
        <template #header>
          <div class="card-title">分省招生高校数量统计</div>
        </template>
        <div ref="mapRef" class="china-map"></div>
      </el-card>

      <el-card shadow="never" class="history-card">
        <template #header>
          <div class="card-title">软件更新历史</div>
        </template>
        <el-timeline class="history-timeline">
          <el-timeline-item
            v-for="(h, i) in history"
            :key="i"
            :color="historyColors[i % historyColors.length]"
            :timestamp="h.date"
            placement="top"
          >
            <div class="history-body">{{ h.body }}</div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'
import chinaGeo from '@/assets/geo/china.json'
import { Odometer, HomeFilled, School, LocationFilled, DataAnalysis, Tickets } from '@element-plus/icons-vue'
import request from '@/utils/request'

const stats = ref({
  collegeCount: '-',
  provinceCount: '-',
  historyYears: '-',
  majorCount: '-',
  provinceStats: [] as { name: string; value: number }[]
})

const cards = ref([
  { label: '高校', value: '-', unit: ' 所', color: '#2f7bff', icon: markRaw(School) },
  { label: '填报省份', value: '-', unit: ' 个', color: '#5aa7ff', icon: markRaw(LocationFilled) },
  { label: '历史数据', value: '-', unit: ' 年', color: '#5cb85c', icon: markRaw(DataAnalysis) },
  { label: '招生专业信息', value: '-', unit: ' 条', color: '#7b68c9', icon: markRaw(Tickets) }
])

// 软件更新历史(源自开发日志)
const history = [
  { date: '2026年10月', body: '“砚衡AI云数据升学规划系统”上线: 完成微服务框架搭建、管理员开通账号体系(有效期一年)、图形校验码登录、全国3075所院校数据入库与仪表板分省统计。' },
  { date: '2026年10月', body: '登录页1:1复刻并接入图形校验码, 账号有效期到期自动停用、管理员可重新开通; 院校库31个省份招生数据接入仪表板。' }
]
const historyColors = ['#5cb85c', '#3f8cff', '#e6a23c', '#f56c6c', '#7b68c9']

const mapRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

function renderMap() {
  if (!mapRef.value) return
  echarts.registerMap('china', chinaGeo as any)
  chart = echarts.init(mapRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 所' },
    visualMap: {
      type: 'piecewise',
      left: 20,
      bottom: 20,
      itemGap: 8,
      pieces: [
        { min: 141, label: '> 140', color: '#e8983f' },
        { min: 101, max: 140, label: '100 - 140', color: '#f2d24e' },
        { min: 61, max: 100, label: '60 - 100', color: '#7cc47f' },
        { min: 21, max: 60, label: '20 - 60', color: '#a8c8f0' },
        { min: 1, max: 20, label: '1 - 20', color: '#4d82d6' }
      ]
    },
    series: [{
      type: 'map',
      map: 'china',
      roam: false,
      label: { show: true, fontSize: 10, color: '#555' },
      itemStyle: { borderColor: '#ffffff', borderWidth: 0.6 },
      emphasis: { label: { color: '#222' }, itemStyle: { areaColor: '#ffd666' } },
      data: stats.value.provinceStats
    }]
  })
}

function resize() {
  chart?.resize()
}

onMounted(async () => {
  const s = await request.get('/college/stats') as any
  stats.value = s
  cards.value[0].value = Number(s.collegeCount).toLocaleString()
  cards.value[1].value = s.provinceCount
  cards.value[2].value = s.historyYears
  cards.value[3].value = Number(s.majorCount).toLocaleString()
  renderMap()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard {
  .title-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .title-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .title-icon {
        color: #303133;
      }

      h2 {
        margin: 0;
        font-size: 20px;
      }

      .title-divider {
        width: 1px;
        height: 22px;
        background: #e0e0e0;
        margin: 0 8px;
      }

      .crumb-sep {
        color: #c0c4cc;
      }

      .crumb {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 18px;

    .stat-card {
      background: #fff;
      border-radius: 6px;
      padding: 22px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 4px rgba(30, 40, 60, 0.06);

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }

      .stat-num {
        font-size: 26px;
        font-weight: 700;
        color: #303133;

        .stat-unit {
          font-size: 14px;
          font-weight: 400;
          margin-left: 4px;
          color: #606266;
        }
      }
    }
  }

  .content-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 18px;
    align-items: start;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .china-map {
      height: 520px;
    }

    .history-timeline {
      padding: 6px 4px 0 2px;
      max-height: 520px;
      overflow-y: auto;

      .history-body {
        font-size: 13px;
        color: #606266;
        line-height: 1.8;
      }
    }
  }
}
</style>
