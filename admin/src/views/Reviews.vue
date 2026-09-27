<script setup lang="ts">
// 评论明细（交接文档 v1.2 14.3 11.3.1、附录 C.3）
// 筛选条件同步到 URL，驾驶舱可以带条件跳进来：?channel=携程&score=bad&tag=queue,hygiene&spot=wc
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AsyncStatus } from '@/components/useAsync'
import StateBlock from '@/components/StateBlock.vue'
import ReviewDrawer from '@/components/ReviewDrawer.vue'
import { getReviews, meta, spotName, tagLabel, tags } from '@/services/reviews'
import { useReviewStore } from '@/stores/reviews'

const store = useReviewStore()
const route = useRoute()
const router = useRouter()

const status = ref<AsyncStatus>(store.loaded ? 'ready' : 'loading')
const error = ref('')
async function load() {
  if (store.loaded) {
    status.value = store.list.length ? 'ready' : 'empty'
    return
  }
  status.value = 'loading'
  try {
    store.init(await getReviews())
    status.value = store.list.length ? 'ready' : 'empty'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
    status.value = 'error'
  }
}
onMounted(load)

// —— 筛选：以 URL 参数为准 ——
const q = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const channel = computed(() => q('channel'))
const score = computed(() => q('score'))
const tagSlugs = computed(() => q('tag').split(',').filter(Boolean))
const spot = computed(() => q('spot'))

function setQuery(patch: Record<string, string>) {
  const next = { ...route.query, ...patch }
  for (const k of Object.keys(next)) if (!next[k]) delete next[k]
  router.replace({ query: next })
}
function toggleTag(slug: string) {
  const list = tagSlugs.value.includes(slug) ? tagSlugs.value.filter((t) => t !== slug) : [...tagSlugs.value, slug]
  setQuery({ tag: list.join(',') })
}
const clearAll = () => router.replace({ query: {} })

const channels = ['携程', '美团']
const scores = [
  { id: 'bad', label: '差评（≤3 分）' },
  { id: 'good', label: '好评（≥4 分）' },
]
const spots = computed(() => [...new Set(store.list.map((r) => r.spot))])

const shown = computed(() => {
  const labels = tagSlugs.value.map(tagLabel)
  return store.list.filter((r) => {
    if (channel.value && r.channel !== channel.value) return false
    if (score.value === 'bad' && r.score > 3) return false
    if (score.value === 'good' && r.score < 4) return false
    if (labels.length && !r.tags.some((t) => labels.includes(t))) return false
    if (spot.value && r.spot !== spot.value) return false
    return true
  })
})
const filtered = computed(() => !!(channel.value || score.value || tagSlugs.value.length || spot.value))

