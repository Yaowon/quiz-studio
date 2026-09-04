# Reuse check: visual-editor and image-export projects

This comparison is deliberately narrow: a vertical, highly art-directed quiz with a fixed family of pages is not the same product as a general website builder.

| Project | Solves | Architecture/dependencies | What is worth reusing | Why it is not the default starter |
| --- | --- | --- | --- | --- |
| [GrapesJS](https://github.com/GrapesJS/grapesjs) | Generic CMS/template editing with blocks, layers, styles and assets | Full browser web-builder framework; own component/style/storage model; BSD-3-Clause | Its separation of asset, layer and style panels | It gives an art-directed quiz a second rendering model and a much larger editing surface than needed. Use it only if arbitrary blocks/templates are explicitly the product. |
| [Craft.js](https://github.com/prevwong/craft.js) | Custom React drag-and-drop editors with serialized editor state | React-only component framework; `@craftjs/core` + user components; MIT | JSON-serializable state and custom editor UI | A good escalation route for an existing React product, but unnecessary for a portable HTML/JS starter. |
| [tldraw](https://github.com/tldraw/tldraw) | Infinite canvas drawing/whiteboard interaction | SDK plus a production license-key path | Its direct-manipulation interaction ideas | The default SDK license is not the permissive, no-account production default required by this open kit. Only use if a real infinite canvas is required and licensing is consciously accepted. |
| [html2canvas](https://github.com/niklasvh/html2canvas) | DOM-to-canvas approximation in the browser | Client-side DOM/style parser; MIT | A possible experimental fallback for non-critical exports | Its README says it recreates DOM rather than taking a native screenshot, and cross-origin assets remain constrained. It cannot be the source of truth for a share card. |

## Decision

The included starter uses native DOM/CSS for the formal page, Pointer Events for direct manipulation, `postMessage` for the embedded formal renderer, `localStorage` plus import/export JSON for drafts, and Canvas for a deterministic share-card renderer. It has no runtime package dependency.

Escalate to Craft.js only when the host product is already React and needs user-defined component trees. Escalate to GrapesJS only for a true general-purpose page builder. Do not adopt an infinite-canvas SDK just to move a portrait on a portrait-format mobile page.
