# Model portability

## Core protocol

The workflow is portable because its required artifacts are plain files:

`SOURCE-AND-COPY.md`, `SCORING.md`, `quiz-config.js`, the static runtime, exported config JSON, screenshots, and validator output. An agent must preserve the contracts even if it cannot use the same tools.

| Capability | Preferred action | Safe fallback |
|---|---|---|
| Web research | search primary sources, then corroborate | ask user for corpus; label source gaps instead of inventing |
| Code/files | use included starter and validator | provide exact files/patches for a human to save and run |
| Image generation | offer reference-aware transparent assets after approval | ask user for assets; use placeholders with clear swap points |
| Browser automation | capture real screenshots and interaction checks | give a manual test checklist; never claim runtime passed |
| Audio processing | extract/transcode user-supplied audio locally | ask for MP3/OGG/WebM and provide placement instructions |
| Hosting/analytics | use owner-approved provider and document endpoint | keep static-only release and leave events disabled |

## Platform adapters

- **Codex / Cursor / Claude Code:** install or point project instructions to this directory; run the supplied scripts locally.
- **ChatGPT / Claude / Gemini chat:** upload or paste `SKILL.md`, selected references, and the starter files; ask it to emit changes as explicit file patches. A human runs validation and browser QA.
- **No code execution:** use the research, copy, and scoring workflow; defer claims of a working site until a developer runs the starter and checks it.

Never hide a missing capability behind model-specific language such as “I tested it” when only static inspection was possible.
