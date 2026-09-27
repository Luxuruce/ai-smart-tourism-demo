<script setup lang="ts">
// V7 我的（Me.dc.html）
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { ThemeName } from '@qs/shared'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import SwitchToggle from '@/components/SwitchToggle.vue'
import { getMyFeedbacks, rateFeedback, rateText } from '@/services/feedback'
import { useCollectionStore } from '@/stores/collection'
import { useFeedbackStore } from '@/stores/feedback'
import { usePersonaStore } from '@/stores/persona'
import { usePrefsStore } from '@/stores/prefs'
import { useTripStore } from '@/stores/trip'
import type { AsyncStatus } from '@/utils/useAsync'
import { go } from '@/utils/nav'
import { usePage } from '@/utils/usePage'


// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })
const { theme, pageStyle, sync } = usePage()
const collection = useCollectionStore()
const feedback = useFeedbackStore()
const persona = usePersonaStore()
const prefs = usePrefsStore()
const trip = useTripStore()

// 「我的反馈」存在 store 里，一键反馈提交后直接插入；首次进入时从 services 取初始列表
const fbStatus = ref<AsyncStatus>(feedback.loaded ? 'ready' : 'loading')
const fbError = ref('')
async function loadFeedbacks() {
  if (feedback.loaded) {
    fbStatus.value = feedback.list.length ? 'ready' : 'empty'
    return
  }
  fbStatus.value = 'loading'
  try {
    feedback.init(await getMyFeedbacks())
    fbStatus.value = feedback.list.length ? 'ready' : 'empty'
  } catch (e) {
    fbError.value = e instanceof Error ? e.message : '加载失败'
    fbStatus.value = 'error'
  }
}
onShow(loadFeedbacks)

async function rate(id: string, r: 'good' | 'bad') {
  try {
    await rateFeedback(id, r)
    feedback.rate(id, r)
  } catch {
    uni.showToast({ title: '评价没提交成功，请重试', icon: 'none' })
  }
}

const stampSlots = computed(() => Array.from({ length: collection.slots }, (_, i) => collection.ordered[i] ?? ''))
const tripText = computed(() => (trip.bookedSlot ? `观光车 ${trip.bookedSlot} 已预约 ›` : '还没有预约观光车 ›'))
const couponText = computed(() => (collection.coupons.length ? `${collection.coupons.length} 张可用` : '暂无可用'))

