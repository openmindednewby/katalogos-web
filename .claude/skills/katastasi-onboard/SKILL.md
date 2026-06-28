---
name: katastasi-onboard
description: Pull requirements from Jira / Confluence / markdown into the local .acp store.
---

Use when a developer is starting on a feature and the requirements live in Jira/Confluence (or markdown).

Steps:
1. Make sure `acp-trace.json` lists the requirement sources (a Jira epic, a Confluence page id, or a markdown file). Creds come from `.env` (`JIRA_*` / `CONFLUENCE_*`); if missing run `katastasi wizard check --source both`.
2. Pull them locally:  `katastasi trace pull-requirements`  → writes `.acp/requirements/`.
   (Or pull a specific tree:  `katastasi pull-jira PROJ-12 ./out`  /  `katastasi pull-confluence 123456 ./out`.)
3. Confirm what came down:  `katastasi trace --no-save`  (lists requirements + status).

MCP equivalent: `pull_requirements`.
