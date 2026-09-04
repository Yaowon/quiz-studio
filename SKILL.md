---
name: quiz-studio
description: Build an evidence-aware, mobile-first personality or role quiz on any topic, with explainable scoring, a live WYSIWYG layout workbench, editable visual systems, and release-ready QA. Use for entertainment quizzes, fandom/character matches, brand archetype tests, and non-clinical self-reflection quizzes; do not use it to diagnose people.
metadata:
  short-description: Build editable personality quiz sites
---

# Quiz Studio / 可编辑人格测试工作台

Create a quiz that is fun, internally coherent, editable by a non-developer, and honest about what it can claim. The topic may be fictional, cultural, brand-related, or reflective. It is **not** a clinical assessment unless the user supplies a qualified, authorized instrument and explicitly asks for that scope.

This package is model- and platform-neutral. Do not require ChatGPT, Codex, a particular image model, a browser plugin, or a paid service. Use the best tools available in the current environment and state any capability gap plainly.

## First turn: establish the brief

State the assumptions already implicit in the request, name any missing information that could materially change the result, identify the most likely failure mode, then ask **one** highest-leverage question. Do not begin scoring or write final personality claims before the answer when the missing input is material.

Collect only what is needed:

1. **Purpose and boundary** — entertainment, education, brand engagement, or reflection; what must never be claimed.
2. **Outcome system** — number and names of result types, whether they are real people/characters/archetypes, and whether every result should have a roughly reachable path.
3. **Source corpus** — user-provided notes, primary material, official pages, episode/book/game references, approved interviews, or any forbidden sources.
4. **Audience and tone** — language, age/region constraints, desired sharpness, and who approves every visible line.
5. **Assets and identity** — required logo, type, colors, portraits/illustrations, audio, rights, and whether AI images are welcome.
6. **Delivery** — target mobile width, web/share-card needs, editable-local versus public mode, hosting, analytics, and privacy requirements.

If the user wants image generation, propose 2–3 visual routes and name the trade-off: integrated generation is fast for rough concepts but unreliable for exact words/logos/layout; user-supplied or separately generated transparent assets are safer for final production. Ask for final assets or explicit permission before using generated imagery in the release build.

Read [intake-and-research.md](references/intake-and-research.md) before researching questions or outcome copy.

## Build order

1. Define 4–8 observable dimensions and a source-backed profile for each outcome. Never infer a real person's full personality from a few scenes.
2. Draft a question ledger: source/context, behavior being distinguished, answer format, weights, and why an answer differentiates results.
3. Show all user-facing text for approval before treating it as final when the user owns copy review.
4. Build scoring and add explicit test cases before polishing visuals. Read [scoring.md](references/scoring.md).
5. Start from `assets/starter/` unless the project already has a better compatible architecture. The starter is intentionally framework-free and portable.
6. Make the workbench part of the product, not an afterthought. It must use the production renderer in an iframe, edit a shared configuration object, persist/export/import it, and never maintain a second set of positions.
7. Use the workbench's editable style system: palette/color wheel, type stack, scale, spacing, card treatment, and CSS-only effects. Never make generated PNG decoration the prerequisite for a usable design.
8. Implement mobile-first pages, result/share cards, optional media, and analytics only after the quiz flow works.
9. Perform the QA gates in [qa-and-release.md](references/qa-and-release.md). Do not say a page is accepted because its config validates.

Read [architecture-and-workbench.md](references/architecture-and-workbench.md) before writing the UI. Read [alignment-protocol.md](references/alignment-protocol.md) before the first visual edit or whenever the workbench and formal page differ. Read [failure-atlas.md](references/failure-atlas.md) before diagnosing an editor/render/export discrepancy. Read [model-portability.md](references/model-portability.md) when adapting this package to another agent platform.

Read [open-source-landscape.md](references/open-source-landscape.md) before adding a page-builder, canvas, or DOM-to-image dependency. Reuse one only when its product scope actually matches the request.

## Non-negotiable rendering invariants

- One versioned config is the layout source of truth. The workbench preview, formal page, share-card exporter, persisted draft, and published configuration must trace to it.
- Every visible string, small scene graphic, portrait, large artwork, button label, color, typography selection, CSS effect, and page height has an editable config entry. A text block with colored sub-lines is separate editable layers, not one locked string.
- Page height is independent from art width/height. Options, footer, progress, and safe areas have their own coordinates or flow rules; changing canvas height must not silently pin or hide them.
- Art can move anywhere on its page. Do not confine it to a hard-coded corner. Select SVG by painted pixels where possible; transparent PNG padding is not the visible art boundary.
- “WYSIWYG” means the workbench embeds the formal renderer and sends config updates to it. A look-alike preview is not acceptable.
- The active config identity, canvas dimensions, viewport, transform origin, and draft/published status must be inspectable in both the workbench and the formal renderer. If they differ, stop moving layers and resolve the identity mismatch first.
- Preserve user-approved coordinates. Fix only the named collision; never apply a global repositioning or typography normalization to existing pages without approval.
- Bind answer, drag, and export callbacks to stable page/layer ids, not a mutable “current page” variable. Ignore a stale callback during a page transition so a tap, selected border, or edit cannot leak into the next screen.
- Save/export must visibly succeed: generate a preview and a user-clickable download/share fallback. Do not silently trust a programmatic download after asynchronous rendering.
- Mobile browsers cannot be forced to autoplay audible music. Start muted/off, require a user interaction to enable sound, and expose an accessible toggle.

## Communication contract

Turn visual feedback into a bounded change ticket before editing: **screen/result id → element id → requested property/axis → values that must remain untouched → acceptance screenshot**. For example: “q07, scene icon, x only; preserve y, scale, all text; accept when it clears the blue prompt by 8px.” Do not interpret “move it” as permission to reflow the page.

When a user says the workbench is right but the formal page is wrong, stop moving elements. Compare config identity, renderer, canvas width/height, and the active persisted/published config first. This is a synchronization defect until proven otherwise.

## Output contract

Deliver, at minimum:

- `SOURCE-AND-COPY.md` — evidence boundary, question ledger, all approved/result-pending text, and unresolved claims.
- `SCORING.md` — dimensions, weights, tie policy, test personas, simulated distribution, and known limits.
- A runnable quiz with formal page, workbench, one shared config, import/export, owner-edit mode, and editable style controls.
- A result export that has been tested on a real browser when the environment permits; otherwise state the exact untested limitation.
- A screenshot/contact sheet of cover, every question variant with dense text, every result type, and every share card before release.
- Validation output from `scripts/validate-persona-quiz.mjs` plus any project-specific browser checks.

## Use the included starter

Create a starter project with:

```bash
python3 scripts/create-project.py /absolute/output/persona-quiz
node scripts/validate-persona-quiz.mjs /absolute/output/persona-quiz
python3 -m http.server 4173 --directory /absolute/output/persona-quiz
```

The server command is for a real browser/manual smoke test, not evidence that the site has been publicly deployed. Do not overwrite an existing project without the user's explicit approval.

## Do not do these things

- Do not call a fandom/role match a psychological diagnosis.
- Do not fabricate factual sources, scene details, psychology citations, or rights to media.
- Do not turn a character prompt into a hidden “correct answer” whose scoring contradicts the apparent behavior.
- Do not use a generic Big Five or MBTI label as a costume for an unrelated scoring system.
- Do not ship text in raster images if the user needs to edit it.
- Do not bind a result card's canvas height to its portrait dimensions.
- Do not replace a user-edited config with defaults on refresh, preview, or export.
- Do not publish, turn on analytics, or upload user assets without authorization.