const themeOptions: { id: ThemeName; label: string }[] = [
  { id: 'light', label: '亮色' },
  { id: 'dark', label: '暗色' },
]
function setTheme(name: ThemeName) {
  theme.set(name)
  sync()
}
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="head">
      <text class="head__title">我的今天</text>
      <text class="head__sub">青石古镇 · 无需注册，数据仅保存在本次游览</text>
    </view>

    <view class="content">
      <view class="card box">
        <view class="box__head">
          <text class="box__title">今日收集</text>
          <text class="box__count">{{ collection.count }} / {{ collection.slots }} 枚印章</text>
        </view>
        <view class="stamps" :aria-label="`已收集 ${collection.count} 枚印章`">
          <text v-for="(s, i) in stampSlots" :key="i" :class="['stamp', { 'stamp--got': s }]">{{ s }}</text>
        </view>
        <view class="box__actions">
          <view class="btn btn--plain btn--grow h40 small" role="link" @tap="go({ page: 'map' })">找下一个任务点</view>
          <PlaceholderButton label="研学报告 · 即将上线" :height="40" extra-style="flex:1 1 0;" />
        </view>
      </view>

      <view class="card box">
        <view class="box__head">
          <text class="box__title">我的反馈</text>
          <text class="box__count box__count--sm">{{ feedback.list.length }} 条</text>
        </view>
        <StateView :status="fbStatus" :rows="2" :row-height="48" empty-text="还没有提交过反馈" :error="fbError" @retry="loadFeedbacks">
          <view class="fb-list">
            <view v-for="f in feedback.list" :key="f.id" class="fb">
              <view class="fb__head">
                <text class="fb__text">{{ f.text }}</text>
                <text :class="['fb__status', `fb__status--${f.status}`]">{{ f.status === 'resolved' ? '已解决' : '待受理' }}</text>
              </view>
              <text class="fb__note">#{{ f.id }} · {{ f.note }}</text>
              <template v-if="f.status === 'resolved'">
                <view v-if="!f.rating" class="fb__rate">
                  <view class="btn btn--outline btn--grow h40 small" role="button" @tap="rate(f.id, 'good')">满意</view>
                  <view class="btn btn--plain btn--grow h40 small" role="button" @tap="rate(f.id, 'bad')">还没解决</view>
                </view>
                <text v-else class="fb__rated" role="status">{{ rateText[f.rating] }}</text>
              </template>
            </view>
          </view>
        </StateView>
      </view>

      <view class="card settings">
        <view class="set" role="link" @tap="go({ page: 'trip' })">
          <text class="set__label">我的行程</text>
          <text class="set__value">{{ tripText }}</text>
        </view>
        <view class="set" role="link" @tap="go({ page: 'sos' })">
          <text class="set__label">安全与求助</text>
          <text class="set__value">同行人共享{{ prefs.share ? '已开启' : '已关闭' }} ›</text>
        </view>
        <view class="set">
          <text class="set__label">我的优惠券</text>
          <text class="set__value">{{ couponText }}</text>
        </view>
        <view class="set">
          <text class="set__label">游览身份</text>
          <view class="set__link" role="link" @tap="go({ page: 'home' })">{{ persona.label }} · 去切换</view>
        </view>
        <view class="set set--tall">
          <text class="set__label">外观</text>
          <view class="appearance" role="radiogroup" aria-label="外观主题">
            <view
              v-for="o in themeOptions"
              :key="o.id"
              :class="['appearance__item', { 'appearance__item--on': theme.name === o.id }]"
              role="radio"
              :aria-checked="theme.name === o.id ? 'true' : 'false'"
              @tap="setTheme(o.id)"
            >{{ o.label }}</view>
            <PlaceholderButton shape="segment" label="跟随系统" />
          </view>
        </view>
        <view class="set">
          <text class="set__label">定位授权</text>
          <SwitchToggle v-model="prefs.location" label="定位授权" />
        </view>
        <PlaceholderButton shape="row" label="我的游记 / 打卡海报" extra-style="border-bottom:1px solid var(--surface-muted);" />
        <PlaceholderButton shape="row" label="语言 Language" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-top: var(--safe-top);
}
.head {
  padding: r(18) r(20) r(12);
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.head__title {
  @include serif(22);
}
.head__sub {
  font-size: r(12);
  color: var(--text-2);
}
.content {
  padding: 0 r(20) r(16);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.box {
  padding: r(14) r(16);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.box__head {
  display: flex;
  align-items: center;
}
.box__title {
  font-size: r(15);
  font-weight: 700;
  flex-grow: 1;
}
.box__count {
  font-size: r(13);
  color: var(--text-2);
}
.box__count--sm {
  font-size: r(12);
}
.box__actions {
  display: flex;
  gap: r(8);
}
.small {
  font-size: r(13);
}
.stamps {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: r(6);
}
.stamp {
  height: r(44);
  border-radius: r(22);
  border: 1px dashed var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}
.stamp--got {
  border: none;
  background: var(--action);
  color: var(--on-color);
  @include serif(15, 400);
}
.fb-list {
  display: flex;
  flex-direction: column;
}
.fb {
  display: flex;
  flex-direction: column;
  gap: r(4);
  padding: r(10) 0;
  border-bottom: 1px solid var(--surface-muted);
  &:first-child {
    padding-top: 0;
  }
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}
.fb__head {
  display: flex;
  align-items: center;
  gap: r(8);
}
.fb__text {
  font-size: r(14);
  flex-grow: 1;
  min-width: 0;
  @include ellipsis;
}
.fb__status {
  padding: r(1) r(8);
  border-radius: r(8);
  font-size: r(11);
  font-weight: 700;
  flex-shrink: 0;
}
.fb__status--pending {
  background: var(--warn-soft);
  color: var(--warn-fg);
}
.fb__status--resolved {
  background: var(--ok-soft);
  color: var(--ok-fg);
}
.fb__note {
  font-size: r(12);
  color: var(--text-2);
}
.fb__rate {
  display: flex;
  gap: r(8);
  margin-top: r(4);
}
.fb__rated {
  font-size: r(13);
  color: var(--ok-fg);
  margin-top: r(4);
}
.settings {
  padding: r(6) r(16);
  display: flex;
  flex-direction: column;
}
.set {
  display: flex;
  align-items: center;
  gap: r(8);
  min-height: r(48);
  border-bottom: 1px solid var(--surface-muted);
  @include tappable;
}
.set--tall {
  min-height: r(52);
}
.set__label {
  font-size: r(14);
  flex-grow: 1;
}
.set__value {
  font-size: r(13);
  color: var(--text-2);
}
.set__link {
  font-size: r(13);
  color: var(--primary-fg);
  min-height: r(44);
  display: flex;
  align-items: center;
}
.appearance {
  display: flex;
  gap: r(2);
  padding: r(3);
  border-radius: r(21);
  background: var(--surface-muted);
}
.appearance__item {
  @include pill(36);
  @include tappable;
  padding: 0 r(12);
  font-size: r(13);
  color: var(--text-2);
}
.appearance__item--on {
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
}
</style>
