<script setup lang="ts">
defineOptions({ options: { virtualHost: true } })

const props = defineProps<{ modelValue: boolean; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const toggle = () => emit('update:modelValue', !props.modelValue)
</script>

<template>
  <view
    :class="['sw', { 'sw--on': modelValue }]"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-label="`${label}：${modelValue ? '已开启' : '已关闭'}`"
    @tap="toggle"
  >
    <view class="sw__knob" />
  </view>
</template>

<style lang="scss" scoped>
// 可视尺寸 44×26，上下各扩 9px 点击区到 44px
.sw {
  width: r(44);
  height: r(26);
  flex-shrink: 0;
  border-radius: r(13);
  padding: r(3);
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  background: var(--border-strong);
  position: relative;
  @include tappable;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: r(-9);
    bottom: r(-9);
  }
}
.sw--on {
  justify-content: flex-end;
  background: var(--switch-on);
}
.sw__knob {
  width: r(20);
  height: r(20);
  border-radius: r(10);
  background: var(--surface);
}
</style>
