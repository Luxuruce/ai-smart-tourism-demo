<script setup lang="ts">
// 二次确认弹窗：推送、派单等动作由人工确认后才执行
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string; confirmText?: string; busy?: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const confirmBtn = ref<HTMLButtonElement | null>(null)

watch(() => props.open, (v) => { if (v) nextTick(() => confirmBtn.value?.focus()) })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="mask" @click.self="emit('cancel')" @keydown.esc="emit('cancel')">
      <div class="dialog" role="dialog" aria-modal="true" :aria-label="title">
        <div class="dialog__title">{{ title }}</div>
        <div class="dialog__body"><slot /></div>
        <div class="dialog__actions">
          <button type="button" class="btn-outline" @click="emit('cancel')">取消</button>
          <button ref="confirmBtn" type="button" class="btn-danger" :disabled="busy" @click="emit('confirm')">
            {{ busy ? '正在推送…' : confirmText ?? '确认' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed; inset: 0; z-index: 100; background: var(--scrim);
  display: flex; align-items: center; justify-content: center;
}
.dialog {
  width: 440px; padding: 24px; border-radius: 16px; background: var(--surface);
  box-shadow: var(--shadow-lg); display: flex; flex-direction: column; gap: 14px;
}
.dialog__title { font-size: 18px; font-weight: 700; }
.dialog__body { font-size: 14px; line-height: 1.7; color: var(--text); }
.dialog__actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-danger {
  height: 44px; padding: 0 18px; border-radius: 22px; border: none;
  background: var(--danger); color: var(--on-color); font-size: 14px; font-weight: 700; cursor: pointer;
}
.btn-danger:disabled { opacity: 0.6; cursor: progress; }
</style>
