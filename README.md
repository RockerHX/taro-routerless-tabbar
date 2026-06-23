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

当前版本 `0.1.0` 是首个稳定版本，已发布到 npm，并已在业务项目的小红书模拟器和真机预览中验证。

源码仓库：https://github.com/RockerHX/taro-routerless-tabbar

npm 包：https://www.npmjs.com/package/taro-routerless-tabbar

## 安装

通过 npm 安装：

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

## Tab 页面与 retap 刷新

Tab 页面建议同时支持两种打开方式：

- `embedded=true`：被 main 容器内嵌渲染，参与 routerless Tab 切换和保活。
- `embedded=false`：被独立页面路由打开，此时应重定向回 main 容器对应 Tab。

### 业务侧封装 `useStandaloneTabRedirect`

当前 package 暂未导出 `useStandaloneTabRedirect`。业务项目可以按下面方式自行封装：

```ts
// utils/tab-page.ts
import Taro from '@tarojs/taro'
import { onMounted } from 'vue'
import { buildRouterlessTabUrl } from 'taro-routerless-tabbar'

import { mainPagePath } from '@/config/tabbar'
import type { TabKey } from '@/config/tabbar'

export const useStandaloneTabRedirect = (
  tabKey: TabKey,
  isEmbedded: () => boolean,
) => {
  onMounted(() => {
    if (isEmbedded()) {
      return
    }

    Taro.redirectTo({
      url: buildRouterlessTabUrl({
        mainPagePath,
        tabKey,
      }),
    })
  })
}
```

### `pages/home/index.vue`

```vue
<template>
  <view v-if="embedded" class="home-page">
    <text>Home active: {{ active }}</text>
  </view>
  <view v-else class="page">
    <text>正在打开首页...</text>
  </view>
</template>

<script setup lang="ts">
import { createRetapRefreshContext } from 'taro-routerless-tabbar'

import type { TabKey } from '@/config/tabbar'
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

// 实际项目通常把这个 context 放在 pages/main/retap-refresh.ts，
// 由 main 容器和各 tab 页面共享同一个业务单例。
const retap = createRetapRefreshContext<TabKey>()
const { startRefreshAnimation, stopRefreshAnimation } =
  retap.useRetapRefreshAnimation('home')

const refreshHome = async () => {
  if (!startRefreshAnimation()) {
    return
  }

  try {
    // 在这里执行首页刷新逻辑，例如重新请求列表。
  } finally {
    stopRefreshAnimation()
  }
}

useStandaloneTabRedirect('home', () => props.embedded)
retap.useRetapRefresh('home', refreshHome, () => props.embedded)
</script>
```

> 注意：上面为了展示完整 API，直接创建了 `createRetapRefreshContext`。真实项目应创建一个共享业务单例，例如 `pages/main/retap-refresh.ts`，然后导出 `useTabRetapRefresh`、`useTabRetapRefreshAnimation` 给各 Tab 页面使用，避免 main 容器和页面各自拥有不同 context。

### `pages/order/index.vue`

```vue
<template>
  <view v-if="embedded" class="order-page">
    <text>Order active: {{ active }}</text>
  </view>
  <view v-else class="page">
    <text>正在打开订单...</text>
  </view>
</template>

<script setup lang="ts">
import {
  useTabRetapRefresh,
  useTabRetapRefreshAnimation,
} from '@/pages/main/retap-refresh'
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

const { startRefreshAnimation, stopRefreshAnimation } =
  useTabRetapRefreshAnimation('order')

const refreshOrder = async () => {
  if (!startRefreshAnimation()) {
    return
  }

  try {
    // 在这里执行订单刷新逻辑。
  } finally {
    stopRefreshAnimation()
  }
}

useStandaloneTabRedirect('order', () => props.embedded)
useTabRetapRefresh('order', refreshOrder, () => props.embedded)
</script>
```

### `pages/profile/index.vue`

```vue
<template>
  <view v-if="embedded" class="profile-page">
    <text>Profile active: {{ active }}</text>
  </view>
  <view v-else class="page">
    <text>正在打开我的...</text>
  </view>
</template>

<script setup lang="ts">
import { useTabRetapRefresh } from '@/pages/main/retap-refresh'
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

const refreshProfile = async () => {
  // 在这里执行我的页面刷新逻辑。
}

useStandaloneTabRedirect('profile', () => props.embedded)
useTabRetapRefresh('profile', refreshProfile, () => props.embedded)
</script>
```

retap 刷新的行为约定：

