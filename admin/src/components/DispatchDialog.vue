<script setup lang="ts">
// 派单弹窗（交接文档 13.2 2.3）：驾驶舱预警和评论明细共用。预填内容可改，人工确认后才生成工单。
import { ref, watch } from 'vue'
import type { DispatchDraft } from '@qs/shared'
import AppDialog from './AppDialog.vue'
import { owners } from '@/services/tickets'

const props = defineProps<{ draft: DispatchDraft | null; busy?: boolean }>()
const emit = defineEmits<{ confirm: [draft: DispatchDraft]; close: [] }>()

const form = ref<DispatchDraft | null>(null)
watch(() => props.draft, (d) => (form.value = d ? { ...d } : null), { immediate: true })

function confirm() {
  if (form.value && form.value.desc.trim()) emit('confirm', { ...form.value })
}
</script>

<template>
  <AppDialog :open="!!draft" title="派单" :width="520" @close="emit('close')">
    <form v-if="form" class="dispatch" @submit.prevent="confirm">
      <div class="dispatch__row">
        <label class="field-label">类型<input v-model="form.aiType" class="field-input" readonly /></label>
        <label class="field-label">区域<input v-model="form.area" class="field-input" readonly /></label>
      </div>
      <label class="field-label">责任人
        <select v-model="form.owner" class="field-input" data-autofocus>
          <option v-for="o in owners" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>
      <label class="field-label">说明<textarea v-model="form.desc" class="field-input" rows="3" /></label>
      <p class="note">确认后生成工单 {{ form.ticketId }}，并通知责任人。</p>
    </form>
    <template #footer>
      <button type="button" class="btn-outline" @click="emit('close')">取消</button>
      <button type="button" class="btn-action" :disabled="busy || !form?.desc.trim()" @click="confirm">
        {{ busy ? '正在派单…' : '确认派单' }}
      </button>
    </template>
  </AppDialog>
</template>

<style scoped>
.dispatch { display: flex; flex-direction: column; gap: 12px; }
.dispatch__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.note { margin: 0; font-size: 12px; color: var(--text-2); }
</style>
