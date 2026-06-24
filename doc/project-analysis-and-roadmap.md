# 项目现状分析与 0.4.0 路线图

生成日期：2026-06-24  
当前版本：`0.4.0`

## 结论

上一阶段的消费侧稳定性、接入样板、调试能力、样式边界和发布预检工作已经完成，并已通过本地质量门禁确认。当前包的 root、`./core`、`./vue`、`./style.css` 导出，独立页 redirect helper，retap 可观测 API，pane host 自定义 class，以及发布前 tarball 校验都已进入可用基线。

0.4.0 不建议继续大改核心 routerless 模型，而应把重点从“构建可用”推进到“运行时可信”：扩展更接近真实业务的 Taro fixture，补齐 H5 自动化运行时验证，沉淀小程序端手动/半自动验证矩阵，并按真实需求逐步增加更多小程序平台 smoke build。

## 当前已验证基线

| 检查项               | 命令                                | 当前状态                                    |
| -------------------- | ----------------------------------- | ------------------------------------------- |
| ESLint               | `pnpm run lint`                     | 已纳入脚本/CI，本次通过                     |
| Prettier             | `pnpm run format:check`             | 已纳入脚本/CI，本次通过                     |
| TypeScript           | `pnpm run typecheck`                | 已纳入脚本/CI，本次通过                     |
| 单元测试             | `pnpm run test:run`                 | 已纳入脚本/CI，本次 9 个文件、72 个用例通过 |
| 库构建               | `pnpm run build`                    | 已纳入脚本/CI，生成 `dist/` 发布产物        |
| 打包预检             | `pnpm run pack:dry-run`             | 已纳入脚本/CI，本次通过                     |
| 依赖审计             | `pnpm audit --audit-level moderate` | 已纳入脚本/CI，本次无已知漏洞               |
| 打包后消费侧验证     | `pnpm run test:package-consumer`    | 已覆盖真实 tarball 导入、类型和 Vite build  |
| 发布预检             | `pnpm run release:check`            | 已覆盖版本、CHANGELOG、质量门禁和 tarball   |
| Taro H5 smoke        | `pnpm run test:taro:h5`             | 已覆盖                                      |
| Taro weapp smoke     | `pnpm run test:taro:weapp`          | 已覆盖                                      |
| Taro multi-end smoke | `pnpm run test:taro`                | 已纳入脚本/CI，本次 H5 + weapp 通过         |
| Taro extended smoke  | `pnpm run test:taro:extended`       | 已覆盖 Alipay experimental build smoke      |

## 已完成能力基线

- 打包后消费侧 fixture 已能从真实 tarball 验证 root、`./core`、`./vue` 和 `./style.css` 导入。
- root 入口保持默认样式自动引入；`./core` / `./vue` 不包含 `style.css` 副作用。
- `resolveStandaloneTabRedirect` 已用于独立 Tab 页面 redirect URL 判断与生成，query 合并规则有单元测试覆盖。
- retap core/context 已提供 `hasRefreshHandler` 和 `isRefreshRunning`，用于区分未注册、执行中和 handler 抛错等调试场景。
- `RouterlessTabPaneHost` 已支持 `hostClass`、`paneClass`、`hiddenClass` 追加业务 class，默认隐藏行为保持不变。
- `doc/styling.md` 和 `doc/compatibility.md` 已补充安全区、内容区 padding、滚动容器、重型原生组件和隐藏策略检查清单。
- release workflow 已复用 `pnpm run release:check`，发布前可重复校验版本、CHANGELOG、质量门禁和 tarball 关键文件。

## 发布策略备注

`dist/` 不纳入 git 跟踪，只作为 npm 包发布产物存在。当前通过 `prepack` 在 `npm pack` / `npm publish` 前自动执行 `pnpm run build`，并由 `package.json` 的 `files` 与 `exports` 控制 tarball 内容。

后续发布策略应继续保持“源码仓库轻量、tarball 内容可验证”的方向。0.4.0 新增的运行时验证或多端 fixture 不应扩大 npm 包发布面，除非对应文档或示例确实需要随包发布。

## 0.4.0 总目标

0.4.0 的目标是把当前 build smoke 和 API 单测，升级为更贴近真实接入场景的验证体系：

