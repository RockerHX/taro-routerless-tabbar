<template>
  <view class="fixture-page">
    <text class="fixture-title" data-testid="active-title">
      {{ activeTitle }}
    </text>
    <text class="fixture-url" data-testid="redirect-preview-url">
      {{ previewUrl }}
    </text>
    <text class="fixture-retap" data-testid="retap-summary">
      {{ retapSummary }}
    </text>
    <view class="fixture-style-boundary" data-testid="style-boundary">
      <text class="fixture-style-boundary-title">样式边界示例</text>
      <text class="fixture-style-boundary-desc">
        当前 fixture 使用 hostClass / paneClass / hiddenClass 追加业务 class，
        并通过 CSS 变量覆盖底栏高度、图标尺寸、激活色和背景色。
      </text>
    </view>

    <RouterlessTabPaneHost
      :items="tabItems"
      :active="tabs.activeKey.value"
      :visited="tabs.visitedKeys.value"
      host-class="fixture-routerless-host"
      pane-class="fixture-routerless-pane"
      hidden-class="fixture-routerless-pane-hidden"
    >
      <template #pane="{ pane, active }">
        <view
          :class="['fixture-pane', active ? 'fixture-pane-active' : '']"
          :data-testid="`pane-${pane.key}`"
        >
          <text
            class="fixture-pane-title"
            :data-testid="`pane-title-${pane.key}`"
          >
            {{ pane.text }}
          </text>
          <text
            class="fixture-pane-meta"
            :data-testid="`pane-visited-${pane.key}`"
          >
            visited: {{ tabs.isVisited(pane.key) ? 'yes' : 'no' }}
          </text>
          <text
            class="fixture-pane-meta"
            :data-testid="`pane-retap-${pane.key}`"
          >
            retap refresh count: {{ refreshCounts[pane.key] }}
          </text>
          <text
            class="fixture-pane-meta"
            :data-testid="`pane-refresh-status-${pane.key}`"
          >
            refresh status: {{ refreshStatus[pane.key] }}
          </text>
          <text
            class="fixture-pane-meta"
            :data-testid="`pane-state-${pane.key}`"
          >
            pane local state: {{ paneLocalCounts[pane.key] }}
          </text>
          <view
            class="fixture-pane-state-action"
            :data-testid="`pane-state-action-${pane.key}`"
            @click="incrementPaneState(pane.key)"
          >
            <text>增加 {{ pane.text }} 本地状态</text>
          </view>
          <view
            class="fixture-pane-fail-action"
            :data-testid="`pane-fail-action-${pane.key}`"
            @click="markNextRefreshFailed(pane.key)"
          >
            <text>模拟下一次 {{ pane.text }} 刷新失败</text>
          </view>
          <view
            class="fixture-detail-action"
            :data-testid="`pane-detail-action-${pane.key}`"
            @click="openFixtureDetail(pane.key)"
          >
            <text>进入 {{ pane.text }} 详情页再返回</text>
          </view>
          <view
            class="fixture-card-list"
            :data-testid="`card-list-${pane.key}`"
          >
            <view
              v-for="card in fixtureCards[pane.key]"
              :key="card.id"
              class="fixture-card"
              :data-testid="`card-${pane.key}-${card.id}`"
            >
              <text class="fixture-card-title">{{ card.title }}</text>
              <text class="fixture-card-desc">{{ card.desc }}</text>
            </view>
          </view>
        </view>
      </template>
    </RouterlessTabPaneHost>

    <RouterlessTabBar
      :active="tabs.activeKey.value"
      :items="tabItems"
      :refreshing="refreshingTab"
      :refresh-icon="refreshIcon"
      @change="handleChange"
      @retap="handleRetap"
    >
      <template #item="{ item, active, refreshing, iconPath }">
        <view
          class="fixture-tabbar-item"
          :data-testid="`tabbar-item-${item.key}`"
        >
          <image
            v-if="refreshing && refreshIcon"
            class="fixture-tabbar-icon"
            mode="scaleToFill"
            :src="refreshIcon"
          />
          <image
            v-else-if="iconPath"
            class="fixture-tabbar-icon"
            mode="scaleToFill"
            :src="iconPath"
          />
          <text
            :class="[
              'fixture-tabbar-text',
              active ? 'fixture-tabbar-text-active' : '',
            ]"
            :data-testid="`tabbar-text-${item.key}`"
          >
            {{ item.text }}
          </text>
        </view>
      </template>
    </RouterlessTabBar>
  </view>
</template>

<script setup lang="ts">
import Taro, { useLoad } from '@tarojs/taro'
import {
  RouterlessTabBar,
  RouterlessTabPaneHost,
  normalizeTabKey,
  resolveStandaloneTabRedirect,
  useRouterlessTabs,
} from 'taro-routerless-tabbar'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

