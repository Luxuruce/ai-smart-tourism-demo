<script setup lang="ts">
// B1 运营驾驶舱（Dashboard.dc.html）
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Alert, DispatchDraft, TopQuestion } from '@qs/shared'
import StateBlock from '@/components/StateBlock.vue'
import AppDialog from '@/components/AppDialog.vue'
import DispatchDialog from '@/components/DispatchDialog.vue'
import TrendChart from '@/components/TrendChart.vue'
import { useAsync } from '@/components/useAsync'
import { toast } from '@/components/toast'
import {
  dispatchTicket, getAlerts, getBadRateTrend, getComplaintShares, getCrowdReviews, getDataSources, getKpis,
  getTopQuestions, pushAdvice, pushCopy,
} from '@/services/dashboard'
import { getKnowledgeEntries, getPendingQuestions } from '@/services/knowledge'
import { tagSlug } from '@/services/reviews'
import { getTickets } from '@/services/tickets'
import { useAlertStore } from '@/stores/alerts'
import { useKnowledgeStore } from '@/stores/knowledge'
import { useTicketStore } from '@/stores/tickets'

const sources = useAsync(getDataSources)
const kpis = useAsync(getKpis)
const trend = useAsync(getBadRateTrend, (v) => v.points.length === 0)
const questions = useAsync(getTopQuestions)
const alerts = useAsync(getAlerts)
const shares = useAsync(getComplaintShares)
const alertStore = useAlertStore()

const ticketStore = useTicketStore()
const router = useRouter()

const pending = computed(() => (alerts.data.value ?? []).filter((a) => !alertStore.handled(a.id)).length)
// 「知识库待补 N 条」和「待补」标签读知识库（14.3 11.3.2 / 11.3.7、清单 12.3）
const knowledge = useKnowledgeStore()
onMounted(async () => {
  if (knowledge.loaded) return
  try {
    const [p, e] = await Promise.all([getPendingQuestions(), getKnowledgeEntries()])
    knowledge.init(p, e)
  } catch {
    // 知识库加载失败时只影响「待补」数字，驾驶舱其他内容照常显示
  }
})
const gapCount = computed(() => (knowledge.loaded ? knowledge.pending.length : 0))
/** 「待补」标签：补录后改为「已补录 · 待审核」（不可点），审核通过后去掉 */
function flagOf(q: TopQuestion) {
  if (!q.flag) return null
  if (q.flag.kind !== 'gap' || !q.pendingId) return { text: q.flag.text, kind: q.flag.kind, link: false }
  const state = knowledge.pendingState(q.pendingId)
  if (state === 'done') return null
  if (state === 'submitted') return { text: '已补录 · 待审核', kind: 'submitted', link: false }
  return { text: q.flag.text, kind: 'gap', link: true }
}
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

// 「依据 8 条差评」：打开差评列表弹窗（13.4 5.1）
const reviewsOpen = ref(false)
const reviews = useAsync(getCrowdReviews, (v) => v.items.length === 0)

