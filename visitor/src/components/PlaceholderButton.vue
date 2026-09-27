<script setup lang="ts">
// 「即将上线」占位：虚线描边、禁用色文字、aria-disabled，点击无反应。
import type { IconName } from '@/icons'
import Icon from './Icon.vue'

defineOptions({ options: { virtualHost: true } })

withDefaults(defineProps<{
  label?: string
  /** 读屏名称，不填时用 label */
  ariaLabel?: string
  /** pill：胶囊按钮；circle：圆形图标按钮；tile：宫格；row：设置列表行；segment：分段选择器里的一项 */
  shape?: 'pill' | 'circle' | 'tile' | 'row' | 'segment'
  icon?: IconName
  /** 设计稿高度（px），pill / circle 用 */
  height?: number
  fontSize?: number
  /** 显示「即将上线」小标签 */
  tag?: boolean
  /** 描边颜色更深一档（浮在图片上时） */
  strong?: boolean
  /** 追加到根节点的样式，如 flex-grow、margin */
  extraStyle?: string
}>(), { shape: 'pill', height: 44, fontSize: 13, tag: false, strong: false, extraStyle: '' })

const px = (n: number) => `${(n * 750) / 390}rpx`
</script>

<template>
  <view
    :class="['ph', `ph--${shape}`, { 'ph--strong': strong }]"
    :style="(shape === 'pill' || shape === 'circle' ? `height:${px(height)};border-radius:${px(height / 2)};font-size:${px(fontSize)};` : '') + (shape === 'circle' ? `width:${px(height)};` : '') + extraStyle"
    role="button"
    aria-disabled="true"
    :aria-label="(ariaLabel || label || '') + '（即将上线）'"
  >
    <template v-if="shape === 'tile'">
      <view class="ph__tile-icon"><Icon v-if="icon" :name="icon" color="icon-disabled" :size="22" /></view>
      <text>{{ label }}</text>
    </template>
    <template v-else-if="shape === 'row'">
      <text class="ph__row-label">{{ label }}</text>
      <text class="ph__tag">即将上线</text>
    </template>
    <template v-else>
      <Icon v-if="icon" :name="icon" color="icon-disabled" :size="20" />
      <text v-if="label" class="ph__label">{{ label }}</text>
      <text v-if="tag" class="ph__tag">即将上线</text>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: r(6);
  box-sizing: border-box;
  color: var(--text-disabled);
  cursor: not-allowed;
}
.ph--pill,
.ph--circle,
.ph--segment {
  border: 1px dashed var(--border-strong);
  background: transparent;
  padding: 0 r(6);
  white-space: nowrap;
}
.ph--circle {
  padding: 0;
  background: var(--surface);
  flex-shrink: 0;
}
// uni-app H5 的 <text> 自带 white-space: pre-line，要在文字元素本身上设置
.ph__label {
  white-space: nowrap;
}
.ph--strong {
  border-color: var(--border-dashed-strong);
}
.ph--segment {
  height: r(36);
  border-radius: r(18);
  padding: 0 r(10);
  font-size: r(12);
}
.ph--tile {
  flex-direction: column;
  padding: r(6) 0;
  font-size: r(12);
}
.ph__tile-icon {
  width: r(44);
  height: r(44);
  border-radius: r(14);
  border: 1px dashed var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ph--row {
  min-height: r(48);
  font-size: r(14);
  justify-content: space-between;
}
.ph__row-label {
  flex-grow: 1;
}
.ph__tag {
  font-size: r(11);
  padding: r(1) r(6);
  border-radius: r(6);
  border: 1px dashed var(--border-strong);
}
</style>
