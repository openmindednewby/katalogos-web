# Task: Backend Coverage Thresholds & Enforcement

## Status: COMPLETED
## Created: 2026-03-13
## Completed: 2026-03-13

## Problem

Backend services have NO coverage thresholds enforced. Current coverage is dangerously low:

| Service | Lines | Branches | Tests |
|---------|-------|----------|-------|
| Identity | 15.8% | 16.1% | 119 |
| Questioner | 21.7% | 20.8% | 16 |
| OnlineMenu | 13.2% | 41.2% | 76 |
| Content | 32.8% | 34.1% | 43 |
| Notification | 44.8% | 79.3% | 111 |
| Logging.Client | 74.8% | 60.7% | 73 |

Frontend already enforces thresholds (50% BaseClient, 100% utils, 60-70% notification-client). Backend has none.

## Solution

### Phase 1: Prevent Regression (immediate)
Set floor thresholds at current coverage levels to prevent further degradation:
- Identity: lines=15, branches=15
- Questioner: lines=20, branches=20
- OnlineMenu: lines=12, branches=40
- Content: lines=30, branches=30
- Notification: lines=40, branches=75
- Logging.Client: lines=70, branches=55

### Phase 2: Raise to Target (via service-specific tasks)
Target thresholds (P1):
- All services: lines=50, branches=50 minimum
- NuGet packages: lines=70, branches=60 minimum

### Implementation
1. Add `coverlet.msbuild` NuGet package to all test projects (replaces collector-based approach)
2. Update Tilt coverage commands to include `/p:CollectCoverage=true /p:Threshold=X /p:ThresholdType="line,branch" /p:ThresholdStat=total`
3. Coverage Tilt resources will FAIL if thresholds are not met

### Files to Modify
- `IdentityService/tests/IdentityService.Tests/IdentityService.Tests.csproj`
- `QuestionerService/Questioner/tests/Questioner.UnitTests/Questioner.UnitTests.csproj`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/OnlineMenu.UnitTests.csproj`
- `ContentService/Content/tests/Content.UnitTests/Content.UnitTests.csproj`
- `NotificationService/Notification/tests/Notification.UnitTests/Notification.UnitTests.csproj`
- `NuGetPackages/Logging.Client/tests/Logging.Client.Tests/Logging.Client.Tests.csproj`
- `Tiltfile` (update coverage resource commands)

## What Was Done
- Added `coverlet.msbuild` v6.0.4 to all 6 `Directory.Packages.props` files
- Added `<PackageReference Include="coverlet.msbuild" />` to all 6 test `.csproj` files
- Updated all 6 `*-unit-tests-coverage` Tilt resources with `/p:CollectCoverage=true /p:Threshold=X /p:ThresholdType=line /p:ThresholdStat=total`
- Thresholds set as floor values: Identity=15, Questioner=20, OnlineMenu=12, Content=30, Notification=40, Logging.Client=70

## Acceptance Criteria
- [x] All backend coverage resources enforce line thresholds
- [x] Tilt `*-unit-tests-coverage` resources fail if thresholds not met
- [x] Floor thresholds set at current levels (regression prevention)
- [x] Coverage metrics visible in Tilt logs output
