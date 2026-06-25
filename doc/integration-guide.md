# 完整接入指南（高级受控模式）

本文展示 Taro 4 + Vue 3 + Vite 项目中一个 `home`、`order`、`profile` 三个 Tab 的高级受控接入方式。若只需要默认 active/visited 管理和默认底栏，优先使用 README 或 `examples/taro-vue3-routerless-tabs-basic` 中的 `RouterlessTabs` 极简示例；本文适合需要完全控制状态、页面模块 resolver、独立页 redirect 或复杂 retap refresh 的项目。

## 何时使用哪种模式

| 目标                                                                   | 推荐模式                  | 说明                                                                                            |
| ---------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| 几行代码接入默认底栏、懒挂载和 pane 保活                               | `RouterlessTabs` 默认模式 | 只需要传入 `tabs` 和 `defaultKey`，适合大多数简单 main 容器。                                   |
| 需要从 query 归一化初始 Tab、接入 `import.meta.glob` 或独立页 redirect | 高级受控模式              | 自行拼装 `useRouterlessTabs`、`RouterlessTabPaneHost` 和 `RouterlessTabBar`，控制每一步数据流。 |
| 需要完全控制 active/visited、切换副作用、底栏布局或 pane host class    | 高级受控模式              | 避免高阶组件隐藏状态变化，便于复杂业务调试。                                                    |

- `examples/taro-vue3-routerless-tabs-basic`：面向 README 用户的最小接入示例，适合直接复制 `RouterlessTabs` 默认模式。
- `examples/taro-vue3-basic`：高级受控 fixture，包含长列表、复杂 query、retap 异步刷新、模拟详情返回链路和样式边界示例。

`RouterlessTabs` 默认模式适合静态 Tab 配置。若 Tab 列表、默认 key 或初始 key 来自异步数据，请在数据就绪后再渲染组件；需要运行时动态增删 Tab 或重建状态时，建议改用 `useRouterlessTabs`、`RouterlessTabPaneHost` 和 `RouterlessTabBar` 自行拼装并管理重置策略。

高级 fixture 的 H5 运行时可通过 `pnpm run test:taro:h5:runtime` 自动验证核心交互。

## 1. 定义 Tab 配置

```ts
// config/tabbar.ts
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

## 2. 创建共享 retap context

如果暂不需要二次点击刷新，也可以先保留这个文件但不在页面注册 handler。需要完整刷新链路时参考 [retap 刷新指南](./retap-refresh.md)。
main 容器和所有 Tab 页面必须引用这个文件导出的同一个实例，不能在页面组件内重新创建 context。

```ts
// pages/main/retap-refresh.ts
import { createRetapRefreshContext } from 'taro-routerless-tabbar'

import type { TabKey } from '@/config/tabbar'

export const tabRetap = createRetapRefreshContext<TabKey>()
export const useTabRetapRefresh = tabRetap.useRetapRefresh
export const useTabRetapRefreshAnimation = tabRetap.useRetapRefreshAnimation
```

## 3. 实现 main 容器页面（高级受控）

main 容器负责解析 URL query、加载业务 Tab 页面组件、维护 active/visited 状态，并渲染默认底栏。

```vue
<!-- pages/main/index.vue -->
<template>
  <view class="page main-page">
    <view class="main-page-content">
      <RouterlessTabPaneHost
        :items="tabPanes"
        :active="activeTab"
        :visited="visitedKeys"
      >
        <template #pane="{ pane, active }">
          <component :is="pane.component" embedded :active="active" />
        </template>
      </RouterlessTabPaneHost>
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
  RouterlessTabPaneHost,
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
import { tabRetap } from '@/pages/main/retap-refresh'

type PageQuery = Record<string, string | undefined>
type TabPageModule = { default: Component }
type TabPane = (typeof tabbarItems)[number] & { component: Component }

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
const visitedKeys = tabs.visitedKeys
const activateTab = tabs.activateTab
const refreshingTab = ref<TabKey | ''>(tabRetap.getAnimatingKey())
const stopWatchingRefreshAnimation = tabRetap.subscribeRefreshAnimation(
  (tab) => {
    refreshingTab.value = tab
  },
)

