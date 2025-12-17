# AGENTS.md — AnamSoft working agreements

## Non-negotiable rules
- READ FIRST: Before any edits, scan relevant files and summarize current behavior + list files touched.
- Prisma schema is source of truth: verify fields/status enums in prisma/schema.prisma. Never invent fields.
- No feature inflation: do not add new columns/buttons/options unless requested and wired to working APIs.
- Remove dead code/UI: if a button/option is not connected to a real API, remove it or disable it with a clear reason.
- Minimal diff: prefer small safe changes over rewrites.

## Verification
- After changes, run the project’s existing checks (lint/typecheck/tests) using the repo’s package manager.
- If tests fail, fix them before finishing.

## Output format
- List “Files changed”
- Short summary of what was kept, removed, and why
