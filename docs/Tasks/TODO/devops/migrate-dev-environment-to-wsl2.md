# Migrate Dev Environment to WSL2 Filesystem

## Status: TODO

## Problem Statement
Docker Desktop crashes repeatedly during development because the project files live on the Windows filesystem (`C:\desktopContents\projects\SaaS`) and are accessed by Docker containers through the WSL2 filesystem bridge (Plan 9/9P protocol). This bridge adds overhead and instability that causes:

- Docker Desktop's Linux engine (`//./pipe/dockerDesktopLinuxEngine`) to die and not recover
- `EMFILE: too many open files` errors in Expo Metro bundler
- Tilt file watching instability across 80+ resources
- Build spikes (dotnet + Node simultaneously) triggering WSL2 OOM, dropping the named pipe

The fix is to move project files **inside** WSL2 so Docker containers access them natively with no translation layer.

## Root Cause Analysis
- Current path: `Windows filesystem → WSL2 bridge → Docker containers` (unstable)
- Target path: `WSL2 filesystem → Docker containers` (native Linux, no bridge)
- Microsoft and Docker both officially recommend keeping project files inside WSL2 when using Docker Desktop on Windows: https://docs.docker.com/desktop/wsl/

## Environment
- OS: Windows 11
- WSL2 distro: Ubuntu (already installed)
- Docker Desktop: already configured with WSL2 integration
- Current project location: `C:\desktopContents\projects\SaaS`
- Target project location: `~/projects/SaaS` inside Ubuntu WSL2

## Implementation Plan

### Step 1 — Clone/copy project into WSL2
```bash
# Option A: clone fresh from git (preferred)
cd ~
git clone <repo-url> projects/SaaS

# Option B: copy from Windows filesystem
cp -r /mnt/c/desktopContents/projects/SaaS ~/projects/SaaS
```

### Step 2 — Install dev tools inside WSL2
Verify or install each tool that currently runs on Windows:
```bash
# Check what's already installed
node --version
bun --version
dotnet --version
tilt version

# Install Node/bun if missing
curl -fsSL https://bun.sh/install | bash

# Install .NET SDK if missing
# https://learn.microsoft.com/dotnet/core/install/linux-ubuntu

# Install Tilt if missing
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```

### Step 3 — Verify Docker Desktop WSL integration
In Docker Desktop: `Settings → Resources → WSL Integration → Ubuntu` must be enabled.
No other Docker Desktop changes needed.

### Step 4 — Open project in VS Code via Remote WSL
```bash
cd ~/projects/SaaS
code .
```
VS Code will detect WSL2 and prompt to reopen via Remote WSL extension. After this, the editor experience is identical — same UI, same extensions, same terminal — but everything runs natively on Linux.

### Step 5 — Install project dependencies inside WSL2
```bash
cd ~/projects/SaaS/BaseClient
npm install   # or bun install

cd ../E2ETests
npm install

# restore dotnet packages for each service
cd ../Services
dotnet restore
```

### Step 6 — Run Tilt and verify all services start cleanly
```bash
cd ~/projects/SaaS
tilt up
```
Verify all ~20 containers start without Docker crashes.

## Success Criteria
- [ ] All Docker containers start and stay running without crashes
- [ ] No `EMFILE: too many open files` errors from Expo
- [ ] Tilt file watching stable across all 80+ resources
- [ ] VS Code Remote WSL working (editor feels identical to before)
- [ ] Frontend accessible at `http://localhost:8082`
- [ ] All E2E test suites pass (run `npx playwright test` from E2ETests/)
- [ ] No `//./pipe/dockerDesktopLinuxEngine` errors in Tilt logs

## Notes
- The Windows desktop, browser, and VS Code window all stay on Windows — only the files and processes move into WSL2
- The project will be accessible from Windows Explorer at `\\wsl$\Ubuntu\home\<username>\projects\SaaS` if needed
- Git configuration (credentials, SSH keys) will need to be set up inside WSL2 if using Option A
- Any environment variables or `.env` files will need to be recreated inside WSL2
- Claude Code can be run from inside WSL2 the same way: `claude` in the WSL2 terminal
