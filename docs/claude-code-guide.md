# How to Use Claude Code in This Project

> A practical guide for developers on the team. Covers setup, daily workflows, slash commands, agents, and how to get the best results.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Where to Run Claude Code](#2-where-to-run-claude-code)
3. [Operational Modes](#3-operational-modes)
4. [Slash Commands (Quick Actions)](#4-slash-commands-quick-actions)
5. [Working with Agents](#5-working-with-agents)
6. [Skills (On-Demand Knowledge)](#6-skills-on-demand-knowledge)
7. [MCP Integrations](#7-mcp-integrations)
8. [The Development Lifecycle](#8-the-development-lifecycle)
9. [Prompt Engineering — Getting Good Results](#9-prompt-engineering--getting-good-results)
10. [Task Documentation](#10-task-documentation)
11. [Cost Management](#11-cost-management)
12. [Hooks (Automatic Guardrails)](#12-hooks-automatic-guardrails)
13. [Troubleshooting](#13-troubleshooting)
14. [Quick Reference](#14-quick-reference)

---

## 1. Getting Started

### Prerequisites

- **Claude Code CLI** installed and in PATH (`claude --version` to verify)
- **Claude Pro subscription** (or better)
- **Node.js** and **npm** installed (for MCP servers and frontend tooling)
- **Chrome browser** (for visual QA via the Chrome MCP extension)

### First-Time Setup

1. Open a terminal and navigate to the project root:
   ```bash
   cd C:\desktopContents\projects\SaaS
   ```

2. Claude Code will automatically discover:
   - `CLAUDE.md` — project-wide instructions
   - `.claude/` — agents, skills, commands, settings
   - `.mcp.json` — MCP server connections (Tilt, Chrome)
   - `.claudeignore` — files excluded from AI context

3. Start Claude Code:
   ```bash
   claude
   ```

4. On first run, approve any commands Claude needs. Approved commands are saved in `.claude/settings.local.json` (not committed to git).

### Project Structure at a Glance

```
SaaS/
├── CLAUDE.md                    # Project instructions (loaded every session)
├── .claude/
│   ├── settings.json            # Shared permissions & hooks (committed)
│   ├── settings.local.json      # Your local permissions (NOT committed)
│   ├── agents/                  # 8 specialized AI agents
│   ├── skills/                  # 8 reference knowledge modules
│   └── commands/                # 4 slash commands
├── .mcp.json                    # MCP server config (Tilt + Chrome)
├── .claudeignore                # Files excluded from AI context
├── BaseClient/                  # React Native/Expo frontend
├── Services/                    # C# backend services
└── E2ETests/                    # Playwright E2E tests
```

---

## 2. Where to Run Claude Code

**Always start from the repository root** (`SaaS/`). Starting from a subdirectory means Claude loses access to agents, skills, commands, and project-wide instructions.

| Mode | How | Best For |
|------|-----|----------|
| **IDE (VS Code)** | Open `SaaS/` as workspace, use Claude Code panel | Daily coding, inline diffs, quick iteration |
| **CLI (Terminal)** | `cd SaaS && claude` | Long-running tasks, parallel agents, background work |
| **Visual Studio** | Install the [Claude Code Extension](https://marketplace.visualstudio.com/items?itemName=dliedke.ClaudeCodeExtension) | .NET backend work in Visual Studio 2022/2026 |

**Pro tip**: Run CLI in a separate terminal while using the IDE. Use CLI for heavy agent work (full-stack features, regression tests) while the IDE handles your current editing.

---

## 3. Operational Modes

| Mode | What It Does | When to Use |
|------|-------------|-------------|
| **Default** | Asks before edits and non-allowed commands | Normal development, first time in unfamiliar code |
| **Plan mode** | Read-only analysis, no changes | Scoping large tasks, understanding impact, architecture decisions |
| **Auto-accept** | Applies file edits silently, still checks command permissions | Well-scoped tasks, bulk fixes, after reviewing a plan |
| **Bypass permissions** | Runs ALL commands without asking | Disposable environments only — never on real code |

```bash
# Plan mode — analyze without changing anything
claude --plan "refactor the authentication flow"

# Auto-accept — trusted task, will review git diff after
claude --auto-accept "fix all lint errors in BaseClient"
```

**Recommendation**: Use **plan mode first** for any task spanning 10+ files or multiple services. The cost of a 30-second plan review is always less than undoing a bad refactor.

---

## 4. Slash Commands (Quick Actions)

Slash commands are shortcuts for common workflows. Type them directly in Claude Code.

| Command | What It Does |
|---------|-------------|
| `/review` | Reviews recent code changes, auto-splits by domain, runs code-reviewer agents in parallel |
| `/quality-check` | Runs full quality gate (lint, YAGNI, tests, build) for all affected domains |
| `/new-feature` | Creates a task document, analyzes requirements, generates an implementation plan |
| `/deploy-check` | Comprehensive pre-deployment verification across frontend, backend, and E2E |

### Example Usage

```
You: /review
Claude: Detected changes in BaseClient/ and Services/Identity/...
        Launching code-reviewer (frontend) + code-reviewer (Identity) in parallel...

        ## Code Review Report
        | Domain   | Verdict        | Issues |
        |----------|----------------|--------|
        | Frontend | REVIEW_PASSED  | 0      |
        | Identity | REVIEW_FAILED  | 2      |

        ### Issues Found
        - [HIGH] IdentityService.cs:42 — Missing tenant filter on query
        - [MEDIUM] UserDto.cs:15 — Property should be init-only
```

### Available Skills (invoked with `/skill-name`)

| Skill | When to Use |
|-------|-------------|
| `/task-doc` | Starting a new task — creates documentation template |
| `/verify` | After code changes — lists all verification commands |
| `/testing` | Writing tests — unit vs E2E philosophy |
| `/lint-rules` | Writing/reviewing code — ESLint and size limits |
| `/lifecycle` | After ANY code change — full pipeline reference |
| `/tilt` | Working with the dev environment — ports, resources |
| `/deps` | Checking dependencies — security, outdated, licenses |
| `/parallel` | Multi-domain work — agent coordination strategy |
| `/frontend-design` | Creating UI — high-quality design principles |

---

## 5. Working with Agents

Agents are specialized AI team members that Claude delegates work to. You don't invoke agents directly — Claude decides which agent to use based on your request.

### Available Agents

| Agent | Model | Role | Invoked When You Say... |
|-------|-------|------|------------------------|
| `frontend-dev` | opus | React/Expo UI, components, hooks, unit tests | "Add a button to...", "Fix the dashboard layout" |
| `backend-dev` | opus | C# APIs, services, database, unit tests | "Create an endpoint for...", "Fix the 500 error in..." |
| `chief-architect` | opus | System design, architectural decisions | "Should we use X or Y?", "Design the payment system" |
| `regression-tester` | opus | Playwright E2E tests | "Run E2E tests", "Write tests for the new feature" |
| `visual-qa` | opus | Browser testing — visual, responsive, a11y | "Check how the page looks", "Run visual QA" |
| `quality-gate` | sonnet | Lint, YAGNI, unit tests, build verification | Auto-invoked by `/quality-check` and lifecycle |
| `code-reviewer` | sonnet | Standards compliance review | Auto-invoked by `/review` and lifecycle |
| `tilt-ops` | sonnet | Tilt environment — restart services, read logs | "Restart identity-api", "Check tilt errors" |

### How Agents Work Together

For a full-stack feature, Claude orchestrates agents like this:

```
1. PARALLEL — Implementation:
   ├── frontend-dev: builds the UI
   └── backend-dev: builds the API

2. PARALLEL — Verification (6 agents):
   ├── quality-gate (frontend)    ├── code-reviewer (frontend)
   ├── quality-gate (backend)     ├── code-reviewer (backend)
   └── regression-tester

3. SEQUENTIAL — Visual QA (if UI changes):
   └── visual-qa: browser testing at 3 breakpoints

4. AGGREGATION → LIFECYCLE_PASSED or LIFECYCLE_FAILED
```

### Scoping Your Requests

The more specific your prompt, the better the agent performs:

```
# Vague — agent has to guess
"Fix the bugs"

# Scoped — agent knows exactly where to look
"In Services/Identity/Application/Commands/CreateUser/, the handler
throws NullReferenceException when the email already exists.
Return Result.Conflict instead."
```

---

## 6. Skills (On-Demand Knowledge)

Skills are reference documents that Claude loads into context when relevant. Unlike agents, skills don't do work — they provide knowledge.

**Auto-loaded**: Skills like `lint-rules`, `testing`, and `lifecycle` are automatically loaded when Claude detects a relevant task (writing code, running tests, completing work).

**Manually loaded**: Skills like `deps` are only loaded when you explicitly ask (`/deps`).

---

## 7. MCP Integrations

MCP (Model Context Protocol) extends Claude's capabilities beyond files and terminal.

### Tilt (Dev Environment)

Claude can manage your Tilt development environment:

```
You: "Restart identity-api and check if it's healthy"
Claude (tilt-ops): Uses mcp__tilt__trigger_and_wait → identity-api
                   Result: healthy in 45s
```

### Chrome (Visual QA)

Claude can interact with a real browser for visual testing:

```
You: "Check how the dashboard looks at mobile breakpoint"
Claude (visual-qa): Navigates to localhost:8082
                    Screenshots at 375px width
                    Checks console for errors
                    Reports: QA_PASSED
```

**Setup**: Install the Claude Code Chrome Extension from the Chrome Web Store. The MCP server is already configured in `.mcp.json`.

---

## 8. The Development Lifecycle

**Every code change must complete this pipeline.** This is enforced by the `CLAUDE.md` instructions and the `/lifecycle` skill.

```
Code Change
    │
    ├──> quality-gate (per domain, parallel)     ← ALWAYS
    ├──> code-reviewer (per domain, parallel)    ← ALWAYS
    │         │
    │         ▼ ALL pass?
    │
    ├──> visual-qa (browser testing)             ← If UI/API changes
    │         │
    │         ▼ Passes?
    │
    ├──> regression-tester (E2E Playwright)       ← If UI/API changes
    │         │
    │         ▼ Passes?
    │
    └──> LIFECYCLE_PASSED — Task complete!
```

### When to Skip Stages

| Stage | Always Run? | Skip When? |
|-------|------------|------------|
| Quality Gate | **Always** | Never |
| Code Reviewer | **Always** | Never |
| Visual QA | UI or API changes | Backend-only internal refactoring |
| Regression Tests | UI or API changes | Backend-only internal refactoring |

### Failure Handling

When a stage fails, Claude doesn't restart the whole pipeline:
1. Routes the failure to the responsible agent
2. The agent fixes the issue
3. Only the failed stage is re-run
4. Pipeline continues from where it left off

---

## 9. Prompt Engineering — Getting Good Results

### The Specificity Spectrum

| Level | When to Use | Example |
|-------|------------|---------|
| **Goal-oriented** | Exploratory, debugging | "The login page shows blank after submit — investigate and fix" |
| **Scoped** (sweet spot) | Most implementation | "In `UserService.cs`, `GetByEmail` throws when user doesn't exist. Return `Result.NotFound`" |
| **Prescriptive** | Known exact change | "Add a null check on line 42 of `UserService.cs` before accessing `user.Email`" |

### Prompt Templates

**Bug fix**:
```
Bug: [symptom]
Location: [file path or component]
Steps to reproduce: [how to trigger]
Expected: [what should happen]
Actual: [what happens instead]
```

**New feature**:
```
Feature: [name]
Context: [why it's needed]
Requirements:
1. [specific requirement]
2. [specific requirement]
Reference: [similar existing feature to follow]
```

**Refactoring**:
```
Refactor: [what needs to change]
Reason: [why — performance, readability, pattern compliance]
Scope: [which files/modules]
Constraints: [what must NOT change]
```

### Anti-Patterns to Avoid

| Don't | Do |
|-------|----|
| "Fix all the bugs" | "Fix the NullReferenceException in UserService.GetByEmail" |
| "Update the tests" | "Add unit tests for DuplicateTemplateCommand: success, not found, duplicate name" |
| "Fix login bug, update dashboard, check CI" | Three separate prompts, one task each |
| "Continue where we left off" | "In our last session we found a race condition in NotificationService.SendAsync..." |
| "Add search to the list" | "Add search: debounced 300ms, by name+description, 'No results' empty state, min 2 chars" |

### Advanced Techniques

**Iterative refinement** — start broad, then narrow:
```
Prompt 1: "Investigate why the dashboard API is slow"
[Claude reports N+1 query in GetDashboardWidgets]
Prompt 2: "Refactor GetDashboardWidgets to use eager loading with Include()"
```

**Pattern reference** — point to existing implementations:
```
"Create DeleteTemplateCommand following the exact pattern in
Services/TemplateService/Application/Commands/CreateTemplate/"
```

**Negative constraints** — prevent unwanted changes:
```
"Add input validation to the registration form.
Do NOT change the layout or styling.
Do NOT add new dependencies."
```

---

## 10. Task Documentation

For non-trivial work, create a task document before starting. Use `/task-doc` for the full template.

### Task Lifecycle

```
docs/Tasks/
├── TODO/            # Planned but not started
├── IN_PROGRESS/     # Actively being worked on
├── COMPLETED/       # Finished with full audit trail
└── BLOCKED/         # Waiting on external input
```

### Quick Start

```
You: /new-feature Add bulk export for templates

Claude: Created task doc at docs/Tasks/IN_PROGRESS/add-bulk-export-feature.md

        Implementation Plan:
        1. backend-dev: POST /api/templates/export endpoint
        2. frontend-dev: Export button + progress indicator
        3. quality-gate + code-reviewer (parallel)
        4. regression-tester: E2E test for export flow

        Ready to proceed?
```

---

## 11. Cost Management

Claude Code usage is metered by tokens. Key strategies to keep costs reasonable:

### Model Optimization (Already Configured)

| Agent | Model | Why |
|-------|-------|-----|
| `frontend-dev`, `backend-dev`, `chief-architect` | **opus** | Requires deep reasoning, creativity |
| `quality-gate`, `code-reviewer`, `tilt-ops` | **sonnet** | Mechanical work — 5-10x cheaper |

### Token-Saving Habits

| Strategy | Impact |
|----------|--------|
| `.claudeignore` is configured — excludes `node_modules/`, `dist/`, `bin/`, etc. | High — saves thousands of tokens per session |
| `CLAUDE.md` is ~290 lines (loaded into every agent context) | Good — under the 300-line budget |
| Skills are loaded on demand, not always | Good — reference material only appears when needed |
| Scope prompts to specific directories | Medium — "Review changes in `BaseClient/src/features/templates/`" |
| Use `/compact` in long sessions | Low — frees context window space |

### Cost Rule of Thumb

| Task | Estimated Cost |
|------|---------------|
| Simple bug fix (single agent) | $0.05 - $0.25 |
| Feature with 2 agents + verification | $1 - $5 |
| Full-stack feature with all pipeline stages | $5 - $15 |

---

## 12. Hooks (Automatic Guardrails)

Hooks are configured in `.claude/settings.json` and run automatically. You don't need to think about them — they just work.

### Active Hooks

| Hook | Trigger | What It Does |
|------|---------|-------------|
| **Protected files** | Before any edit | Blocks edits to `.env`, secrets, certificates |
| **Auto-ESLint** | After editing `.ts`/`.tsx` | Runs `eslint --fix` on the changed file |
| **Desktop notification** | When Claude needs input | Shows a Windows popup so you don't have to watch the terminal |

### How Hooks Help

- **Protected files**: Even if Claude tries to edit a `.env` file, the hook blocks it before the edit happens
- **Auto-ESLint**: Every TypeScript file Claude touches is automatically formatted — no need to remember to run lint
- **Notifications**: When running long agent tasks in CLI mode, you get a popup when Claude needs your attention

---

## 13. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Claude doesn't know the coding standards | Started from wrong directory | Restart from `SaaS/` root |
| Agents aren't available | Started from a subdirectory | Restart from `SaaS/` root |
| Claude asks permission for every command | New machine, empty `settings.local.json` | Approve commands as prompted — they're saved for next time |
| Visual QA agent can't use browser | Chrome MCP not connected | Install the Claude Code Chrome Extension, restart Claude |
| Tilt commands fail | Tilt not running | Start Tilt first: `tilt up` |
| Claude reads irrelevant files | `.claudeignore` misconfigured | Check `.claudeignore` at project root |
| Session feels slow/expensive | Context window filling up | Use `/compact` to summarize history |
| "Fix tilt errors" doesn't work | Error log not found | Read `tilt-errors.log` in project root |
| Agent makes wrong architecture decisions | No plan mode used first | Use `claude --plan` before implementation |

---

## 14. Quick Reference

### Daily Workflow

```
1. cd SaaS && claude                    # Start from project root
2. Describe your task clearly           # Scoped prompt with file paths
3. Claude delegates to agents           # Implementation happens
4. /quality-check                       # Verify the changes
5. /review                              # Review for standards
6. Claude runs visual-qa + regression   # If UI/API changes
7. LIFECYCLE_PASSED                     # Done!
```

### Slash Commands

| Command | Shortcut For |
|---------|-------------|
| `/review` | Code review on recent changes |
| `/quality-check` | Lint + YAGNI + tests + build |
| `/new-feature` | Task doc + implementation plan |
| `/deploy-check` | Full pre-deployment verification |

### Quality Check Commands (Manual)

```bash
# Frontend
cd BaseClient && npm run lint:fix           # Lint
cd BaseClient && npm run test:coverage      # Unit tests
cd BaseClient && npx expo export --platform web  # Build

# Backend (per service)
cd Services/<Name> && dotnet format --verify-no-changes  # Lint
cd Services/<Name> && dotnet build --verbosity quiet     # Build
cd Services/<Name> && dotnet test --verbosity quiet      # Tests

# E2E
cd E2ETests && npx playwright test          # Quick mode
cd E2ETests && npm run tilt:<suite>         # Tilt mode (authoritative)
```

### Key File Locations

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions (auto-loaded every session) |
| `.claude/settings.json` | Shared permissions, hooks, deny list |
| `.claude/settings.local.json` | Your local command approvals (not committed) |
| `.claude/agents/*.md` | Agent definitions (8 specialized agents) |
| `.claude/skills/*/SKILL.md` | Reference knowledge modules (8 skills) |
| `.claude/commands/*.md` | Slash command definitions (4 commands) |
| `.mcp.json` | MCP server connections (Tilt + Chrome) |
| `.claudeignore` | Files excluded from AI context |
| `BaseClient/docs/code-standards/` | Coding standards (shared by humans and AI) |
| `BaseClient/docs/Tasks/` | Task documentation (IN_PROGRESS, COMPLETED, etc.) |
