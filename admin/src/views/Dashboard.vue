<script setup lang="ts">
// B1 运营驾驶舱（Dashboard.dc.html）
import { computed, ref } from 'vue'
import type { Alert } from '@qs/shared'
import StateBlock from '@/components/StateBlock.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import TrendChart from '@/components/TrendChart.vue'
import { useAsync } from '@/components/useAsync'
import { toast } from '@/components/toast'
import {
  getAlerts, getBadRateTrend, getComplaintShares, getDataSources, getKpis, getTopQuestions, pushAdvice,
} from '@/services/dashboard'
import { useAlertStore } from '@/stores/alerts'

const sources = useAsync(getDataSources)
const kpis = useAsync(getKpis)
const trend = useAsync(getBadRateTrend, (v) => v.points.length === 0)
const questions = useAsync(getTopQuestions)
const alerts = useAsync(getAlerts)
const shares = useAsync(getComplaintShares)
const alertStore = useAlertStore()

const pending = computed(() => (alerts.data.value ?? []).filter((a) => !alertStore.pushed.includes(a.id)).length)
const gapCount = computed(() => (questions.data.value ?? []).filter((q) => q.flag?.kind === 'gap').length)
const maxShare = computed(() => Math.max(1, ...(shares.data.value ?? []).map((s) => s.percent)))