1. H5 端至少有一条可自动执行的运行时交互链路。
2. Taro fixture 覆盖长列表、复杂 query、redirect、retap、返回链路和样式边界等真实业务问题。
3. 小程序端明确区分 build smoke、手动真机/开发者工具验证和自动化验证，不再混用“已构建”和“已运行”。
4. 多端扩展以稳定和可维护为前提，新增平台不影响 H5 + WeChat 主链路发布。

## 0.4.0 目标

### 目标 1：增加 H5 运行时自动化 smoke

**优先级：高**

**背景**

当前 H5 与 WeChat 小程序已覆盖 build smoke，但 build 通过不能证明关键交互在运行时符合预期，例如 Tab 切换是否保留 pane 实例、retap 是否触发共享 context、独立页 redirect query 是否正确、内容区 padding 是否遮挡底栏。

H5 是最适合先落地自动化运行时验证的平台。先把 H5 链路跑通，可以为后续小程序自动化或手动矩阵提供统一的断言模型。

**规划**

1. 为 `examples/taro-vue3-basic` 增加可稳定定位的测试标记或可见文案，避免测试依赖易变样式结构。
2. 增加 H5 运行时测试脚本，例如 `test:taro:h5:runtime`。
3. 构建并启动 H5 产物后，自动验证：
   - 初始 `tab` query 归一化。
   - 点击不同 Tab 后 active 状态和内容切换正确。
   - 已访问 pane 不被销毁，关键状态可保留。
   - 点击当前 Tab 触发 retap 刷新计数。
   - 独立页 redirect URL 保留普通 query、过滤 `embedded`、覆盖 `tab`。
4. 将 H5 运行时 smoke 接入 CI；如果耗时明显增加，可先作为独立 job 或 release workflow 门禁。

**验收标准**

- 一个命令可在本地完成 H5 build、serve 和运行时断言。
- CI 能稳定执行 H5 运行时 smoke。
- 失败信息能定位到 tab 初始化、tab 切换、retap、redirect 或样式布局中的具体环节。

### 目标 2：升级 Taro 示例 fixture 为真实业务场景

**优先级：高**

**背景**

当前 fixture 适合验证基础构建链路，但真实接入中更容易出问题的是长列表滚动、异步刷新、分享参数、页面返回、复杂 query 和底栏布局。这些场景不一定需要新增核心 API，但需要有官方示例和可重复验证入口。

**规划**

扩展 `examples/taro-vue3-basic`，至少覆盖：

- 长列表或卡片列表：验证内容区底部 padding、滚动容器高度和 Tab 切换后的状态保留。
- retap 异步刷新：覆盖 loading、成功、失败提示和重复 retap 并发保护。
- 复杂 query：覆盖普通 query、分享参数、旧 `tab` 参数、`embedded` 参数的合并与过滤。
- 返回链路：从 Tab 内容进入二级页面或模拟详情入口，再返回主容器后保持当前 Tab 状态。
- 样式边界：展示 `hostClass`、`paneClass`、`hiddenClass` 和 CSS 变量覆盖的推荐写法。

**验收标准**

- fixture 中每个关键能力都有可见页面或说明，不再只存在于文档片段。
- H5/weapp build smoke 覆盖升级后的 fixture。
- H5 运行时 smoke 至少覆盖其中的核心交互链路。
- `doc/integration-guide.md` 与 `doc/compatibility.md` 能指向 fixture 中的对应示例。

### 目标 3：沉淀端侧运行时验证矩阵

**优先级：高**

**背景**

当前文档已经说明 H5/weapp 是 build smoke，但没有系统记录“哪些能力只构建过、哪些能力人工跑过、哪些能力自动化覆盖”。随着 fixture 变复杂，如果不拆清验证层级，后续容易把构建成功误解为端侧运行时兼容。

**规划**

1. 在 `doc/compatibility.md` 中新增运行时验证矩阵，或新增 `doc/runtime-validation.md` 后从兼容性文档链接过去。
2. 将每个能力按验证层级标注：
   - 单元测试。
   - 打包后消费侧验证。
   - H5 自动化运行时验证。
   - 小程序 build smoke。
   - 小程序开发者工具/真机手动验证。
3. 为小程序端提供手动检查清单：Tab 切换、retap、redirect、返回链路、安全区、长列表滚动、重型原生组件隐藏/恢复。
4. 记录验证环境：Taro 版本、平台插件版本、开发者工具版本、设备/系统版本和验证日期。

**验收标准**

- 文档能明确说明每个端、每个能力的验证等级。
- 新增或修改 fixture 后，有固定位置记录端侧验证结果和已知限制。
- 用户能根据矩阵判断自己的目标端是否需要额外验证。

