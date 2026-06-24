# 项目现状分析与 1.0.0 路线图

生成日期：2026-06-24  
当前版本：`0.4.0`

## 结论

前序版本的消费侧稳定性、接入样板、调试能力、样式边界、运行时验证、多端 smoke 和发布预检工作已经完成。当前包已经具备进入稳定版收敛阶段的基础：导出结构清晰、核心 API 有单元测试，真实 tarball 消费侧验证可重复执行，Taro H5 有自动化运行时 smoke，WeChat 主链路 build smoke 和 Alipay experimental extended build smoke 均已落地。

1.0.0 不建议继续扩展新的核心能力，而应聚焦“稳定版承诺”：冻结公开 API 与导出结构，补齐端侧验证记录，明确长期支持范围和已知限制，并把发布流程收敛到可重复、可审计、可回滚的最小步骤。

## 当前已验证基线

| 检查项               | 命令                                | 当前状态                                   |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| ESLint               | `pnpm run lint`                     | 已纳入脚本/CI                              |
| Prettier             | `pnpm run format:check`             | 已纳入脚本/CI                              |
| TypeScript           | `pnpm run typecheck`                | 已纳入脚本/CI                              |
| 单元测试             | `pnpm run test:run`                 | 已覆盖 core helper、retap 和 Vue 状态      |
| 库构建               | `pnpm run build`                    | 已纳入脚本/CI，生成 `dist/` 发布产物       |
| 打包预检             | `pnpm run pack:dry-run`             | 已纳入脚本/CI                              |
| 依赖审计             | `pnpm audit --audit-level moderate` | 已纳入 CI                                  |
| 打包后消费侧验证     | `pnpm run test:package-consumer`    | 已覆盖真实 tarball 导入、类型和 Vite build |
| 发布预检             | `pnpm run release:check`            | 已覆盖版本、CHANGELOG、质量门禁和 tarball  |
| Taro H5 smoke        | `pnpm run test:taro:h5`             | 已覆盖                                     |
| Taro weapp smoke     | `pnpm run test:taro:weapp`          | 已覆盖                                     |
| Taro multi-end smoke | `pnpm run test:taro`                | 已覆盖 H5 + WeChat 主链路                  |
| Taro H5 runtime      | `pnpm run test:taro:h5:runtime`     | 已覆盖核心浏览器交互链路                   |
| Taro extended smoke  | `pnpm run test:taro:extended`       | 已覆盖 Alipay experimental build smoke     |

## 已完成能力基线

- root、`./core`、`./vue`、`./style.css` 子路径导出已可从真实 tarball 正常消费。
- root 入口保持默认样式自动引入；`./core` / `./vue` 不包含 `style.css` 副作用。
- `resolveStandaloneTabRedirect` 已覆盖独立 Tab 页面 redirect URL 判断、query 合并、`embedded` 过滤和目标 `tab` 覆盖。
- retap core/context 已提供 handler 注册、并发保护、错误回调、刷新动画 key、`hasRefreshHandler` 和 `isRefreshRunning`。
- `RouterlessTabPaneHost` 已支持 `hostClass`、`paneClass`、`hiddenClass` 追加业务 class，默认隐藏行为保持不变。
- `examples/taro-vue3-basic` 已覆盖长列表、异步 retap、复杂 query、模拟详情返回链路、样式边界和稳定测试标记。
- `doc/runtime-validation.md` 已区分单元测试、消费侧验证、H5 runtime、小程序 build smoke、扩展平台 build smoke 和手动端侧验证。
- release workflow 已复用 `pnpm run release:check`，并额外执行 H5 runtime smoke。

## 发布策略备注

`dist/` 不纳入 git 跟踪，只作为 npm 包发布产物存在。当前通过 `prepack` 在 `npm pack` / `npm publish` 前自动执行 `pnpm run build`，并由 `package.json` 的 `files` 与 `exports` 控制 tarball 内容。