// 推送前必须二次确认（PRD：推送和派单由人工确认，AI 只给建议）
const confirming = ref<Alert | null>(null)
const pushing = ref(false)
async function doPush() {
  const a = confirming.value
  if (!a) return
  pushing.value = true
  try {
    await pushAdvice(a.id)
    alertStore.markPushed(a.id)
    confirming.value = null
  } catch (e) {
    toast(e instanceof Error ? e.message : '推送失败，请重试')
  } finally {
    pushing.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="head__title">
        <div class="page-title">运营驾驶舱</div>
        <div class="page-sub">近 6 个月 · 今日实时 · 以下均为示例数据</div>
      </div>
      <div class="sources">
        <span v-for="s in sources.data.value ?? []" :key="s.label" :class="['source', { 'source--off': !s.enabled }]">{{ s.label }}</span>
      </div>
    </header>

    <StateBlock :status="kpis.status.value" :rows="1" :row-height="96" :error="kpis.error.value" @retry="kpis.reload">
      <section class="kpis" aria-label="核心指标">
        <div v-for="k in kpis.data.value ?? []" :key="k.label" class="card kpi">
          <div class="kpi__label">{{ k.label }}</div>
          <div class="kpi__value serif">{{ k.value }}</div>
          <div :class="['kpi__sub', { 'kpi__sub--good': k.trend === 'good' }]">{{ k.sub }}</div>
        </div>
      </section>
    </StateBlock>

    <div class="cols">
      <div class="col col--wide">
        <section class="card panel">
          <div class="panel__head">
            <h2 class="panel__title">月度差评率</h2>
            <span class="panel__note">{{ trend.data.value?.note }}</span>
          </div>
          <StateBlock :status="trend.status.value" :rows="1" :row-height="184" :error="trend.error.value" @retry="trend.reload">
            <TrendChart v-if="trend.data.value" :points="trend.data.value.points" :launch-after-index="trend.data.value.launchAfterIndex" />
          </StateBlock>
        </section>

        <section class="card panel panel--grow">
          <div class="panel__head panel__head--center">
            <h2 class="panel__title panel__title--grow">游客在问什么 · 今日 TOP 6</h2>
            <span class="panel__note">来自 AI 导游问答</span>
            <span v-if="gapCount" class="badge-warn">知识库待补 {{ gapCount }} 条</span>
          </div>
          <StateBlock :status="questions.status.value" :rows="6" :error="questions.error.value" empty-text="今天还没有游客提问" @retry="questions.reload">
            <ol class="qs">
              <li v-for="q in questions.data.value ?? []" :key="q.rank" class="q">
                <span class="q__rank">{{ q.rank }}</span>
                <span class="q__text">{{ q.text }}</span>
                <span class="q__count">{{ q.count }}</span>
                <span :class="['q__flag', q.flag ? `q__flag--${q.flag.kind}` : '']">{{ q.flag?.text }}</span>
              </li>
            </ol>
          </StateBlock>
        </section>
      </div>

      <div class="col col--narrow">
        <section class="card panel">
          <div class="panel__head">
            <h2 class="panel__title">AI 预警与建议</h2>
            <span class="pending" aria-live="polite">待处置 {{ pending }}</span>
          </div>
          <StateBlock :status="alerts.status.value" :rows="3" :row-height="96" :error="alerts.error.value" empty-text="暂无预警" @retry="alerts.reload">
            <div class="alerts">
              <div v-for="a in alerts.data.value ?? []" :key="a.id" :class="['alert', `alert--${a.level}`]">
                <div class="alert__cat">{{ a.category }} · {{ a.level === 'high' ? '高' : '中' }}</div>
                <div class="alert__title">{{ a.title }}</div>
                <div class="alert__desc">
                  {{ a.desc }}<RouterLink to="/tickets">{{ a.basis }}</RouterLink>
                </div>
                <template v-if="a.action === 'push'">
                  <span v-if="alertStore.pushed.includes(a.id)" class="alert__done" role="status">{{ a.pushedText }}</span>
                  <button v-else type="button" class="alert__push" @click="confirming = a">一键推送错峰建议</button>
                </template>
              </div>
            </div>
          </StateBlock>
        </section>

        <section class="card panel panel--grow">
          <h2 class="panel__title">差评结构（本月，按 AI 标签）</h2>
          <StateBlock :status="shares.status.value" :rows="6" :row-height="22" :error="shares.error.value" @retry="shares.reload">
            <div v-for="s in shares.data.value ?? []" :key="s.label" class="bar" :title="`${s.label} ${s.percent}%`">
              <span class="bar__label">{{ s.label }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: (s.percent / maxShare) * 100 + '%' }" /></div>
              <span class="bar__value">{{ s.percent }}%</span>
            </div>
          </StateBlock>
        </section>
      </div>
    </div>

    <ConfirmDialog
      :open="!!confirming"
      title="确认推送错峰建议？"
      :confirm-text="`确认推送给 ${confirming?.reach ?? 0} 人`"
      :busy="pushing"
      @confirm="doPush"
      @cancel="confirming = null"
    >
      <p class="confirm__p">将向正前往「文昌阁飞檐」的游客推送替代机位和「15:30 再来」建议。</p>
      <p class="confirm__reach">预计触达 <b>{{ confirming?.reach }}</b> 人</p>
      <p class="confirm__note">推送以小程序服务通知发送，游客可自行选择是否改道；推送后不可撤回。</p>
    </ConfirmDialog>
  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 16px; }
.head { display: flex; align-items: flex-end; gap: 16px; }
.head__title { display: flex; flex-direction: column; gap: 4px; flex-grow: 1; }
.sources { display: flex; gap: 8px; font-size: 12px; }
.source { padding: 6px 12px; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); }
.source--off { border: 1px dashed var(--border-strong); color: var(--text-2); }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.kpi { padding: 14px 18px; display: flex; flex-direction: column; gap: 4px; }
.kpi__label { font-size: 13px; color: var(--text-2); }
.kpi__value { font-size: 30px; }
.kpi__sub { font-size: 12px; color: var(--text-2); }
.kpi__sub--good { color: var(--ok-fg); }
.cols { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
.col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.col--wide { grid-column: span 3; }
.col--narrow { grid-column: span 2; }
.panel { padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; }
.col--narrow .panel { padding: 16px 18px; }
.panel--grow { flex-grow: 1; }
.panel__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.panel__head--center { align-items: center; }
.panel__title { margin: 0; font-size: 16px; font-weight: 700; }
.panel__title--grow { flex-grow: 1; }
.panel__note { font-size: 12px; color: var(--text-2); }
.badge-warn { padding: 4px 10px; border-radius: 12px; background: var(--warn-soft); color: var(--warn-fg); font-size: 12px; font-weight: 700; }
.qs { list-style: none; margin: 0; padding: 0; }
.q { display: flex; align-items: center; gap: 12px; min-height: 34px; border-bottom: 1px solid var(--surface-muted); font-size: 13px; }
.q__rank { width: 16px; color: var(--text-2); }
.q__text { flex-grow: 1; }
.q__count { width: 56px; text-align: right; color: var(--text-2); }
.q__flag { width: 150px; text-align: right; font-size: 12px; font-weight: 700; }
.q__flag--gap { color: var(--danger-fg); }
.q__flag--biz { color: var(--primary-fg); }
.panel:has(.alerts) { gap: 10px; }
.pending { font-size: 12px; color: var(--danger-fg); font-weight: 700; }
.alerts { display: flex; flex-direction: column; gap: 10px; }
.alert { padding: 10px 12px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px; }
.alert--high { background: var(--danger-soft); border: 1px solid var(--danger-border); gap: 6px; }
.alert--mid { background: var(--warn-soft); }
.alert__cat { font-size: 12px; font-weight: 700; }
.alert--high .alert__cat { color: var(--danger-fg); }
.alert--mid .alert__cat { color: var(--warn-fg); }
.alert__title { font-size: 14px; font-weight: 700; }
.alert__desc { font-size: 12px; line-height: 1.6; color: var(--text-2); }
.alert__push {
  align-self: flex-start; height: 34px; padding: 0 14px; border-radius: 8px; border: none;
  background: var(--danger); color: var(--on-color); font-size: 13px; font-weight: 700; cursor: pointer;
}
.alert__done { font-size: 13px; color: var(--ok-fg); font-weight: 700; }
.bar { display: flex; align-items: center; gap: 10px; }
.bar__label { width: 96px; font-size: 13px; }
.bar__track { flex-grow: 1; height: 10px; }
.bar__fill { height: 10px; background: var(--primary); border-radius: 0 4px 4px 0; }
.bar__value { width: 36px; font-size: 13px; text-align: right; }
.confirm__p, .confirm__note { margin: 0; }
.confirm__reach { margin: 10px 0; font-size: 15px; }
.confirm__reach b { font-size: 22px; color: var(--danger-fg); }
.confirm__note { font-size: 12px; color: var(--text-2); }
</style>
