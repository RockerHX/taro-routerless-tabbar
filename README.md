# taro-routerless-tabbar

免路由、不闪烁、保状态的 Taro Vue3 自定义 TabBar 方案。

`taro-routerless-tabbar` 不是一个单纯“画底栏”的 UI 组件库，而是一套把多个 Tab 页面收口到同一个主容器里渲染的免路由 TabBar 机制。点击 Tab 时不调用 `Taro.switchTab`、`Taro.navigateTo` 或 `Taro.redirectTo`，只更新主容器内部状态。

## 解决什么问题

普通路由式 Tab 切换在小程序/H5 多端场景里容易遇到这些问题：

- 切换 Tab 时页面重建、闪烁或局部状态丢失。
- 原生 `tabBar` 对图标尺寸、文字样式、安全区、刷新态等视觉细节控制有限。
- 不同 Taro 运行端对原生自定义 TabBar 的支持程度不一致。
- 业务希望二次点击当前 Tab 触发刷新，并显示刷新动画。

本包第一版聚焦以下能力：

- **不走路由切换**：点击不同 Tab 只更新主容器内的 active key。
- **访问后保活**：Tab 首次访问后继续挂载，切走时隐藏而不是卸载。
- **首屏懒挂载**：初始只挂载默认 Tab，其他 Tab 首次访问后再挂载。
- **retap 刷新**：点击当前 Tab 派发 retap，页面自行注册刷新处理器。
- **视觉可控**：提供默认 `RouterlessTabBar`，也允许通过 slot/CSS 变量完全自定义。

## 和 Taro 原生 `tabBar` 的区别

| 对比项   | Taro 原生 `tabBar`        | `taro-routerless-tabbar`         |
| -------- | ------------------------- | -------------------------------- |
| 切换方式 | 平台原生 Tab 路由切换     | 同一个主容器内切换 active key    |
| 页面状态 | 依赖平台页面生命周期      | 已访问 Tab 可保持组件实例        |
| 首屏挂载 | 由平台和页面栈机制决定    | 默认只挂载首个 Tab               |
| 视觉控制 | 受原生配置项限制          | 组件、slot、CSS 变量均可控制     |
| retap    | 需要额外适配平台行为      | 内置点击当前 Tab 的 retap 判定   |
| 适用目标 | 适合标准原生 Tab 页面结构 | 适合希望自定义布局和保状态的场景 |

## 和官方 `custom-tab-bar` 的区别

官方 `custom-tab-bar` 仍围绕小程序原生 TabBar 机制工作，通常需要遵守平台目录和生命周期约束。`taro-routerless-tabbar` 不依赖平台特定的 `custom-tab-bar` 目录，也不接管 Taro 路由系统；它只提供“主容器内切换 Tab 内容”的状态、组件和辅助函数。

因此它更适合：

- 希望同一套实现尽量覆盖小程序/H5 的项目。
- 需要保留列表滚动、筛选条件、页面局部状态的 Tab 页面。
- 需要完全控制底栏视觉、刷新态和安全区表现的业务。

## 为什么叫 routerless

这里的 `routerless` 指“Tab 切换不通过路由跳转完成”。

外部仍然可以通过 URL 进入主容器，例如：

```txt
/pages/main/index?tab=orders
```

但用户点击底部 Tab 时不会进入 `/pages/orders/index` 之类的独立页面路由，而是在 `/pages/main/index` 里切换当前激活的内嵌页面。

## 适用范围

第一版目标：

- Taro 4
- Vue 3
- Vite 构建
- 小程序/H5 场景
- 自定义底栏 UI + 免路由 Tab 内容切换

明确非目标：

- 不接管整个 Taro 路由系统。
- 不替代 Pinia、Vue Router 或 Taro navigation。
- 不内置业务顶部导航栏。
- 不内置业务图标资源。
- 不绑定任何业务 Tab key。
- 暂不承诺 React 支持。
- 暂不承诺所有 Taro 运行端表现完全一致。

## 当前状态

当前包仍处于 internal package 阶段，尚未作为公开 npm 包发布。正式发布前会继续补齐发布配置、版本管理和独立 demo 验证。

## 安装

当前包仍是 internal package，推荐在 pnpm workspace 里使用：

```json
{
  "dependencies": {
    "taro-routerless-tabbar": "workspace:*"
  }
}
```

如果业务项目需要在开发/测试时直接引用源码，可以在 Vite/Vitest/TypeScript 配置里把包名别名到 `packages/taro-routerless-tabbar/src/index.ts`。正式 npm 发布后再改为普通安装：

```bash
pnpm add taro-routerless-tabbar
```

## 最小接入示例

下面示例展示一个 `home`、`order`、`profile` 三个 Tab 的最小接入方式。示例省略业务顶部导航、图片资源和 store，只保留 routerless tab 的核心链路。

### `config/tabbar.ts`