import refreshIcon from '../../assets/tabbar/refresh.svg'
import {
  fixtureRetap,
  useFixtureRetapRefresh,
  useFixtureRetapRefreshAnimation,
} from './retap-refresh'
import { tabItems, tabKeys } from './tabbar'
import type { TabKey } from './tabbar'

const defaultTabKey: TabKey = 'home'

const tabs = useRouterlessTabs({
  tabs: tabItems,
  defaultKey: defaultTabKey,
})
const refreshingTab = ref<TabKey | ''>(fixtureRetap.getAnimatingKey())
const lastRetapTab = ref<TabKey | ''>('')
const refreshCounts = reactive<Record<TabKey, number>>({
  home: 0,
  orders: 0,
  profile: 0,
})
const refreshStatus = reactive<Record<TabKey, string>>({
  home: 'idle',
  orders: 'idle',
  profile: 'idle',
})
const failNextRefresh = reactive<Record<TabKey, boolean>>({
  home: false,
  orders: false,
  profile: false,
})
const paneLocalCounts = reactive<Record<TabKey, number>>({
  home: 0,
  orders: 0,
  profile: 0,
})
const refreshAnimations = {
  home: useFixtureRetapRefreshAnimation('home'),
  orders: useFixtureRetapRefreshAnimation('orders'),
  profile: useFixtureRetapRefreshAnimation('profile'),
} satisfies Record<TabKey, ReturnType<typeof useFixtureRetapRefreshAnimation>>
const fixtureCards = {
  home: Array.from({ length: 18 }, function createHomeCard(_, index) {
    return {
      id: index + 1,
      title: `首页推荐卡片 ${index + 1}`,
      desc: '用于验证长列表底部 padding 与 Tab 切换后的滚动内容保留。',
    }
  }),
  orders: Array.from({ length: 8 }, function createOrderCard(_, index) {
    return {
      id: index + 1,
      title: `订单状态 ${index + 1}`,
      desc: '用于模拟真实订单列表、筛选条件和切换后的页面状态。',
    }
  }),
  profile: Array.from({ length: 6 }, function createProfileCard(_, index) {
    return {
      id: index + 1,
      title: `个人中心入口 ${index + 1}`,
      desc: '用于展示 profile Tab 中的卡片式业务入口。',
    }
  }),
} satisfies Record<TabKey, Array<{ id: number; title: string; desc: string }>>
const stopWatchingRefreshAnimation = fixtureRetap.subscribeRefreshAnimation(
  (tab) => {
    refreshingTab.value = tab
  },
)
const previewUrl = computed(function getPreviewUrl() {
  const redirect = resolveStandaloneTabRedirect({
    mainPagePath: '/pages/index/index?from=fixture#top',
    tabKey: 'home',
    currentQuery: {
      campaign: 'summer',
      embedded: '0',
      from: 'share-card',
      lastRetap: lastRetapTab.value || undefined,
      tab: 'legacy',
    },
  })

  if (!redirect.shouldRedirect) {
    return 'embedded=true 时不需要 redirect'
  }

  return redirect.url
})
const activeTitle = computed(function getActiveTitle() {
  return `当前 Tab：${tabs.activeTab.value?.text ?? ''}`
})
const retapSummary = computed(function getRetapSummary() {
  return lastRetapTab.value
    ? `最近刷新：${lastRetapTab.value}`
    : '点击当前 Tab 可触发 retap 刷新'
})

function waitForFixtureRefresh() {
  return new Promise<void>(function resolveFixtureRefresh(resolve) {
    setTimeout(resolve, 250)
  })
}

function createRefreshHandler(key: TabKey) {
  return async function refreshFixtureTab() {
    const animation = refreshAnimations[key]

    if (!animation.startRefreshAnimation()) {
      refreshStatus[key] = 'busy'
      return
    }

    try {
      refreshStatus[key] = 'loading'
      await waitForFixtureRefresh()

      if (failNextRefresh[key]) {
        failNextRefresh[key] = false
        refreshStatus[key] = 'failed'
        throw new Error(`${key} fixture refresh failed`)
      }

      refreshCounts[key] += 1
      lastRetapTab.value = key
      refreshStatus[key] = 'success'
      await Promise.resolve()
    } finally {
      animation.stopRefreshAnimation()
    }
  }
}

useFixtureRetapRefresh('home', createRefreshHandler('home'))
useFixtureRetapRefresh('orders', createRefreshHandler('orders'))
useFixtureRetapRefresh('profile', createRefreshHandler('profile'))

function handleChange(key: TabKey) {
  tabs.activateTab(key)
}

async function handleRetap(key: TabKey) {
  const started = await fixtureRetap.runRefresh(key)

  if (!started) {
    refreshStatus[key] = 'busy'
  }
}

function incrementPaneState(key: TabKey) {
  paneLocalCounts[key] += 1
}

function markNextRefreshFailed(key: TabKey) {
  failNextRefresh[key] = true
  refreshStatus[key] = 'will-fail'
}

