# Shared Docker Network Refactoring

> **Status**: COMPLETED
> **Created**: 2026-01-31

## Problem Statement

Currently, services in separate docker-compose files communicate via `host.docker.internal` which:
- Routes traffic through the host's network stack (less efficient)
- Has had historical issues on Linux
- Doesn't make service dependencies explicit
- Requires exposing ports to the host

## Solution

Create a shared external Docker network (`saas-network`) that all services join, enabling:
- Direct container-to-container communication using container names
- Better performance (no host network stack routing)
- Cross-platform compatibility
- Explicit service dependencies

## Implementation Plan

### 1. Create External Network
```bash
docker network create saas-network
```

### 2. Update Docker Compose Files

| File | Changes |
|------|---------|
| `NotificationService/docker-compose.yml` | Add `saas-network` as external, keep rabbitmq/redis accessible |
| `IdentityService/docker-compose.yml` | Add `saas-network`, change `RabbitMq__Host` to `rabbitmq` |
| `QuestionerService/docker-compose.yml` | Add `saas-network`, change `RabbitMq__Host` to `rabbitmq` |
| `OnlineMenuSaaS/OnlineMenuService/docker-compose.yml` | Add `saas-network`, change `RabbitMq__Host` to `rabbitmq` |
| `ContentService/docker-compose.yml` | Add `saas-network` for future cross-service communication |

### 3. Environment Variable Changes

| Service | Old Value | New Value |
|---------|-----------|-----------|
| IdentityService | `RabbitMq__Host=host.docker.internal` | `RabbitMq__Host=rabbitmq` |
| QuestionerService | `RabbitMq__Host=host.docker.internal` | `RabbitMq__Host=rabbitmq` |
| OnlineMenuService | `RabbitMq__Host=host.docker.internal` | `RabbitMq__Host=rabbitmq` |

### 4. Port Reference (from DATABASE-PORTS.md)

| Port | Service | Container Name |
|------|---------|----------------|
| 5432 | OnlineMenuService | OnlineMenuDB |
| 5433 | QuestionerService | QuestionerDB |
| 5434 | IdentityService | IdentityServiceDB |
| 5435 | ContentService | ContentDB |
| 5436 | NotificationService | NotificationDB |
| 5672 | RabbitMQ | NotificationRabbitMQ |
| 6379 | Redis | NotificationRedis |

## Files to Modify

1. `NotificationService/docker-compose.yml`
2. `IdentityService/docker-compose.yml`
3. `QuestionerService/docker-compose.yml`
4. `OnlineMenuSaaS/OnlineMenuService/docker-compose.yml`
5. `ContentService/docker-compose.yml`
6. `DATABASE-PORTS.md` (document the network)

## Success Criteria

- [ ] All docker-compose files use `saas-network`
- [ ] Services communicate via container names, not `host.docker.internal`
- [ ] All services start successfully with `tilt up`
- [ ] RabbitMQ connections work (no connection refused errors)
- [ ] Health checks pass for all services
- [ ] Quality gate passes
- [ ] Code review passes

## Changes Made

### 1. NotificationService/docker-compose.yml
- Added `saas-network` as external network
- Added `saas-network` to `rabbitmq`, `redis`, and `notification.web` services
- Changed `IdentityService__BaseUrl` from `host.docker.internal:5002` to `identityservice.api:8080`

### 2. IdentityService/docker-compose.yml
- Added `saas-network` as external network
- Added `saas-network` to `identityservice.api` service
- Changed `RabbitMq__Host` from `host.docker.internal` to `rabbitmq`
- Updated comment to reflect shared network usage

### 3. QuestionerService/docker-compose.yml
- Added `saas-network` as external network
- Added `saas-network` to `questioner.web` and `questioner-db` services
- Changed `RabbitMq__Host` from `host.docker.internal` to `rabbitmq`
- Changed `IdentityService__BaseUrl` from `host.docker.internal:5002` to `identityservice.api:8080`

### 4. OnlineMenuSaaS/OnlineMenuService/docker-compose.yml
- Added `saas-network` as external network
- Added `saas-network` to `project1.web` and `onlinemenu-db` services
- Changed `RabbitMq__Host` from `host.docker.internal` to `rabbitmq`
- Changed `IdentityService__BaseUrl` from `host.docker.internal:5002` to `identityservice.api:8080`

### 5. ContentService/docker-compose.yml
- Added `saas-network` as external network
- Added `saas-network` to ALL services:
  - `content.web`, `content-db`
  - `seaweedfs-master`, `seaweedfs-volume`, `seaweedfs-filer`, `seaweedfs-s3`
  - `nginx-cors-proxy`, `seaweedfs-init`

### 6. DATABASE-PORTS.md
- Added "Infrastructure Ports" section documenting RabbitMQ and Redis ports
- Added "Shared Docker Network" section with:
  - Network creation command
  - Service discovery table with internal vs external URLs

## Test Results

- All docker-compose files verified to have correct YAML syntax
- No remaining references to `host.docker.internal`
- All services properly reference `saas-network` as external
- Network configuration consistent across all files
- Quality gate passed after fixing database network isolation issue
- All services that need to communicate are on the same network

## Next Steps for User

Before running `tilt up`, create the shared network:
```bash
docker network create saas-network
```

Then restart Tilt to apply the changes.
