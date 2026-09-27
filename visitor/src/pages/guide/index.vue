<script setup lang="ts">
// V5 AI 导游（Guide.dc.html）
// 不接真实大模型：快捷问题切换预设对话；自由提问追加一条固定提示。
import { computed, nextTick, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { NarrationId, QaScenarioId, QaTurn } from '@qs/shared'
import Icon from '@/components/Icon.vue'
import PlaceholderButton from '@/components/PlaceholderButton.vue'
import StateView from '@/components/StateView.vue'
import SwitchToggle from '@/components/SwitchToggle.vue'
import { askFreeText, getGuideMeta, getNearbyNarration, getScenarios } from '@/services/guide'
import { useGuideFocusStore } from '@/stores/guideFocus'
import { usePartyStore } from '@/stores/party'
import { usePersonaStore } from '@/stores/persona'
import { go } from '@/utils/nav'
import { useAsync } from '@/utils/useAsync'
import { usePage } from '@/utils/usePage'


// 页面参数不作为属性透传到根节点
defineOptions({ inheritAttrs: false })
const { pageStyle } = usePage()
const persona = usePersonaStore()
const party = usePartyStore()
const focus = useGuideFocusStore()

const meta = useAsync(getGuideMeta)
const scenarios = useAsync(getScenarios)

const auto = ref(true)
const q = ref<QaScenarioId>('history')
/** 在当前预设对话后追加的自由提问 */
const extra = ref<QaTurn[]>([])
const input = ref('')
const asking = ref(false)

const turns = computed<QaTurn[]>(() => {
  const s = scenarios.data.value?.find((x) => x.id === q.value)
  return [...(s?.turns ?? []), ...extra.value]
})

// 带着问题打开：其他页面跳过来时直接显示指定场景（13.1 1.2）
onShow(() => {
  const id = focus.take()
  if (id) pick(id)
})

// 附近讲解条：点击后在本页展开迷你播放条，不跳转（13.1 1.4）
const narration = useAsync(getNearbyNarration, { isEmpty: (v) => v.versions.length === 0, immediate: false })
const playerOpen = ref(false)
const playing = ref(false)
const versionId = ref<NarrationId>('std')
const version = computed(() => narration.data.value?.versions.find((v) => v.id === versionId.value) ?? narration.data.value?.versions[0])
function togglePlayer() {
  playerOpen.value = !playerOpen.value
  if (playerOpen.value) {
    playing.value = true
    if (!narration.data.value) narration.reload()
  }
}

function pick(id: QaScenarioId) {
  q.value = id
  extra.value = []
  scrollToBottom()
}

async function submit() {
  const text = input.value.trim()
  if (!text || asking.value) return
  input.value = ''
  extra.value = [...extra.value, { role: 'user', blocks: [{ type: 'text', text }] }]
  scrollToBottom()
  asking.value = true
  try {
    const reply = await askFreeText(text)
    extra.value = [...extra.value, { role: 'ai', blocks: [{ type: 'text', text: reply }] }]
  } catch (e) {
    extra.value = [...extra.value, { role: 'ai', blocks: [{ type: 'meta', text: e instanceof Error ? e.message : '回答失败' }] }]
  } finally {
    asking.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => uni.pageScrollTo({ scrollTop: 99999, duration: 200 }))
}

/** 只有纯文字的回答用窄气泡；带列表、按钮的回答铺满宽度 */
const isRich = (t: QaTurn) => t.blocks.some((b) => b.type === 'rows' || b.type === 'items' || b.type === 'actions' || b.type === 'notice')
const userText = (t: QaTurn) => (t.blocks[0]?.type === 'text' ? t.blocks[0].text : '')
</script>

<template>
  <page-meta :page-style="pageStyle" />
  <view class="page">
    <view class="top">
      <view class="top__title">
        <text class="top__name">AI 导游</text>
        <text class="top__sub">{{ meta.data.value?.subtitle ?? '只根据景区审核过的资料回答，每条都注明依据' }}</text>
      </view>
      <view class="near">
        <Icon name="pin" color="action-fg" :size="18" />
        <view class="near__link" role="button" :aria-expanded="playerOpen ? 'true' : 'false'" @tap="togglePlayer">
          <text>你在<text class="near__spot">{{ meta.data.value?.nearby.spot ?? '文昌阁' }}</text>附近</text>
          <text class="near__story">{{ meta.data.value?.nearby.story ?? '' }} ›</text>
        </view>
        <text class="near__label">走近自动讲</text>
        <SwitchToggle v-model="auto" label="走近讲解点时自动播放" />
      </view>
      <view v-if="playerOpen" class="mini" role="region" aria-label="讲解播放条">
        <StateView :status="narration.status.value" :rows="1" :row-height="48" :error="narration.error.value" @retry="narration.reload">
          <view v-if="version && narration.data.value" class="mini__body">
            <view class="mini__row">
              <view class="mini__play" role="button" :aria-label="playing ? '暂停讲解' : '播放讲解'" @tap="playing = !playing">
                <Icon :name="playing ? 'pause' : 'play'" color="on-color" :size="16" />
              </view>
              <view class="mini__meta">
                <text class="mini__title">{{ narration.data.value.storyTitle }}</text>
                <text class="mini__time">{{ version.label }} · {{ narration.data.value.storyProgress }} / {{ version.duration }}</text>
              </view>
            </view>
            <view class="mini__versions" role="radiogroup" aria-label="讲解版本">
              <view
                v-for="v in narration.data.value.versions"
                :key="v.id"
                :class="['mini__version', { 'mini__version--on': versionId === v.id }]"
                role="radio"
                :aria-checked="versionId === v.id ? 'true' : 'false'"
                @tap="versionId = v.id"
              >{{ v.label }}</view>
            </view>
          </view>
        </StateView>
      </view>
    </view>

    <view class="chat">
      <text class="chat__persona">已知你的身份：{{ persona.label }} · {{ party.label }} · 今天</text>
      <StateView :status="scenarios.status.value" :rows="3" :row-height="72" empty-text="景区还没有配置可回答的问题" :error="scenarios.error.value" @retry="scenarios.reload">
        <view class="turns" aria-live="polite">
          <template v-for="(t, i) in turns" :key="`${q}-${i}`">
            <view v-if="t.role === 'user'" class="bubble bubble--user">{{ userText(t) }}</view>
            <view v-else :class="['bubble', 'bubble--ai', { 'bubble--rich': isRich(t) }]">
              <template v-for="(b, j) in t.blocks" :key="j">
                <text v-if="b.type === 'text'" class="ai-text">{{ b.text }}</text>
                <view v-else-if="b.type === 'rows'" class="ai-rows">
                  <view v-for="r in b.rows" :key="r.k" class="ai-row">
                    <text class="ai-row__k">{{ r.k }}</text>
                    <text>{{ r.v }}</text>
                  </view>
                </view>
                <view v-else-if="b.type === 'items'" class="ai-rows">
                  <view v-for="(it, k) in b.items" :key="k">
                    <text v-if="it.bold" class="ai-bold">{{ it.bold }}</text><text>{{ it.text }}</text>
                  </view>
                </view>
                <text v-else-if="b.type === 'notice'" class="ai-notice">{{ b.text }}</text>
                <view v-else-if="b.type === 'actions'" class="ai-actions">
                  <view
                    v-for="a in b.items"
                    :key="a.label"
                    :class="['btn', 'btn--grow', 'h40', 'ai-btn', a.kind === 'action' ? 'btn--action' : a.kind === 'ok' ? 'btn--ok' : 'btn--danger-soft']"
                    role="link"
                    @tap="go(a.link)"
                  >{{ a.label }}</view>
                </view>
                <view v-else-if="b.type === 'link'" class="ai-link" role="link" @tap="go(b.link)">{{ b.label }}</view>
                <text v-else-if="b.type === 'meta'" class="ai-meta">{{ b.text }}</text>
              </template>
              <text v-if="t.basis" class="ai-meta">依据：{{ t.basis }}</text>
            </view>
          </template>
          <view v-if="asking" class="bubble bubble--ai ai-meta" aria-busy="true">正在查找景区资料…</view>
        </view>
      </StateView>
    </view>

    <view class="composer">
      <scroll-view scroll-x class="chips-scroll" :show-scrollbar="false">
        <view class="chips" role="radiogroup" aria-label="快捷问题">
          <view
            v-for="s in scenarios.data.value ?? []"
            :key="s.id"
            :class="['qchip', { 'qchip--on': q === s.id }]"
            role="radio"
            :aria-checked="q === s.id ? 'true' : 'false'"
            @tap="pick(s.id)"
          >{{ s.chip }}</view>
        </view>
      </scroll-view>
      <view class="ask">
        <PlaceholderButton shape="circle" icon="camera" aria-label="拍照识建筑" extra-style="background:transparent;" />
        <input
          v-model="input"
          class="ask__input"
          placeholder="问故事、问路线、问排队……"
          placeholder-class="ask__ph"
          aria-label="向 AI 导游提问"
          confirm-type="send"
          @confirm="submit"
        />
        <PlaceholderButton shape="circle" icon="mic" aria-label="按住说话" extra-style="background:transparent;" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: r(130);
}
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  padding: calc(var(--safe-top) + #{r(16)}) r(20) r(10);
  display: flex;
  flex-direction: column;
  gap: r(10);
}
.top__title {
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.top__name {
  @include serif(22);
}
.top__sub {
  font-size: r(12);
  color: var(--text-2);
}
.near {
  padding: r(8) r(12);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: r(14);
  display: flex;
  align-items: center;
  gap: r(10);
}
.near__link {
  font-size: r(13);
  flex-grow: 1;
  min-height: r(36);
  display: flex;
  flex-direction: column;
  justify-content: center;
  @include tappable;
}
.near__spot {
  font-weight: 700;
}
.near__story {
  font-size: r(11);
  color: var(--text-2);
}
.near__label {
  font-size: r(12);
  color: var(--text-2);
}
.mini {
  padding: r(10) r(12);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: r(14);
}
.mini__body {
  display: flex;
  flex-direction: column;
  gap: r(8);
}
.mini__row {
  display: flex;
  align-items: center;
  gap: r(10);
}
.mini__play {
  width: r(40);
  height: r(40);
  border-radius: r(20);
  background: var(--action);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include tappable;
}
.mini__meta {
  display: flex;
  flex-direction: column;
  gap: r(2);
}
.mini__title {
  font-size: r(14);
  font-weight: 700;
}
.mini__time {
  font-size: r(11);
  color: var(--text-2);
}
.mini__versions {
  display: flex;
  gap: r(6);
  flex-wrap: wrap;
}
.mini__version {
  @include pill(32);
  @include tappable;
  padding: 0 r(10);
  font-size: r(12);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.mini__version--on {
  border-color: var(--primary-fg);
  background: var(--primary-soft);
  color: var(--primary-fg);
  font-weight: 700;
}
.chat {
  padding: r(4) r(20) r(12);
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.chat__persona {
  align-self: center;
  font-size: r(11);
  color: var(--text-2);
  background: var(--surface-muted);
  padding: r(3) r(10);
  border-radius: r(10);
}
.turns {
  display: flex;
  flex-direction: column;
  gap: r(12);
}
.bubble {
  font-size: r(14);
}
.bubble--user {
  align-self: flex-end;
  max-width: 78%;
  padding: r(10) r(14);
  border-radius: r(16) r(16) r(4) r(16);
  background: var(--primary);
  color: var(--on-color);
}
.bubble--ai {
  align-self: flex-start;
  max-width: 86%;
  padding: r(12) r(14);
  border-radius: r(16) r(16) r(16) r(4);
  background: var(--surface);
  border: 1px solid var(--border);
  line-height: 1.7;
  display: flex;
  flex-direction: column;
  gap: r(6);
}
.bubble--rich {
  align-self: stretch;
  max-width: none;
  padding: r(14);
  gap: r(10);
}
.ai-text {
  font-size: r(14);
  line-height: 1.7;
}
.ai-rows {
  display: flex;
  flex-direction: column;
  gap: r(8);
  font-size: r(13);
  line-height: 1.6;
}
.ai-row {
  display: flex;
  gap: r(8);
}
.ai-row__k {
  width: r(36);
  flex-shrink: 0;
  color: var(--text-2);
}
.ai-bold {
  font-weight: 700;
}
.ai-notice {
  padding: r(8) r(10);
  border-radius: r(8);
  background: var(--warn-soft);
  color: var(--warn-fg);
  font-size: r(12);
  line-height: 1.6;
}
.ai-actions {
  display: flex;
  gap: r(8);
}
.ai-btn {
  font-size: r(13);
  padding: 0 r(8);
}
.ai-link {
  font-size: r(13);
  color: var(--primary-fg);
  min-height: r(32);
  display: flex;
  align-items: center;
  @include tappable;
}
.ai-meta {
  font-size: r(11);
  color: var(--text-2);
  line-height: 1.5;
}
.composer {
  position: fixed;
  z-index: 20;
  left: var(--frame-inset, 0px);
  right: var(--frame-inset, 0px);
  bottom: var(--window-bottom, 0px);
  padding: r(10) r(20);
  display: flex;
  flex-direction: column;
  gap: r(8);
  border-top: 1px solid var(--border);
  background: var(--bg);
}
.chips-scroll {
  width: 100%;
  white-space: nowrap;
}
.chips {
  display: inline-flex;
  gap: r(8);
}
.qchip {
  @include pill(36);
  @include tappable;
  flex-shrink: 0;
  padding: 0 r(12);
  font-size: r(13);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.qchip--on {
  border-color: var(--primary-fg);
  background: var(--primary-soft);
  color: var(--primary-fg);
  font-weight: 700;
}
.ask {
  display: flex;
  gap: r(8);
  align-items: center;
}
.ask__input {
  flex-grow: 1;
  min-width: 0;
  height: r(44);
  padding: 0 r(16);
  border-radius: r(22);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: r(14);
  color: var(--text);
}
:deep(.ask__ph) {
  color: var(--text-disabled);
}
</style>
