# API 文档

本文按 root 入口和子路径入口整理 API。类型以源码声明为准，示例面向 Taro 4 + Vue 3。

从 `1.0.0` 起，本文列出的入口、导出名称、公开类型、组件 props、事件和 slot 参数属于稳定版公开契约；后续破坏性调整应进入新的 major 版本。仓库内测试脚本、fixture、release 脚本、构建脚本和 `dist/` 内 chunk 文件名不属于运行时公开 API。

## 1. 导出总览

### 入口

| 入口                               | 导出范围                       | 样式行为                    |
| ---------------------------------- | ------------------------------ | --------------------------- |
| `taro-routerless-tabbar`           | 全部稳定 API，兼容入口         | 自动引入默认 `style.css`    |
| `taro-routerless-tabbar/core`      | 纯 helper、retap core 和纯类型 | 不引入 CSS，不导出 Vue API  |
| `taro-routerless-tabbar/vue`       | Vue composable、组件和相关类型 | 不自动引入 CSS              |
| `taro-routerless-tabbar/style.css` | 默认样式文件                   | 供 `./vue` 入口用户显式导入 |

helper-only 场景应从 `taro-routerless-tabbar/core` 导入，避免 root 入口的默认样式副作用。`taro-routerless-tabbar/core` 和 `taro-routerless-tabbar/vue` 都不会自动引入 CSS；使用 `taro-routerless-tabbar/vue` 时，如果需要默认底栏样式，请额外导入 `taro-routerless-tabbar/style.css`。

### 按入口导出矩阵

下表只列出 JS / TS 命名导出；`taro-routerless-tabbar/style.css` 是样式入口，不提供命名导出。矩阵以仓库内 `scripts/check-api-surface.mjs` 的稳定导出面为同步来源。

| 名称                           | root | `./core` | `./vue` |
| ------------------------------ | ---- | -------- | ------- |
| `KeyedTabItem`                 | ✅   | ✅       | ✅      |
| `RetapAnimationListener`       | ✅   | ✅       | ✅      |
| `RetapRefreshContextOptions`   | ✅   | ✅       | ✅      |
| `RetapRefreshHandler`          | ✅   | ✅       | ✅      |
| `RouterlessTabBar`             | ✅   | —        | ✅      |
| `RouterlessTabBarItem`         | ✅   | —        | ✅      |
| `RouterlessTabPaneHost`        | ✅   | —        | ✅      |
| `RouterlessTabPaneItem`        | ✅   | —        | ✅      |
| `RouterlessTabs`               | ✅   | —        | ✅      |
| `RouterlessTabsItem`           | ✅   | —        | ✅      |
| `RouterlessTabQueryValue`      | ✅   | ✅       | —       |
| `StandaloneTabRedirectOptions` | ✅   | ✅       | —       |
| `StandaloneTabRedirectResult`  | ✅   | ✅       | —       |
| `TabClickResult`               | ✅   | ✅       | ✅      |
| `TabPageModuleResolver`        | ✅   | ✅       | —       |
| `TabPageModuleResolverOptions` | ✅   | ✅       | —       |
| `UseRouterlessTabsOptions`     | ✅   | —        | ✅      |
| `UseRouterlessTabsResult`      | ✅   | —        | ✅      |
| `buildRouterlessTabUrl`        | ✅   | ✅       | —       |
| `createRetapRefreshContext`    | ✅   | —        | ✅      |
| `createRetapRefreshCore`       | ✅   | ✅       | —       |
| `createTabPageModuleResolver`  | ✅   | ✅       | —       |
| `createVisitedTabRecord`       | ✅   | ✅       | —       |
| `getTabKeys`                   | ✅   | ✅       | —       |
| `getVisitedTabs`               | ✅   | ✅       | —       |
| `isTabKey`                     | ✅   | ✅       | —       |
| `normalizeTabKey`              | ✅   | ✅       | —       |
| `resolveStandaloneTabRedirect` | ✅   | ✅       | —       |
| `resolveTabClick`              | ✅   | ✅       | —       |
| `resolveTabPageModuleKey`      | ✅   | ✅       | —       |
| `useRouterlessTabs`            | ✅   | —        | ✅      |

