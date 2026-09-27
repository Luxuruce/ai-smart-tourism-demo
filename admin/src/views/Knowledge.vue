<script setup lang="ts">
// AI 问答与知识库（交接文档 v1.2 14.3 11.3.2、附录 C.4、14.5）
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { KnowledgeEntry, PendingQuestion } from '@qs/shared'
import type { AsyncStatus } from '@/components/useAsync'
import AppDialog from '@/components/AppDialog.vue'
import StateBlock from '@/components/StateBlock.vue'
import { toast } from '@/components/toast'
import { getKnowledgeEntries, getPendingQuestions, meta, reviewEntry, submitAnswer } from '@/services/knowledge'
import { useKnowledgeStore } from '@/stores/knowledge'

const store = useKnowledgeStore()
const route = useRoute()

const status = ref<AsyncStatus>(store.loaded ? 'ready' : 'loading')
const error = ref('')
async function load() {
  if (store.loaded) {
    status.value = 'ready'
    return
  }
  status.value = 'loading'
  try {
    const [p, e] = await Promise.all([getPendingQuestions(), getKnowledgeEntries()])
    store.init(p, e)
    status.value = 'ready'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
    status.value = 'error'
  }
}
onMounted(load)

type Tab = 'pending' | 'entries'
const tab = ref<Tab>('pending')

// 从驾驶舱「待补」标签跳过来：高亮对应问题 3 秒
const highlight = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
watch(() => route.query.highlight, (id) => {
  if (typeof id !== 'string') return
  tab.value = 'pending'
  highlight.value = id
  clearTimeout(timer)
  timer = setTimeout(() => (highlight.value = null), 3000)
}, { immediate: true })
onUnmounted(() => clearTimeout(timer))

// —— 补录：答案、依据来源都必填；提交后进入「待审核」——
const filling = ref<PendingQuestion | null>(null)
const answer = ref('')
const source = ref('')
const busy = ref(false)
function openFill(p: PendingQuestion) {
  filling.value = p
  answer.value = ''
  source.value = ''
}
async function submitFill() {
  const p = filling.value
  if (!p || !answer.value.trim() || !source.value.trim() || busy.value) return
  busy.value = true
  try {
    await submitAnswer(p.id)
    store.submit(p.id, answer.value.trim(), source.value.trim())
    filling.value = null
    toast('已提交审核，可在「知识条目」里查看')
  } catch (e) {
    toast(e instanceof Error ? e.message : '提交失败，请重试')
  } finally {
    busy.value = false
  }
}

// —— 审核：通过 / 修改后通过 / 驳回 ——
const editing = ref<KnowledgeEntry | null>(null)
const editTitle = ref('')
const editAnswer = ref('')
function openEdit(e: KnowledgeEntry) {
  editing.value = e
  editTitle.value = e.title
  editAnswer.value = e.answer ?? ''
}
async function review(e: KnowledgeEntry, action: 'approve' | 'reject', edited?: { title: string; answer: string }) {
  if (busy.value) return
  busy.value = true
  try {
    await reviewEntry(e.id, action)
    if (action === 'approve') store.approve(e.id, edited)
    else store.reject(e.id)
    editing.value = null
  } catch (err) {
    toast(err instanceof Error ? err.message : '操作失败，请重试')
  } finally {
    busy.value = false
  }
}
const saveEdit = () => {
  if (editing.value && editTitle.value.trim()) review(editing.value, 'approve', { title: editTitle.value.trim(), answer: editAnswer.value.trim() })
}

