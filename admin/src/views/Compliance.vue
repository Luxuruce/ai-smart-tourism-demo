<script setup lang="ts">
// B2 评级合规自检（Compliance.dc.html）
import type { ComplianceResult } from '@qs/shared'
import StateBlock from '@/components/StateBlock.vue'
import { useAsync } from '@/components/useAsync'
import { toast } from '@/components/toast'
import { getComplianceSummary } from '@/services/compliance'

const res = useAsync(getComplianceSummary, (v) => v.items.length === 0)

// 结果同时用符号和颜色表达
const RESULT: Record<ComplianceResult, { label: string; symbol: string }> = {
  pass: { label: '达标', symbol: '●' },
  partial: { label: '部分达标', symbol: '▲' },
  fail: { label: '未达标', symbol: '✕' },
  na: { label: '不适用', symbol: '—' },
}
const ORDER: ComplianceResult[] = ['pass', 'partial', 'fail', 'na']

const demoOnly = () => toast('原型演示，暂不生成文件')
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="head__title">
        <div class="page-title">评级合规自检</div>
        <div class="page-sub">{{ res.data.value?.subtitle ?? '对照 GB/T 17775-2024 智慧旅游及相关条款' }}</div>
      </div>
      <button type="button" class="btn-outline" @click="demoOnly">重新自检</button>
      <button type="button" class="btn-action" @click="demoOnly">导出自检报告（Word / PDF）</button>
    </header>

    <StateBlock :status="res.status.value" :rows="1" :row-height="78" :error="res.error.value" @retry="res.reload">
      <section class="stats" aria-label="自检统计">
        <div v-for="r in ORDER" :key="r" class="card stat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :class="['stat__icon', `stat__icon--${r}`]" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path v-if="r === 'pass'" d="M8 12.5l2.5 2.5L16 9.5" />
            <path v-else-if="r === 'partial'" d="M12 7v6M12 16.5v.5" />
            <path v-else-if="r === 'fail'" d="M9 9l6 6M15 9l-6 6" />
            <path v-else d="M8 12h8" />
          </svg>
          <div class="stat__text">
            <span class="stat__label">{{ RESULT[r].label }}</span>
            <span class="stat__num serif">{{ res.data.value?.counts[r] }}</span>
          </div>
        </div>
      </section>
    </StateBlock>

    <section class="card table" aria-label="条款明细">
      <div class="row row--head" role="row">
        <span>条款</span><span>要求要点</span><span>结果</span><span>证据（自动采集 / 景区上传）</span><span>差距与建议</span>
      </div>
      <StateBlock :status="res.status.value" :rows="5" :row-height="52" :error="res.error.value" empty-text="还没有自检结果，点「重新自检」生成" @retry="res.reload">
        <div v-for="(it, i) in res.data.value?.items ?? []" :key="i" class="row" role="row">
          <span class="muted">{{ it.clause }}</span>
          <span>{{ it.requirement }}</span>
          <span :class="['result', `result--${it.result}`]">{{ RESULT[it.result].symbol }} {{ RESULT[it.result].label }}</span>
          <span>{{ it.evidence }}</span>
          <span :class="{ muted: it.gap === '—' }">{{ it.gap }}</span>
        </div>
      </StateBlock>
      <div class="table__gap" />
      <!-- 免责声明必须保留 -->
      <div class="disclaimer">{{ res.data.value?.disclaimer ?? '本报告为自检辅助材料，不代表评定机构结论。' }}</div>
    </section>
  </div>
</template>

<style scoped>
.page { padding: 28px 36px; display: flex; flex-direction: column; gap: 20px; min-height: 100vh; }
.head { display: flex; align-items: flex-end; gap: 16px; }
.head__title { display: flex; flex-direction: column; gap: 4px; flex-grow: 1; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.stat { padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
.stat__icon { stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.stat__icon--pass { stroke: var(--heat-low-dot); }
.stat__icon--partial { stroke: var(--warn-icon); }
.stat__icon--fail { stroke: var(--danger-fg); }
.stat__icon--na { stroke: var(--text-2); }
.stat__text { display: flex; flex-direction: column; }
.stat__label { font-size: 13px; color: var(--text-2); }
.stat__num { font-size: 28px; }
.table { overflow: hidden; flex-grow: 1; display: flex; flex-direction: column; }
.row {
  display: grid; grid-template-columns: 90px 1.6fr 110px 1.8fr 1.2fr; gap: 16px; padding: 14px 20px;
  border-top: 1px solid var(--surface-muted); font-size: 13px; line-height: 1.6; align-items: start;
}
.row--head { background: var(--surface-muted); font-weight: 700; border-top: none; line-height: 1.5; }
.table :deep(.sk), .table :deep(.msg) { margin: 14px 20px; }
.muted { color: var(--text-2); }
.result { font-weight: 700; }
.result--pass { color: var(--ok-fg); }
.result--partial { color: var(--warn-fg); }
.result--fail { color: var(--danger-fg); }
.result--na { color: var(--text-2); }
.table__gap { flex-grow: 1; }
.disclaimer { padding: 12px 20px; border-top: 1px solid var(--surface-muted); font-size: 12px; color: var(--text-2); }
</style>