### 类型

| 名称                           | 说明                             |
| ------------------------------ | -------------------------------- |
| `KeyedTabItem`                 | 至少包含 `key` 的 Tab 配置基类   |
| `RouterlessTabBarItem`         | 默认底栏使用的 Tab 配置类型      |
| `RouterlessTabPaneItem`        | pane 宿主使用的 Tab 配置类型     |
| `RouterlessTabsItem`           | 高阶组件使用的 Tab 配置类型      |
| `TabClickResult`               | 点击结果：`change` 或 `retap`    |
| `RouterlessTabQueryValue`      | URL query 支持的值类型           |
| `StandaloneTabRedirectOptions` | 独立页重定向解析配置项           |
| `StandaloneTabRedirectResult`  | 独立页重定向解析结果             |
| `TabPageModuleResolver`        | 页面模块 key resolver 函数类型   |
| `TabPageModuleResolverOptions` | 页面模块 key resolver 配置项     |
| `RetapRefreshHandler`          | retap 刷新 handler 类型          |
| `RetapAnimationListener`       | 刷新动画状态监听器类型           |
| `RetapRefreshContextOptions`   | retap context 配置项             |
| `UseRouterlessTabsOptions`     | `useRouterlessTabs` 入参类型     |
| `UseRouterlessTabsResult`      | `useRouterlessTabs` 返回结果类型 |

### 函数、组件和 composable

| 名称                           | 分类     | 说明                                      |
| ------------------------------ | -------- | ----------------------------------------- |
| `resolveTabClick`              | 纯函数   | 判断点击结果是切换 Tab 还是 retap         |
| `getTabKeys`                   | 纯函数   | 从 Tab 配置中按原顺序取出 key             |
| `isTabKey`                     | 纯函数   | 判断字符串是否为合法 Tab key              |
| `normalizeTabKey`              | 纯函数   | 把 query、alias 或非法值归一化为合法值    |
| `createVisitedTabRecord`       | 纯函数   | 创建 visited 状态记录                     |
| `getVisitedTabs`               | 纯函数   | 按原 Tab 顺序筛出已访问 Tab               |
| `buildRouterlessTabUrl`        | 纯函数   | 生成 main 容器 URL                        |
| `resolveStandaloneTabRedirect` | 纯函数   | 判断独立 Tab 页是否需要重定向并生成 URL   |
| `createTabPageModuleResolver`  | 纯函数   | 创建可配置页面模块 key resolver           |
| `resolveTabPageModuleKey`      | 纯函数   | 默认 resolver 的兼容快捷方法              |
| `createRetapRefreshCore`       | 纯逻辑   | 创建 retap 注册表和动画状态管理           |
| `createRetapRefreshContext`    | Vue API  | 创建带 Vue 生命周期封装的 retap context   |
| `useRouterlessTabs`            | Vue API  | 管理 active、visited、懒挂载和点击状态    |
| `RouterlessTabBar`             | Vue 组件 | 默认底部 TabBar UI                        |
| `RouterlessTabPaneHost`        | Vue 组件 | 可选 pane 宿主，只渲染 visited panes      |
| `RouterlessTabs`               | Vue 组件 | 低门槛高阶组件，内部拼装状态、pane 和底栏 |

## 2. Tab 点击与 key helpers

### `resolveTabClick(activeKey, clickedKey)`

```ts
resolveTabClick<Key extends string>(
  activeKey: Key,
  clickedKey: Key,
):
  | { type: 'change'; key: Key }
  | { type: 'retap'; key: Key }
```

- `clickedKey === activeKey` 时返回 `{ type: 'retap', key }`。
- 否则返回 `{ type: 'change', key }`。
- 不校验 key 是否存在于业务 Tab 列表，校验应由业务或 `useRouterlessTabs` 完成。

### `getTabKeys(tabs)`

```ts
getTabKeys<const Item extends KeyedTabItem<string>>(
  tabs: readonly Item[],
): Array<Item['key']>
```

