---
name: katastasi-design
description: Turn a feature + requirements + code into a dev-ready pack (system design, DB changes, ordered tasks, tests, curls).
---

Use to produce the full plan an implementer follows. Needs an AI key (`OPENAI_API_KEY` or `GITHUB_TOKEN`).

Run the wizard:
  `katastasi wizard --feature "<name>" --source <jira|confluence|none> --requirements <pull|new|clean>`
  Add `--db-changes` if the feature touches the database (the AI then enumerates every migration).

It generates, under `.acp/features/<name>/feature-pack.html` (+ markdown, + optional Confluence):
- a system + per-use-case data-flow mermaid diagram,
- a "Database / migration changes" checklist (when --db-changes),
- dependency-ordered tasks, each with inline code/Jira/Confluence context,
- unit/e2e/acceptance test stubs + ready-made curls.

The developer opens the HTML, reads the diagram, approves the tasks, runs the curls, ticks verify.
MCP equivalent: `feature_wizard`.