const handleTabRetap = async (tab: TabKey) => {
  await tabRetap.runRefresh(tab)
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
</style>
```

## 4. 支持独立 Tab 页面重定向

Tab 页面建议同时支持两种打开方式：

- `embedded=true`：被 main 容器内嵌渲染，参与 routerless Tab 切换和保活。
- `embedded=false`：被独立页面路由打开，此时重定向回 main 容器对应 Tab。

推荐用官方 `resolveStandaloneTabRedirect` 封装一个项目内 composable。这个 helper 只负责判断是否需要跳转并生成 URL，不依赖 Taro runtime，因此可以稳定单测 query 合并规则：

```ts
// utils/tab-page.ts
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { resolveStandaloneTabRedirect } from 'taro-routerless-tabbar'

import { mainPagePath } from '@/config/tabbar'
import type { TabKey } from '@/config/tabbar'

type PageQuery = Record<string, string | undefined>

export const useStandaloneTabRedirect = (
  tabKey: TabKey,
  isEmbedded: () => boolean,
) => {
  useLoad((query: PageQuery) => {
    const redirect = resolveStandaloneTabRedirect({
      mainPagePath,
      tabKey,
      embedded: isEmbedded(),
      currentQuery: query,
    })

    if (redirect.shouldRedirect) {
      Taro.redirectTo({
        url: redirect.url,
      })
    }
  })
}
```

`resolveStandaloneTabRedirect` 会保留独立页打开时的普通 query 参数，过滤 `embedded`，并用当前 Tab key 覆盖旧的 `tab` 参数。

fixture 中的主容器会展示一条 redirect 预览 URL，用于观察普通 query 保留、`embedded` 过滤和旧 `tab` 覆盖结果。

Tab 页面中按需使用：

```vue
<!-- pages/home/index.vue -->
<template>
  <view v-if="embedded" class="home-page">
    <text>Home active: {{ active }}</text>
  </view>
  <view v-else class="page">
    <text>正在打开首页...</text>
  </view>
</template>

<script setup lang="ts">
import { useStandaloneTabRedirect } from '@/utils/tab-page'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

useStandaloneTabRedirect('home', () => props.embedded)
</script>
```

`order`、`profile` 等其他 Tab 页面保持同样结构，只替换对应 Tab key 和业务内容。需要二次点击刷新时，按 [retap 刷新指南](./retap-refresh.md) 从共享单例文件导入 `useTabRetapRefresh`，不要在每个页面重复创建新的 context。

fixture 中每个 Tab 都注册了异步刷新 handler，可见 loading、成功、失败提示和重复 retap 并发保护效果。长列表和卡片列表用于验证内容区底部 padding，样式边界区域展示 `hostClass`、`paneClass`、`hiddenClass` 与 CSS 变量覆盖的推荐写法。

## 5. 页面模块解析

`import.meta.glob` 必须写在业务项目里：

```ts
const tabPageModules = import.meta.glob('../*/index.vue', {
  eager: true,
})
```

原因是 Vite 需要静态分析 glob 路径，而不同项目的 `pages` 目录结构不一定相同。package 只提供 `resolveTabPageModuleKey` 这类 helper，不会扫描使用者项目目录。

基础项目可以继续使用 `resolveTabPageModuleKey`，它只接受 `/pages/...` 或 `pages/...` 形式，并转换为 main 页面相邻目录可用的 `../xxx/index.vue`。

如果项目使用 subpackages、自定义页面根目录，或 main 页面与 Tab 页面不在同级目录，可以创建自定义 resolver：

```ts
import { createTabPageModuleResolver } from 'taro-routerless-tabbar'

const resolveSubpackageModuleKey = createTabPageModuleResolver({
  pageRoot: '/subpackages/shop/pages',
  modulePrefix: '../../subpackages/shop/pages',
  extension: '.vue',
})

const tabPageModules = import.meta.glob<TabPageModule>(
  '../../subpackages/shop/pages/**/index.vue',
  {
    eager: true,
  },
)

const pageModule =
  tabPageModules[
    resolveSubpackageModuleKey('/subpackages/shop/pages/orders/index')
  ]
```

如果页面路径和 `import.meta.glob` key 不存在稳定推导关系，也可以在业务 Tab 配置中直接声明 `moduleKey`，并优先使用显式配置：

```ts
export const tabbarItems = [
  {
    key: 'order',
    text: '订单',
    pagePath: '/subpackages/shop/pages/order/index',
    moduleKey: '../../subpackages/shop/pages/order/index.vue',
  },
] as const

const tabPanes = tabbarItems.map((item) => {
  const moduleKey = item.moduleKey ?? resolveTabPageModuleKey(item.pagePath)
  const pageModule = tabPageModules[moduleKey]

  if (!pageModule) {
    throw new Error(`Missing tab page component: ${item.pagePath}`)
  }

  return {
    ...item,
    component: pageModule.default,
  }
})
```
