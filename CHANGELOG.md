# Changelog

## Unreleased

## 0.2.3

面向页面模块解析、组件事件类型和内部性能细节的维护版本。

### Added

- 新增 `createTabPageModuleResolver`，支持通过 `pageRoot`、`modulePrefix` 和 `extension` 配置页面模块 key 解析。

### Changed

- `resolveTabPageModuleKey` 保持兼容旧行为，并复用默认页面模块 resolver。
- `RouterlessTabBar` 的 `change` / `retap` 事件声明参数从 `any[]` 收敛为 `string`。
- `createVisitedTabRecord` 改为原地赋值创建 visited 记录，避免 reduce 中每轮展开对象。
- 更新页面模块解析文档，补充复杂项目可直接声明 `moduleKey` 的接入方式。

## 0.2.2

面向导出结构、多端 smoke 和兼容性说明的维护版本。

### Added

- 新增 `./core` 子路径导出，提供不引入 CSS 的纯 helper 和 retap core 入口。
- 新增 `./vue` 与 `./style.css` 子路径导出，支持 Vue API/组件和默认样式分开导入。
- 扩展 Taro Vue3 fixture，覆盖 `home`、`orders`、`profile` 三个 Tab、query 初始化、retap 刷新、本地图标和 CSS 变量样式覆盖。
- 新增 WeChat 小程序 smoke build，并提供 `test:taro:weapp` 与一次 prepare 后连续验证 H5/weapp 的 `test:taro`。
- 新增多端兼容性文档，说明 H5 / WeChat 小程序验证范围、routerless tab 与原生 `tabBar` 生命周期关系，以及 subpackage / 非标准页面结构限制。

### Changed

- root 入口继续保持自动引入默认样式；helper-only 使用场景可改用 `./core` 避免 CSS 副作用。
- CI 的 Taro smoke 从单 H5 build 扩展为 H5 + WeChat 小程序多端 build。
- 更新 roadmap，标记小程序端覆盖问题已完成，并保留复杂 resolver 能力作为后续问题。

## 0.2.1

面向文档信息架构的维护版本。

### Docs

- 精简 README，将首页文档收敛为定位、快速开始和文档导航。
- 新增完整接入、retap 刷新、样式自定义和 API 文档。
- 修正 retap 示例，统一使用共享 context，避免复制出不可工作的刷新链路。
- 将拆分后的用户文档加入 npm 包发布清单。

## 0.2.0

面向发布前质量门禁和运行时边界的维护版本。

### Added

- 新增 Husky + lint-staged 提交前检查。
- 新增最小 Taro Vue3 H5 示例 fixture 和 `test:taro:h5` smoke build。
- 新增 GitHub Actions CI，覆盖 lint、format、typecheck、test、build、pack、audit 和 Taro H5 smoke。
- `useRouterlessTabs` 增加空 tabs、非法 defaultKey、非法 key 激活的运行时校验。

### Changed

- 升级开发依赖链路，降低 Vite/Vitest/happy-dom 等开发环境安全风险。
- 提高 TypeScript 检查严格度，开启 `noImplicitAny`。
- Taro smoke fixture 改用 CSS，避免 Sass legacy JS API warning。

### Fixed

- 修复 `buildRouterlessTabUrl` 在 `mainPagePath` 已包含 query/hash 时的 URL 拼接问题。
- 清理发布包中误输出的测试辅助类型声明。

### Docs

- 明确 retap refresh 的返回值、错误处理和重复注册覆盖语义。
- 更新项目分析报告，标记原主要问题均已完成处理。

## 0.1.0

首个稳定版本。

### Changed

- 将 `getTabKeys` 类型签名调整为从 `as const` tabs 自动保留字面量 key 类型，避免 `normalizeTabKey` 在严格编译链中退化为 `string`。
- README 安装说明更新为 npm 正式安装方式。

### Verified

- 已在当前业务项目完成类型检查、routerless 相关单测、小红书构建、模拟器和真机预览验证。

## 0.1.0-beta.0

发布前 beta 版本，用于验证 `taro-routerless-tabbar` 从 internal package 走向 npm 发布的完整能力。

### Added

- 新增 internal package 骨架，包含 Taro Vue3 routerless tabbar 的源码、构建、类型检查和测试配置。
- 新增 tab core helpers：
  - `resolveTabClick`
  - `getTabKeys`
  - `isTabKey`
  - `normalizeTabKey`
  - `buildRouterlessTabUrl`
  - `resolveTabPageModuleKey`
- 新增 retap refresh core 与 Vue context：
  - `createRetapRefreshCore`
  - `createRetapRefreshContext`
- 新增默认底栏组件 `RouterlessTabBar`。
- 新增主容器状态 composable `useRouterlessTabs`，支持 active、visited、懒挂载和 retap/change 分支。
- 新增轻量 pane 宿主组件 `RouterlessTabPaneHost`。
- 当前业务项目已通过 dependency 接入 package 能力，覆盖点击判定、retap refresh、tab helper 和 main 容器状态。
- 新增 README，提供安装、配置、main 容器、Tab 页面、retap、独立页 redirect、样式自定义和 API 速查示例。

### Notes

- 该版本尚未执行 `npm publish`。
- 已迁移到独立 repository：https://github.com/RockerHX/taro-routerless-tabbar。