从 Tab 配置中按原顺序取出 key，并尽量保留 `as const` 配置中的字面量联合类型。

### `isTabKey(value, tabKeys)`

```ts
isTabKey<Key extends string>(
  value: string,
  tabKeys: readonly Key[],
): value is Key
```

判断字符串是否存在于合法 Tab key 列表中，可用于 query 解析后的类型收窄。

### `normalizeTabKey(options)`

```ts
normalizeTabKey<Key extends string>(options: {
  value?: string
  tabKeys: readonly Key[]
  defaultKey: Key
  aliases?: Partial<Record<string, Key>>
}): Key
```

归一化外部传入的 Tab key：

1. 如果 `value` 命中 `aliases`，返回 alias 对应的 key。
2. 如果 `value` 是合法 Tab key，返回 `value`。
3. 其他情况返回 `defaultKey`。

```ts
const tabKey = normalizeTabKey({
  value: String(query.tab ?? ''),
  tabKeys,
  defaultKey: 'home',
  aliases: {
    index: 'home',
  },
})
```

### `createVisitedTabRecord(options)`

```ts
createVisitedTabRecord<Key extends string>(options: {
  tabKeys: readonly Key[]
  defaultKey: Key
}): Record<Key, boolean>
```

创建 visited 记录。默认只有 `defaultKey` 标记为 `true`，其他 key 为 `false`。

### `getVisitedTabs(tabs, visited)`

```ts
getVisitedTabs<Key extends string, Item extends KeyedTabItem<Key>>(
  tabs: readonly Item[],
  visited: Partial<Record<Key, boolean>>,
): Item[]
```

根据 visited 记录筛出已访问 Tab，并保持原始 `tabs` 顺序。

## 3. URL 与页面模块 helpers

### `buildRouterlessTabUrl(options)`

```ts
buildRouterlessTabUrl<Key extends string>(options: {
  mainPagePath: string
  tabKey: Key
  queryKey?: string
  query?: Record<string, RouterlessTabQueryValue>
}): string
```

生成 main 容器 URL，默认 query key 为 `tab`。

```ts
buildRouterlessTabUrl({
  mainPagePath: '/pages/main/index',
  tabKey: 'order',
})
// /pages/main/index?tab=order
```

边界行为：

- `mainPagePath` 上已有 query 会被保留。
- `tabKey` 会覆盖已有同名 tab query。
- `query` 中 `null` / `undefined` 会被忽略。
- `query` 中与已有 query 同名的非 tab 参数会覆盖旧值。
- `mainPagePath` 上的 hash 会保留在最终 URL 尾部。

### `resolveStandaloneTabRedirect(options)`

```ts
type StandaloneTabRedirectOptions<Key extends string> = {
  mainPagePath: string
  tabKey: Key
  embedded?: boolean
  currentQuery?: Record<string, RouterlessTabQueryValue>
  queryKey?: string
  embeddedQueryKey?: string
}

type StandaloneTabRedirectResult =
  | { shouldRedirect: false; url: '' }
  | { shouldRedirect: true; url: string }

resolveStandaloneTabRedirect<Key extends string>(
  options: StandaloneTabRedirectOptions<Key>,
): StandaloneTabRedirectResult
```

判断独立 Tab 页面是否需要 redirect 回 main 容器，并在需要时生成目标 URL。

```ts
const redirect = resolveStandaloneTabRedirect({
  mainPagePath: '/pages/main/index',
  tabKey: 'home',
  currentQuery: {
    from: 'share',
  },
})

if (redirect.shouldRedirect) {
  Taro.redirectTo({ url: redirect.url })
}
```

边界行为：

- `embedded === true` 时返回 `{ shouldRedirect: false, url: '' }`。
- `embedded` 未传时，会从 `currentQuery[embeddedQueryKey]` 判断；`true`、`'true'`、`'1'` 视为已内嵌，不重定向。
- 需要重定向时，复用 `buildRouterlessTabUrl` 生成 URL。
- `currentQuery` 中的普通参数会被保留，`embeddedQueryKey` 对应参数会被过滤。
- `tabKey` 会覆盖旧的同名 tab query；可用 `queryKey` 自定义 tab query 名。
- helper 不依赖 Taro runtime，实际 `Taro.redirectTo` 调用由业务项目完成。

