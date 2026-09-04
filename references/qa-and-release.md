# QA and release

## Four different passes

Do not collapse these into “looks fine”:

1. **Schema pass:** config parses; ids, vector lengths, and files are valid.
2. **Scoring pass:** test personas produce intended top results; all target results are reachable; distribution policy is reviewed.
3. **Visual pass:** screenshots at actual target widths show no clipping, invisible control, unwanted overlap, orphaned footer, or transparent-padding false collision.
4. **Runtime pass:** start, back, answer selection, retry, owner edit persistence, config import/export, style controls, audio toggle, export preview/download, and analytics events work in a real browser.

Passing one does not imply another.

## Required visual matrix

Capture and inspect:

- cover at narrow and common phone widths;
- every question with its longest prompt/answer set;
- every question scene at its saved position;
- every result type and its share card;
- every visual preset, font-stack choice, and color palette on at least one dense page;
- editor view after an owner moves text, a vector, a PNG, canvas height, and color/effect;
- the same page after refresh, config export/import, and published-config load.

Use screenshots as evidence. Do not decide an object collides solely because its CSS container overlaps another container.

## Release gate

- User-approved copy and assets match the published config.
- Local draft and deploy directory were compared; no stale mirror is being deployed.
- Public analytics are opt-in from the owner's perspective, collect the minimum event data, and have a documented endpoint/retention owner.
- Music, imagery, portraits, logos, and quotations have an identified rights basis or are removed.
- Browser export was manually tested in one desktop browser and one target mobile/browser container when feasible. State any untested platform explicitly.
- Any public deployment, analytics endpoint, or paid service is performed only with owner authorization.
