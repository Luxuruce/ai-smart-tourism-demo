<script setup lang="ts">
// 工单详情抽屉（交接文档 v1.1 13.4 5.2、13.6）
// 可做的操作随状态变化：待受理 / 已超时 → 受理、转派；处理中 → 转派、标记已解决；已解决 → 关闭
import { computed, nextTick, ref, watch } from 'vue'
import type { Ticket } from '@qs/shared'
import { toast } from './toast'
import { owners, stages, updateTicket } from '@/services/tickets'
import { useTicketStore } from '@/stores/tickets'

const props = defineProps<{ ticket: Ticket | null }>()
const emit = defineEmits<{ close: [] }>()
const store = useTicketStore()
const panel = ref<HTMLElement | null>(null)

type Mode = 'none' | 'transfer' | 'resolve'
const mode = ref<Mode>('none')
const newOwner = ref('')
const result = ref('')
const busy = ref(false)

watch(() => props.ticket?.id, (id) => {
  mode.value = 'none'
  result.value = ''
  if (id) nextTick(() => panel.value?.focus())
})

const canAccept = computed(() => props.ticket?.status === 'pending' || props.ticket?.status === 'overdue')
const canTransfer = computed(() => ['pending', 'overdue', 'processing'].includes(props.ticket?.status ?? ''))
const canResolve = computed(() => props.ticket?.status === 'processing')
const canClose = computed(() => props.ticket?.status === 'resolved')

/** 时间线：已发生的事件（含「超时升级」「转派」）按顺序列出，后面补上还没到的阶段 */
const timeline = computed(() => {
  const t = props.ticket
  if (!t) return []
  const done = t.history.map((e) => ({ ...e, done: true }))
  const reached = new Set(t.history.map((e) => e.label))
  const lastStage = Math.max(...t.history.map((e) => stages.indexOf(e.label as (typeof stages)[number])))
  const future = stages
    .filter((s, i) => i > lastStage && !reached.has(s))
    .map((label) => ({ label, done: false, time: undefined, note: undefined }))
  return [...done, ...future]
})

async function act(action: string, apply: () => void) {
  const t = props.ticket
  if (!t || busy.value) return
  busy.value = true
  try {
    await updateTicket(t.id, action)
    apply()
    mode.value = 'none'
  } catch (e) {
    toast(e instanceof Error ? e.message : '操作失败，请重试')
  } finally {
    busy.value = false
  }
}

const accept = () => act('accept', () => store.accept(props.ticket!.id))
function startTransfer() {
  newOwner.value = owners.find((o) => o !== props.ticket?.owner) ?? owners[0]
  mode.value = 'transfer'
}
const transfer = () => act('transfer', () => store.transfer(props.ticket!.id, newOwner.value))
const resolve = () => {
  if (!result.value.trim()) return
  act('resolve', () => store.resolve(props.ticket!.id, result.value.trim()))
}
const close = () => act('close', () => store.close(props.ticket!.id))
</script>

