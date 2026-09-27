<script setup lang="ts">
// 评论详情抽屉（交接文档 v1.2 14.3 11.3.1）：修正 AI 标签、记录回复、生成工单
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { DispatchDraft, ReviewItem } from '@qs/shared'
import DispatchDialog from './DispatchDialog.vue'
import { toast } from './toast'
import { meta, saveReply, saveTags, spotName, tags } from '@/services/reviews'
import { dispatchTicket } from '@/services/dashboard'
import { getTickets, ownerFor } from '@/services/tickets'
import { useReviewStore } from '@/stores/reviews'
import { useTicketStore } from '@/stores/tickets'

const props = defineProps<{ review: ReviewItem | null }>()
const emit = defineEmits<{ close: [] }>()
const store = useReviewStore()
const tickets = useTicketStore()
const router = useRouter()
const panel = ref<HTMLElement | null>(null)

const editingTags = ref(false)
const tagDraft = ref<string[]>([])
const reply = ref('')
const busy = ref(false)

watch(() => props.review?.id, (id) => {
  editingTags.value = false
  reply.value = props.review?.reply ?? ''
  if (id) nextTick(() => panel.value?.focus())
})

function startEditTags() {
  tagDraft.value = [...(props.review?.tags ?? [])]
  editingTags.value = true
}
async function run(action: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  try {
    await action()
  } catch (e) {
    toast(e instanceof Error ? e.message : '保存失败，请重试')
  } finally {
    busy.value = false
  }
}
const saveTagEdit = () => run(async () => {
  const r = props.review!
  await saveTags(r.id, tagDraft.value)
  store.setTags(r.id, tagDraft.value)
  editingTags.value = false
})
const saveReplyText = () => run(async () => {
  const r = props.review!
  if (!reply.value.trim()) return
  await saveReply(r.id, reply.value.trim())
  store.setReply(r.id, reply.value.trim())
  toast('已保存回复')
})