### `createTabPageModuleResolver(options?)`

```ts
type TabPageModuleResolverOptions = {
  pageRoot?: string
  modulePrefix?: string
  extension?: string
}

createTabPageModuleResolver(
  options?: TabPageModuleResolverOptions,
): (pagePath: string) => string
```

创建一个把业务 Tab `pagePath` 转成 `import.meta.glob` 模块 key 的 resolver。

默认值：

| 配置           | 默认值   | 说明                            |
| -------------- | -------- | ------------------------------- |
| `pageRoot`     | `/pages` | 允许解析的页面根路径            |
| `modulePrefix` | `..`     | 生成模块 key 时使用的相对前缀   |
| `extension`    | `.vue`   | 生成模块 key 时追加的文件扩展名 |

```ts
const resolveSubpackageModuleKey = createTabPageModuleResolver({
  pageRoot: '/subpackages/shop/pages',
  modulePrefix: '../../subpackages/shop/pages',
  extension: '.vue',
})

resolveSubpackageModuleKey('/subpackages/shop/pages/orders/index')
// ../../subpackages/shop/pages/orders/index.vue
```

边界行为：

- `pagePath` 和 `pageRoot` 都支持有无前导 `/`。
- `pagePath` 不在 `pageRoot` 下时抛出 `Invalid tab pagePath`。
- `import.meta.glob` 仍必须由业务项目静态声明，本包只负责生成匹配 key。

### `resolveTabPageModuleKey(pagePath)`

```ts
resolveTabPageModuleKey(pagePath: string): string
```

`createTabPageModuleResolver()` 的兼容快捷方法，等价于使用默认配置把业务 Tab 的页面路径转换为 main 页面中 `import.meta.glob('../*/index.vue')` 可用的模块 key。

```ts
resolveTabPageModuleKey('/pages/order/index')
// ../order/index.vue
```

限制：

- 只接受 `/pages/...` 或 `pages/...` 形式。
- 非 `/pages/` 开头会抛出 `Invalid tab pagePath`。
- 默认转换结果假设 main 页面和 Tab 页面同在 `pages` 目录下。
- subpackages、自定义页面根目录、非同级 main 页面等复杂结构，建议改用 `createTabPageModuleResolver` 或直接在 Tab 配置中声明模块 key。

## 4. retap refresh core

### `createRetapRefreshCore(options?)`

```ts
createRetapRefreshCore<Key extends string>(options?: {
  onError?(error: unknown, key: Key): void
})
```

返回纯逻辑 retap core：

| 方法                        | 说明                                    |
| --------------------------- | --------------------------------------- |
| `registerRefreshHandler`    | 注册指定 Tab 的刷新 handler             |
| `unregisterRefreshHandler`  | 注销指定 Tab 的刷新 handler             |
| `getRefreshHandler`         | 获取当前 Tab 的 handler                 |
| `hasRefreshHandler`         | 判断当前 Tab 是否已注册刷新 handler     |
| `isRefreshRunning`          | 判断当前 Tab 是否正在执行刷新 handler   |
| `runRefresh`                | 执行当前 Tab 的 handler                 |
| `getAnimatingKey`           | 获取当前显示刷新动画的 Tab key          |
| `startRefreshAnimation`     | 设置刷新动画 key                        |
| `stopRefreshAnimation`      | 清理刷新动画 key                        |
| `subscribeRefreshAnimation` | 订阅刷新动画 key 变化，返回取消订阅函数 |

行为约定：

- 未注册 handler 时 `runRefresh(key)` 返回 `false`，可用 `hasRefreshHandler(key)` 判断。
- 同一个 key 的 handler 执行中，再次 `runRefresh(key)` 返回 `false`，可用 `isRefreshRunning(key)` 判断。
- handler 执行完成或抛错后都会释放执行态。
- handler 抛错会调用 `onError(error, key)`；如果 `onError` 不抛错，`runRefresh` 不继续向外抛出 handler 异常。
- 同一个 key 重复注册时，后注册的 handler 覆盖先注册的 handler。