const openId = ref<string | null>(null)
const opened = computed(() => (openId.value ? store.find(openId.value) ?? null : null))
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="page-title">{{ meta.title }}</div>
      <div class="page-sub">{{ meta.subtitle }}</div>
    </header>

    <section class="card filters" aria-label="筛选评论">
      <div class="frow">
        <span class="frow__label">渠道</span>
        <button type="button" :class="['chip', { 'chip--on': !channel }]" :aria-pressed="!channel" @click="setQuery({ channel: '' })">全部</button>
        <button v-for="c in channels" :key="c" type="button" :class="['chip', { 'chip--on': channel === c }]" :aria-pressed="channel === c" @click="setQuery({ channel: c })">{{ c }}</button>
      </div>
      <div class="frow">
        <span class="frow__label">评分</span>
        <button type="button" :class="['chip', { 'chip--on': !score }]" :aria-pressed="!score" @click="setQuery({ score: '' })">全部</button>
        <button v-for="s in scores" :key="s.id" type="button" :class="['chip', { 'chip--on': score === s.id }]" :aria-pressed="score === s.id" @click="setQuery({ score: s.id })">{{ s.label }}</button>
      </div>
      <div class="frow">
        <span class="frow__label">AI 标签</span>
        <button
          v-for="t in tags"
          :key="t.slug"
          type="button"
          :class="['chip', { 'chip--on': tagSlugs.includes(t.slug) }]"
          :aria-pressed="tagSlugs.includes(t.slug)"
          @click="toggleTag(t.slug)"
        >{{ t.label }}</button>
      </div>
      <div class="frow">
        <span class="frow__label">点位</span>
        <select class="field-input frow__select" :value="spot" aria-label="点位" @change="setQuery({ spot: ($event.target as HTMLSelectElement).value })">
          <option value="">全部</option>
          <option v-for="s in spots" :key="s" :value="s">{{ spotName(s) }}</option>
        </select>
        <span class="frow__gap" />
        <button v-if="filtered" type="button" class="clear" @click="clearAll">清除筛选</button>
      </div>
    </section>

    <section class="card table" aria-label="评论列表">
      <div class="row row--head" role="row">
        <span>渠道</span><span>评分</span><span>日期</span><span>点位</span><span>AI 标签</span><span>原文</span><span>回复</span>
      </div>
      <StateBlock :status="status" :rows="6" :row-height="44" :error="error" empty-text="近 30 天还没有评论" @retry="load">
        <div v-if="!shown.length" class="none">没有符合筛选条件的评论</div>
        <button
          v-for="r in shown"
          :key="r.id"
          type="button"
          class="row row--item"
          :aria-label="`${r.channel} ${r.score} 分，${r.text}，查看详情`"
          @click="openId = r.id"
        >
          <span>{{ r.channel }}</span>
          <span :class="['score', { 'score--bad': r.score <= 3 }]">{{ r.score }} 分</span>
          <span>{{ r.date }}</span>
          <span>{{ spotName(r.spot) }}</span>
          <span class="tags">
            <span v-for="t in r.tags" :key="t" class="tag">{{ t }}</span>
            <span v-if="!r.tags.length" class="muted">—</span>
          </span>
          <span class="text">{{ r.text }}</span>
          <span :class="['reply', { 'reply--done': r.replied }]">{{ r.replied ? '已回复' : '未回复' }}</span>
        </button>
      </StateBlock>
    </section>

    <ReviewDrawer :review="opened" @close="openId = null" />
  </div>
</template>

<style scoped>
.page { padding: 28px 36px; display: flex; flex-direction: column; gap: 20px; }
.head { display: flex; flex-direction: column; gap: 4px; }
.filters { padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; }
.frow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.frow__label { width: 64px; font-size: 13px; color: var(--text-2); }
.frow__select { width: 200px; padding: 6px 10px; }
.frow__gap { flex-grow: 1; }
.chip {
  height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid var(--border-strong);
  background: var(--surface); color: var(--text); font-size: 13px; cursor: pointer;
}
.chip--on { border-color: var(--ink-chip); background: var(--ink-chip); color: var(--on-color); font-weight: 700; }
.clear { border: none; background: none; color: var(--primary-fg); font: inherit; font-size: 13px; cursor: pointer; }
.table { overflow: hidden; display: flex; flex-direction: column; }
.row {
  display: grid; grid-template-columns: 60px 60px 60px 100px 190px 1fr 70px; gap: 14px; padding: 12px 20px;
  border-top: 1px solid var(--surface-muted); font-size: 13px; align-items: center;
}
.row--head { background: var(--surface-muted); font-weight: 700; border-top: none; }
.row--item {
  width: 100%; border: none; border-top: 1px solid var(--surface-muted); background: var(--surface);
  font: inherit; font-size: 13px; color: var(--text); text-align: left; cursor: pointer;
}
.row--item:hover { background: var(--bg); }
.table :deep(.sk), .table :deep(.msg), .none { margin: 14px 20px; }
.none { font-size: 13px; color: var(--text-2); }
.score { font-weight: 700; }
.score--bad { color: var(--danger-fg); }
.tags { display: flex; gap: 4px; flex-wrap: wrap; }
.tag { padding: 1px 8px; border-radius: 8px; background: var(--surface-muted); font-size: 12px; }
.muted { color: var(--text-2); }
.text { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.6; }
.reply { font-size: 12px; color: var(--warn-fg); font-weight: 700; }
.reply--done { color: var(--ok-fg); }
</style>
