---
id: KAT-1
title: "Execute credential rotation for OVERDUE/WARN credentials flagged by monitoring"
status: blocked
requirements: []
tests: []
assignee: ~
source: migrated:credential-rotation-execution.md
created: 2026-05-01
updated: 2026-06-28
---

Monitoring, inventory, encrypted backups and rotation wrappers are built and verified; pre-flight and pre-rotation DB snapshots are done. Actual rotation is pending — the SAFE set (age key, github_pat, npm_token) awaits user go-ahead, and the bundle rotation (6 DBs, RabbitMQ, SeaweedFS, Grafana, Keycloak) is blocked on patching stale container names in `rotate-credentials.ps1` (SharedDB consolidation) and avoiding the production-Keycloak hit. Currently 15 OVERDUE / 13 WARN credentials.
