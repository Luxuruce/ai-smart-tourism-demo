<script setup lang="ts">
// V9 安全与求助（SOS.dc.html）
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import SwitchToggle from '@/components/SwitchToggle.vue'
import { cancelSos, getSosInfo, sendSos, startSeeking } from '@/services/sos'
import { usePrefsStore } from '@/stores/prefs'
import { back, call, go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'


// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })
const { pageStyle } = usePage()
const prefs = usePrefsStore()
const info = useAsync(getSosInfo, { isEmpty: () => false })

const sent = ref(false)
const seeking = ref(false)
const busy = ref(false)

async function run(action: () => Promise<unknown>, after: () => void) {
  if (busy.value) return
  busy.value = true
  try {
    await action()
    after()
  } catch {
    uni.showToast({ title: '网络不稳定，请直接拨打 110 / 120', icon: 'none' })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="head">
      <view class="head__back" role="button" aria-label="返回首页" @tap="back({ page: 'home' })">
        <Icon name="back" color="text" :size="20" />
      </view>
      <text class="head__title">安全与求助</text>
    </view>

    <view class="content">
      <view v-if="info.data.value" class="warn">
        <Icon name="warning" color="danger-fg" :size="20" />
        <view class="warn__body">
          <text class="warn__title">{{ info.data.value.weather.title }}</text>
          <text class="warn__desc">{{ info.data.value.weather.desc }}</text>
        </view>
      </view>

      <view class="card sos">
        <view v-if="!sent" class="sos__idle">
          <view class="sos__btn" role="button" aria-label="一键求助，发送位置给景区值班室" @tap="run(sendSos, () => (sent = true))">一键求助</view>
          <view class="sos__hint"><text>会把你的位置和同行人信息</text><text>发送给景区值班室</text></view>
        </view>
        <view v-else class="sos__sent" role="status">
          <view class="sos__check"><Icon name="check" color="ok-fg" :size="30" /></view>
          <text class="sos__title">景区值班室已收到</text>
          <view class="sos__desc"><text>{{ info.data.value?.received }}</text><text>请留在原地，保持手机畅通。</text></view>
          <view class="btn btn--plain h40 sos__cancel" role="button" @tap="run(cancelSos, () => (sent = false))">取消求助</view>
        </view>
        <view class="sos__facts">
          <view class="fact">
            <text class="fact__k">当前位置</text>
            <text class="fact__v">{{ info.data.value?.location ?? '定位中…' }}</text>
          </view>
          <view class="fact">
            <text class="fact__k">网络</text>
            <text class="fact__v">{{ info.data.value?.network ?? '检测中…' }}</text>
          </view>
        </view>
      </view>

      <view class="card share">
        <view class="share__row">
          <view class="share__text">
            <text class="share__title">同行人位置共享</text>
            <text class="share__sub">走远 200 米或 15 分钟不动，会提醒对方</text>
          </view>
          <SwitchToggle v-model="prefs.share" label="同行人位置共享" />
        </view>
        <view v-if="!seeking" class="btn h44 seek" role="button" @tap="run(startSeeking, () => (seeking = true))">孩子或同伴走散了？发起寻人</view>
        <text v-else class="seeking" role="status">{{ info.data.value?.seeking }}</text>
      </view>

      <view class="card nearest">
        <text class="nearest__title">离你最近</text>
        <StateView :status="info.status.value" :rows="3" :row-height="40" :error="info.error.value" @retry="info.reload">
          <view v-if="info.data.value && !info.data.value.nearest.length" class="nearest__none">附近暂时没有服务点数据</view>
          <view
            v-for="n in info.data.value?.nearest ?? []"
            :key="n.id"
            class="near"
            role="link"
            @tap="go({ page: 'map', focus: n.id })"
          >
            <text class="near__glyph">{{ n.glyph }}</text>
            <text class="near__name">{{ n.label }}</text>
            <text class="near__dist">{{ n.distance }} ›</text>
          </view>
        </StateView>
      </view>

      <view class="calls">
        <view class="btn btn--plain btn--grow h48 call" role="button" aria-label="拨打报警电话 110" @tap="call('110')">报警 110</view>
        <view class="btn btn--plain btn--grow h48 call" role="button" aria-label="拨打急救电话 120" @tap="call('120')">急救 120</view>
        <PlaceholderButton label="值班室 · 待接入" aria-label="值班室电话" :height="48" extra-style="flex:1 1 0;" />
      </view>

      <view class="to-feedback" role="link" @tap="go({ page: 'feedback' })">不紧急的问题（卫生、设施、价格）→ 一键反馈</view>
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
  padding: 0 r(20) r(20);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.warn {
  padding: r(12) r(14);
  border-radius: r(12);
  background: var(--danger-soft);
  border: 1px solid var(--danger-border);
  display: flex;
  gap: r(10);
  align-items: flex-start;
  > :first-child {
    margin-top: r(2);
  }
}
.warn__body {
  display: flex;
  flex-direction: column;
  gap: r(4);
}
.warn__title {
  font-size: r(14);
  font-weight: 700;
  color: var(--danger-fg);
}
.warn__desc {
  font-size: r(12);
  line-height: 1.6;
  color: var(--danger-fg-sub);
}
.sos {
  padding: r(18) r(16);
  border-radius: r(16);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(12);
  text-align: center;
}
.sos__idle,
.sos__sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(10);
}
.sos__sent {
  gap: r(8);
}
.sos__btn {
  width: r(132);
  height: r(132);
  border-radius: r(66);
  border: r(8) solid var(--danger-soft);
  background: var(--danger);
  color: var(--on-color);
  font-size: r(20);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  @include tappable;
}
.sos__hint,
.sos__desc {
  font-size: r(12);
  line-height: 1.6;
  color: var(--text-2);
  display: flex;
  flex-direction: column;
}
.sos__desc {
  font-size: r(13);
}
.sos__check {
  width: r(64);
  height: r(64);
  border-radius: r(32);
  background: var(--ok-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sos__title {
  font-size: r(18);
  font-weight: 700;
}
.sos__cancel {
  font-size: r(13);
}
.sos__facts {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: r(8);
  text-align: left;
}
.fact {
  padding: r(8) r(10);
  border-radius: r(10);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.fact__k {
  font-size: r(11);
  color: var(--text-2);
}
.fact__v {
  font-size: r(13);
  font-weight: 700;
}
.share {
  padding: r(14) r(16);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.share__row {
  display: flex;
  align-items: center;
  gap: r(10);
}
.share__text {
  display: flex;
  flex-direction: column;
  gap: r(2);
  flex-grow: 1;
}
.share__title {
  font-size: r(15);
  font-weight: 700;
}
.share__sub {
  font-size: r(12);
  color: var(--text-2);
}
.seek {
  border: 1px solid var(--danger-fg);
  background: var(--surface);
  color: var(--danger-fg);
}
.seeking {
  padding: r(10) r(12);
  border-radius: r(10);
  background: var(--ok-soft);
  color: var(--ok-fg);
  font-size: r(13);
  line-height: 1.6;
}
.nearest {
  padding: r(6) r(16);
  display: flex;
  flex-direction: column;
}
.nearest__title {
  font-size: r(15);
  font-weight: 700;
  padding: r(8) 0 r(4);
}
.nearest__none {
  padding: r(12) 0;
  font-size: r(13);
  color: var(--text-2);
}
.near {
  min-height: r(48);
  display: flex;
  align-items: center;
  gap: r(10);
  border-bottom: 1px solid var(--surface-muted);
  @include tappable;
  &:last-child {
    border-bottom: none;
  }
}
.near__glyph {
  width: r(26);
  height: r(26);
  border-radius: r(7);
  background: var(--ink-chip);
  color: var(--on-color);
  font-size: r(12);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.near__name {
  font-size: r(14);
  flex-grow: 1;
}
.near__dist {
  font-size: r(12);
  color: var(--text-2);
}
.calls {
  display: flex;
  gap: r(8);
}
.call {
  font-weight: 700;
  padding: 0 r(8);
}
.to-feedback {
  font-size: r(13);
  color: var(--primary-fg);
  text-align: center;
  min-height: r(36);
  display: flex;
  align-items: center;
  justify-content: center;
  @include tappable;
}
</style>