// 派单：弹窗预填，人工确认后生成工单并跳到工单中心高亮（13.2 2.3）
const dispatching = ref<Alert | null>(null)
const draft = ref<DispatchDraft | null>(null)
const sending = ref(false)
function openDispatch(a: Alert) {
  if (!a.dispatch) return
  dispatching.value = a
  draft.value = { ...a.dispatch }
}
function closeDispatch() {
  dispatching.value = null
  draft.value = null
}
async function doDispatch(d: DispatchDraft) {
  const a = dispatching.value
  if (!a) return
  sending.value = true
  try {
    await dispatchTicket(d)
    if (!ticketStore.loaded) ticketStore.init(await getTickets())
    ticketStore.addDispatched(d)
    alertStore.markDispatched(a.id, d.ticketId)
    closeDispatch()
    router.push({ path: '/tickets', query: { highlight: d.ticketId } })
  } catch (e) {
    toast(e instanceof Error ? e.message : '派单失败，请重试')
  } finally {
    sending.value = false
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
            <RouterLink v-if="gapCount" to="/knowledge" class="badge-warn">知识库待补 {{ gapCount }} 条</RouterLink>
          </div>
          <StateBlock :status="questions.status.value" :rows="6" :error="questions.error.value" empty-text="今天还没有游客提问" @retry="questions.reload">
            <ol class="qs">
              <li v-for="q in questions.data.value ?? []" :key="q.rank" class="q">
                <span class="q__rank">{{ q.rank }}</span>
                <span class="q__text">{{ q.text }}</span>
                <span class="q__count">{{ q.count }}</span>
                <RouterLink
                  v-if="flagOf(q)?.link"
                  :to="{ path: '/knowledge', query: { highlight: q.pendingId } }"
                  class="q__flag q__flag--gap q__flag--link"
                >{{ flagOf(q)?.text }}</RouterLink>
                <span v-else :class="['q__flag', flagOf(q) ? `q__flag--${flagOf(q)?.kind}` : '']">{{ flagOf(q)?.text }}</span>
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
                  {{ a.desc
                  }}<button v-if="a.action === 'push'" type="button" class="link-btn" @click="reviewsOpen = true">{{ a.basis }}</button
                  ><template v-else-if="alertStore.dispatched[a.id]"><RouterLink :to="{ path: '/tickets', query: { highlight: alertStore.dispatched[a.id] } }">查看工单</RouterLink></template
                  ><button v-else type="button" class="link-btn" @click="openDispatch(a)">{{ a.basis }}</button>
                </div>
                <template v-if="a.action === 'push'">
                  <template v-if="alertStore.pushed.includes(a.id)">
                    <span class="alert__done" role="status">{{ a.pushedText }}</span>
                    <button type="button" class="alert__push" disabled>{{ a.cooldownMin }} 分钟后可再次推送</button>
                  </template>
                  <button v-else type="button" class="alert__push" @click="confirming = a">一键推送错峰建议</button>
                </template>
                <span v-else-if="alertStore.dispatched[a.id]" class="alert__done" role="status">处理中 · 工单 {{ alertStore.dispatched[a.id] }}</span>
              </div>
            </div>
          </StateBlock>
        </section>

        <section class="card panel panel--grow">
          <h2 class="panel__title">差评结构（本月，按 AI 标签）</h2>
          <StateBlock :status="shares.status.value" :rows="6" :row-height="22" :error="shares.error.value" @retry="shares.reload">
            <RouterLink
              v-for="s in shares.data.value ?? []"
              :key="s.label"
              class="bar"
              :to="{ path: '/reviews', query: { tag: tagSlug(s.label), score: 'bad' } }"
              :title="`${s.label} ${s.percent}%，查看这类差评`"
            >
              <span class="bar__label">{{ s.label }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: (s.percent / maxShare) * 100 + '%' }" /></div>
              <span class="bar__value">{{ s.percent }}%</span>
            </RouterLink>
          </StateBlock>
        </section>
      </div>
    </div>

    <AppDialog :open="!!confirming" :title="pushCopy.title" @close="confirming = null">
      <p class="confirm__p">{{ pushCopy.body }}</p>
      <p class="confirm__reach">预计触达 <b>{{ confirming?.reach }}</b> {{ pushCopy.reachSuffix }}</p>
      <p class="confirm__note">{{ pushCopy.note }}</p>
      <template #footer>
        <button type="button" class="btn-outline" @click="confirming = null">取消</button>
        <button type="button" class="btn-danger" data-autofocus :disabled="pushing" @click="doPush">
          {{ pushing ? '正在推送…' : `确认推送给 ${confirming?.reach ?? 0} 人` }}
        </button>
      </template>
    </AppDialog>

    <AppDialog :open="reviewsOpen" :title="reviews.data.value?.title ?? '相关差评'" :width="640" @close="reviewsOpen = false">
      <StateBlock :status="reviews.status.value" :rows="8" :row-height="28" :error="reviews.error.value" empty-text="近 30 天没有相关差评" @retry="reviews.reload">
        <table class="reviews">
          <thead><tr><th>渠道</th><th>评分</th><th>日期</th><th>内容</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in reviews.data.value?.items ?? []" :key="i">
              <td>{{ r.channel }}</td><td>{{ r.score }} 分</td><td>{{ r.date }}</td><td>{{ r.text }}</td>
            </tr>
          </tbody>
        </table>
        <p class="confirm__note reviews__footer">{{ reviews.data.value?.footer }}</p>
        <!-- 保留弹窗（PRD RC-8），另可跳到评论明细看全部，带上筛选条件（14.3） -->
        <RouterLink class="reviews__all" :to="{ path: '/reviews', query: { spot: 'wc', tag: 'queue', score: 'bad' } }" @click="reviewsOpen = false">查看全部评论 ›</RouterLink>
      </StateBlock>
      <template #footer>
        <button type="button" class="btn-outline" data-autofocus @click="reviewsOpen = false">关闭</button>
      </template>
    </AppDialog>

    <DispatchDialog :draft="draft" :busy="sending" @confirm="doDispatch" @close="closeDispatch" />
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
.q__flag--submitted { color: var(--text-2); }
.q__flag--link:hover { text-decoration: underline; }
a.badge-warn:hover { color: var(--warn-fg); text-decoration: underline; }
a.bar { color: var(--text); border-radius: 6px; margin: 0 -6px; padding: 2px 6px; }
a.bar:hover { background: var(--bg); color: var(--text); }
.reviews__all { display: inline-block; margin-top: 8px; font-weight: 700; }
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
.alert__push:disabled { background: var(--surface-muted); color: var(--text-disabled); cursor: not-allowed; }
.link-btn { border: none; background: none; padding: 0; font: inherit; color: var(--primary-fg); cursor: pointer; }
.link-btn:hover { color: var(--link-hover); }
.reviews { width: 100%; border-collapse: collapse; font-size: 13px; }
.reviews th { text-align: left; font-weight: 700; background: var(--surface-muted); padding: 8px 10px; white-space: nowrap; }
.reviews td { padding: 8px 10px; border-top: 1px solid var(--surface-muted); vertical-align: top; }
.reviews td:nth-child(-n+3) { white-space: nowrap; color: var(--text-2); }
.reviews__footer { margin-top: 10px; }

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
