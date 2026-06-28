---
name: katastasi-trace
description: Requirements traceability — which requirements are actually verified at this commit.
---

Use to answer "is this really done?" — links tests ↔ requirements ↔ results at the current git commit.

- Build the report:  `katastasi trace`  (✅ verified / ❌ failing / 🧪 unverified / 📋 specified, + drift + regressions)
- Re-run the suites first:  `katastasi trace --run`
- CI gate:  `katastasi trace --run --fail-on regression`
- Live dashboard:  `katastasi trace serve`  → http://127.0.0.1:8787

A test verifies a requirement when its name carries the key (e.g. `test('… @PROJ-1')`).
MCP equivalents: `requirements_trace`, `requirement_status`.