```ts
import {
  buildRouterlessTabUrl,
  getTabKeys,
  isTabKey as isRouterlessTabKey,
  normalizeTabKey as normalizeRouterlessTabKey,
  resolveTabPageModuleKey,
} from 'taro-routerless-tabbar'

export const mainPagePath = '/pages/main/index'
export const defaultTabKey = 'home'

export const tabbarItems = [
  {
    key: 'home',
    text: '首页',
    pagePath: '/pages/home/index',
    iconPath: '/assets/tabbar/home.png',
    selectedIconPath: '/assets/tabbar/home-active.png',
  },
  {
    key: 'order',
    text: '订单',
    pagePath: '/pages/order/index',
    iconPath: '/assets/tabbar/order.png',
    selectedIconPath: '/assets/tabbar/order-active.png',
  },
  {
    key: 'profile',
    text: '我的',
    pagePath: '/pages/profile/index',
    iconPath: '/assets/tabbar/profile.png',
    selectedIconPath: '/assets/tabbar/profile-active.png',
  },
] as const

export type TabbarItem = (typeof tabbarItems)[number]
export type TabKey = TabbarItem['key']

export const tabKeys = getTabKeys(tabbarItems)

export const isTabKey = (value: string): value is TabKey =>
  isRouterlessTabKey(value, tabKeys)

export const normalizeTabKey = (value: string | undefined): TabKey =>
  normalizeRouterlessTabKey({
    value,
    tabKeys,
    defaultKey: defaultTabKey,
    aliases: {
      index: defaultTabKey,
    },
  })

export const buildMainTabUrl = (tabKey: TabKey = defaultTabKey) =>
  buildRouterlessTabUrl({
    mainPagePath,
    tabKey,
  })

export { resolveTabPageModuleKey }
```

### `pages/main/index.vue`

```vue
<template>
  <view class="page main-page">
    <view class="main-page-content">
      <view
        v-for="pane in visitedTabPanes"
        :key="pane.key"
        :class="[
          'main-page-pane',
          activeTab !== pane.key ? 'main-page-pane-hidden' : '',
        ]"
      >
        <component
          :is="pane.component"
          embedded
          :active="activeTab === pane.key"
        />
      </view>
    </view>

    <RouterlessTabBar
      :active="activeTab"
      :items="tabbarItems"
      :refreshing="refreshingTab"
      refresh-icon="/assets/tabbar/refresh.svg"
      @change="activateTab"
      @retap="handleTabRetap"
    />
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'
import {
  RouterlessTabBar,
  createRetapRefreshContext,
  useRouterlessTabs,
} from 'taro-routerless-tabbar'
import type { Component } from 'vue'
import { onUnmounted, ref } from 'vue'

import {
  buildMainTabUrl,
  defaultTabKey,
  normalizeTabKey,
  resolveTabPageModuleKey,
  tabbarItems,
} from '@/config/tabbar'
import type { TabKey } from '@/config/tabbar'

type PageQuery = Record<string, string | undefined>
type TabPageModule = { default: Component }
type TabPane = (typeof tabbarItems)[number] & { component: Component }

const retap = createRetapRefreshContext<TabKey>()
const tabPageModules = import.meta.glob<TabPageModule>('../*/index.vue', {
  eager: true,
})

const tabPanes: TabPane[] = tabbarItems.map((item) => {
  const moduleKey = resolveTabPageModuleKey(item.pagePath)
  const pageModule = tabPageModules[moduleKey]

  if (!pageModule) {
    throw new Error(`Missing tab page component: ${item.pagePath}`)
  }

  return {
    ...item,
    component: pageModule.default,
  }
})

const tabs = useRouterlessTabs({
  tabs: tabPanes,
  defaultKey: defaultTabKey,
})
const activeTab = tabs.activeKey
const visitedTabPanes = tabs.visitedTabs
const activateTab = tabs.activateTab
const refreshingTab = ref<TabKey | ''>(retap.getAnimatingKey())
const stopWatchingRefreshAnimation = retap.subscribeRefreshAnimation((tab) => {
  refreshingTab.value = tab
})

const handleTabRetap = async (tab: TabKey) => {
  await retap.runRefresh(tab)
}

onUnmounted(() => {
  stopWatchingRefreshAnimation()
})

defineOptions({
  onShareAppMessage() {
    return {
      title: '示例应用',
      path: buildMainTabUrl(defaultTabKey),
    }
  },
})

useLoad((query: PageQuery) => {
  activateTab(normalizeTabKey(String(query.tab ?? '')))
})
</script>

<style lang="scss">
.main-page-content {
  min-height: 100vh;
}

.main-page-pane-hidden {
  display: none;
}
</style>
```

`import.meta.glob` 必须写在业务项目里。不同项目的 `pages` 目录结构不一定相同，package 不会也不能可靠扫描使用者的页面文件。