1.0.0 发布前应继续保持这一策略：源码仓库不提交构建产物，发布包只包含库产物、README、CHANGELOG、LICENSE 和必要文档。示例 fixture、测试脚本和平台依赖不进入 npm 包发布面。

## 1.0.0 总目标

1.0.0 的核心目标是把当前能力从“功能完成”推进到“稳定承诺”：

1. 公开 API、类型命名、子路径导出和样式入口冻结。
2. 主链路验证长期稳定，失败时能快速定位到源码、打包、消费侧、Taro build 或 H5 runtime 环节。
3. H5 自动化验证、WeChat build smoke、Alipay experimental smoke 和小程序手动验证记录边界清晰。
4. 文档明确适用场景、不适用场景、已知限制、发布步骤和故障排查方式。
5. 版本发布流程可重复，tag、CHANGELOG、npm tarball 和 GitHub Release 信息一致。

## 1.0.0 目标

### 目标 1：冻结公开 API 与导出结构

**优先级：高**

**背景**

稳定版发布后，root 入口、`./core`、`./vue`、`./style.css`、公开类型和组件 props 都会成为使用者依赖的长期契约。进入 1.0.0 前应主动审查这些契约，避免把实验性命名或不必要的导出带入稳定版。

**规划**

1. 梳理 `src/index.ts`、`src/core.ts`、`src/vue.ts` 与 `package.json` exports，列出稳定版公开面。
2. 检查公开类型、函数、组件 props、事件名和 slot 参数是否命名一致、语义清晰。
3. 对不准备承诺的内部能力，确认不会从 root / 子路径导出。
4. 增加 API surface 文档或轻量导出快照，方便后续版本变更时 review。
5. 更新 `doc/api.md`，明确哪些 API 属于稳定承诺，哪些验证能力仅为项目脚本。

**验收标准**

- root、`./core`、`./vue`、`./style.css` 的导出清单和 `doc/api.md` 一致。
- 公开类型、props、事件和 slot 参数均有文档说明。
- 后续新增/删除导出会在 review 中显式暴露，不依赖人工记忆。

### 目标 2：补齐端侧手动验证记录

**优先级：高**

**背景**

当前 H5 已有自动化运行时 smoke，小程序侧主要是 build smoke。稳定版可以继续把自动化范围限定在可维护边界内，但必须明确记录开发者工具或真机验证结果，避免把“已构建”误写成“已运行”。

**规划**

1. 按 `doc/runtime-validation.md` 的手动检查清单，在 WeChat 开发者工具或真机记录一次主链路结果。
2. 如果条件允许，对 Alipay 开发者工具也记录一次 experimental 运行时结果；如果无法验证，明确标注未验证原因。
3. 检查项至少包括：Tab 切换、pane 保活、retap loading/成功/失败、redirect query、详情返回、长列表底部 padding、安全区和隐藏 pane 恢复。
4. 将验证日期、工具版本、平台插件版本、设备/系统和结论写回 `doc/runtime-validation.md`。

**验收标准**

- WeChat 小程序至少有一条明确的开发者工具或真机验证记录。
- Alipay experimental 覆盖有“已验证”或“未验证原因”记录。
- 文档不混用 build smoke 与运行时验证结论。

### 目标 3：稳定质量门禁与发布流程

**优先级：高**

**背景**

当前已有 CI、release workflow、`release:check`、package consumer 验证和 H5 runtime smoke。1.0.0 前需要确认这些门禁的职责边界稳定，并补齐发布操作步骤，避免 npm 发布、GitHub Release 和 CHANGELOG 之间产生漂移。

**规划**

1. 明确发布前必跑命令：`pnpm run release:check`、`pnpm run test:taro`、`pnpm run test:taro:h5:runtime`。
2. 明确可选扩展命令：`pnpm run test:taro:extended`。
3. 检查 release workflow 与本地发布步骤是否一致，必要时新增 `doc/release.md`。
4. 记录失败排查：package consumer 失败、tarball 缺文件、Taro build 失败、Playwright 浏览器缺失、Alipay extended 波动。
5. 确认 `CHANGELOG.md`、`package.json` version、git tag 和 npm tarball 版本一致。

