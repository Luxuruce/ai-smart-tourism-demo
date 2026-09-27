<script setup lang="ts">
// 热度标签：颜色 + 文字同时表达（照顾色弱用户）
import type { Heat } from '@qs/shared'

defineOptions({ options: { virtualHost: true } })

withDefaults(defineProps<{
  heat: Heat
  text: string
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md' })
</script>

<template>
  <text :class="['heat', `heat--${heat}`, `heat--${size}`]">{{ text }}</text>
</template>

<style lang="scss" scoped>
.heat {
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}
.heat--sm {
  padding: r(1) r(8);
  border-radius: r(8);
  font-size: r(11);
}
.heat--md {
  padding: r(3) r(10);
  border-radius: r(10);
  font-size: r(12);
}
.heat--lg {
  padding: r(4) r(10);
  border-radius: r(10);
  font-size: r(12);
}
.heat--high {
  background: var(--heat-high-soft);
  color: var(--danger-fg);
}
.heat--mid {
  background: var(--warn-soft);
  color: var(--warn-fg);
}
.heat--low {
  background: var(--ok-soft);
  color: var(--ok-fg);
}
</style>
