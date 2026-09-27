<script setup lang="ts">
// B3 工单中心（Tickets.dc.html + 交接文档 v1.1 13.4 5.2、13.6）
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Ticket } from '@qs/shared'
import StateBlock from '@/components/StateBlock.vue'
import TicketDrawer from '@/components/TicketDrawer.vue'
import { useAsync } from '@/components/useAsync'
import { getTicketRules, getTickets, listTitle } from '@/services/tickets'
import { useTicketStore } from '@/stores/tickets'
import type { AsyncStatus } from '@/components/useAsync'

const store = useTicketStore()
const rules = useAsync(getTicketRules)

// 工单列表在 store 里，驾驶舱派单后回到这里不重新加载
const status = ref<AsyncStatus>(store.loaded ? 'ready' : 'loading')
const error = ref('')
async function load() {
  if (store.loaded) {
    status.value = store.list.length ? 'ready' : 'empty'
    return
  }
  status.value = 'loading'
  try {
    store.init(await getTickets())
    status.value = store.list.length ? 'ready' : 'empty'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
    status.value = 'error'
  }
}
onMounted(load)

type Filter = 'all' | 'pending' | 'processing' | 'overdue' | 'safety'
const filters: { id: Filter; label: string; match: (t: Ticket) => boolean }[] = [
  { id: 'all', label: '全部', match: () => true },
  // 已超时即超时未受理，也算待受理（13.6），与页头统计口径一致
  { id: 'pending', label: '待受理', match: (t) => t.status === 'pending' || t.status === 'overdue' },
  { id: 'processing', label: '处理中', match: (t) => t.status === 'processing' },
  { id: 'overdue', label: '已超时', match: (t) => t.status === 'overdue' },
  { id: 'safety', label: '安全类', match: (t) => !!t.isSafety },
]
const filter = ref<Filter>('all')
const shown = computed(() => store.list.filter(filters.find((x) => x.id === filter.value)!.match))
const summary = computed(() => {
  const c = store.counts
  return `今天 · 待受理 ${c.pending} · 处理中 ${c.processing} · 已解决 ${c.resolved} · 示例数据`
})

// 从驾驶舱派单跳过来：高亮新工单 3 秒
const route = useRoute()
const highlight = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
watch(() => route.query.highlight, (id) => {
  if (typeof id !== 'string') return
  filter.value = 'all'
  highlight.value = id
  clearTimeout(timer)
  timer = setTimeout(() => (highlight.value = null), 3000)
}, { immediate: true })
onUnmounted(() => clearTimeout(timer))

const openId = ref<string | null>(null)
const opened = computed(() => (openId.value ? store.find(openId.value) ?? null : null))
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="head__title">
        <div class="page-title">工单中心</div>
        <div class="page-sub" aria-live="polite">{{ summary }}</div>
      </div>
      <button type="button" class="btn-placeholder" aria-disabled="true" title="即将上线">分派规则设置 · 即将上线</button>
    </header>

    <div class="filters" role="tablist" aria-label="筛选工单">
      <button
        v-for="f in filters"
        :key="f.id"
        type="button"
        role="tab"
        :aria-selected="filter === f.id"
        :class="['filter', { 'filter--on': filter === f.id }]"
        @click="filter = f.id"
      >{{ f.label }}</button>
    </div>

    <section class="card table" :aria-label="listTitle">
      <div class="table__title">{{ listTitle }}</div>
      <div class="row row--head" role="row">
        <span>编号</span><span>游客反馈</span><span>AI 类型</span><span>区域</span><span>责任人</span><span>状态</span><span>用时</span>
      </div>
      <StateBlock :status="status" :rows="5" :row-height="40" :error="error" empty-text="今天还没有工单" @retry="load">
        <div v-if="!shown.length" class="none">这个筛选下没有工单</div>
        <button
          v-for="t in shown"
          :key="t.id"
          type="button"
          :class="['row', 'row--item', { 'row--safety': t.isSafety, 'row--flash': highlight === t.id }]"
          :aria-label="`${t.id} ${t.text}，${t.statusText}，查看详情`"
          @click="openId = t.id"
        >
          <span>{{ t.id }}</span>
          <span class="text">
            <svg v-if="t.isSafety" width="18" height="18" viewBox="0 0 24 24" fill="none" class="warn" aria-label="安全类">
              <path d="M12 3l9 16H3z" /><path d="M12 10v4M12 17v.5" />
            </svg>{{ t.text }}
          </span>
          <span :class="{ danger: t.isSafety }">{{ t.aiType }}</span>
          <span>{{ t.area }}</span>
          <span>{{ t.owner }}</span>
          <span :class="['status', `status--${t.status}`, { 'status--safety': t.isSafety }]">{{ t.statusText }}</span>
          <span>{{ t.elapsed }}</span>
        </button>
      </StateBlock>
    </section>

    <section class="rules">
      <div v-for="r in rules.data.value ?? []" :key="r.title" class="card rule"><b>{{ r.title }}</b><br />{{ r.text }}</div>
    </section>

    <TicketDrawer :ticket="opened" @close="openId = null" />
  </div>
</template>

<style scoped>
.page { padding: 28px 36px; display: flex; flex-direction: column; gap: 20px; }
.head { display: flex; align-items: flex-end; gap: 16px; }
.head__title { display: flex; flex-direction: column; gap: 4px; flex-grow: 1; }
.filters { display: flex; gap: 8px; }
.filter {
  height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--border-strong);
  background: var(--surface); color: var(--text); font-size: 13px; cursor: pointer;
}
.filter--on { border-color: var(--ink-chip); background: var(--ink-chip); color: var(--on-color); font-weight: 700; }
.table { overflow: hidden; display: flex; flex-direction: column; }
.table__title { padding: 14px 20px 10px; font-size: 15px; font-weight: 700; }
.row {
  display: grid; grid-template-columns: 80px 2.2fr 120px 1fr 110px 130px 110px; gap: 16px; padding: 14px 20px;
  border-top: 1px solid var(--surface-muted); font-size: 13px; align-items: center;
}
.row--head { background: var(--surface-muted); font-weight: 700; border-top: none; }
.row--item {
  width: 100%; border: none; border-top: 1px solid var(--surface-muted); background: var(--surface);
  font: inherit; font-size: 13px; color: var(--text); text-align: left; cursor: pointer;
  transition: background-color 0.3s;
}
.row--item:hover { background: var(--bg); }
.row--safety, .row--safety:hover { background: var(--danger-soft); }
.row--flash, .row--flash:hover { background: var(--warn-soft); box-shadow: inset 4px 0 0 var(--warn-fg); }
.table :deep(.sk), .table :deep(.msg), .none { margin: 14px 20px; }
.none { font-size: 13px; color: var(--text-2); }
.text { display: flex; gap: 8px; align-items: center; }
.warn { stroke: var(--danger-fg); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.danger { color: var(--danger-fg); font-weight: 700; }
.status { font-weight: 700; }
.status--pending { color: var(--warn-fg); }
.status--processing { color: var(--primary-fg); }
.status--overdue, .status--safety { color: var(--danger-fg); }
.status--resolved { color: var(--ok-fg); }
.status--closed { color: var(--text-2); }
.rules { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.rule { padding: 16px 20px; font-size: 13px; line-height: 1.7; }
</style>
