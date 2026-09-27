<script setup lang="ts">
// V8 AI 行程与观光车预约（Trip.dc.html）
import { computed, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import StateView from '@/components/StateView.vue'
import { bookBus, getBusInfo, getFollowNote, getTripPlan } from '@/services/trip'
import { useTripStore } from '@/stores/trip'
import { back, go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'

const { pageStyle } = usePage(true)
const trip = useTripStore()

const plan = useAsync(getTripPlan, { isEmpty: (v) => v.steps.length === 0 })
const bus = useAsync(getBusInfo, { isEmpty: (v) => v.slots.length === 0 })
const note = useAsync(getFollowNote)

const tabs = [
  { id: 'plan', label: '行程安排' },
  { id: 'bus', label: '观光车预约' },
] as const

const booking = ref(false)
const bookError = ref('')
async function confirm() {
  if (booking.value) return
  booking.value = true
  bookError.value = ''
  try {
    await bookBus(trip.slot)
    trip.confirm()
  } catch (e) {
    bookError.value = e instanceof Error ? e.message : '预约失败，请重试'
  } finally {
    booking.value = false
  }
}

const stats = computed(() => plan.data.value?.stats ?? [])
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="head">
      <view class="head__bar">
        <view class="head__back" role="button" aria-label="返回首页" @tap="back({ page: 'home' })">
          <Icon name="back" color="on-color" :size="20" />
        </view>
        <text class="head__meta">{{ plan.data.value?.meta ?? '' }}</text>
        <text class="head__tag">示例数据</text>
      </view>
      <text class="head__title">{{ plan.data.value?.title ?? '' }}</text>
      <view class="stats">
        <view v-for="s in stats" :key="s.label" class="stat">
          <text class="stat__label">{{ s.label }}</text>
          <text class="stat__value">{{ s.value }}</text>
        </view>
        <template v-if="!stats.length">
          <view v-for="i in 3" :key="i" class="stat stat--loading" />
        </template>
      </view>
    </view>

    <view class="tabs" role="tablist">
      <view
        v-for="t in tabs"
        :key="t.id"
        :class="['tab', { 'tab--on': trip.tab === t.id }]"
        role="tab"
        :aria-selected="trip.tab === t.id ? 'true' : 'false'"
        @tap="trip.openTab(t.id)"
      >{{ t.label }}</view>
    </view>

    <view class="content">
      <StateView v-if="trip.tab === 'plan'" :status="plan.status.value" :rows="4" :row-height="64" empty-text="还没有生成行程" :error="plan.error.value" @retry="plan.reload">
        <view class="card timeline">
          <view v-for="(s, i) in plan.data.value?.steps ?? []" :key="s.time + s.place" class="step">
            <text class="step__time">{{ s.time }}</text>
            <view class="step__rail">
              <view :class="['step__dot', { 'step__dot--now': i === 0 }]" />
              <view :class="['step__line', { 'step__line--end': i === (plan.data.value?.steps.length ?? 0) - 1 }]" />
            </view>
            <view class="step__body">
              <view class="step__head">
                <text class="step__place">{{ s.place }}</text>
                <text v-if="s.adjusted" class="step__adjusted">AI 已调整</text>
              </view>
              <text class="step__tip">{{ s.tip }}</text>
            </view>
          </view>
        </view>
      </StateView>

      <StateView v-else :status="bus.status.value" :rows="4" :row-height="48" empty-text="今天的观光车时段还没发布" :error="bus.error.value" @retry="bus.reload">
        <view v-if="bus.data.value" class="card busbox">
          <view class="busbox__head">
            <text class="busbox__line">{{ bus.data.value.line }}</text>
            <text class="busbox__rule">{{ bus.data.value.rule }}</text>
          </view>
          <view class="slots" role="radiogroup" aria-label="乘车时段">
            <template v-for="b in bus.data.value.slots" :key="b.key">
              <view v-if="b.full" class="slot slot--full" role="radio" aria-checked="false" aria-disabled="true">
                <text class="slot__time">{{ b.range }}</text>
                <text class="slot__note">{{ b.note }}</text>
              </view>
              <view
                v-else
                :class="['slot', { 'slot--on': trip.slot === b.key }]"
                role="radio"
                :aria-checked="trip.slot === b.key ? 'true' : 'false'"
                @tap="trip.pick(b.key)"
              >
                <text class="slot__time">{{ b.range }}</text>
                <text :class="['slot__note', { 'slot__note--on': trip.slot === b.key }]">{{ trip.slot === b.key ? `${b.note} · 已选` : b.note }}</text>
              </view>
            </template>
          </view>
          <text class="busbox__ai">{{ bus.data.value.aiTip }}</text>
          <text class="busbox__fair">{{ bus.data.value.fairness }}</text>
        </view>
      </StateView>

      <view v-if="note.data.value" class="follow">
        <text class="follow__bold">{{ note.data.value.bold }}</text>{{ note.data.value.text }}
      </view>
      <text v-if="bookError" class="book-error" role="alert">{{ bookError }}</text>
    </view>

    <view class="bottom-bar bar">
      <view class="btn btn--line h48" role="link" @tap="go({ page: 'guide' })">让 AI 改一改</view>
      <view v-if="trip.confirmed" class="btn btn--ok btn--grow h48 bar__done" role="status">已确认 · 观光车 {{ trip.slot }} 已预约</view>
      <view v-else class="btn btn--action btn--grow h48 bar__confirm" role="button" :aria-busy="booking ? 'true' : 'false'" @tap="confirm">
        {{ booking ? '正在预约…' : `确认行程并预约 ${trip.slot}` }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: r(88);
}
.head {
  padding: calc(var(--safe-top) + #{r(14)}) r(20) r(16);
  background: var(--primary);
  color: var(--on-color);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.head__bar {
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
.head__meta {
  font-size: r(12);
  color: var(--on-primary-sub);
  flex-grow: 1;
}
.head__tag {
  font-size: r(11);
  padding: r(2) r(8);
  border-radius: r(10);
  background: var(--primary-deep);
  color: var(--on-primary-sub);
}
.head__title {
  @include serif(24);
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: r(8);
}
.stat {
  padding: r(8) r(10);
  border-radius: r(10);
  background: var(--primary-deep);
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.stat--loading {
  height: r(58);
}
.stat__label {
  font-size: r(11);
  color: var(--on-primary-sub);
}
.stat__value {
  font-size: r(15);
  font-weight: 700;
}
.tabs {
  padding: r(12) r(20) 0;
  display: flex;
  gap: r(8);
}
.tab {
  @include pill(40);
  @include tappable;
  padding: 0 r(16);
  font-size: r(14);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-strong);
}
.tab--on {
  background: var(--ink-chip);
  color: var(--on-color);
  border-color: var(--text);
  font-weight: 700;
}
.content {
  padding: r(12) r(20);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.timeline {
  padding: r(14) r(16);
  display: flex;
  flex-direction: column;
}
.step {
  display: flex;
  gap: r(10);
}
.step__time {
  width: r(40);
  flex-shrink: 0;
  font-size: r(13);
  font-weight: 700;
  padding-top: r(1);
}
.step__rail {
  width: r(12);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step__dot {
  width: r(12);
  height: r(12);
  border-radius: r(6);
  margin-top: r(4);
  flex-shrink: 0;
  border: 2px solid var(--primary-fg);
  background: var(--surface);
}
.step__dot--now {
  border: none;
  background: var(--action);
}
.step__line {
  width: 2px;
  flex-grow: 1;
  background: var(--border);
}
.step__line--end {
  background: transparent;
}
.step__body {
  flex-grow: 1;
  padding-bottom: r(14);
  display: flex;
  flex-direction: column;
  gap: r(3);
}
.step__head {
  display: flex;
  align-items: center;
  gap: r(6);
  flex-wrap: wrap;
}
.step__place {
  font-size: r(15);
  font-weight: 700;
}
.step__adjusted {
  padding: r(1) r(6);
  border-radius: r(6);
  background: var(--warn-soft);
  color: var(--warn-fg);
  font-size: r(11);
  font-weight: 700;
}
.step__tip {
  font-size: r(12);
  line-height: 1.6;
  color: var(--text-2);
}
.busbox {
  padding: r(14) r(16);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.busbox__head {
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.busbox__line {
  font-size: r(15);
  font-weight: 700;
}
.busbox__rule {
  font-size: r(12);
  color: var(--text-2);
}
.slots {
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.slot {
  min-height: r(48);
  padding: 0 r(14);
  border-radius: r(12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  @include tappable;
}
.slot--on {
  border: 2px solid var(--primary-fg);
  background: var(--primary-soft);
  padding: 0 calc(#{r(14)} - 1px);
}
.slot--full {
  border: 1px dashed var(--border-strong);
  background: transparent;
  color: var(--text-disabled);
  cursor: not-allowed;
}
.slot__time {
  font-size: r(14);
  font-weight: 700;
}
.slot__note {
  font-size: r(12);
  color: var(--text-2);
}
.slot--full .slot__note {
  color: var(--text-disabled);
}
.slot__note--on {
  color: var(--primary-fg);
  font-weight: 700;
}
.busbox__ai {
  padding: r(8) r(10);
  border-radius: r(8);
  background: var(--ok-soft);
  color: var(--ok-fg);
  font-size: r(12);
  line-height: 1.6;
}
.busbox__fair {
  font-size: r(11);
  color: var(--text-2);
}
.follow {
  padding: r(12) r(14);
  border-radius: r(12);
  background: var(--primary-soft);
  color: var(--text);
  font-size: r(12);
  line-height: 1.7;
}
.follow__bold {
  font-weight: 700;
}
.book-error {
  font-size: r(12);
  color: var(--danger-fg);
}
.bar {
  padding-bottom: r(12);
}
.bar__confirm {
  font-size: r(15);
}
.bar__done {
  font-size: r(14);
}
</style>
