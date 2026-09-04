# Architecture and workbench

## One config, four consumers

Use one versioned config for:

1. the formal quiz page;
2. the workbench preview;
3. the saved draft/import-export payload;
4. the share-card exporter.

The workbench must embed the formal page in an iframe and update it with `postMessage`. The formal renderer replies with selection events. This avoids the most expensive failure: a workbench that looks correct while its published page interprets dimensions, text blocks, or art positioning differently.

`localStorage` is only a draft cache. Export/import config for review. Publish only after the owner approves an exported config. Do not let a `snapshot` query parameter silently ignore owner edits.

## Layout model

Every element is a layer with a stable id and this minimum shape:

```js
{
  id: 'question-choice',
  type: 'text', // text | image | vector | group | option
  text: '...',
  x: 8, y: 34, width: 82, height: 12, // percentage of the page canvas
  scale: 1, rotate: 0, z: 3,
  style: { fontSize: 28, letterSpacing: 0, color: '#111111', effect: 'none' }
}
```

- Each page has `canvas.height` independent from every media layer.
- A question's route, prompt lead, prompt choice, prompt contrast, each option, tip, and scene asset are separate layers. Alignment tools may copy only the requested axis.
- The options group needs explicit `x`, `y`, `width`, `gap`, and item-height rules. Do not use `margin-top:auto` when page height is editable.
- Give images a visible-content-aware selection method. SVG can use `pointer-events: visiblePainted`; for PNGs, show the actual alpha/visible bounds during editing or let the owner use a supplied visible-bounds crop. Never treat transparent padding as a collision.
- Let all media move across the whole page. Do not special-case a “top-right icon zone”.

## Editable visual system

The workbench is a small art-direction console, not an image generator. Use native controls and CSS, which are portable and cheap:

```js
theme: {
  preset: 'editorial-paper',
  palette: { paper:'#FFF8EC', ink:'#171717', accent:'#D95A4E', secondary:'#567C9E' },
  typography: { display:'system-black', body:'system-sans', scale:1, tracking:0 },
  treatment: { radius:18, border:1, shadow:'soft', texture:'none' }
}
```

Provide:

- 3–5 CSS-only style presets (for example editorial paper, bright pop, quiet film, monochrome poster) that alter variables, never copy content;
- a native color input/color wheel plus palette swatches;
- a font-stack menu with browser-safe defaults, plus an optional owner-supplied WOFF/WOFF2 slot; do not scrape or embed fonts without a licence;
- typography scale, line-height, letter-spacing, radius, border, gradient/noise opacity, and safe effect choices (`none`, `outline`, `soft-shadow`, `hard-shadow`, `blur`);
- per-layer overrides that remain editable after changing a global preset.

Generated PNG art is optional. The model can suggest art directions and prompts, but final portraits, logos, lettering, music, and other identity assets should be supplied/approved separately and referenced by the config.

## Inspector requirements

The workbench needs:

- page selector and question/result selector;
- clickable layer list and direct selection in the formal iframe;
- drag position, numeric x/y, width/height, scale, rotation, z-index;
- editable text and per-layer font size, line-height, letter spacing, color;
- asset URL/relative-path field and image/vector controls; add an uploader only when the host has an approved asset-storage policy;
- page canvas height independent of all layers;
- the visual-system controls above;
- undo/redo or, at minimum, export/import and a clear reset-to-template action;
- a collision warning that reports overlap but never auto-moves user-approved layers.

## Export and media

Use a deterministic share-card renderer driven by the same profile/copy data and an explicit `pages.share` layer list. A share card may have different approved coordinates from the long result page, but it must not read stale or separate copy. Put `pages.share` in the same workbench page selector so its title, portrait, body, colors, and canvas are edited before export.

Programmatic `a.click()` after asynchronous canvas/image work is not a reliable download guarantee. Always show a visible generated image plus a user-clickable download link. On mobile, offer the native share sheet only after the file exists; if unavailable, retain the preview for long press/save.

Music should be an optional user-supplied asset, preloaded without audible autoplay, looped only when requested, and controlled by an accessible top-bar toggle.
