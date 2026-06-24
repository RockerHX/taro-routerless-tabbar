# 多端兼容性与复杂项目说明

本文记录当前已验证的 Taro 端、fixture 覆盖点和复杂页面结构限制。

## 已验证范围

| 场景                          | 验证命令                   | 状态   |
| ----------------------------- | -------------------------- | ------ |
| Taro Vue3 H5 build            | `pnpm run test:taro:h5`    | 已覆盖 |
| Taro Vue3 WeChat 小程序 build | `pnpm run test:taro:weapp` | 已覆盖 |
| H5 + WeChat 小程序连续 smoke  | `pnpm run test:taro`       | 已覆盖 |

当前 fixture 位于 `examples/taro-vue3-basic`，使用 Taro 4、Vue 3 和 Vite。CI 中执行 `pnpm run test:taro`，一次 prepare 后连续验证 H5 与 WeChat 小程序构建。

## 与原生 tabBar 生命周期的关系

`taro-routerless-tabbar` 的核心设计是 routerless tab：多个 Tab pane 收口到同一个主容器中，点击 Tab 时只更新主容器内部状态，不调用 `Taro.switchTab`、`Taro.navigateTo` 或 `Taro.redirectTo` 完成 Tab 切换。

因此它不依赖平台原生 `tabBar` 生命周期，也不替代 Taro 的完整路由系统。需要完全复用原生 `tabBar` 生命周期、原生页面栈行为或平台级 tabBar 配置的项目，不适合直接用本包接管底栏切换。

## fixture 覆盖点

`examples/taro-vue3-basic` 当前覆盖：

- `home`、`orders`、`profile` 三个 Tab。
- `useLoad` 读取 `tab` query，并通过 `getTabKeys` / `normalizeTabKey` 归一化初始 Tab。
- 点击当前 Tab 触发 `retap`，由共享 `createRetapRefreshContext` 调用对应 Tab 的刷新 handler。
- 页面展示刷新次数和最近刷新 Tab，便于 smoke 示例可见。
- `iconPath` / `selectedIconPath` 本地图标资源。
- 默认 TabBar CSS 变量覆盖，例如高度、图标尺寸、激活色和背景色。
- H5 与 WeChat 小程序 build smoke。

## H5 与小程序差异

| 能力                           | H5         | WeChat 小程序 | 说明                                                         |
| ------------------------------ | ---------- | ------------- | ------------------------------------------------------------ |
| Routerless active/visited 状态 | 已验证构建 | 已验证构建    | 运行时状态由 Vue 管理，不依赖平台路由切 Tab。                |
| `tab` query 初始化             | 已验证构建 | 已验证构建    | fixture 使用 `useLoad` 读取 query 后归一化。                 |
| retap 刷新链路                 | 已验证构建 | 已验证构建    | 通过共享 context 注册和触发刷新 handler。                    |
| 本地图标资源                   | 已验证构建 | 已验证构建    | fixture 使用本地 SVG 资源走 Taro 构建链路。                  |
| CSS 变量覆盖                   | 已验证构建 | 已验证构建    | fixture 覆盖默认底栏变量；具体渲染细节仍以端侧样式能力为准。 |
| 原生 tabBar 生命周期           | 不依赖     | 不依赖        | 本包不接管或模拟平台原生 tabBar 生命周期。                   |

当前验证属于 build smoke，不等同于覆盖所有平台运行时交互细节。接入真实业务后，仍建议在目标端做端侧点击、刷新、样式和页面返回链路验证。

## subpackage / 非标准页面结构

默认 `resolveTabPageModuleKey` 对目录结构有基础假设，适合常规 `/pages/...` 页面路径和相邻页面模块解析。对于以下复杂场景，已提供 `createTabPageModuleResolver` 创建自定义 resolver：

- subpackage 页面。
- 自定义 pages 根目录。
- main 容器与 Tab 页面不在常规相对层级。
- `import.meta.glob` key 与页面 path 不存在稳定推导关系。

建议做法：

1. 使用 `createTabPageModuleResolver`，把页面路径转换为项目实际的 `import.meta.glob` key。
2. 或在 Tab 配置中直接声明模块 key，避免由本包推断业务目录结构。
3. `import.meta.glob` 仍需业务侧静态声明，本包不会扫描使用者项目目录。