## 5. Vue APIs

### `createRetapRefreshContext(options?)`

基于 `createRetapRefreshCore` 增加两个 Vue 生命周期封装：

| 方法                       | 说明                                               |
| -------------------------- | -------------------------------------------------- |
| `useRetapRefresh`          | 在组件生命周期内按 `enabled` 注册/注销刷新 handler |
| `useRetapRefreshAnimation` | 返回当前 key 绑定的动画开始/停止函数，卸载时清理   |

```ts
const tabRetap = createRetapRefreshContext<TabKey>()

const { startRefreshAnimation, stopRefreshAnimation } =
  tabRetap.useRetapRefreshAnimation('home')

tabRetap.useRetapRefresh('home', refreshHome, () => props.embedded)
```

业务项目应把 context 封装为共享单例文件，然后 main 容器和所有 Tab 页面都从该文件导入。不要在页面组件内重复调用 `createRetapRefreshContext`。

### `useRouterlessTabs(options)`

```ts
useRouterlessTabs<Item extends KeyedTabItem<string>>(options: {
  tabs: readonly Item[]
  defaultKey: Item['key']
  initialKey?: Item['key']
})
```

返回：

| 字段/方法        | 说明                                       |
| ---------------- | ------------------------------------------ |
| `activeKey`      | 当前激活 key 的 `Ref`                      |
| `activeTab`      | 当前激活 Tab 的 `ComputedRef`              |
| `visitedKeys`    | 已访问 key 列表，按原始 Tab 顺序           |
| `visitedTabs`    | 已访问 Tab 列表，按原始 Tab 顺序           |
| `activateTab`    | 切换 active key，并标记 visited            |
| `handleTabClick` | 处理点击，返回 `change` 或 `retap`         |
| `isVisited`      | 判断指定 key 是否已访问                    |
| `isActive`       | 判断指定 key 是否激活                      |
| `resetVisited`   | 重置 visited，只保留 default 和当前 active |

运行时保护：

- `tabs` 为空会抛出 `Routerless tabs cannot be empty`。
- `defaultKey` 不存在于 `tabs` 会抛出 `Invalid default routerless tab key`。
- `activateTab` / `handleTabClick` 收到非法 key 会抛出 `Invalid routerless tab key`。
- `initialKey` 非法时回退到 `defaultKey`。

## 6. Vue 组件

### `RouterlessTabs`

低门槛高阶组件，内部复用 `useRouterlessTabs`、`RouterlessTabPaneHost` 和 `RouterlessTabBar`。适合希望快速接入默认 routerless tab 行为的项目。

```ts
type RouterlessTabsItem<Key extends string = string> =
  RouterlessTabBarItem<Key> & {
    component: import('vue').Component
  }
```

Props：

| 名称          | 类型                            | 说明                                               |
| ------------- | ------------------------------- | -------------------------------------------------- |
| `tabs`        | `readonly RouterlessTabsItem[]` | Tab 列表，至少包含 `key`、`text` 和 `component`    |
| `defaultKey`  | `string`                        | 默认激活 Tab key                                   |
| `initialKey`  | `string`                        | 初始激活 Tab key；非法时回退到 `defaultKey`        |
| `refreshing`  | `string`                        | 正在显示刷新态的 Tab key，默认空                   |
| `refreshIcon` | `string`                        | 刷新态图标路径，默认空                             |
| `hostClass`   | `string \| string[] \| object`  | 透传给内部 `RouterlessTabPaneHost` 的 host class   |
| `paneClass`   | `string \| string[] \| object`  | 透传给内部 `RouterlessTabPaneHost` 的 pane class   |
| `hiddenClass` | `string \| string[] \| object`  | 透传给内部 `RouterlessTabPaneHost` 的 hidden class |

默认 pane 渲染会执行：

```vue
<component :is="pane.component" embedded :active="active" />
```

Events：

