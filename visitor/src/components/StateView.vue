<script setup lang="ts">
// 列表的加载中（骨架）/ 空 / 异常状态。ready 时渲染默认插槽。
import type { AsyncStatus } from '@/utils/useAsync'

defineOptions({ options: { virtualHost: true } })

withDefaults(defineProps<{
  status: AsyncStatus
  /** 骨架条数 */
  rows?: number
  /** 骨架单条高度（设计稿 px） */
  rowHeight?: number
  emptyText?: string
  error?: string
}>(), { rows: 3, rowHeight: 64, emptyText: '暂时没有内容', error: '' })

const emit = defineEmits<{ retry: [] }>()
const px = (n: number) => `${(n * 750) / 390}rpx`
</script>

<template>
  <slot v-if="status === 'ready'" />
  <view v-else-if="status === 'loading'" class="sv-skeleton" aria-busy="true" aria-label="加载中">
    <view v-for="i in rows" :key="i" class="sv-skeleton__row" :style="`height:${px(rowHeight)}`" />
  </view>
  <view v-else-if="status === 'empty'" class="sv-msg" role="status">
    <text>{{ emptyText }}</text>
  </view>
  <view v-else class="sv-msg" role="alert">
    <text>{{ error || '加载失败' }}</text>
    <view class="sv-retry" role="button" @tap="emit('retry')">重试</view>
  </view>
</template>

<style lang="scss" scoped>
.sv-skeleton {
  display: flex;
  flex-direction: column;
  gap: r(8);
  width: 100%;
}
.sv-skeleton__row {
  border-radius: r(12);
  background: var(--surface-muted);
  animation: sv-pulse 1.2s ease-in-out infinite;
}
@keyframes sv-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.sv-msg {
  width: 100%;
  padding: r(20) r(14);
  border-radius: r(12);
  border: 1px dashed var(--border-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(10);
  font-size: r(13);
  color: var(--text-2);
  text-align: center;
}
.sv-retry {
  @include pill(36);
  @include tappable;
  padding: 0 r(16);
  border: 1px solid var(--primary-fg);
  color: var(--primary-fg);
  font-size: r(13);
}
</style>
