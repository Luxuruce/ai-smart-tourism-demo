<script setup lang="ts">
// 我的优惠券（交接文档 v1.2 14.2 11.2.1、附录 C.2）
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'
import StateView from '@/components/StateView.vue'
import { emptyText, getMyCoupons } from '@/services/coupons'
import { useCollectionStore } from '@/stores/collection'
import { back } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'

// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })

const { pageStyle } = usePage()
const collection = useCollectionStore()
const list = useAsync(() => getMyCoupons(collection.coupons))

/** 点击券展开券码 */
const openId = ref<string | null>(null)
const toggle = (id: string) => (openId.value = openId.value === id ? null : id)

const STATUS_LABEL = { active: '可用', used: '已使用', expired: '已过期' } as const
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="head">
      <view class="head__back" role="button" aria-label="返回" @tap="back({ page: 'me' })">
        <Icon name="back" color="text" :size="20" />
      </view>
      <text class="head__title">我的优惠券</text>
    </view>

    <view class="content">
      <StateView :status="list.status.value" :rows="2" :row-height="96" :empty-text="emptyText" :error="list.error.value" @retry="list.reload">
        <view class="list">
          <view
            v-for="c in list.data.value ?? []"
            :key="c.id"
            :class="['coupon', `coupon--${c.status}`]"
            role="button"
            :aria-expanded="openId === c.id ? 'true' : 'false'"
            @tap="toggle(c.id)"
          >
            <view class="coupon__main">
              <view class="coupon__value">
                <text class="coupon__title">{{ c.title }}</text>
                <text class="coupon__threshold">{{ c.threshold }}</text>
              </view>
              <view class="coupon__info">
                <text class="coupon__merchant">{{ c.merchant }}</text>
                <text class="coupon__expiry">有效期：{{ c.expiry }}</text>
              </view>
              <text :class="['coupon__status', `coupon__status--${c.status}`]">{{ STATUS_LABEL[c.status] }}</text>
            </view>
            <view v-if="openId === c.id" class="coupon__code">
              <!-- 二维码为占位，原型不生成真实券码 -->
              <view class="qr" aria-label="券码二维码（示例占位）"><text>[二维码]</text></view>
              <text class="coupon__code-text">券码 {{ c.code }}</text>
              <text class="coupon__redeem">{{ c.redeem }}</text>
            </view>
            <text v-else class="coupon__hint">点击查看券码</text>
          </view>
        </view>
      </StateView>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-top: var(--safe-top);
}
.head {
  padding: r(14) r(20) r(8);
  display: flex;
  align-items: center;
  gap: r(8);
}
.head__back {
  width: r(44);
  height: r(44);
  margin-left: r(-12);
  display: flex;
  align-items: center;
  justify-content: center;
  @include tappable;
}
.head__title {
  @include serif(22);
  flex-grow: 1;
}
.content {
  padding: r(4) r(20) r(24);
}
.list {
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.coupon {
  border-radius: r(14);
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
  @include tappable;
}
.coupon--used,
.coupon--expired {
  opacity: 0.6;
}
.coupon__main {
  display: flex;
  align-items: center;
  gap: r(12);
  padding: r(14);
}
.coupon__value {
  width: r(96);
  flex-shrink: 0;
  padding: r(10) r(8);
  border-radius: r(10);
  background: var(--danger-soft);
  color: var(--danger-fg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(2);
}
.coupon__title {
  font-size: r(15);
  font-weight: 700;
}
.coupon__threshold {
  font-size: r(11);
}
.coupon__info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: r(4);
}
.coupon__merchant {
  font-size: r(15);
  font-weight: 700;
}
.coupon__expiry {
  font-size: r(12);
  color: var(--text-2);
}
.coupon__status {
  flex-shrink: 0;
  padding: r(2) r(8);
  border-radius: r(8);
  font-size: r(11);
  font-weight: 700;
}
.coupon__status--active {
  background: var(--ok-soft);
  color: var(--ok-fg);
}
.coupon__status--used,
.coupon__status--expired {
  background: var(--surface-muted);
  color: var(--text-2);
}
.coupon__hint {
  display: block;
  padding: 0 r(14) r(12);
  font-size: r(12);
  color: var(--text-2);
}
.coupon__code {
  border-top: 1px dashed var(--border-strong);
  padding: r(16) r(14);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(8);
}
.qr {
  width: r(140);
  height: r(140);
  border-radius: r(10);
  border: 1px dashed var(--border-strong);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: r(12);
  color: var(--text-2);
}
.coupon__code-text {
  font-size: r(16);
  font-weight: 700;
  letter-spacing: r(1);
}
.coupon__redeem {
  font-size: r(12);
  color: var(--text-2);
}
</style>
