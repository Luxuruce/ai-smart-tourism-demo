<script setup lang="ts">
// V9 安全与求助（SOS.dc.html + 交接文档 v1.1 13.2 2.4/2.5/2.7）
import { computed, onUnmounted, ref } from 'vue'
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

// —— 一键求助：长按 2 秒发送，外圈显示进度；中途松手不发送（防误触）——
const HOLD_MS = computed(() => info.data.value?.holdMs ?? 2000)
const holdProgress = ref(0)
let holdTimer: ReturnType<typeof setInterval> | null = null
let holdStart = 0
/** 触屏设备松手后浏览器还会补发 mouse 事件，这段时间内忽略 */
let lastTouch = 0

function stopHold() {
  if (holdTimer) clearInterval(holdTimer)
  holdTimer = null
}
function pressStart(isTouch: boolean) {
  if (!isTouch && Date.now() - lastTouch < 800) return
  if (isTouch) lastTouch = Date.now()
  if (sent.value || busy.value || holdTimer) return
  cancelledNotice.value = false
  holdStart = Date.now()
  holdProgress.value = 0
  holdTimer = setInterval(() => {
    holdProgress.value = Math.min(1, (Date.now() - holdStart) / HOLD_MS.value)
    if (holdProgress.value >= 1) {
      stopHold()
      run(sendSos, () => (sent.value = true))
      holdProgress.value = 0
    }
  }, 50)
}
function pressEnd(isTouch: boolean) {
  if (!isTouch && Date.now() - lastTouch < 800) return
  if (isTouch) lastTouch = Date.now()
  if (!holdTimer) return
  stopHold()
  holdProgress.value = 0
  uni.showToast({ title: info.data.value?.holdHint ?? '按住 2 秒发送求助', icon: 'none' })
}
onUnmounted(stopHold)
const ringStyle = computed(() => `--p:${holdProgress.value}`)

// —— 取消求助：原因可选，确认后值班室会回电 ——
const cancelOpen = ref(false)
const cancelReason = ref<string | null>(null)
const cancelledNotice = ref(false)
function confirmCancel() {
  run(cancelSos, () => {
    sent.value = false
    cancelOpen.value = false
    cancelReason.value = null
    cancelledNotice.value = true
  })
}

// —— 值班室号码卡（14.2 11.1.16）：号码需景区提供，原型只复制不拨打 ——
const dutyOpen = ref(false)
function copyDuty() {
  const phone = info.data.value?.duty.phone ?? ''
  uni.setClipboardData({ data: phone, success: () => uni.showToast({ title: '已复制', icon: 'none' }), fail: () => {} })
}

// —— 同行人位置共享：默认关闭；没有同行人时先邀请绑定 ——
const inviteOpen = ref(false)
function toggleShare(on: boolean) {
  if (on && !prefs.companion) {
    inviteOpen.value = true
    return
  }
  prefs.share = on
}
/** 原型阶段模拟：点「分享给同行人」即视为对方已打开卡片、完成绑定 */
function shareToCompanion() {
  prefs.companion = info.data.value?.share.companion ?? '[同行人 A]'
  prefs.share = true
  inviteOpen.value = false
}

