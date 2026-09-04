# Alignment protocol / 对齐协议

中文：这个协议来自移动端测试制作中反复出现的问题：工作台排对了，正式页却错；为了解决一个遮挡，反而弄坏一整页；导出、截图和部署各自读取了不同状态。它的目的不是替代审美判断，而是把人和 AI 的反复对齐固定到可检查的步骤里。

English: This protocol keeps an owner, an agent, a workbench, the production renderer, export, and deployment aligned. It does not make aesthetic decisions for the owner. It makes visual changes traceable and prevents a local repair from silently changing unrelated approved work.

Read this before the first visual edit, after importing owner edits, and whenever two views disagree.

## 1. Freeze an accepted baseline

Before any visual repair, capture the approved screen(s) at the target viewport and record:

- page/result id, canvas width and height, and viewport width;
- the active config file or exported payload identity (version or hash);
- which layer is being changed and which layers are locked;
- the acceptance observation, not only a description such as “make it nicer”.

If there is no accepted baseline, ask for one screenshot or one explicitly approved workbench state. Do not guess which prior layout the owner meant.

## 2. Use one visible source of truth

The workbench, formal page, share-card exporter, and deploy bundle must state which config they are using. A useful minimum is:

```text
config version/hash: …
canvas: 393 × 852 CSS px
source: template | local draft | imported review config | published config
```

`localStorage` is a draft cache, not publishing authority. Export/import the reviewed config and publish that exact artifact. A URL snapshot parameter must never silently replace an owner draft. When the workbench is correct and the formal page is wrong, treat it as a synchronization problem until the config identity, renderer, and coordinate contract are proven equal.

## 3. Keep a coordinate contract

For every consumer of a layout config, define and preserve the same:

- canvas width/height and CSS-pixel unit;
- anchor (`left/top`, `right/top`, centre, or a named parent layer);
- transform order and origin;
- responsive scale rule and font-loading behavior;
- z-index and clipping parent.

Do not “fix” a mismatch with a second set of coordinates for the formal page. That makes the next user edit impossible to reason about. An image's DOM box is not necessarily its painted content: SVG viewBox padding and transparent PNG pixels must be inspected before declaring a collision.

## 4. Make one bounded visual change

Turn feedback into a change ticket before editing:

```text
Screen: q07 at 393px
Layer: scene-train
Change: y only, -12px
Preserve: x, scale, prompt text, options, card height
Accept: painted train clears the blue prompt by at least 8px
```

Apply the smallest delta to that layer. Do not globally move scenes to one corner, normalize all type, stretch page height, or change a container rule to repair one collision. Screenshot the named page again, then compare the untouched baseline pages before making a second change.

Colored prompt lines must remain separate layers. Route/context, lead, choice, contrast, each option, tip, image, vector, and footer need stable ids; a request to align red and blue text means copy only the requested axis between those ids.

## 5. Treat page flow and media as independent

Canvas height, media dimensions, options, footer, safe areas, and progress must have independent rules. Avoid `margin-top:auto`, a fixed `bottom`, or an art-dependent height for editable pages. A change in one must not silently move or resize another.

For media, let the owner move art across the whole page. Collision warnings may report a likely overlap, but never auto-move an approved layer. Use painted pixels/alpha bounds for selection and collision review, not a transparent outer rectangle.

## 6. Make transitions state-safe

Answer and editor events must carry their immutable source id:

```js
choose(questionId, answerId)
moveLayer(pageId, layerId, delta)
```

Never resolve an old event through a mutable `currentQuestion` or `currentLayer`. During a touch/click transition, prevent duplicate/stale input until the next page is mounted. The next page starts with no selected option unless its own stored answer exists; returning to a prior page may intentionally show that page's selection.

This is especially important on mobile, where a DOM replacement can occur before the final event of the original tap has finished.

## 7. Verify the same artifact users receive

Do not call a layout accepted because config parsing or a desktop preview passed. Run four distinct checks:

1. config/schema;
2. scoring/calibration;
3. target-width screenshots of cover, every dense question, every result, and every share card;
4. real interactions: start, back, answer transition, retry, owner edit persistence, import/export, audio toggle, share preview, and user-clickable download.

For image export, create a visible preview before asking the browser to download or share. Keep a user-clickable link or long-pressable preview as fallback. Final assets must be same-origin or CORS-enabled before Canvas draws them.

Before publishing, compare the deploy payload with the approved source config and verify it after deployment. A local server is evidence of a local smoke test, not evidence that the public URL is current.

## 8. Escalation order when something is wrong

1. Reproduce it on the target-width formal renderer.
2. Compare config identity, canvas/viewport, and computed layer transforms.
3. Inspect painted media bounds and clipping before moving art.
4. Check event ids and transition timing before changing selected-state CSS.
5. Make one bounded layer/config repair.
6. Re-capture the named screen plus cover, first question, and one result as regression guards.
7. Only then update the approved export/deploy artifact.

If a required piece of owner intent is missing, stop at the relevant gate and ask for that single decision rather than redesigning the page.
