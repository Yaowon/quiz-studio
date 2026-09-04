# Failure atlas: symptom to smallest fix

Use this before moving a layer “until it looks right”. Confirm the failure class with evidence first.

| Symptom | Likely root cause | Evidence to collect | Smallest safe fix |
|---|---|---|---|
| Workbench is right; formal page is wrong | Two renderers, two configs, stale snapshot, or different canvas math | Config version/hash and computed canvas width/height in both views | Embed the formal renderer in the workbench; make config identity visible; remove stale override |
| Moving a workbench item changes nothing after refresh | Draft was saved only in an in-memory object or a query snapshot wins over local draft | Reload with config version displayed | Persist draft, export/import it, and make source priority explicit |
| Editor can move PNG but visual collision is misdiagnosed | Transparent PNG padding is treated as visible pixels | Alpha bounds or an image with background checkered | Use visible bounds/crop overlay; do not auto-move based on outer box |
| Scene art always returns to the corner | Shared CSS rule or renderer default overrides per-question config | Computed `top/right/transform` and active layer values | Delete the default positional rule; render x/y from the selected layer only |
| Changing page length does not move options/footer correctly | `margin-top:auto`, a fixed `bottom`, or art size is coupled to page height | Inspect layout rules before drag edits | Give option area/footer/page height separate config properties |
| Red, blue, and context text cannot be independently aligned | Text was merged into one DOM node/layer | Layer list has one prompt item instead of three | Store/render each semantic line as a separate layer; align only the requested axis |
| User asks to nudge one object and the whole page changes | Global normalization, responsive rescale, or a broad selector | Diff the config; compare untouched layer ids | Revert unrelated changes and apply a single-layer delta only |
| Buttons suddenly do nothing | Earlier JavaScript parse/runtime failure prevented event registration | Browser console; `node --check`; script end location | Fix the first boot error; then test the actual interaction, not just markup |
| Back button is absent or unclickable | It is conditionally hidden, under a z-index layer, or covered by an editor overlay | DOM visibility, hit test, z-index | Restore explicit back state and pointer access; do not rely on empty space |
| Save image appears to do nothing on desktop | Async rendering lost user activation or download was silently blocked | Does canvas/blob exist? Is a preview visible? | Always expose generated preview and a real user-clickable download link |
| Share image differs from final copy | Exporter reads a separate/stale object | Compare copy ids and config versions in both output paths | Drive export from the same text/profile config; keep separate layout only if explicit |
| Music is silent or fails on mobile | Audible autoplay is blocked | Test after a real tap; inspect `play()` promise | Start muted/off; enable only from a button, handle rejected play |
| Cloud deploy is older than local | Mirror directory or build output was not synced | File hashes before deploy | Diff/hash source and deploy payload; deploy only after owner approval |
| “Validation passed” but text still overlaps | Schema/scoring validation was mistaken for visual QA | Target-width screenshots | Run the visual matrix and list any remaining overflow/collision |

## Communication accelerator

Ask for feedback in this format whenever the user can see the page:

```text
Screen: q07 at 393px
Element: scene-train
Change: x only, -12px
Preserve: y, scale, all text, card height
Accept: visible artwork clears the contrast line; no new overlap
```

This prevents an agent from turning a one-axis nudge into a global re-layout.
