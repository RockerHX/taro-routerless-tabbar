# Changelog

## Unreleased

## 1.0.2

### Fixed

- 移除极简示例误跟踪的 `.swc` 构建缓存，并统一 example 缓存忽略规则。

### Docs

- 同步高级受控 smoke fixture 的覆盖点说明，补齐 query、retap、redirect、返回链路和样式边界记录。
- 补充按 root / `./core` / `./vue` 划分的 API 导出矩阵，避免误用子路径入口。
- 明确 `RouterlessTabs` / `useRouterlessTabs` 的静态初始化边界，以及内容区 padding 复用 CSS 变量时的作用域要求。

### Tests

- 新增静态初始化契约单测，固定挂载后不自动重建 active / visited 状态和合法 key 集合的当前行为。

## 1.0.0

### Added

- 新增 API surface 检查脚本，并接入 `release:check`，用于冻结 1.0.0 稳定导出结构。
- 新增发布流程文档，明确发布前门禁、版本清单、tag 和常见失败排查。
- 新增 `RouterlessTabs` 高阶组件，提供几行代码即可接入的默认 active/visited、pane 保活和底栏切换能力。

### Docs

- 明确 root、`./core`、`./vue` 和 `./style.css` 的稳定 API / exports 承诺。
- 补齐组件 props、事件、slot 参数和非公开范围说明。
- README 快速开始改用 `RouterlessTabs` 极简示例，并将 primitives 说明收敛为高级受控模式。
- 记录 WeChat 开发者工具尝试结果、Alipay experimental 验证边界和文档一致性收敛。

### Changed

- 将版本推进到 1.0.0，作为当前 Taro 4 + Vue 3 + Vite routerless tabbar 能力的稳定版承诺。

## 0.4.0

### Added

- 新增 H5 运行时自动化 smoke，覆盖初始 `tab` query、Tab 切换、pane 状态保留、retap、redirect query 和返回链路。
- 升级 Taro Vue3 fixture，加入长列表、异步刷新、复杂 query、模拟详情返回链路和样式边界示例。
- 新增端侧运行时验证矩阵，区分单元测试、消费侧验证、H5 runtime、小程序 build smoke 和手动真机/开发者工具验证。
- 新增支付宝小程序 experimental extended build smoke，可通过 `pnpm run test:taro:alipay` / `pnpm run test:taro:extended` 验证。

### Changed

- CI 和 release workflow 接入 H5 runtime smoke，`prepublishOnly` 仍保持轻量发布前检查。
- `test:taro` 继续只覆盖 H5 + WeChat 主链路，支付宝构建保持在 optional extended smoke。

## 0.3.2

面向 0.3.x 剩余调试、样式边界和发布预检能力的收敛版本。

### Added

- retap core/context 新增 `hasRefreshHandler` 和 `isRefreshRunning`，便于判断刷新 handler 注册状态和执行状态。
- `RouterlessTabPaneHost` 新增 `hostClass`、`paneClass` 和 `hiddenClass`，支持在保留默认 class 的同时追加业务 class。
- 新增 `release:check` 发布预检脚本，校验版本号、CHANGELOG 和发布文件清单，并复用 `prepublishOnly`。

### Docs

- 补充 retap 刷新链路调试说明，区分未注册、执行中和 handler 抛错等场景。
- 补充 PaneHost class 定制和端侧布局检查清单，覆盖安全区、内容区 padding、滚动容器和重型原生组件。

### Changed

- release workflow 改为复用 `pnpm run release:check`，减少本地和 CI 发布门禁漂移。

## 0.3.1

面向消费侧稳定性和独立页接入样板的功能版本。

### Added

- 新增 `resolveStandaloneTabRedirect`，用于判断独立 Tab 页面是否需要重定向回 main 容器，并生成保留普通 query、过滤 `embedded` 的目标 URL。
- 新增打包后消费侧 fixture，验证 root、`./core`、`./vue` 和 `./style.css` 子路径可从真实 tarball 正常导入和构建。
- Taro Vue3 smoke fixture 新增独立 `home` 页面，覆盖官方独立页 redirect helper 的构建链路。

### Changed

- CI、release workflow 和 `prepublishOnly` 接入打包产物消费侧验证。
- 完整接入指南和 API 文档改为推荐官方独立页 redirect helper。

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
