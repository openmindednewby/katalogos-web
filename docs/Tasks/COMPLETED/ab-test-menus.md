# A/B Test Menus - Backend Implementation

## Status: COMPLETED

## Problem Statement

Implement A/B testing functionality for restaurant menus in the OnlineMenuService. Restaurant owners should be able to test two menu configurations against each other and track engagement metrics (views, item clicks, time on page) to determine which performs better.

## Architectural Approach

### Domain Layer (OnlineMenu.Core)
- `MenuExperiment` entity (BaseTenantEntity, IAggregateRoot) with lifecycle states
- `ExperimentStatus` enum: Draft, Running, Completed, Archived
- `ExperimentVariant` enum: A, B (for deterministic assignment)
- `ExperimentMetrics` value object for tracking engagement
- `VariantAssigner` static helper for deterministic hash-based 50/50 split
- `IMenuExperimentRepository` interface for specialized queries

### Application Layer (OnlineMenu.UseCases)
- CQRS handlers: CreateExperiment, StartExperiment, StopExperiment, GetExperiment, ListExperiments
- RecordExperimentView command handler
- GetExperimentVariant query handler (public, deterministic assignment)

### Web Layer (OnlineMenu.Web)
- FastEndpoints in `Experiments/` domain folder
- Admin endpoints: Create, List, GetById, Start, Stop
- Public endpoint: RecordView (AllowAnonymous)
- FluentValidation for all requests

### Infrastructure Layer
- EF migration for MenuExperiments table
- Repository implementation
- DbContext configuration with tenant filtering

### Feature Gating
- Enterprise tier only (use existing ISubscriptionStatusService pattern)

## Affected Services
- OnlineMenuService (primary)

## Success Criteria
- [x] MenuExperiment entity with full lifecycle
- [x] Deterministic variant assignment via hash
- [x] CQRS handlers for all operations
- [x] FastEndpoints with proper auth
- [x] Unit tests with high coverage
- [x] All Tilt quality checks pass (lint, YAGNI, tests, API rebuild)

## Implementation Log
- Created MenuExperiment entity, ExperimentStatus/ExperimentVariant enums, ExperimentMetrics value object
- Created VariantAssigner with SHA256-based deterministic 50/50 split
- Created IMenuExperimentRepository interface
- Created all CQRS handlers (Create, Start, Stop, Get, List, RecordView, GetVariant)
- Created FastEndpoints in Experiments/ domain folder
- Created EF migration, DbContext config, repository implementation
- Created comprehensive unit tests
- Ran Tilt quality gate