### 目标 4：按真实需求扩展小程序平台 build smoke

**优先级：中**

**背景**

当前主链路已覆盖 H5 和 WeChat 小程序。支付宝、抖音等平台可以提升信心，但它们会引入额外 Taro 平台插件、依赖体积和 CI 波动。0.4.0 应优先保证新增平台可重复构建，而不是一次性承诺所有运行时行为一致。

**规划**

1. 先评估支付宝小程序 build smoke，作为 WeChat 之外的首个候选平台。
2. 如果支付宝链路稳定，再评估抖音等平台；每个平台都需要独立脚本，例如 `test:taro:alipay` / `test:taro:tt`。
3. 多端脚本应分层：
   - `test:taro` 保持 H5 + WeChat 主链路稳定。
   - 新平台可先进入 `test:taro:extended` 或独立 CI job。
4. 兼容性文档记录平台插件版本、构建结果和已知限制。

**验收标准**

- 至少完成一个新增平台的可行性结论：接入并纳入 extended smoke，或明确暂缓原因。
- 新平台失败不影响 H5 + WeChat 的主链路质量门禁，除非已正式升级为稳定支持范围。
- 文档清楚区分“稳定覆盖”和“实验性覆盖”。

### 目标 5：收敛 0.4.0 发布门禁与文档入口

**优先级：中**

**背景**

0.4.0 如果新增运行时 smoke、扩展 fixture 和验证矩阵，需要同步调整发布前检查与文档入口，否则容易出现代码验证已更新但用户文档仍停留在旧示例的情况。

**规划**

1. 评估是否将 H5 运行时 smoke 纳入 `prepublishOnly`、`release:check` 或仅纳入 CI/release workflow。
2. 更新 README 的“验证范围”和“推荐接入路径”，明确 root / `./core` / `./vue` / `./style.css` 的使用建议仍不变。
3. 更新 `doc/integration-guide.md`，把真实业务 fixture 的长列表、复杂 query、返回链路和 retap 调试串起来。
4. 更新 CHANGELOG 模板或发布说明，要求记录本次新增/变更的验证范围。

**验收标准**

- 0.4.0 发布前有明确的一组必跑命令和可选扩展命令。
- README、API、集成指南、兼容性文档对验证范围的描述一致。
- CHANGELOG 能体现新增运行时验证、fixture 覆盖点和已知限制。

## 版本计划

### 0.4.0：运行时验证与多端矩阵

- [x] 增加 H5 运行时自动化 smoke，覆盖 tab 初始化、切换、状态保留、retap 和 redirect query。
- [x] 升级 `examples/taro-vue3-basic`，加入长列表、异步刷新、复杂 query、返回链路和样式边界示例。
- [x] 建立端侧运行时验证矩阵，区分单测、消费侧验证、H5 自动化、小程序 build smoke 和手动真机/开发者工具验证。
- [x] 评估并尝试新增一个 WeChat 之外的小程序平台 build smoke，优先保证可重复构建和文档记录。
- [x] 收敛 0.4.0 发布门禁，明确哪些运行时验证进入 CI、release workflow 或手动发布清单。
- [x] 更新 README、集成指南、兼容性文档和 CHANGELOG，确保验证范围与 fixture 能力一致。

### 1.0.0：稳定版条件

- [ ] API 命名和导出结构冻结。
- [ ] H5 + 至少一个主流小程序端 smoke build 长期稳定。
- [ ] 核心交互链路具备自动化或明确的端侧验证记录。
- [ ] 独立页 redirect、retap refresh、样式自定义均有官方推荐样板和 fixture 覆盖。
- [ ] npm 发布流程可重复，tarball 内容、导出结构和消费侧类型解析有自动检查。
- [ ] CHANGELOG、兼容性说明、运行时验证矩阵和已知限制齐全。

## 推荐下一步

0.4.0 的计划任务已经完成。后续建议进入发布后收敛和 1.0.0 准备：

1. 发布前继续执行 `pnpm run release:check`、`pnpm run test:taro:h5:runtime` 和可选的 `pnpm run test:taro:extended`。
2. 在 WeChat / Alipay 开发者工具或真机中补充手动端侧验证记录，完善 `doc/runtime-validation.md` 中的“小程序手动”列。
3. 进入 1.0.0 前再评估 API 命名冻结、长期 CI 稳定性和已知限制是否满足稳定版条件。
