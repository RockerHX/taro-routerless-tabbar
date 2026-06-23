# Changelog

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
