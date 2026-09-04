# Contributing to Quiz Studio / 参与贡献

Thank you for helping make quiz production more reliable and less mysterious.

## Good contributions

- A small, dependency-free visual preset or editable layer type.
- A reproducible scoring, layout, rendering, export, or mobile-browser failure case.
- A focused fix with a runnable check.
- A model-portability note grounded in an actual workflow.
- A source/copy safeguard that prevents overclaiming or fabrication.

## Before opening a pull request

```bash
node scripts/validate-persona-quiz.mjs /absolute/path/to/a/generated-quiz
python3 scripts/create-project.py /tmp/quiz-studio-check
node scripts/validate-persona-quiz.mjs /tmp/quiz-studio-check
```

If you use Codex, also run the installed `skill-creator` validator against this repository. Include the command output and, for visual changes, a mobile-size screenshot or short reproduction note.

## Non-negotiable rules

- Do not add a duplicate editor preview. The workbench must continue to render the formal page.
- Do not couple page height to an image's dimensions or a fixed option count.
- Keep separately editable text as separate layers.
- Do not claim clinical validity, diagnose people, or invent source evidence.
- Avoid mandatory paid services and heavy dependencies unless the benefit is specific and documented.

---

## 中文说明

欢迎贡献能让人格测试更可编辑、更可验证的改进：新风格预设、可复现的布局/导出/计分问题、带验证的最小修复、真实的跨模型经验，以及能阻止虚构来源和过度人格断言的护栏。

提交前请至少跑一次生成器与验证器；涉及视觉改动时，请附上手机尺寸截图或明确复现步骤。不要做两套预览、不要把页高绑到图片或选项数量、不要把可编辑的多行文本锁成一层，也不要引入没有必要的付费服务或重型依赖。