// —— 寻人：先填表（称呼必填），发起后可结束 ——
type SeekState = 'idle' | 'form' | 'seeking' | 'ended'
const seek = ref<SeekState>('idle')
const seekForm = ref({ name: '', age: '', clothes: '' })
const canSeek = computed(() => seekForm.value.name.trim().length > 0)
function startSeek() {
  if (!canSeek.value) return
  run(startSeeking, () => (seek.value = 'seeking'))
}
function endSeek() {
  seek.value = 'ended'
  seekForm.value = { name: '', age: '', clothes: '' }
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
          <view class="sos__ring" :style="ringStyle">
            <view
              class="sos__btn"
              role="button"
              aria-label="一键求助：按住 2 秒，发送位置给景区值班室"
              @touchstart="pressStart(true)"
              @touchend="pressEnd(true)"
              @touchcancel="pressEnd(true)"
              @mousedown="pressStart(false)"
              @mouseup="pressEnd(false)"
              @mouseleave="pressEnd(false)"
            >
              <text>一键求助</text>
              <text class="sos__btn-sub">按住 2 秒</text>
            </view>
          </view>
          <view class="sos__hint"><text>会把你的位置和同行人信息</text><text>发送给景区值班室</text></view>
          <text v-if="cancelledNotice" class="sos__cancelled" role="status">{{ info.data.value?.cancelled }}</text>
        </view>
        <view v-else class="sos__sent" role="status">
          <view class="sos__check"><Icon name="check" color="ok-fg" :size="30" /></view>
          <text class="sos__title">景区值班室已收到</text>
          <view class="sos__desc"><text>{{ info.data.value?.received }}</text><text>请留在原地，保持手机畅通。</text></view>
          <view v-if="!cancelOpen" class="btn btn--plain h40 sos__cancel" role="button" @tap="cancelOpen = true">取消求助</view>
          <view v-else class="reason" role="group" aria-label="取消原因（可不选）">
            <text class="reason__title">取消原因（可不选）</text>
            <view class="reason__chips">
              <view
                v-for="r in info.data.value?.cancelReasons ?? []"
                :key="r"
                :class="['reason__chip', { 'reason__chip--on': cancelReason === r }]"
                role="radio"
                :aria-checked="cancelReason === r ? 'true' : 'false'"
                @tap="cancelReason = cancelReason === r ? null : r"
              >{{ r }}</view>
            </view>
            <view class="reason__actions">
              <view class="btn btn--plain btn--grow h40 small" role="button" @tap="cancelOpen = false">不取消</view>
              <view class="btn btn--danger btn--grow h40 small" role="button" @tap="confirmCancel">确认取消</view>
            </view>
          </view>
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
            <text class="share__sub">{{ info.data.value?.share.desc }}</text>
          </view>
          <SwitchToggle :model-value="prefs.share" label="同行人位置共享" @update:model-value="toggleShare" />
        </view>
        <text v-if="prefs.companion" class="share__bound" role="status">{{ prefs.companion }} 已加入</text>
        <view v-if="inviteOpen" class="invite" role="dialog" aria-label="邀请同行人">
          <text class="invite__text">{{ info.data.value?.share.invite }}</text>
          <view class="invite__actions">
            <view class="btn btn--plain btn--grow h40 small" role="button" @tap="inviteOpen = false">以后再说</view>
            <view class="btn btn--primary btn--grow h40 small" role="button" @tap="shareToCompanion">分享给同行人</view>
          </view>
        </view>

        <view v-if="seek === 'idle' || seek === 'ended'" class="seek-start">
          <text v-if="seek === 'ended'" class="seek-ended" role="status">{{ info.data.value?.seekEnded }}</text>
          <view class="btn h44 seek" role="button" @tap="seek = 'form'">孩子或同伴走散了？发起寻人</view>
        </view>
        <view v-else-if="seek === 'form'" class="seek-form" role="form" aria-label="寻人信息">
          <input v-model="seekForm.name" class="field" :placeholder="info.data.value?.seekFields.name" placeholder-class="field__ph" aria-label="走失者称呼（必填）" />
          <input v-model="seekForm.age" class="field" type="number" :placeholder="info.data.value?.seekFields.age" placeholder-class="field__ph" aria-label="年龄" />
          <input v-model="seekForm.clothes" class="field" :placeholder="info.data.value?.seekFields.clothes" placeholder-class="field__ph" aria-label="衣着描述" />
          <PlaceholderButton icon="camera" label="添加照片（可选）" />
          <view class="seek-form__actions">
            <view class="btn btn--plain btn--grow h44 small" role="button" @tap="seek = 'idle'">取消</view>
            <view
              :class="['btn', 'btn--danger', 'btn--grow', 'h44', { 'seek-form__go--off': !canSeek }]"
              role="button"
              :aria-disabled="canSeek ? 'false' : 'true'"
              @tap="startSeek"
            >立即发起寻人</view>
          </view>
        </view>
        <view v-else class="seeking-box">
          <text class="seeking" role="status">{{ info.data.value?.seeking }}</text>
          <view class="btn btn--outline h44" role="button" @tap="endSeek">已找到，结束寻人</view>
        </view>
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
        <view class="btn btn--plain btn--grow h48 call" role="button" aria-label="景区值班室电话" @tap="dutyOpen = true">值班室</view>
      </view>

      <view v-if="dutyOpen && info.data.value" class="duty-mask" @tap.self="dutyOpen = false">
        <view class="duty" role="dialog" :aria-label="info.data.value.duty.title">
          <text class="duty__title">{{ info.data.value.duty.title }}</text>
          <text class="duty__phone">{{ info.data.value.duty.phone }}</text>
          <view class="duty__actions">
            <view class="btn btn--plain btn--grow h44 small" role="button" @tap="dutyOpen = false">关闭</view>
            <view class="btn btn--primary btn--grow h44 small" role="button" @tap="copyDuty">复制号码</view>
          </view>
        </view>
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
.sos__ring {
  // 外圈即原型的 8px 浅色描边；按住时用进度填满
  --p: 0;
  width: r(132);
  height: r(132);
  border-radius: 50%;
  padding: r(8);
  box-sizing: border-box;
  background: conic-gradient(var(--danger-fg) calc(var(--p) * 1turn), var(--danger-soft) 0);
}
.sos__btn {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--danger);
  color: var(--on-color);
  font-size: r(20);
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  @include tappable;
}
.sos__btn-sub {
  font-size: r(11);
  font-weight: 400;
  opacity: 0.85;
}
.sos__cancelled {
  font-size: r(13);
  color: var(--ok-fg);
}
.reason {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.reason__title {
  font-size: r(13);
  color: var(--text-2);
}
.reason__chips {
  display: flex;
  gap: r(8);
  justify-content: center;
}
.reason__chip {
  @include pill(36);
  @include tappable;
  padding: 0 r(14);
  font-size: r(13);
  border: 1px solid var(--border-strong);
  background: var(--surface);
}
.reason__chip--on {
  border-color: var(--primary-fg);
  background: var(--primary-soft);
  color: var(--primary-fg);
  font-weight: 700;
}
.reason__actions,
.invite__actions,
.seek-form__actions {
  display: flex;
  gap: r(8);
}
.small {
  font-size: r(13);
}
.share__bound {
  font-size: r(13);
  color: var(--ok-fg);
}
.invite {
  padding: r(12);
  border-radius: r(10);
  background: var(--primary-soft);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.invite__text {
  font-size: r(13);
  line-height: 1.6;
}
.seek-start,
.seeking-box,
.seek-form {
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.seek-ended {
  font-size: r(13);
  color: var(--text-2);
}
.field {
  height: r(44);
  padding: 0 r(14);
  border-radius: r(10);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: r(14);
  color: var(--text);
}
:deep(.field__ph) {
  color: var(--text-disabled);
}
.seek-form__go--off {
  opacity: 0.5;
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
.duty-mask {
  position: fixed;
  z-index: 50;
  left: var(--frame-inset, 0px);
  right: var(--frame-inset, 0px);
  top: 0;
  bottom: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 r(32);
}
.duty {
  width: 100%;
  padding: r(20);
  border-radius: r(16);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: r(10);
}
.duty__title {
  font-size: r(15);
  color: var(--text-2);
}
.duty__phone {
  font-size: r(24);
  font-weight: 700;
}
.duty__actions {
  width: 100%;
  display: flex;
  gap: r(8);
  margin-top: r(6);
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
