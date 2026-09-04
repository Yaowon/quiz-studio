#!/usr/bin/env python3
"""Copy the dependency-free editable quiz starter into a new empty directory."""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path


SOURCE_AND_COPY = """# Source and Copy Ledger

## Scope and audience

- Intended use:
- Audience:
- Non-diagnostic boundary:

## Sources

| ID | Claim or inspiration | Primary source URL or owner-provided material | Status |
| --- | --- | --- | --- |
| S01 |  |  | pending |

## Result profiles

| Result ID | Public name | Observable traits | Approved copy |
| --- | --- | --- | --- |
|  |  |  | no |

## Copy approval

- [ ] Cover copy approved
- [ ] Every question and answer approved
- [ ] Every result page and share-card copy approved
"""

SCORING = """# Scoring Notes

## Dimensions

Define 4–8 observable dimensions. Do not use clinical labels unless the project has the required professional basis.

| Dimension | What a high score means | What a low score means | Evidence source |
| --- | --- | --- | --- |
|  |  |  |  |

## Calibration cases

Each named intended profile must have an explicit answer path and expected result.

| Case | Answers | Expected result | Verified |
| --- | --- | --- | --- |
|  |  |  | no |

Run `node scripts/validate-persona-quiz.mjs .` before visual QA.
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path, help="new or empty destination directory")
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / "assets" / "starter"
    destination = args.destination.expanduser().resolve()
    if destination.exists() and any(destination.iterdir()):
        raise SystemExit(f"Refusing to overwrite non-empty directory: {destination}")
    destination.mkdir(parents=True, exist_ok=True)
    for item in source.iterdir():
        target = destination / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)
    (destination / "SOURCE-AND-COPY.md").write_text(SOURCE_AND_COPY, encoding="utf-8")
    (destination / "SCORING.md").write_text(SCORING, encoding="utf-8")
    print(f"Created editable persona quiz starter: {destination}")


if __name__ == "__main__":
    main()
