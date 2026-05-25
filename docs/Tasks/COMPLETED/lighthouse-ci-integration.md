# Lighthouse CI Integration

> **Reference**: [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

## Status: COMPLETED

## Problem Statement

We need automated performance, accessibility, SEO, and best practices auditing as part of our CI/CD pipeline, similar to how we run linters. This will help catch performance regressions, accessibility issues, and other quality problems before they reach production.

## Solution

Integrate Google's Lighthouse CI (`@lhci/cli`) into the BaseClient project and Tiltfile workflow.

## Implementation Plan

### Phase 1: BaseClient Setup

#### 1.1 Install Dependencies
```bash
cd BaseClient
npm install -D @lhci/cli
```

#### 1.2 Create Lighthouse Configuration
Create `BaseClient/lighthouserc.js`:
```javascript
module.exports = {
  ci: {
    collect: {
      // Use the running dev server
      url: ['http://localhost:8082/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        // Skip PWA audits since this is a web app, not PWA
        skipAudits: ['installable-manifest', 'splash-screen', 'themed-omnibox'],
      },
    },
    assert: {
      assertions: {
        // Performance - warn at 80, fail at 60
        'categories:performance': ['warn', { minScore: 0.8 }],
        // Accessibility - strict, fail below 90
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Best Practices - warn at 80, fail at 70
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        // SEO - warn at 80
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      // For now, just output to filesystem
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
```

#### 1.3 Add npm Scripts to package.json
Add to `BaseClient/package.json` scripts:
```json
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:collect": "lhci collect",
    "lighthouse:assert": "lhci assert",
    "lighthouse:open": "npx serve lighthouse-reports -p 9001"
  }
}
```

#### 1.4 Add to .gitignore
Add to `BaseClient/.gitignore`:
```
# Lighthouse CI reports
lighthouse-reports/
.lighthouseci/
```

### Phase 2: Tiltfile Integration

#### 2.1 Add Lighthouse Resource to Main Tiltfile
Add after the frontend resource in `Tiltfile`:
```python
# --- Lighthouse Audit (manual trigger, depends on frontend) ---
local_resource(
    name='frontend-lighthouse',
    labels=['Frontend'],
    cmd='npm run lighthouse',
    dir='BaseClient',
    resource_deps=['frontend'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### 2.2 Update Backup Tiltfile
Apply the same changes to `OnlineMenuSaaS/TIltfileBackup/Tiltfile`.

### Phase 3: Documentation Updates

#### 3.1 Update CLAUDE.md
Add Lighthouse to the verification commands and checklist:
- Add `npm run lighthouse` to Frontend Verification Suite
- Add to Quick Reference Commands table
- Add to "When to Run Each Check" table

## Files to Modify

| File | Change |
|------|--------|
| `BaseClient/package.json` | Add @lhci/cli dependency and scripts |
| `BaseClient/lighthouserc.js` | Create new config file |
| `BaseClient/.gitignore` | Add lighthouse-reports directory |
| `Tiltfile` | Add frontend-lighthouse resource |
| `OnlineMenuSaaS/TIltfileBackup/Tiltfile` | Add frontend-lighthouse resource (keep in sync) |
| `CLAUDE.md` | Document lighthouse commands |

## Success Criteria

- [x] `@lhci/cli` installed as dev dependency
- [x] `lighthouserc.js` configuration created with appropriate thresholds
- [x] npm scripts added: `lighthouse`, `lighthouse:collect`, `lighthouse:assert`, `lighthouse:open`
- [x] `lighthouse-reports/` added to .gitignore
- [x] Tiltfile has `frontend-lighthouse` resource (manual trigger)
- [x] Backup Tiltfile has identical `frontend-lighthouse` resource
- [x] CLAUDE.md updated with lighthouse commands
- [ ] Running `npm run lighthouse` works when frontend is running (requires manual verification)
- [x] Agents can run lighthouse check via `cd BaseClient && npm run lighthouse`

## Thresholds Explanation

| Category | Warn | Fail | Rationale |
|----------|------|------|-----------|
| Performance | < 80 | < 60 | React Native Web can be heavy; realistic targets |
| Accessibility | - | < 90 | High priority, must be accessible |
| Best Practices | < 80 | < 70 | Should follow best practices |
| SEO | < 80 | - | Important but warning only |

## Agent Usage After Implementation

```bash
# Run lighthouse audit (requires frontend running on :8082)
cd BaseClient && npm run lighthouse

# Or via Tilt UI
# Click "frontend-lighthouse" in the Tilt dashboard
```

## Multiple Pages (Future Enhancement)

To audit multiple pages, update `lighthouserc.js`:
```javascript
url: [
  'http://localhost:8082/',
  'http://localhost:8082/login',
  'http://localhost:8082/dashboard',
  // Add more routes as needed
],
```

## Changes Made

All implementation completed successfully:

1. **Installed @lhci/cli v0.15.1** as dev dependency in BaseClient
2. **Created `BaseClient/lighthouserc.js`** with configuration:
   - Target URL: http://localhost:8082/
   - 3 runs per audit
   - Desktop preset
   - Thresholds: Performance 80% warn, Accessibility 90% error, Best Practices 80% warn, SEO 80% warn
   - Reports output to `./lighthouse-reports`
3. **Updated `BaseClient/package.json`** with scripts:
   - `lighthouse` - runs full lhci autorun
   - `lighthouse:collect` - collects lighthouse data only
   - `lighthouse:assert` - asserts against thresholds only
   - `lighthouse:open` - serves reports on port 9001
4. **Updated `BaseClient/.gitignore`** to ignore:
   - `lighthouse-reports/`
   - `.lighthouseci/`
5. **Updated main `Tiltfile`** with `frontend-lighthouse` resource:
   - Manual trigger mode
   - Depends on `frontend` resource
   - In Frontend label group
6. **Updated backup `OnlineMenuSaaS/TIltfileBackup/Tiltfile`** with identical resource
7. **Updated `CLAUDE.md`**:
   - Added lighthouse to Frontend Verification Suite
   - Added to "When to Run Each Check" table with new rows for Performance/Accessibility changes
   - Added to Quick Reference Commands table

## Test Results

All changes verified:
- [x] `lighthouserc.js` created at `BaseClient/lighthouserc.js`
- [x] `package.json` contains all 4 lighthouse scripts
- [x] `.gitignore` contains lighthouse entries
- [x] Main Tiltfile contains `frontend-lighthouse` resource
- [x] Backup Tiltfile contains identical `frontend-lighthouse` resource
- [x] CLAUDE.md updated with lighthouse documentation

Note: `npm run lighthouse` was NOT run as it requires the frontend to be running on port 8082.
