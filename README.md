# AI Travel Roadbook

把一份完整旅行攻略交给 AI Agent，生成一份独立、可在手机使用的旅行路书。它保留电影感首页、每日详情、Today、路线地图、导航链接与 PWA 外壳，但不绑定任何城市或固定天数。

## 开始使用

1. 在 GitHub 点击 **Use this template**，为一次旅行新建独立仓库。
2. 将完整攻略原文放入 `content/source-guide.md`；它是不可静默改写的事实来源。
3. 将下面指令交给 Agent，并先确认它生成的事实核对报告。
4. 核对完成后，让 Agent 更新内容包、生成本地 AI 图片并运行 `npm run check && npm run build`。

```text
Use this repository as a single-trip AI Travel Roadbook. Read AGENTS.md first.
Import my guide into content/source-guide.md without rewriting it. Extract facts,
conflicts, unverified details and missing route geometry into a review for my approval.
Do not generate or change the roadbook until I approve the review. After approval,
update only the structured content pack, generate local images with the available image
tool (Codex must use imagegen), validate, build, and open the local preview.
```

## 常用命令

```bash
npm install
npm run media:optimize
npm run validate
npm run check
npm run build
npm run preview
npm run roadbook:use -- --example jeju-complete
```

`examples/jeju-complete` 是完整济州五天四晚示例。执行最后一条命令会覆盖当前 `content/`，但不会改动示例文件。

## 内容包

- `content/source-guide.md`：用户原始攻略。
- `content/roadbook.json`：目的地、主题、任意天数、地点、行程和场景。
- `content/routes.geojson`：真实路线几何；没有验证几何的路线将以虚线和警告显示。
- `content/facts.json`：来源与待核对状态。
- `content/media-manifest.json`：本地图片、提示词、工具和替代文本。

详细规则见 [Agent workflow](docs/agent-workflow.md) 和 [内容格式](docs/content-pack.md)。

## 开源与隐私

代码、示例和文档采用 [MIT](LICENSE) 许可证。不要把密钥、部署凭据或不希望公开的个人行程资料提交到 Git。在线地图瓦片不属于离线缓存保证；PWA 离线模式缓存页面外壳、内容、路线与本地图片。
