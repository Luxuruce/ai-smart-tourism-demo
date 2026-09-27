<script setup lang="ts">
// 列表的加载中（骨架）/ 空 / 异常状态，ready 时渲染默认插槽
import type { AsyncStatus } from './useAsync'

withDefaults(defineProps<{ status: AsyncStatus; rows?: number; rowHeight?: number; emptyText?: string; error?: string }>(), {
  rows: 3, rowHeight: 34, emptyText: '暂无数据', error: '',
})
defineEmits<{ retry: [] }>()
</script>

<template>
  <slot v-if="status === 'ready'" />
  <div v-else-if="status === 'loading'" class="sk" aria-busy="true" aria-label="加载中">
    <div v-for="i in rows" :key="i" class="sk__row" :style="{ height: rowHeight + 'px' }" />
  </div>
  <div v-else-if="status === 'empty'" class="msg" role="status">{{ emptyText }}</div>
  <div v-else class="msg" role="alert">
    <span>{{ error || '加载失败' }}</span>
    <button type="button" class="retry" @click="$emit('retry')">重试</button>
  </div>
</template>

<style scoped>
.sk { display: flex; flex-direction: column; gap: 8px; }
.sk__row { border-radius: 8px; background: var(--surface-muted); animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.5; } }
.msg {
  padding: 16px; border-radius: 10px; border: 1px dashed var(--border-strong);
  font-size: 13px; color: var(--text-2); display: flex; align-items: center; justify-content: center; gap: 12px;
}
.retry {
  height: 32px; padding: 0 14px; border-radius: 16px; border: 1px solid var(--primary-fg);
  background: var(--surface); color: var(--primary-fg); cursor: pointer;
}
</style>
