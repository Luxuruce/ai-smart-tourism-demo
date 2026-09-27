<script setup lang="ts">
// V6 一键反馈（Feedback.dc.html + 交接文档 v1.1 13.4 4.1/4.4、附录 B.6）
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { VisitorFeedback } from '@qs/shared'
import Icon from '@/components/Icon.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import {
  categories, classify, getForm, getMyFeedbacks, getProgress, safetyCategory, submitFeedback,
} from '@/services/feedback'
import { spotName } from '@/services/map'
import { useFeedbackStore } from '@/stores/feedback'
import { back, go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'

// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })

const { pageStyle } = usePage()
const store = useFeedbackStore()

const form = useAsync(getForm, { isEmpty: () => false })
const progress = useAsync(getProgress)

/** 从排队页「反馈问题」「不太好」进入时，带着来源和机位 */
const fromSpot = ref<string | null>(null)
onLoad((query) => {
  if (query?.from === 'queue' && query.spot) fromSpot.value = spotName(String(query.spot))
})

// 文本框为空，只显示提示文字（13.4 4.4）
const text = ref('')
const placeholder = computed(() => (fromSpot.value ? form.data.value?.queuePlaceholder : form.data.value?.placeholder) ?? '')
const location = computed(() => (fromSpot.value ? `${fromSpot.value}（来自排队页）` : form.data.value?.location ?? ''))

// AI 识别：输入后按关键词规则识别；「修改」后以游客的选择为准
const manualCategory = ref<string | null>(null)
const category = computed(() => manualCategory.value ?? (text.value.trim() ? classify(text.value) : null))
const isSafety = computed(() => category.value === safetyCategory)
const sheetOpen = ref(false)
function chooseCategory(c: string) {
  manualCategory.value = c
  sheetOpen.value = false
}

const sending = ref(false)
const sendError = ref('')
const sent = ref<VisitorFeedback | null>(null)

async function submit() {
  const content = text.value.trim()
  if (!content || sending.value) return
  sending.value = true
  sendError.value = ''
  try {
    // 先保证「我的反馈」初始列表已加载，新工单插在最前面
    if (!store.loaded) store.init(await getMyFeedbacks())
    const item = await submitFeedback(content)
    store.add(item)
    sent.value = item
  } catch (e) {
    sendError.value = e instanceof Error ? e.message : '提交失败，请重试'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="head">
      <view class="head__back" role="button" aria-label="返回" @tap="back({ page: 'home' })">
        <Icon name="back" color="text" :size="20" />
      </view>
      <text class="head__title">告诉景区</text>
    </view>

    <view v-if="!sent" class="edit">
      <view class="danger">
        <Icon name="warning" color="danger-fg" :size="20" />
        <text class="danger__text">有人受伤、走失或拥挤危险？</text>
        <view class="btn btn--danger h36 danger__btn" role="link" @tap="go({ page: 'sos' })">紧急求助</view>
      </view>
      <text class="label">遇到什么问题？一句话就行，不用选分类</text>
      <textarea
        v-model="text"
        class="textarea"
        :maxlength="200"
        aria-label="反馈内容"
        :placeholder="placeholder"
        placeholder-class="textarea__ph"
      />
      <view v-if="isSafety" class="safety" role="alert">
        <text>{{ form.data.value?.safetyHint }}</text>
        <view class="safety__link" role="link" @tap="go({ page: 'sos' })">去一键求助 ›</view>
      </view>
      <view class="tools">
        <PlaceholderButton icon="mic" label="语音" />
        <PlaceholderButton icon="camera" label="拍照" />
      </view>
      <StateView :status="form.status.value" :rows="1" :row-height="80" :error="form.error.value" @retry="form.reload">
        <view v-if="form.data.value" class="card ai">
          <view class="ai__row">
            <text class="ai__k">AI 识别</text>
            <text v-if="category" class="ai__type">{{ category }}</text>
            <text v-else class="ai__wait">{{ form.data.value.beforeInput }}</text>
            <view class="ai__edit" role="button" aria-haspopup="true" @tap="sheetOpen = true">修改</view>
          </view>
          <view class="ai__row">
            <text class="ai__k">位置</text>
            <text>{{ location }}</text>
          </view>
        </view>
      </StateView>
      <text v-if="sendError" class="error" role="alert">{{ sendError }}</text>
      <view class="edit__spacer" />
      <view class="submit">
        <view
          :class="['btn', 'btn--action', 'h52', 'submit__btn', { 'submit__btn--off': !text.trim() }]"
          role="button"
          :aria-disabled="!text.trim() ? 'true' : 'false'"
          :aria-busy="sending ? 'true' : 'false'"
          @tap="submit"
        >{{ sending ? '正在提交…' : '提交' }}</view>
      </view>
    </view>

    <view v-else class="sent">
      <view class="sent__hero">
        <view class="sent__check"><Icon name="check" color="ok-fg" :size="30" /></view>
        <text class="sent__title">已送达现场工作人员</text>
        <text class="sent__desc">工单 #{{ sent.id }} · 通常 15 分钟内有人处理，处理结果会通过服务通知告诉你</text>
      </view>
      <view class="card steps">
        <text class="steps__title">处理进度</text>
        <StateView :status="progress.status.value" :rows="3" :row-height="20" :error="progress.error.value" @retry="progress.reload">
          <view class="steps__list">
            <view v-for="p in progress.data.value ?? []" :key="p.label" class="steps__item">
              <view :class="['steps__dot', { 'steps__dot--done': p.done }]" />
              <text :class="{ 'steps__todo': !p.done }">{{ p.label }}</text>
            </view>
          </view>
        </StateView>
      </view>
      <view class="edit__spacer" />
      <view class="sent__actions">
        <view class="btn btn--plain btn--grow h52" role="link" @tap="go({ page: 'me' })">我的反馈</view>
        <view class="btn btn--action btn--grow h52 sent__go" role="link" @tap="go({ page: 'map' })">继续逛</view>
      </view>
    </view>
    <view v-if="sheetOpen" class="sheet-mask" @tap.self="sheetOpen = false">
      <view class="sheet" role="dialog" aria-label="选择问题分类">
        <text class="sheet__title">选择问题分类</text>
        <view class="sheet__grid">
          <view
            v-for="c in categories"
            :key="c"
            :class="['sheet__item', { 'sheet__item--on': category === c }]"
            role="radio"
            :aria-checked="category === c ? 'true' : 'false'"
            @tap="chooseCategory(c)"
          >{{ c }}</view>
        </view>
        <view class="btn btn--plain h44" role="button" @tap="sheetOpen = false">取消</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-top: var(--safe-top);
  display: flex;
  flex-direction: column;
}
.head {
  padding: r(14) r(20);
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
.edit {
  padding: 0 r(20);
  display: flex;
  flex-direction: column;
  gap: r(12);
  flex-grow: 1;
}
.edit__spacer {
  flex-grow: 1;
}
.danger {
  padding: r(12) r(14);
  border-radius: r(12);
  background: var(--danger-soft);
  border: 1px solid var(--danger-border);
  display: flex;
  align-items: center;
  gap: r(10);
}
.danger__text {
  font-size: r(13);
  flex-grow: 1;
}
.danger__btn {
  padding: 0 r(12);
  font-size: r(12);
  flex-shrink: 0;
}
.label {
  font-size: r(13);
  color: var(--text-2);
}
.textarea {
  width: 100%;
  height: r(110);
  padding: r(12);
  border-radius: r(12);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: r(15);
  color: var(--text);
}
:deep(.textarea__ph) {
  color: var(--text-disabled);
}
.tools {
  display: flex;
  gap: r(8);
}
.tool {
  padding: 0 r(14);
  gap: r(6);
  font-size: r(13);
}
.ai {
  padding: r(12) r(14);
  display: flex;
  flex-direction: column;
  gap: r(8);
  font-size: r(13);
}
.ai__row {
  display: flex;
  gap: r(8);
  align-items: center;
}
.ai__k {
  color: var(--text-2);
  width: r(56);
  flex-shrink: 0;
}
.ai__type {
  padding: r(2) r(10);
  border-radius: r(10);
  background: var(--surface-muted);
  font-weight: 700;
}
.ai__edit {
  color: var(--primary-fg);
  font-size: r(13);
  min-height: r(32);
  display: flex;
  align-items: center;
  padding: 0 r(6);
  @include tappable;
}
.ai__wait {
  color: var(--text-disabled);
  flex-grow: 1;
}
.safety {
  padding: r(10) r(12);
  border-radius: r(10);
  background: var(--danger-soft);
  color: var(--danger-fg);
  font-size: r(13);
  display: flex;
  align-items: center;
  gap: r(8);
}
.safety text {
  flex-grow: 1;
}
.safety__link {
  font-weight: 700;
  min-height: r(32);
  display: flex;
  align-items: center;
  @include tappable;
}
.sheet-mask {
  position: fixed;
  z-index: 50;
  left: var(--frame-inset, 0px);
  right: var(--frame-inset, 0px);
  top: 0;
  bottom: 0;
  background: var(--scrim);
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  padding: r(18) r(20) calc(#{r(20)} + env(safe-area-inset-bottom));
  border-radius: r(16) r(16) 0 0;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: r(14);
}
.sheet__title {
  font-size: r(16);
  font-weight: 700;
}
.sheet__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: r(8);
}
.sheet__item {
  @include pill(44);
  @include tappable;
  font-size: r(13);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.sheet__item--on {
  border-color: var(--primary-fg);
  background: var(--primary-soft);
  color: var(--primary-fg);
  font-weight: 700;
}
.error {
  font-size: r(12);
  color: var(--danger-fg);
}
.submit {
  padding-bottom: r(24);
}
.submit__btn {
  width: 100%;
  font-size: r(16);
}
.submit__btn--off {
  opacity: 0.5;
}
.sent {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.sent__hero {
  padding: r(20) r(24);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(10);
  text-align: center;
}
.sent__check {
  width: r(64);
  height: r(64);
  border-radius: r(32);
  background: var(--ok-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sent__title {
  @include serif(22);
}
.sent__desc {
  font-size: r(13);
  color: var(--text-2);
}
.steps {
  margin: r(8) r(20) 0;
  padding: r(16);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.steps__title {
  font-size: r(14);
  font-weight: 700;
}
.steps__list {
  display: flex;
  flex-direction: column;
  gap: r(12);
  font-size: r(13);
}
.steps__item {
  display: flex;
  gap: r(10);
  align-items: center;
}
.steps__dot {
  width: r(12);
  height: r(12);
  border-radius: r(6);
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
}
.steps__dot--done {
  border: none;
  background: var(--heat-low-dot);
}
.steps__todo {
  color: var(--text-2);
}
.sent__actions {
  padding: r(12) r(20) r(24);
  display: flex;
  gap: r(10);
}
.sent__go {
  font-size: r(15);
}
</style>