// 生成工单：复用派单弹窗，按这条评论预填；编号从 #1040 起（清单 12.3）
const draft = ref<DispatchDraft | null>(null)
function openDispatch() {
  const r = props.review
  if (!r) return
  const tag = r.tags[0]
  draft.value = {
    aiType: tag ?? '其他',
    area: spotName(r.spot),
    owner: ownerFor(tag),
    desc: `${r.channel} ${r.score} 分评论：${r.text}`,
    ticketId: `#${tickets.nextReviewNo}`,
  }
}
const sending = ref(false)
async function doDispatch(d: DispatchDraft) {
  sending.value = true
  try {
    await dispatchTicket(d)
    if (!tickets.loaded) tickets.init(await getTickets())
    tickets.takeReviewNo()
    tickets.addDispatched(d, '由评论明细生成')
    draft.value = null
    emit('close')
    router.push({ path: '/tickets', query: { highlight: d.ticketId } })
  } catch (e) {
    toast(e instanceof Error ? e.message : '生成工单失败，请重试')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="review" class="mask" @click.self="emit('close')" @keydown.esc="emit('close')">
      <aside ref="panel" class="drawer" role="dialog" aria-modal="true" aria-label="评论详情" tabindex="-1">
        <header class="drawer__head">
          <div class="drawer__title">{{ review.channel }} · {{ review.score }} 分</div>
          <span class="drawer__date">{{ review.date }}</span>
          <button type="button" class="drawer__x" aria-label="关闭详情" @click="emit('close')">×</button>
        </header>

        <p :class="['quote', { 'quote--bad': review.score <= 3 }]">{{ review.text }}</p>

        <section class="block">
          <div class="block__label">
            AI 标签
            <span v-if="review.tagsEdited" class="edited">已人工修正</span>
          </div>
          <div v-if="!editingTags" class="tags">
            <button type="button" class="tags__btn" aria-label="修正 AI 标签" @click="startEditTags">
              <span v-for="t in review.tags" :key="t" class="tag">{{ t }}</span>
              <span v-if="!review.tags.length" class="muted">未打标签</span>
              <span class="tags__edit">修正</span>
            </button>
          </div>
          <div v-else class="tag-editor" role="group" aria-label="选择一级标签（可多选）">
            <label v-for="t in tags" :key="t.slug" class="check">
              <input v-model="tagDraft" type="checkbox" :value="t.label" />{{ t.label }}
            </label>
            <div class="actions">
              <button type="button" class="btn-outline small" @click="editingTags = false">取消</button>
              <button type="button" class="btn-action small" :disabled="busy" @click="saveTagEdit">保存标签</button>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="block__label">关联点位</div>
          <div>{{ spotName(review.spot) }}</div>
        </section>

        <section class="block">
          <label class="field-label">回复
            <textarea v-model="reply" class="field-input" rows="3" placeholder="写给这位游客的回复" />
          </label>
          <p class="note">{{ meta.replyNote }}</p>
          <div class="actions">
            <span :class="['reply-state', { 'reply-state--done': review.replied }]">{{ review.replied ? '已回复' : '未回复' }}</span>
            <button type="button" class="btn-action small" :disabled="busy || !reply.trim()" @click="saveReplyText">保存回复</button>
          </div>
        </section>

        <footer class="foot">
          <button type="button" class="btn-outline" @click="openDispatch">生成工单</button>
        </footer>
      </aside>
    </div>
  </Teleport>
  <DispatchDialog :draft="draft" :busy="sending" @confirm="doDispatch" @close="draft = null" />
</template>

<style scoped>
.mask { position: fixed; inset: 0; z-index: 90; background: var(--scrim); display: flex; justify-content: flex-end; }
.drawer {
  width: 460px; height: 100%; overflow-y: auto; background: var(--surface); outline: none;
  padding: 24px; display: flex; flex-direction: column; gap: 18px; box-shadow: var(--shadow-lg);
}
.drawer__head { display: flex; align-items: center; gap: 12px; }
.drawer__title { font-family: 'Noto Serif SC', serif; font-size: 20px; font-weight: 700; }
.drawer__date { flex-grow: 1; font-size: 13px; color: var(--text-2); }
.drawer__x {
  width: 36px; height: 36px; border-radius: 18px; border: none; background: var(--surface-muted);
  font-size: 20px; line-height: 1; color: var(--text); cursor: pointer;
}
.quote { margin: 0; padding: 12px 14px; border-radius: 10px; background: var(--bg); font-size: 14px; line-height: 1.7; }
.quote--bad { background: var(--danger-soft); }
.block { display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
.block__label { font-size: 12px; color: var(--text-2); display: flex; align-items: center; gap: 8px; }
.edited { padding: 1px 8px; border-radius: 8px; background: var(--warn-soft); color: var(--warn-fg); font-weight: 700; }
.tags__btn {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center; width: 100%; padding: 8px 10px;
  border: 1px dashed var(--border-strong); border-radius: 10px; background: var(--surface); cursor: pointer; font: inherit;
}
.tags__btn:hover { border-color: var(--primary-fg); }
.tag { padding: 2px 8px; border-radius: 8px; background: var(--surface-muted); font-size: 12px; }
.tags__edit { margin-left: auto; font-size: 12px; color: var(--primary-fg); }
.muted { color: var(--text-2); font-size: 13px; }
.tag-editor { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; border-radius: 10px; background: var(--bg); }
.check { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.tag-editor .actions { grid-column: span 2; }
.actions { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.small { height: 36px; padding: 0 14px; font-size: 13px; }
.note { margin: 0; font-size: 12px; color: var(--text-2); }
.reply-state { flex-grow: 1; font-size: 12px; font-weight: 700; color: var(--warn-fg); }
.reply-state--done { color: var(--ok-fg); }
.foot { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--surface-muted); display: flex; justify-content: flex-end; }
</style>