**验收标准**

- 发布前门禁和可选扩展门禁在 README 或 release 文档中有明确入口。
- release workflow 与本地脚本不重复维护两套互相漂移的逻辑。
- 1.0.0 发布前可通过一个清单确认版本、CHANGELOG、tag、tarball 和 GitHub Release。

### 目标 4：收敛文档信息架构和已知限制

**优先级：中**

**背景**

当前文档已经覆盖 README、集成指南、retap、样式、兼容性、API 和运行时验证矩阵。稳定版前需要做一次信息架构收敛：用户能从 README 快速判断是否适合使用本包，并能跳转到对应接入、调试、样式和验证文档。

**规划**

1. README 保持轻量定位，突出适用/不适用场景、入口选择、最小示例和验证范围。
2. `doc/integration-guide.md` 保持端到端接入路径，避免和 API 文档重复堆砌类型细节。
3. `doc/retap-refresh.md` 聚焦共享 context、并发保护、错误处理和调试方法。
4. `doc/styling.md` 聚焦 CSS 变量、slot、自定义 class、安全区和隐藏策略。
5. `doc/compatibility.md` / `doc/runtime-validation.md` 明确平台范围、验证等级和已知限制。

**验收标准**

- README 能在 3 分钟内帮助新用户判断是否适合本包。
- 每个文档入口职责清晰，没有互相矛盾的验证范围描述。
- 已知限制集中记录，不散落在多个文档里互相重复。

### 目标 5：1.0.0 发布准备

**优先级：中**

**背景**

稳定版发布不仅是改版本号，还需要确认 CHANGELOG、README、API 文档、兼容性说明、验证矩阵和 release notes 都表达同一组承诺。发布准备应在所有质量门禁通过后进行。

**规划**

1. 将 `package.json` version 更新到 `1.0.0`。
2. `CHANGELOG.md` 新增 `## 1.0.0`，保留顶部 `## Unreleased`。
3. README 当前版本更新到 `1.0.0`，并确认 npm 包链接、仓库链接和文档导航正确。
4. 执行完整发布前验证清单。
5. 创建 tag 前最后确认工作树干净、tarball 文件清单符合预期。

**验收标准**

- `pnpm run release:check`、`pnpm run test:taro`、`pnpm run test:taro:h5:runtime` 通过。
- 可选的 `pnpm run test:taro:extended` 有通过结果或明确暂缓原因。
- `CHANGELOG.md`、README、API 文档和验证矩阵均反映 1.0.0 稳定版承诺。

## 版本计划

### 1.0.0：稳定版收敛

- [ ] 冻结公开 API、类型命名、组件 props、事件、slot 参数和子路径导出结构。
- [ ] 增加或沉淀 API surface 检查方式，避免稳定版后无意修改公开面。
- [ ] 补齐 WeChat 小程序开发者工具或真机运行时验证记录。
- [ ] 记录 Alipay experimental 运行时验证结果，或明确未验证原因。
- [ ] 收敛发布前必跑命令、可选扩展命令和失败排查文档。
- [ ] 检查 README、集成指南、retap、样式、兼容性、API 和运行时验证矩阵的一致性。
- [ ] 准备 1.0.0 版本号、CHANGELOG、README 当前版本和发布说明。
- [ ] 完成 1.0.0 发布前完整质量门禁。

### 1.x：发布后维护方向

- [ ] 仅在明确需求下增加新的平台 smoke 或运行时验证，不扩大默认支持承诺。
- [ ] 保持 semver：破坏性 API 调整进入后续 major，小版本只增加兼容能力。
- [ ] 持续更新已知限制和端侧验证记录。

## 推荐下一步

1. 先做公开 API / exports 审查，确认 1.0.0 要冻结的稳定契约。
2. 按 `doc/runtime-validation.md` 对 WeChat 小程序补一次开发者工具或真机验证记录。
3. 再收敛发布文档和 1.0.0 版本准备，避免在验证记录缺失时直接发布稳定版。
