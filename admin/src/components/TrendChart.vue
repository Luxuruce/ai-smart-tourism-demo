<script setup lang="ts">
// 月度差评率折线：坐标系与 Dashboard.dc.html 的 660×184 SVG 一致（12% → y20，3% → y140）
import { computed } from 'vue'
import type { TrendPoint } from '@qs/shared'

const props = defineProps<{ points: TrendPoint[]; launchAfterIndex: number }>()

const TICKS = [12, 9, 6, 3]
const X0 = 80
const STEP = 96
const y = (rate: number) => 20 + ((12 - rate) * 120) / 9
const x = (i: number) => X0 + i * STEP

const pts = computed(() => props.points.map((p, i) => ({ ...p, x: x(i), y: y(p.rate) })))
const path = computed(() => pts.value.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y.toFixed(1)}`).join(' '))
const launchX = computed(() => x(props.launchAfterIndex) + STEP / 3)
const last = computed(() => pts.value[pts.value.length - 1])
</script>

<template>
  <svg class="chart" viewBox="0 0 660 184" fill="none" role="img" :aria-label="`月度差评率：${points.map((p) => `${p.month} ${p.rate}%`).join('，')}`">
    <line v-for="t in TICKS" :key="t" x1="48" :y1="y(t)" x2="640" :y2="y(t)" class="grid" />
    <line x1="48" y1="160" x2="640" y2="160" class="axis" />
    <text v-for="t in TICKS" :key="'l' + t" x="40" :y="y(t) + 4" class="tick" text-anchor="end">{{ t }}%</text>
    <line :x1="launchX" y1="14" :x2="launchX" y2="160" class="launch" />
    <text :x="launchX + 6" y="28" class="launch-label">产品上线</text>
    <path :d="path" class="line" />
    <circle v-for="(p, i) in pts" :key="p.month" :cx="p.x" :cy="p.y" :r="i === pts.length - 1 ? 6 : 5" class="dot">
      <title>{{ p.month }}：{{ p.rate }}%</title>
    </circle>
    <text v-if="last" :x="last.x + 12" :y="last.y - 4" class="last">{{ last.rate }}%</text>
    <text v-for="p in pts" :key="'m' + p.month" :x="p.x" y="178" class="tick" text-anchor="middle">{{ p.month }}</text>
  </svg>
</template>

<style scoped>
.chart { width: 100%; max-width: 660px; height: auto; display: block; }
.grid { stroke: var(--surface-muted); }
.axis { stroke: var(--border-strong); }
.tick { fill: var(--text-2); font-size: 11px; }
.launch { stroke: var(--action); stroke-dasharray: 4 4; }
.launch-label { fill: var(--action-fg); font-size: 11px; font-weight: 700; }
.line { stroke: var(--primary); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.dot { fill: var(--primary); stroke: var(--on-color); stroke-width: 2; }
.last { fill: var(--text); font-size: 12px; font-weight: 700; }
</style>
