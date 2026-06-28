---
name: katastasi-test
description: Run requirement-first acceptance tests (HTTP + CLI) and feed results to trace.
---

Use to verify a requirement with an executable acceptance test instead of (or alongside) a unit test.

- Run them:  `katastasi test`  (runs `.acp/tests/*.acp.{json,yml,md}` + inline `\`\`\`acp-test` blocks → JUnit)
- One requirement:  `katastasi test --req PROJ-1`
- Then fold into status:  `katastasi trace`

Author a spec inline under a requirement, terse:  `POST /login {"u":"x"} -> 401`  or as JSON for chained/captured cases. `katastasi wizard` / `analyze` also generate these.
MCP equivalent: `test_run`. Full guide: docs/ACCEPTANCE.md.