- 点击非当前 Tab 时派发 `change`，主容器切换 active key。
- 点击当前 Tab 时派发 `retap`，主容器调用对应刷新 handler。
- 同一个 Tab 的 handler 执行中，再次 retap 会返回 `false`，避免并发刷新。
- `runRefresh` 返回 `true` 只表示找到了 handler 并已执行，不代表业务刷新成功。
- handler 抛错会交给 `onError`；如果 `onError` 自身不抛错，`runRefresh` 不会继续向外抛出 handler 异常。
- 同一个 Tab key 只保留一个 handler，重复注册时后注册的 handler 会覆盖先注册的 handler。
- 刷新内容、失败提示和动画时机由业务页面自行决定。

## 默认 TabBar 与样式自定义

`RouterlessTabBar` 是受控组件，只负责展示和派发事件，不负责路由跳转。

```vue
<RouterlessTabBar
  :active="activeTab"
  :items="tabbarItems"
  :refreshing="refreshingTab"
  refresh-icon="/assets/tabbar/refresh.svg"
  @change="activateTab"
  @retap="handleTabRetap"
/>
```

Props：

| 名称          | 说明                                 |
| ------------- | ------------------------------------ |
| `active`      | 当前激活 Tab key                     |
| `items`       | Tab 列表，至少包含 `key` 和 `text`   |
| `refreshing`  | 正在显示刷新态的 Tab key，默认为空   |
| `refreshIcon` | 刷新态图标，传入后会替换默认图标文字 |

Events：

| 名称     | 触发时机                       |
| -------- | ------------------------------ |
| `change` | 点击非当前 Tab，参数为目标 key |
| `retap`  | 点击当前 Tab，参数为当前 key   |

### 使用 `#item` 完全自定义单个 Tab

```vue
<RouterlessTabBar :active="activeTab" :items="tabbarItems">
  <template #item="{ item, active, refreshing, iconPath }">
    <view class="my-tabbar-item">
      <image v-if="iconPath" :src="iconPath" mode="scaleToFill" />
      <text :class="active ? 'is-active' : ''">
        {{ refreshing ? '刷新中' : item.text }}
      </text>
    </view>
  </template>
</RouterlessTabBar>
```

### 使用 CSS 变量覆盖默认样式

```scss
.routerless-tabbar {
  --routerless-tabbar-height: 52px;
  --routerless-tabbar-icon-size: 28px;
  --routerless-tabbar-text-size: 11px;
  --routerless-tabbar-color: #8a8f99;
  --routerless-tabbar-active-color: #ff4d4f;
  --routerless-tabbar-border-color: #edf2fd;
  --routerless-tabbar-bg: #fff;
}
```

默认样式只保证开箱可用。复杂业务视觉建议优先通过 `#item` 插槽或业务侧样式覆盖实现。

## API 速查

| API                         | 类型     | 说明                                              |
| --------------------------- | -------- | ------------------------------------------------- |
| `resolveTabClick`           | 纯函数   | 判断点击结果是 `change` 还是 `retap`              |
| `getTabKeys`                | 纯函数   | 从 Tab 配置按原顺序取出 key                       |
| `isTabKey`                  | 纯函数   | 判断字符串是否为合法 Tab key                      |
| `normalizeTabKey`           | 纯函数   | 把 query、alias 或非法值归一化为合法 Tab key      |
| `buildRouterlessTabUrl`     | 纯函数   | 生成主容器 URL，例如 `/pages/main/index?tab=home` |
| `resolveTabPageModuleKey`   | 纯函数   | 把 `/pages/home/index` 转为 `../home/index.vue`   |
| `createRetapRefreshCore`    | 纯逻辑   | 创建 retap 注册表、runner 和动画状态管理          |
| `createRetapRefreshContext` | Vue API  | 创建带 Vue 生命周期封装的 retap context           |
| `useRouterlessTabs`         | Vue API  | 管理 active、visited、懒挂载和点击切换状态        |
| `RouterlessTabBar`          | Vue 组件 | 默认底部 TabBar UI                                |
| `RouterlessTabPaneHost`     | Vue 组件 | 可选 pane 宿主，只渲染 visited panes              |

## 关于页面模块解析

`import.meta.glob` 必须由业务项目自己调用：

```ts
const tabPageModules = import.meta.glob('../*/index.vue', {
  eager: true,
})
```

原因是 Vite 需要静态分析 glob 路径，而不同项目的 `src/pages` 结构不一定相同。package 只提供 `resolveTabPageModuleKey` 这类 helper，不扫描使用者项目目录。
