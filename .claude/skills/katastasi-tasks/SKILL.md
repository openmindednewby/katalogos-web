---
name: katastasi-tasks
description: Manage the local markdown task board (.acp/tasks): add / list / status / board.
---

Use to track work locally in markdown, linked to requirements.

- Add:  `katastasi task add "Implement login" --req PROJ-1`
- Move:  `katastasi task set TASK-1 done`
- Board:  `katastasi task board`  (→ .acp/BOARD.md)
- Honesty check:  `katastasi task verify --fail-on drift`  (a "done" task whose requirements aren't verified fails)

MCP equivalents: `task_add`, `task_list`, `task_set_status`, `task_board`.
