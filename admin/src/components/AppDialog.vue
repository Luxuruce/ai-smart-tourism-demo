<script setup lang="ts">
// 通用弹窗：推送确认、派单、差评列表共用。Esc 或点遮罩关闭，打开时焦点移到弹窗内。
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ open: boolean; title: string; width?: number }>(), { width: 460 })
const emit = defineEmits<{ close: [] }>()
const box = ref<HTMLElement | null>(null)

watch(() => props.open, (v) => {
  if (v) nextTick(() => (box.value?.querySelector<HTMLElement>('[data-autofocus]') ?? box.value)?.focus())
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="mask" @click.self="emit('close')" @keydown.esc="emit('close')">
      <div ref="box" class="dialog" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1" :style="{ width: width + 'px' }">
        <div class="dialog__title">{{ title }}</div>
        <div class="dialog__body"><slot /></div>
        <div class="dialog__actions"><slot name="footer" /></div>
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
  max-width: calc(100vw - 48px); max-height: calc(100vh - 48px); overflow: auto; outline: none;
  padding: 24px; border-radius: 16px; background: var(--surface);
  box-shadow: var(--shadow-lg); display: flex; flex-direction: column; gap: 14px;
}
.dialog__title { font-size: 18px; font-weight: 700; }
.dialog__body { font-size: 14px; line-height: 1.7; color: var(--text); }
.dialog__actions { display: flex; justify-content: flex-end; gap: 10px; }
.dialog__actions:empty { display: none; }
</style>
