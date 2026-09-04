# Quiz Studio

**An open, model-agnostic Skill for building mobile-first personality, archetype, role-match, and fandom quizzes that people can actually edit.**

[中文说明](#中文说明) · [Quick start](#quick-start) · [Architecture](#architecture) · [Contributing](CONTRIBUTING.md)

> Quiz Studio is for entertainment, reflection, education, and creative engagement. It is not a clinical diagnostic instrument and must not claim to diagnose real people.

## Why this exists

Most quiz prototypes fail in a predictable way: the copy, weights, visual layout, editor preview, public page, and exported share image gradually become different products. A creator moves something in an editor; the formal page remains wrong. A result seems plausible by eye; the scoring picks a different role. A download button fires but nobody can save the image.

Quiz Studio makes those failure modes explicit and gives an AI agent or developer a small, reusable production path.

## What you get

| Capability | What it means in practice |
| --- | --- |
| **One source of truth** | A versioned config drives the workbench, formal quiz, result page, share card, exported PNG, and draft cache. |
| **Real WYSIWYG editing** | The workbench embeds the actual formal renderer in an iframe. It does not draw a look-alike preview. |
| **Every visible element is ownable** | Edit copy, per-line text, title, result summaries, image/vector positions, width, height, scale, z-index, type size, line height, tracking, color, effects, page height, and asset paths. |
| **Aesthetic range without a design dependency** | Four CSS-only presets, native color inputs, font-stack switches, global type scale/tracking, radius, borders, and light effects; owners can still bring their own PNG/SVG/audio. |
| **Mobile-first layout rules** | Page height, option area, footer, and art are independent. A taller page does not silently resize, hide, or pin an image. |
| **Explainable scoring** | Observable dimensions, explicit answer vectors, result profiles, named calibration cases, deterministic tie behavior, and distribution simulation. |
| **Copy and source discipline** | A source/copy ledger prevents a role-match game from inventing real-person psychology or presenting fan inference as fact. |
| **Export that fails visibly** | Share-card PNG rendering produces a preview and a user-clickable download link. Cross-origin image failures are explained instead of swallowed. |
| **Portable by design** | Plain Markdown, HTML, CSS, JavaScript, Python, and Node standard library. No paid model, UI SDK, cloud service, or frontend framework is required. |
| **A diagnosis atlas** | The common editor/render/export/scoring failures are indexed by symptom, root cause, evidence, and smallest safe fix. |

## Quick start

```bash
git clone https://github.com/Yaowon/quiz-studio.git
cd quiz-studio

python3 scripts/create-project.py /absolute/path/my-quiz
node scripts/validate-persona-quiz.mjs /absolute/path/my-quiz
python3 -m http.server 4173 --directory /absolute/path/my-quiz
```

Open `http://localhost:4173/design-studio.html`.

The workbench saves drafts only in browser local storage. Export a JSON config for review; copy it into `quiz-config.js` only after the owner approves the change.

## Architecture

```text
quiz-config.js
       │
       ├── formal quiz renderer ── answer flow / result page
       ├── embedded workbench ─── select / drag / inspect / style
       ├── share-card renderer ── preview / user-clickable PNG download
       └── local draft + import/export JSON
```

The starter deliberately uses native DOM/CSS, Pointer Events, `postMessage`, local storage, Canvas, and standard inputs.

- [GrapesJS](https://github.com/GrapesJS/grapesjs) is a strong general template builder with blocks, style, layers, and asset management, but is too broad when a product only needs a fixed family of portrait-format quiz pages.
- [Craft.js](https://github.com/prevwong/craft.js) is the right escalation path for a React product that needs a custom component-tree editor and serialized state.
- [tldraw](https://github.com/tldraw/tldraw/blob/main/LICENSE.md) is an infinite-canvas SDK with a production license path; it is not a no-conditions default for an open skill.
- [html2canvas](https://github.com/niklasvh/html2canvas) recreates a DOM representation rather than taking a native screenshot and is constrained by cross-origin assets, so it is not the export source of truth.

The full decision record is in [references/open-source-landscape.md](references/open-source-landscape.md).

## Workflow for agents and teams

1. Establish the boundary, audience, outcome types, source corpus, copy owner, assets, target width, hosting, and privacy needs.
2. Define 4–8 observable dimensions and source-backed result profiles.
3. Make a question ledger before final copy: scenario, behavior, answer task, scoring vector, and sensitive wording.
4. Add calibration cases and test simulation before visual polish.
5. Use the workbench to approve each page, each result, and each share card on a real mobile-sized viewport.
6. Ship only after schema, scoring, visual, runtime, and rights/privacy checks all pass.

`SKILL.md` contains the agent workflow. Detailed references cover [intake and research](references/intake-and-research.md), [scoring](references/scoring.md), [architecture and workbench](references/architecture-and-workbench.md), [known failure modes](references/failure-atlas.md), [QA and release](references/qa-and-release.md), and [model portability](references/model-portability.md).

## Compatibility

Use this repository with Codex, Claude Code, Cursor, Gemini, ChatGPT, another coding agent, or a human developer:

- If the environment supports tools and a browser, run the starter and complete the QA matrix.
- If it supports file editing only, generate the project and clearly label browser/export checks as unverified.
- If it supports chat only, use `SKILL.md` plus the reference Markdown files as a product brief and hand the generated config/spec to a developer.

Do not claim a UI test happened if the agent only performed static validation.

## Included starter

```text
assets/starter/
├── index.html             # formal quiz
├── design-studio.html     # live workbench
├── quiz-config.js         # shared config and demo content
├── quiz-core.js           # validation, scoring, simulation
├── quiz-runtime.js        # formal renderer, interaction, share-card export
├── studio.js              # workbench controls and iframe synchronization
└── styles.css             # portable visual system
```

The included `scripts/validate-persona-quiz.mjs` checks config shape, duplicate IDs, scoring test cases, simulation coverage, JavaScript syntax, and required workbench/runtime contracts. It is not a substitute for visual QA.

## Scope and limits

- User-provided or separately generated transparent images are safer than AI-generated images containing exact logos, lettering, or layout.
- Owners must confirm asset, portrait, music, trademark, source, and analytics rights before publishing.
- Browsers cannot be forced to start audible music automatically. Start muted/off and use an accessible user-controlled toggle.
- Remote images need CORS permission for Canvas export. Store final assets in the same project when possible.

---

# 中文说明

**Quiz Studio 是一个开源、模型无关的 Skill：用来制作任何主题的移动端人格、角色匹配、原型或粉丝向测试，并且让用户真的能自己改。**

它适用于娱乐、内容互动、品牌原型与自我反思；不适用于临床人格诊断，也不能把少量内容、剧情或观察包装成对真实人物的完整心理结论。

## 它解决的不是“生成几个题”，而是这些常见事故

- 工作台里排得对，正式页位置却错；
- 红字、蓝字和背景字被锁成一块，不能单独移动；
- 调页面长度后，选项、页脚和人物图跟着互相打架；
- 透明 PNG 的空白边缘被误判为碰撞，导致图片被挪到错误位置；
- 用户改好的坐标被刷新、快照参数或全局重排覆盖；
- 题目看上去像某种人格，最终却算到完全不相干的结果；
- “保存图片”按钮看似点了，移动端和网页端却没有任何可保存内容；
- 模型把娱乐测试写成了貌似有医学依据的人格诊断。

## 核心优势

1. **一个配置，所有页面共用。** 工作台、正式页、结果页、分享卡、导出 PNG 与草稿缓存都读取同一份版本化配置。
2. **工作台直接嵌入正式页。** 不是两套 UI；右侧预览就是用户最终看到的渲染器。
3. **文字、图片、矢量小图、按钮和页高都能编辑。** 支持拖动、数值微调、层级、缩放、旋转、字体、字号、行高、字距、颜色和效果。
4. **视觉系统不是固定模板。** 内置编辑纸感、明亮流行、安静电影、黑白海报四种轻量 CSS 风格；可用原生色轮、字体栈、全局字号/字距、边框、圆角和阴影继续调。
5. **计分可解释、可测试。** 每个答案都有权重，结果有画像向量，写入明确的测试路径，并通过随机模拟检查是否存在“隐藏角色”。
6. **把真实踩坑写成故障图谱。** 不再凭感觉乱挪位置：先看症状、根因、证据，再做最小安全修复。
7. **结果图可以被真实验收。** 先生成可见预览，再给用户主动点击下载；跨域素材失败会告诉你原因。
8. **不绑模型、不绑云。** 纯 HTML/CSS/JS/Python/Node 标准库，Codex、Claude、Cursor、Gemini、ChatGPT 或人工开发者都能接手。

## 最小使用方式

```bash
python3 scripts/create-project.py /absolute/path/my-quiz
node scripts/validate-persona-quiz.mjs /absolute/path/my-quiz
python3 -m http.server 4173 --directory /absolute/path/my-quiz
```

打开 `http://localhost:4173/design-studio.html`，在工作台中调整后导出 JSON。确认无误再合并回 `quiz-config.js` 并发布。

## 推荐的协作顺序

1. 明确测试目的、边界、受众、结果类型、内容来源、文案审核人、素材版权、部署与数据规则。
2. 先定义 4–8 个可观察维度，再写每个角色/结果的证据和差异。
3. 题目先写进题目账本：场景、区分什么行为、回答方式、赋分向量和敏感风险。
4. 先测赋分与结果覆盖，再做视觉。
5. 每张封面、题目、结果页和分享卡都在真实手机尺寸下截图验收。
6. 只有结构、赋分、视觉、交互、版权与隐私都通过，才叫完成。

## 开源参与

欢迎提交新的风格预设、布局层类型、测试用例、故障复盘和不同模型的使用记录。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

[MIT](LICENSE)。使用者自行负责题材来源、肖像、音乐、商标、分析统计与部署合规。