const STATUS: Record<KnowledgeEntry['status'], string> = { published: '已发布', pending: '待审核', rejected: '已驳回', reviewing: '复核中' }
const summary = computed(() => `已发布 ${store.publishedCount} · 待审核 ${store.reviewingCount} · 待补问题 ${store.pending.length}`)
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="page-title">{{ meta.title }}</div>
      <div class="page-sub" aria-live="polite">{{ status === 'ready' ? summary : ' ' }}</div>
    </header>

    <div class="tabs" role="tablist" aria-label="知识库">
      <button type="button" role="tab" :aria-selected="tab === 'pending'" :class="['tab', { 'tab--on': tab === 'pending' }]" @click="tab = 'pending'">
        待补问题<span v-if="status === 'ready'" class="tab__count">{{ store.pending.length }}</span>
      </button>
      <button type="button" role="tab" :aria-selected="tab === 'entries'" :class="['tab', { 'tab--on': tab === 'entries' }]" @click="tab = 'entries'">知识条目</button>
    </div>

    <section v-if="tab === 'pending'" class="card table" aria-label="待补问题">
      <div class="row row--pending row--head" role="row">
        <span>问题</span><span>提问次数</span><span>最近提问</span><span>来源</span><span>操作</span>
      </div>
      <StateBlock :status="status" :rows="3" :row-height="44" :error="error" @retry="load">
        <div v-if="!store.pending.length" class="none">待补问题都处理完了</div>
        <div v-for="p in store.pending" :key="p.id" :class="['row', 'row--pending', { 'row--flash': highlight === p.id }]" role="row">
          <span class="strong">{{ p.text }}</span>
          <span>{{ p.count }}</span>
          <span>{{ p.lastAsked }}</span>
          <span>{{ p.source }}</span>
          <span><button type="button" class="btn-action small" @click="openFill(p)">补录</button></span>
        </div>
      </StateBlock>
    </section>

    <section v-else class="card table" aria-label="知识条目">
      <div class="row row--entry row--head" role="row">
        <span>标题</span><span>点位</span><span>来源</span><span>状态</span><span>审核</span><span>操作</span>
      </div>
      <StateBlock :status="status" :rows="8" :row-height="44" :error="error" @retry="load">
        <div v-for="e in store.entries" :key="e.id" class="row row--entry" role="row">
          <span class="title">
            <span class="strong">{{ e.title }}</span>
            <span v-if="e.keyReview" class="key" title="含年代、人物、数字，需要重点审核">重点审核</span>
          </span>
          <span>{{ e.spot }}</span>
          <span class="muted">{{ e.source }}</span>
          <span>
            <span :class="['status', `status--${e.status}`]">{{ STATUS[e.status] }}</span>
            <span v-if="e.note" class="muted note">{{ e.note }}</span>
          </span>
          <span class="muted">{{ e.reviewer ? `${e.reviewer} · ${e.date}` : '—' }}</span>
          <span class="ops">
            <template v-if="e.status === 'pending'">
              <button type="button" class="btn-action small" :disabled="busy" @click="review(e, 'approve')">通过</button>
              <button type="button" class="btn-outline small" @click="openEdit(e)">修改后通过</button>
              <button type="button" class="link-danger" :disabled="busy" @click="review(e, 'reject')">驳回</button>
            </template>
          </span>
        </div>
      </StateBlock>
    </section>

    <AppDialog :open="!!filling" :title="`补录：${filling?.text ?? ''}`" :width="520" @close="filling = null">
      <div class="form">
        <label class="field-label">答案（必填）<textarea v-model="answer" class="field-input" rows="4" data-autofocus /></label>
        <label class="field-label">依据来源（必填）<input v-model="source" class="field-input" :placeholder="meta.sourceHint" /></label>
        <p class="hint">提交后进入「知识条目」待审核；含年代、人物、数字的答案会标为重点审核。</p>
      </div>
      <template #footer>
        <button type="button" class="btn-outline" @click="filling = null">取消</button>
        <button type="button" class="btn-action" :disabled="busy || !answer.trim() || !source.trim()" @click="submitFill">提交审核</button>
      </template>
    </AppDialog>

    <AppDialog :open="!!editing" title="修改后通过" :width="520" @close="editing = null">
      <div class="form">
        <label class="field-label">标题<input v-model="editTitle" class="field-input" data-autofocus /></label>
        <label class="field-label">内容<textarea v-model="editAnswer" class="field-input" rows="4" placeholder="修改后的知识内容" /></label>
      </div>
      <template #footer>
        <button type="button" class="btn-outline" @click="editing = null">取消</button>
        <button type="button" class="btn-action" :disabled="busy || !editTitle.trim()" @click="saveEdit">保存并通过</button>
      </template>
    </AppDialog>
  </div>
</template>

<style scoped>
.page { padding: 28px 36px; display: flex; flex-direction: column; gap: 20px; }
.head { display: flex; flex-direction: column; gap: 4px; }
.tabs { display: flex; gap: 8px; }
.tab {
  height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--border-strong);
  background: var(--surface); color: var(--text); font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.tab--on { border-color: var(--ink-chip); background: var(--ink-chip); color: var(--on-color); font-weight: 700; }
.tab__count { padding: 0 6px; border-radius: 8px; background: var(--danger); color: var(--on-color); font-size: 11px; line-height: 16px; }
.table { overflow: hidden; display: flex; flex-direction: column; }
.row { display: grid; gap: 16px; padding: 12px 20px; border-top: 1px solid var(--surface-muted); font-size: 13px; align-items: center; }
.row--head { background: var(--surface-muted); font-weight: 700; border-top: none; }
.row--pending { grid-template-columns: 1fr 90px 90px 120px 90px; }
.row--entry { grid-template-columns: 1.4fr 90px 1.2fr 1.1fr 150px 250px; }
.row--flash { background: var(--warn-soft); box-shadow: inset 4px 0 0 var(--warn-fg); }
.table :deep(.sk), .table :deep(.msg), .none { margin: 14px 20px; }
.none { font-size: 13px; color: var(--text-2); }
.strong { font-weight: 700; }
.muted { color: var(--text-2); }
.title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.key { padding: 1px 6px; border-radius: 6px; background: var(--danger-soft); color: var(--danger-fg); font-size: 11px; font-weight: 700; }
.status { font-weight: 700; }
.status--published { color: var(--ok-fg); }
.status--pending { color: var(--warn-fg); }
.status--rejected { color: var(--text-2); }
.status--reviewing { color: var(--primary-fg); }
.note { display: block; font-size: 12px; margin-top: 2px; }
.ops { display: flex; gap: 8px; align-items: center; }
.small { height: 32px; padding: 0 12px; font-size: 13px; }
.link-danger { border: none; background: none; color: var(--danger-fg); font: inherit; font-size: 13px; cursor: pointer; }
.form { display: flex; flex-direction: column; gap: 12px; }
.hint { margin: 0; font-size: 12px; color: var(--text-2); }
</style>
