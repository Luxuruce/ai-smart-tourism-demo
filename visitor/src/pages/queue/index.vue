<script setup lang="ts">
// V4 排队中 / 拍完（Queue.dc.html）
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { NarrationId } from '@qs/shared'
import Icon from '@/components/Icon.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import { scenarioOfSpot } from '@/services/guide'
import { getQueueContent } from '@/services/queue'
import { useCollectionStore } from '@/stores/collection'
import { back, go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'

const done = ref(false)
// 页面参数（id）不作为属性透传到根节点
defineOptions({ inheritAttrs: false })

const { pageStyle, sync } = usePage(() => !done.value)
const collection = useCollectionStore()

const spotId = ref('wc')
const res = useAsync(() => getQueueContent(spotId.value), { isEmpty: (v) => v.versions.length === 0, immediate: false })
onLoad((query) => {
  if (query?.id) spotId.value = String(query.id)
  res.reload()
})
const c = computed(() => res.data.value)
/** 打卡模式：等待不超过 2 分钟的机位，不显示排队计时（13.3 3.2） */
const checkin = computed(() => c.value?.mode === 'checkin')

// 没有小任务或附近商户的机位，不显示对应 tab
type Tab = 'story' | 'task' | 'near'
const tabs = computed(() => {
  const list: { id: Tab; label: string }[] = [{ id: 'story', label: '听讲解' }]
  if (c.value?.quizzes.length) list.push({ id: 'task', label: '小任务' })
  if (c.value?.merchants.length) list.push({ id: 'near', label: '附近' })
  return list
})
const tab = ref<Tab>('story')

const playing = ref(true)
const versionId = ref<NarrationId>('std')
const version = computed(() => c.value?.versions.find((v) => v.id === versionId.value) ?? c.value?.versions[0])

// 小任务：按机位配题，逐题作答；首次答对任意一题即获得该机位的印章（13.3 3.3 / 3.5）
const quizIndex = ref(0)
const quiz = computed(() => c.value?.quizzes[quizIndex.value])
const answer = ref<string | null>(null)
const right = computed(() => !!quiz.value && answer.value === quiz.value.answer)
/** 本题答对时是否刚收入印章（同一机位的印章已收过，只显示解析） */
const newStamp = ref(false)
const hasNext = computed(() => !!c.value && quizIndex.value < c.value.quizzes.length - 1)
function pick(opt: string) {
  if (right.value || !quiz.value) return
  answer.value = opt
  if (opt === quiz.value.answer) newStamp.value = collection.collect(quiz.value.stamp)
}
function nextQuiz() {
  quizIndex.value += 1
  answer.value = null
  newStamp.value = false
}
const resultText = computed(() => {
  if (!quiz.value) return ''
  if (!right.value) return quiz.value.wrongHint
  // 清单 9.2.2：{解析} 已收入「今日收集」{n}/6
  return newStamp.value ? `${quiz.value.explain} 已收入「今日收集」${collection.count}/${collection.slots}` : quiz.value.explain
})

const couponKey = (name: string) => `${spotId.value}:${name}`

type Rate = 'good' | 'ok' | 'bad'
const rates: { id: Rate; label: string }[] = [
  { id: 'good', label: '还不错' },
  { id: 'ok', label: '一般' },
  { id: 'bad', label: '不太好' },
]
const rate = ref<Rate | null>(null)

/** 从排队页进入反馈：带上来源和机位，反馈页据此改提示文字和位置（13.4 4.4） */
const toFeedback = () => go({ page: 'feedback', query: { from: 'queue', spot: spotId.value } })

function finish() {
  done.value = true
  sync()
}
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view :class="['page', { 'page--bar': !done }]">
    <StateView :status="res.status.value" :rows="4" :row-height="96" empty-text="这个机位暂时没有讲解内容" :error="res.error.value" @retry="res.reload">
      <template v-if="c && !done">
        <view class="head">
          <view class="head__bar">
            <view class="head__back" role="button" aria-label="返回机位详情" @tap="back({ page: 'spot', id: c.spotId })">
              <Icon name="back" color="on-color" :size="20" />
            </view>
            <text class="head__title">{{ checkin ? '正在打卡' : '正在排队' }} · {{ c.spotName }}</text>
            <view class="head__quit" role="link" @tap="go({ page: 'map' })">{{ checkin ? '回到地图' : '不排了' }}</view>
          </view>
          <view v-if="!checkin" class="head__time">
            <text class="head__clock">{{ c.elapsed }}</text>
            <view class="head__remain"><text>{{ c.ahead }}</text><text>{{ c.remain }}</text></view>
          </view>
          <view v-if="!checkin" class="progress" role="progressbar" :aria-valuenow="c.progress" aria-valuemin="0" aria-valuemax="100" aria-label="排队进度">
            <view class="progress__fill" :style="`width:${c.progress}%`" />
          </view>
        </view>

        <view class="tabs" role="tablist">
          <view
            v-for="t in tabs"
            :key="t.id"
            :class="['tab', { 'tab--on': tab === t.id }]"
            role="tab"
            :aria-selected="tab === t.id ? 'true' : 'false'"
            @tap="tab = t.id"
          >{{ t.label }}</view>
        </view>

        <view class="panel">
          <view v-if="tab === 'story' && version" class="card story">
            <view class="story__player">
              <view class="story__play" role="button" :aria-label="playing ? '暂停讲解' : '播放讲解'" @tap="playing = !playing">
                <Icon :name="playing ? 'pause' : 'play'" color="on-color" :size="18" />
              </view>
              <view class="story__meta">
                <text class="story__title">{{ c.storyTitle }}</text>
                <view class="story__bar"><view class="story__bar-fill" /></view>
                <text class="story__time">到达机位后自动播放 · {{ version.label }} · {{ c.storyProgress }} / {{ version.duration }}</text>
              </view>
            </view>
            <view class="versions" role="radiogroup" aria-label="讲解版本">
              <view
                v-for="v in c.versions"
                :key="v.id"
                :class="['version', { 'version--on': versionId === v.id }]"
                role="radio"
                :aria-checked="versionId === v.id ? 'true' : 'false'"
                @tap="versionId = v.id"
              >{{ v.label }}</view>
            </view>
            <text class="story__text">{{ version.text }}</text>
            <text class="story__source">{{ c.source }}</text>
            <view class="story__asks">
              <view class="btn btn--line h36 ask" role="link" @tap="go({ page: 'guide', q: scenarioOfSpot(c.spotId) })">关于{{ c.spotName }}，还能问什么？</view>
            </view>
          </view>

          <view v-if="tab === 'task' && quiz" class="card task">
            <text class="task__progress">观察小任务 · {{ quizIndex + 1 }}/{{ c.quizzes.length }}</text>
            <text class="task__q">{{ quiz.question }}</text>
            <view class="task__opts" role="radiogroup" aria-label="选择答案">
              <view
                v-for="o in quiz.options"
                :key="o"
                :class="['opt', { 'opt--on': answer === o }]"
                role="radio"
                :aria-checked="answer === o ? 'true' : 'false'"
                @tap="pick(o)"
              >{{ o }}{{ quiz.unit ? ` ${quiz.unit}` : '' }}</view>
            </view>
            <text v-if="answer !== null" :class="['task__result', right ? 'task__result--ok' : 'task__result--bad']" role="status">{{ resultText }}</text>
            <view v-if="right && hasNext" class="btn btn--outline h40 task__next" role="button" @tap="nextQuiz">下一题</view>
          </view>

          <view v-if="tab === 'near'" class="near">
            <text class="near__caption">拍完顺路去 · 步行 3 分钟内 · 推荐</text>
            <view v-for="m in c.merchants" :key="m.name" class="card shop">
              <view class="shop__thumb" />
              <view class="shop__text">
                <text class="shop__name">{{ m.name }}</text>
                <text class="shop__sub">{{ m.walk }} · {{ m.item }}</text>
              </view>
              <view
                v-if="m.coupon"
                :class="['coupon', { 'coupon--claimed': collection.coupons.includes(couponKey(m.name)) }]"
                role="button"
                :aria-pressed="collection.coupons.includes(couponKey(m.name)) ? 'true' : 'false'"
                @tap="collection.claimCoupon(couponKey(m.name))"
              >{{ collection.coupons.includes(couponKey(m.name)) ? '已领取' : m.coupon.label }}</view>
              <PlaceholderButton v-else-if="m.placeholder" :label="m.placeholder" :height="40" :font-size="12" extra-style="padding:0 12px;" />
            </view>
          </view>
        </view>

        <view class="bottom-bar">
          <view class="btn btn--line h52" role="link" @tap="toFeedback">反馈问题</view>
          <view class="btn btn--action btn--grow h52 finish" role="button" @tap="finish">拍完了</view>
        </view>
      </template>

      <view v-if="c && done" class="done">
        <view class="done__hero">
          <view class="done__check"><Icon name="check" color="ok-fg" :size="30" /></view>
          <text class="done__title">{{ c.doneTitle }}</text>
          <text v-if="c.doneTime" class="done__desc">{{ c.doneTime }}</text>
        </view>

        <view class="card block">
          <text class="block__title">{{ checkin ? '这次打卡体验怎么样？' : '这次排队体验怎么样？' }}</text>
          <view class="rates" role="radiogroup" aria-label="排队体验">
            <view
              v-for="r in rates"
              :key="r.id"
              :class="['rate', { 'rate--on': rate === r.id }]"
              role="radio"
              :aria-checked="rate === r.id ? 'true' : 'false'"
              @tap="rate = r.id"
            >{{ r.label }}</view>
          </view>
          <view v-if="rate === 'bad'" class="block__link" role="link" @tap="toFeedback">哪里不好？告诉景区，15 分钟内有人处理</view>
        </view>

        <view v-if="c.nextStop" class="card block block--next">
          <text class="block__caption">{{ c.timeLeft }}</text>
          <view class="next">
            <view class="next__text">
              <text class="next__name">{{ c.nextStop.name }}</text>
              <text class="next__desc">{{ c.nextStop.desc }}</text>
            </view>
            <view class="btn btn--primary h44" role="link" @tap="go(c.nextStop.link)">去看看</view>
          </view>
        </view>

        <view class="done__row">
          <PlaceholderButton label="生成打卡海报 · 即将上线" :height="48" extra-style="flex:1 1 0;" />
          <view class="btn btn--plain btn--grow h48 done__collect" role="link" @tap="go({ page: 'me' })">查看今日收集</view>
        </view>

        <view class="done__spacer" />
        <view class="done__back">
          <view class="btn btn--action h52 finish" role="link" @tap="go({ page: 'map' })">回到地图</view>
        </view>
      </view>
    </StateView>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page--bar {
  padding-bottom: r(100);
}
.head {
  padding: calc(var(--safe-top) + #{r(14)}) r(20) r(18);
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
.head__title {
  font-size: r(14);
  flex-grow: 1;
}
.head__quit {
  font-size: r(13);
  color: var(--on-primary-sub);
  min-height: r(44);
  display: flex;
  align-items: center;
  @include tappable;
}
.head__time {
  display: flex;
  align-items: flex-end;
  gap: r(12);
}
.head__clock {
  @include serif(34);
  flex-grow: 1;
  line-height: 1.3;
}
.head__remain {
  font-size: r(12);
  color: var(--on-primary-sub);
  text-align: right;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
}
.progress {
  height: r(6);
  border-radius: r(3);
  background: var(--primary-deep);
}
.progress__fill {
  height: r(6);
  border-radius: r(3);
  background: var(--on-primary-sub);
}
.tabs {
  padding: r(14) r(20) 0;
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
.panel {
  padding: r(14) r(20);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.story,
.task {
  padding: r(16);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.story__player {
  display: flex;
  align-items: center;
  gap: r(12);
}
.story__play {
  width: r(48);
  height: r(48);
  border-radius: r(24);
  background: var(--action);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include tappable;
}
.story__meta {
  display: flex;
  flex-direction: column;
  gap: r(4);
  flex-grow: 1;
}
.story__title {
  font-size: r(15);
  font-weight: 700;
}
.story__bar {
  height: r(4);
  border-radius: r(2);
  background: var(--surface-muted);
}
.story__bar-fill {
  width: 40%;
  height: r(4);
  border-radius: r(2);
  background: var(--action);
}
.story__time {
  font-size: r(11);
  color: var(--text-2);
}
.versions {
  display: flex;
  gap: r(6);
  flex-wrap: wrap;
}
.version {
  @include pill(32);
  @include tappable;
  padding: 0 r(10);
  font-size: r(12);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: r(-6);
    bottom: r(-6);
  }
}
.version--on {
  border-color: var(--primary-fg);
  background: var(--primary-soft);
  color: var(--primary-fg);
  font-weight: 700;
}
.story__text {
  font-size: r(14);
  line-height: 1.8;
}
.story__source {
  font-size: r(11);
  color: var(--text-2);
}
.story__asks {
  display: flex;
  gap: r(8);
  flex-wrap: wrap;
}
.ask {
  padding: 0 r(12);
  font-size: r(13);
}
.task__progress {
  font-size: r(12);
  color: var(--action-fg);
  font-weight: 700;
}
.task__q {
  font-size: r(16);
  font-weight: 700;
  line-height: 1.6;
}
.task__opts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: r(8);
}
.opt {
  height: r(48);
  border-radius: r(12);
  font-size: r(16);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  @include tappable;
}
.opt--on {
  border: 2px solid var(--primary-fg);
  background: var(--ok-soft);
  font-weight: 700;
}
.task__next {
  align-self: flex-start;
  font-size: r(14);
}
.task__result {
  font-size: r(13);
}
.task__result--ok {
  color: var(--ok-fg);
}
.task__result--bad {
  color: var(--danger-fg);
}
.near {
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.near__caption {
  font-size: r(12);
  color: var(--text-2);
}
.shop {
  padding: r(14);
  display: flex;
  gap: r(12);
  align-items: center;
}
.shop__thumb {
  width: r(56);
  height: r(56);
  border-radius: r(10);
  background: var(--thumb);
  flex-shrink: 0;
}
.shop__text {
  display: flex;
  flex-direction: column;
  gap: r(3);
  flex-grow: 1;
}
.shop__name {
  font-size: r(15);
  font-weight: 700;
}
.shop__sub {
  font-size: r(12);
  color: var(--text-2);
}
.coupon {
  @include pill(40);
  @include tappable;
  padding: 0 r(12);
  font-size: r(13);
  font-weight: 700;
  border: 1px solid var(--action-fg);
  background: var(--surface);
  color: var(--action-fg);
  flex-shrink: 0;
}
.coupon--claimed {
  border-color: var(--border-strong);
  background: var(--surface-muted);
  color: var(--text-2);
}
.finish {
  font-size: r(16);
}
.done {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: var(--safe-top);
}
.done__hero {
  padding: r(36) r(24) r(20);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(10);
  text-align: center;
}
.done__check {
  width: r(64);
  height: r(64);
  border-radius: r(32);
  background: var(--ok-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.done__title {
  @include serif(24);
}
.done__desc {
  font-size: r(13);
  color: var(--text-2);
}
.block {
  margin: 0 r(20);
  padding: r(14) r(16);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.block--next {
  margin-top: r(12);
}
.block__title {
  font-size: r(14);
  font-weight: 700;
}
.block__caption {
  font-size: r(12);
  color: var(--action-fg);
  font-weight: 700;
}
.block__link {
  font-size: r(13);
  color: var(--primary-fg);
  min-height: r(32);
  display: flex;
  align-items: center;
  @include tappable;
}
.rates {
  display: flex;
  gap: r(8);
}
.rate {
  @include pill(44);
  @include tappable;
  flex: 1 1 0;
  font-size: r(14);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.rate--on {
  border: 2px solid var(--primary-fg);
  background: var(--ok-soft);
  font-weight: 700;
}
.next {
  display: flex;
  align-items: center;
  gap: r(12);
}
.next__text {
  display: flex;
  flex-direction: column;
  gap: r(2);
  flex-grow: 1;
}
.next__name {
  font-size: r(16);
  font-weight: 700;
}
.next__desc {
  font-size: r(12);
  color: var(--text-2);
}
.done__row {
  margin: r(12) r(20) 0;
  display: flex;
  gap: r(8);
}
.done__collect {
  font-size: r(13);
}
.done__spacer {
  flex-grow: 1;
  min-height: r(24);
}
.done__back {
  padding: r(12) r(20) r(24);
}
</style>