<template>
  <Teleport to="body">
    <div v-if="ticket" class="mask" @click.self="emit('close')" @keydown.esc="emit('close')">
      <aside ref="panel" class="drawer" role="dialog" aria-modal="true" :aria-label="`工单 ${ticket.id} 详情`" tabindex="-1">
        <header class="drawer__head">
          <div class="drawer__id">工单 {{ ticket.id }}</div>
          <span :class="['status', `status--${ticket.status}`, { 'status--safety': ticket.isSafety }]">{{ ticket.statusText }}</span>
          <button type="button" class="drawer__x" aria-label="关闭详情" @click="emit('close')">×</button>
        </header>

        <section class="block">
          <div class="block__label">游客原文</div>
          <p :class="['quote', { 'quote--safety': ticket.isSafety }]">{{ ticket.text }}</p>
        </section>

        <dl class="facts">
          <div><dt>AI 类型</dt><dd>{{ ticket.aiType }}</dd></div>
          <div><dt>区域</dt><dd>{{ ticket.area }}</dd></div>
          <div><dt>责任人</dt><dd>{{ ticket.owner }}</dd></div>
          <div><dt>用时</dt><dd>{{ ticket.elapsed }}</dd></div>
        </dl>

        <section class="block">
          <div class="block__label">处理时间线</div>
          <ol class="timeline">
            <li v-for="(e, i) in timeline" :key="i" :class="['tl', { 'tl--todo': !e.done, 'tl--warn': e.label === '超时升级' }]">
              <span class="tl__dot" />
              <div class="tl__body">
                <div class="tl__head"><b>{{ e.label }}</b><span v-if="e.time" class="tl__time">{{ e.time }}</span></div>
                <div v-if="e.note" class="tl__note">{{ e.note }}</div>
              </div>
            </li>
          </ol>
        </section>

        <section v-if="mode === 'transfer'" class="block form">
          <label class="field-label">转派给
            <select v-model="newOwner" class="field-input">
              <option v-for="o in owners" :key="o" :value="o" :disabled="o === ticket.owner">{{ o }}</option>
            </select>
          </label>
          <div class="actions">
            <button type="button" class="btn-outline" @click="mode = 'none'">取消</button>
            <button type="button" class="btn-action" :disabled="busy" @click="transfer">确认转派</button>
          </div>
        </section>

        <section v-else-if="mode === 'resolve'" class="block form">
          <label class="field-label">处理结果（必填）
            <textarea v-model="result" class="field-input" rows="3" placeholder="例如：已补充厕纸并拖干地面" />
          </label>
          <div class="actions">
            <button type="button" class="btn-outline" @click="mode = 'none'">取消</button>
            <button type="button" class="btn-action" :disabled="busy || !result.trim()" @click="resolve">确认已解决</button>
          </div>
        </section>

        <footer v-else class="actions actions--foot">
          <button v-if="canTransfer" type="button" class="btn-outline" :disabled="busy" @click="startTransfer">转派</button>
          <button v-if="canAccept" type="button" class="btn-action" :disabled="busy" @click="accept">受理</button>
          <button v-if="canResolve" type="button" class="btn-action" :disabled="busy" @click="mode = 'resolve'">标记已解决</button>
          <button v-if="canClose" type="button" class="btn-action" :disabled="busy" @click="close">关闭</button>
          <span v-if="ticket.status === 'closed'" class="closed">工单已关闭</span>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.mask { position: fixed; inset: 0; z-index: 90; background: var(--scrim); display: flex; justify-content: flex-end; }
.drawer {
  width: 440px; height: 100%; overflow-y: auto; background: var(--surface); outline: none;
  padding: 24px; display: flex; flex-direction: column; gap: 18px; box-shadow: var(--shadow-lg);
}
.drawer__head { display: flex; align-items: center; gap: 12px; }
.drawer__id { font-family: 'Noto Serif SC', serif; font-size: 20px; font-weight: 700; flex-grow: 1; }
.drawer__x {
  width: 36px; height: 36px; border-radius: 18px; border: none; background: var(--surface-muted);
  font-size: 20px; line-height: 1; color: var(--text); cursor: pointer;
}
.status { font-size: 13px; font-weight: 700; }
.status--pending { color: var(--warn-fg); }
.status--processing { color: var(--primary-fg); }
.status--overdue, .status--safety { color: var(--danger-fg); }
.status--resolved { color: var(--ok-fg); }
.status--closed { color: var(--text-2); }
.block { display: flex; flex-direction: column; gap: 8px; }
.block__label { font-size: 12px; color: var(--text-2); }
.quote { margin: 0; padding: 12px 14px; border-radius: 10px; background: var(--bg); font-size: 14px; line-height: 1.7; }
.quote--safety { background: var(--danger-soft); }
.facts { margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
.facts dt { font-size: 12px; color: var(--text-2); }
.facts dd { margin: 2px 0 0; font-size: 14px; }
.timeline { list-style: none; margin: 0; padding: 0; }
.tl { display: flex; gap: 12px; position: relative; padding-bottom: 14px; }
.tl:not(:last-child)::before {
  content: ''; position: absolute; left: 5px; top: 14px; bottom: 0; width: 2px; background: var(--border);
}
.tl__dot { width: 12px; height: 12px; border-radius: 6px; margin-top: 4px; flex-shrink: 0; background: var(--heat-low-dot); }
.tl--warn .tl__dot { background: var(--danger); }
.tl--todo .tl__dot { background: var(--surface); border: 2px solid var(--border-strong); box-sizing: border-box; }
.tl--todo .tl__head { color: var(--text-disabled); }
.tl__head { display: flex; gap: 10px; align-items: baseline; font-size: 14px; }
.tl__time { font-size: 12px; color: var(--text-2); }
.tl__note { font-size: 12px; color: var(--text-2); line-height: 1.6; margin-top: 2px; }
.form { gap: 12px; }
.actions { display: flex; gap: 10px; justify-content: flex-end; }
.actions--foot { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--surface-muted); }
.closed { font-size: 13px; color: var(--text-2); align-self: center; }
</style>