function openFixtureDetail(key: TabKey) {
  void Taro.navigateTo({
    url: `/pages/detail/index?tab=${key}&from=fixture-detail`,
  })
}

function readBrowserQuery() {
  const location = globalThis.location
  const params = new URLSearchParams(location.search)
  const hashQueryIndex = location.hash.indexOf('?')

  if (hashQueryIndex >= 0) {
    new URLSearchParams(location.hash.slice(hashQueryIndex + 1)).forEach(
      function appendHashQuery(value, key) {
        params.set(key, value)
      },
    )
  }

  return Object.fromEntries(params.entries()) as Record<
    string,
    string | undefined
  >
}

function resolveLoadQuery(query: Record<string, string | undefined>) {
  if (typeof globalThis.location === 'undefined') {
    return query
  }

  return {
    ...readBrowserQuery(),
    ...query,
  }
}

function activateFromQuery(query: Record<string, string | undefined>) {
  const loadQuery = resolveLoadQuery(query)
  const nextTab = normalizeTabKey({
    value: String(loadQuery.tab ?? ''),
    tabKeys,
    defaultKey: defaultTabKey,
    aliases: {
      index: 'home',
    },
  })

  tabs.activateTab(nextTab)
}

useLoad((query: Record<string, string | undefined>) => {
  activateFromQuery(query)
})

onMounted(() => {
  if (typeof globalThis.location !== 'undefined') {
    activateFromQuery({})
  }
})

onUnmounted(() => {
  stopWatchingRefreshAnimation()
})
</script>

<style>
.fixture-page {
  --routerless-tabbar-height: 56px;
  --routerless-tabbar-icon-size: 24px;
  --routerless-tabbar-active-color: #f75d5b;
  --routerless-tabbar-bg: #fff;

  min-height: 100vh;
  padding: 32px 24px 112px;
}

.fixture-title,
.fixture-url,
.fixture-retap {
  display: block;
  margin-bottom: 16px;
  color: #1f2329;
  font-size: 28px;
}

.fixture-url,
.fixture-retap {
  color: #4e5969;
  font-size: 22px;
  line-height: 1.5;
  word-break: break-all;
}

.fixture-routerless-pane {
  margin-top: 24px;
}

.fixture-routerless-host {
  border-top: 1px dashed #ffd6a5;
}

.fixture-routerless-pane-hidden {
  pointer-events: none;
}

.fixture-style-boundary {
  margin-top: 20px;
  padding: 20px;
  border: 1px dashed #ffd6a5;
  border-radius: 12px;
  background: #fffaf0;
}

.fixture-style-boundary-title,
.fixture-style-boundary-desc {
  display: block;
}

.fixture-style-boundary-title {
  color: #d46b08;
  font-size: 24px;
}

.fixture-style-boundary-desc {
  margin-top: 8px;
  color: #4e5969;
  font-size: 20px;
  line-height: 1.5;
}

.fixture-pane {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid #edf2fd;
  border-radius: 12px;
  background: #fff;
  color: #4e5969;
}

.fixture-pane-active {
  border-color: #f75d5b;
  color: #f75d5b;
}

.fixture-pane-title,
.fixture-pane-meta {
  display: block;
}

.fixture-pane-title {
  margin-bottom: 12px;
  font-size: 28px;
}

.fixture-pane-meta {
  color: #4e5969;
  font-size: 22px;
  line-height: 1.5;
}

.fixture-pane-state-action,
.fixture-pane-fail-action,
.fixture-detail-action {
  display: inline-flex;
  margin-top: 16px;
  margin-right: 12px;
  padding: 12px 18px;
  border-radius: 999px;
  background: #fff1f0;
  color: #f75d5b;
  font-size: 22px;
}

.fixture-pane-fail-action {
  background: #fff7e6;
  color: #d46b08;
}

.fixture-detail-action {
  background: #e6f4ff;
  color: #1677ff;
}

.fixture-card-list {
  padding-bottom: calc(var(--routerless-tabbar-height) + 32px);
}

.fixture-card {
  margin-top: 16px;
  padding: 20px;
  border-radius: 12px;
  background: #f7f8fa;
}

.fixture-card-title,
.fixture-card-desc {
  display: block;
}

.fixture-card-title {
  color: #1f2329;
  font-size: 24px;
}

.fixture-card-desc {
  margin-top: 8px;
  color: #86909c;
  font-size: 20px;
  line-height: 1.5;
}

.fixture-tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fixture-tabbar-icon {
  width: var(--routerless-tabbar-icon-size);
  height: var(--routerless-tabbar-icon-size);
}

.fixture-tabbar-text {
  margin-top: 4px;
  color: #86909c;
  font-size: 20px;
}

.fixture-tabbar-text-active {
  color: var(--routerless-tabbar-active-color);
}
</style>
