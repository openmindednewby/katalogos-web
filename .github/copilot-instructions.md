# Copilot instructions

<!-- katastasi:start -->
## Katastasi

Katastasi is a local-first documentation / task-tracking / testing toolkit (CLI `katastasi`, aliases `kat`/`acp`, + an MCP server). Everything stays in this repo's `.acp/` markdown; Jira/Confluence/GitHub are optional projections. Drive it with these actions:

- **Onboard** — pull requirements from Jira/Confluence/markdown:  `katastasi trace pull-requirements`
- **Design** — feature → system design + DB changes + ordered tasks + tests + curls:  `katastasi wizard --feature "X" [--db-changes]`
- **Sync** — tasks ⇄ Jira/GitHub issues (status round-trips):  `katastasi sync` (preview) → `--apply`
- **Trace** — which requirements are verified now:  `katastasi trace [--run]`
- **Test** — requirement-first acceptance tests:  `katastasi test`
- **Tasks** — local board:  `katastasi task add/set/board`

Credentials live in `.env` (`JIRA_*` / `CONFLUENCE_*` / `GITHUB_TOKEN`) — see docs/SOURCES_SETUP.md. Prefer the MCP tools (requirements_trace, feature_wizard, sync_preview/sync_apply, test_run, task_*) when available.
<!-- katastasi:end -->
