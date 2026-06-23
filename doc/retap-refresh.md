# retap 刷新指南

`retap` 指用户再次点击当前激活 Tab。`taro-routerless-tabbar` 只负责识别 retap、维护刷新 handler 注册表和刷新动画 key；真正的数据刷新、错误提示和动画时机由业务页面决定。

## 1. 创建共享 context

必须让 main 容器和所有 Tab 页面共享同一个 context。推荐放在 main 页面目录旁边：

```ts
// pages/main/retap-refresh.ts
import { createRetapRefreshContext } from 'taro-routerless-tabbar'

import type { TabKey } from '@/config/tabbar'

export const tabRetap = createRetapRefreshContext<TabKey>({
  onError(error, key) {
    console.error(`[tab retap] ${key} refresh failed`, error)
  },
})

export const useTabRetapRefresh = tabRetap.useRetapRefresh
export const useTabRetapRefreshAnimation = tabRetap.useRetapRefreshAnimation
```

不要在每个 Tab 页面里重新创建 context。否则 main 容器触发的 `runRefresh(tab)` 和页面注册的 handler 会落在不同实例上，刷新链路不会生效。

## 2. main 容器派发 retap

main 容器监听默认底栏的 `retap` 事件，并调用共享 context 的 `runRefresh`。

```vue
<!-- pages/main/index.vue 片段 -->
<template>
  <RouterlessTabBar
    :active="activeTab"
    :items="tabbarItems"
    :refreshing="refreshingTab"
    refresh-icon="/assets/tabbar/refresh.svg"
    @change="activateTab"
    @retap="handleTabRetap"
  />
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import type { TabKey } from '@/config/tabbar'
import { tabRetap } from '@/pages/main/retap-refresh'

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
</script>
```

`RouterlessTabBar` 的事件规则：

- 点击非当前 Tab：派发 `change`，主容器切换 active key。
- 点击当前 Tab：派发 `retap`，主容器调用对应刷新 handler。

## 3. Tab 页面注册刷新 handler

Tab 页面通过共享的 `useTabRetapRefresh` 注册刷新 handler。建议用 `embedded` 控制注册状态，避免独立页面重定向过程中的临时实例注册刷新逻辑。

```vue
<!-- pages/home/index.vue -->
<template>
  <view v-if="embedded" class="home-page">
    <text>{{ active ? '首页刷新可用' : '首页已保活' }}</text>
  </view>
  <view v-else class="page">
    <text>正在打开首页...</text>
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
  useTabRetapRefreshAnimation('home')

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
useTabRetapRefresh('home', refreshHome, () => props.embedded)
</script>
```

其他 Tab 页面保持同样模式，只替换 Tab key 和业务刷新函数：

```vue
<!-- pages/order/index.vue 片段 -->
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

如果某个页面不需要刷新动画，也可以只注册 handler：

```vue
<!-- pages/profile/index.vue 片段 -->
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

## 4. 行为约定

- `runRefresh(tab)` 找不到 handler 时返回 `false`。
- 同一个 Tab 的 handler 执行中，再次 retap 返回 `false`，不会并发执行同一个刷新函数。
- `runRefresh` 返回 `true` 只表示找到了 handler 并已执行，不代表业务刷新一定成功。
- handler 抛错会交给 `onError`；如果 `onError` 自身不抛错，`runRefresh` 不会继续向外抛出 handler 异常。
- 同一个 Tab key 只保留一个 handler，重复注册时后注册的 handler 会覆盖先注册的 handler。
- `useRetapRefresh` 会在组件卸载时自动注销当前 handler。
- `useRetapRefreshAnimation` 会在组件卸载时清理当前页面持有的刷新动画。
- 刷新内容、失败提示、重试策略和动画持续时间都由业务页面自行决定。

## 5. 常见错误

### 页面里重复创建 context

错误做法是 main 容器创建一个 context，Tab 页面又各自创建另一个 context。这样页面注册的 handler 不在 main 容器调用的注册表里，retap 不会触发刷新。

统一做法：只在 `pages/main/retap-refresh.ts` 创建一次，然后 main 容器和所有 Tab 页面都从这个文件导入。

### 忘记按 embedded 控制注册

独立页面打开后通常会立刻重定向回 main 容器。如果独立页实例也注册刷新 handler，可能出现短时间内 handler 归属不清晰。建议 `useTabRetapRefresh(tab, handler, () => props.embedded)`，只让内嵌实例参与刷新链路。
