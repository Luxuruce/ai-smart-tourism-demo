<script setup lang="ts">
// 首页和地图右下角的「反馈」浮动按钮，位于 tabBar 上方
import { go } from '@/utils/nav'
import Icon from './Icon.vue'
</script>

<template>
  <view class="fab" role="button" aria-label="一键反馈" @tap="go({ page: 'feedback' })">
    <Icon name="message" color="on-color" :size="18" />
    <text>反馈</text>
  </view>
</template>

<style lang="scss" scoped>
.fab {
  position: fixed;
  z-index: 20;
  right: calc(var(--frame-inset, 0px) + #{r(16)});
  bottom: calc(var(--window-bottom, 0px) + #{r(16)});
  height: r(48);
  padding: 0 r(16);
  border-radius: r(24);
  background: var(--action);
  color: var(--on-color);
  font-size: r(14);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: r(6);
  box-shadow: var(--shadow-md);
  @include tappable;
}
</style>
