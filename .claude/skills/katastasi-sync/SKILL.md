---
name: katastasi-sync
description: Sync local .acp/tasks with Jira / GitHub issues, bidirectionally and conflict-safe.
---

Use to reconcile local tasks with their Jira/GitHub issues (e.g. after merging work, to flip status).

1. Preview (never writes):  `katastasi sync`
2. Apply the safe changes:  `katastasi sync --apply`  (pushes local-only edits, pulls remote-only, flags conflicts)
   - one direction only:  `--push-only` / `--pull-only`
   - just one binding:  `--binding <id>`
3. If conflicts are reported, open `.acp/sync/conflicts/<binding>/<id>.md`, edit the local task (or the remote) to the intended value, then re-run `katastasi sync --apply`.

Status round-trips via the binding's `statusMap` (e.g. local `done` ⇄ GitHub `closed`). Creds: `GITHUB_TOKEN` / `JIRA_*` in `.env`. Config: the `sync` block in `acp-trace.json`.
MCP equivalents: `sync_preview`, `sync_apply`.
