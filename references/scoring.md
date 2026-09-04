# Scoring and reachability

## A transparent default

Represent each answer as a vector across a small set of named dimensions. Represent each result profile as another vector. Sum selected answer vectors, normalize where appropriate, and rank profiles by similarity or weighted distance. Keep the mapping in the config, not scattered through click handlers.

Use anchors only for genuinely discriminating canonical behaviors. Anchors must be visible in the score ledger and must not secretly override every other answer.

Define a tie policy before launch: show a primary plus secondary role, use a declared deterministic tie-break, or ask one extra differentiating question. Never use unseeded randomness to decide a tie if users expect repeatable results.

## Required checks

1. Every question has the expected number of answer weights; every vector has the same dimension length.
2. Every result profile has a test persona: a selected answer sequence that should rank it first.
3. For each test persona, record the expected top result and expected runner-up if relevant.
4. Run a random or stratified simulation. If a result is unreachable or materially rarer than intended, inspect weights and anchors rather than adding a hidden multiplier.
5. Read each question as a user: a person selecting obvious behaviors associated with a result should not repeatedly land on a contradictory type.
6. Version scoring separately from visual layout. A user moving an illustration must not alter scores.

## Distribution target

Equal probabilities are not automatically correct. Choose one policy explicitly:

- **Natural distribution:** keep observed differences and disclose that some results are rarer.
- **Balanced entertainment distribution:** tune questions/weights until each intended role is plausibly reachable; do not randomize the final winner just to force equality.
- **Editorially weighted:** document intentional prevalence and the rationale.

The included validator checks profile reachability against deterministic test cases and can run a seeded simulation. It cannot prove psychological validity or audience enjoyment.
