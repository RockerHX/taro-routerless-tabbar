# 发布流程

本文记录 `taro-routerless-tabbar` 稳定版发布前检查、版本一致性要求和常见失败排查。发布前应先确认工作树干净，且不提交 `dist/` 构建产物。

## 发布前必跑门禁

按顺序执行：

```bash
pnpm run release:check
pnpm run test:taro
pnpm run test:taro:h5:runtime
```

说明：

- `release:check` 会校验 `CHANGELOG.md`、发布文件清单、API surface，并复用 lint、格式检查、类型检查、单元测试、打包后消费侧验证和 pack dry-run。
- `test:taro` 覆盖 H5 + WeChat 小程序 build smoke。
- `test:taro:h5:runtime` 使用 Playwright 覆盖 H5 真实浏览器交互链路。

## 可选扩展门禁

```bash
pnpm run test:taro:extended
```

当前 extended 只覆盖支付宝小程序 experimental build smoke，不阻断 H5 + WeChat 主链路。若该命令失败，需要在发布记录中写明失败原因；不要把 extended build 写成稳定运行时支持承诺。

## 版本与发布清单

发布前确认：

- `package.json` 的 `version` 与本次发布版本一致。
- `CHANGELOG.md` 保留顶部 `## Unreleased`，并包含当前版本章节。
- README 当前版本、兼容性说明、API 文档和运行时验证矩阵表达同一组稳定承诺。
- `npm pack --dry-run` 输出只包含发布所需文件：`dist/`、README、CHANGELOG、LICENSE 和必要文档。
- git tag 建议使用 `vX.Y.Z`，例如 `v1.0.0`。
- GitHub Release 的 tag、标题和 release notes 与 CHANGELOG 当前版本章节一致。

## 发布步骤

1. 完成代码、文档和版本号提交。
2. 执行发布前必跑门禁；如需扩展验证，再执行 `pnpm run test:taro:extended`。
3. 确认 `git status --short` 干净。
4. 创建并推送 tag，例如 `git tag v1.0.0 && git push origin v1.0.0`。
5. 等待 release workflow 通过并创建 GitHub Release。
6. 执行 npm 发布前再次确认 tarball 清单，随后执行 `npm publish`。

## 常见失败排查

- package consumer 失败：先查看 tarball 是否缺少 `dist/*.d.ts`、`style.css` 或子路径入口，再检查 `exports` 与 `files` 是否一致。
- tarball 缺文件：检查 `package.json.files` 和 `scripts/release-check.mjs` 的 required files 是否同步。
- Taro build 失败：先重新执行 `pnpm run test:taro:prepare`，再分别跑 H5、WeChat 或 Alipay 单端命令定位。
- Playwright 浏览器缺失：先执行 `pnpm exec playwright install --with-deps chromium`，再重跑 `pnpm run test:taro:h5:runtime`。
- Alipay extended 波动：确认是否仍为 experimental build smoke；失败原因应写入验证记录，不应阻断主链路发布，除非本次发布显式要扩大支付宝承诺。