| 名称     | 参数          | 触发时机                                           |
| -------- | ------------- | -------------------------------------------------- |
| `change` | `key: string` | 点击非当前 Tab 后，组件内部完成切换并派发目标 key  |
| `retap`  | `key: string` | 点击当前 Tab 时派发当前 key，不改变 active/visited |

Slots：

| 名称   | slot props                               | 说明                                                             |
| ------ | ---------------------------------------- | ---------------------------------------------------------------- |
| `pane` | `{ pane, active }`                       | 覆盖默认 pane 渲染；`pane` 为当前 Tab 配置，`active` 为布尔值    |
| `item` | `{ item, active, refreshing, iconPath }` | 透传给内部 `RouterlessTabBar` 的 item slot，用于自定义单个底栏项 |

需要完全控制 active、visited 或切换副作用时，请改用 `useRouterlessTabs` + `RouterlessTabPaneHost` + `RouterlessTabBar` 的高级受控模式。

### `RouterlessTabBar`

默认底部 TabBar UI。

Props：

| 名称          | 类型                              | 说明                                                                     |
| ------------- | --------------------------------- | ------------------------------------------------------------------------ |
| `active`      | `string`                          | 当前激活 Tab key；用于判断 active 样式和点击结果                         |
| `items`       | `readonly RouterlessTabBarItem[]` | Tab 列表，至少包含 `key` 和 `text`，可选 `iconPath` / `selectedIconPath` |
| `refreshing`  | `string`                          | 正在显示刷新态的 Tab key，默认空；等于 item key 时展示刷新态 class       |
| `refreshIcon` | `string`                          | 刷新态图标路径，默认空；为空时继续展示普通 icon/text                     |

Events：

| 名称     | 参数          | 触发时机                           |
| -------- | ------------- | ---------------------------------- |
| `change` | `key: string` | 点击非当前 Tab，参数为目标 Tab key |
| `retap`  | `key: string` | 点击当前 Tab，参数为当前 Tab key   |

Slots：

| 名称   | slot props                               | 说明                                                                                                               |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `item` | `{ item, active, refreshing, iconPath }` | 自定义单个 Tab；`item` 为当前配置，`active` / `refreshing` 为布尔值，`iconPath` 为已按 active 状态解析后的图标路径 |

样式自定义参考 [样式自定义指南](./styling.md)。

### `RouterlessTabPaneHost`

可选 pane 宿主组件，用于只渲染 visited panes，并隐藏非 active pane。

Props：

| 名称          | 类型                               | 说明                                         |
| ------------- | ---------------------------------- | -------------------------------------------- |
| `items`       | `readonly RouterlessTabPaneItem[]` | 所有 pane 配置，至少包含 `key`               |
| `active`      | `string`                           | 当前激活 key；active pane 不添加隐藏 class   |
| `visited`     | `readonly string[]`                | 已访问 key 列表；组件只渲染命中该列表的 pane |
| `hostClass`   | `string \| string[] \| object`     | 追加到 host 的自定义类，默认空               |
| `paneClass`   | `string \| string[] \| object`     | 追加到每个 pane 的自定义类，默认空           |
| `hiddenClass` | `string \| string[] \| object`     | 追加到非 active pane 的类，默认空            |

Slots：

| 名称   | slot props         | 说明                                                      |
| ------ | ------------------ | --------------------------------------------------------- |
| `pane` | `{ pane, active }` | 渲染单个已访问 pane；`pane` 为当前配置，`active` 为布尔值 |

组件会给非 active pane 添加 `routerless-tab-pane-hidden`，默认样式为 `display: none`。`hostClass` / `paneClass` / `hiddenClass` 只追加 class，不替换默认 class。

## 7. 非公开范围

以下内容用于项目验证、构建或发布流程，不属于 1.0.0 运行时 API 契约：

- `scripts/*`、`.github/workflows/*`、`examples/*` 和测试文件。
- `dist/` 中由打包器生成的 hash chunk 文件名。
- `pnpm run test:*`、`pnpm run release:check`、`pnpm run api:check` 等仓库脚本。

这些能力可以在 minor / patch 版本中按维护需要调整；使用者项目不应依赖它们作为运行时导入入口。
