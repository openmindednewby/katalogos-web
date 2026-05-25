# Tilt Per-Environment Image Builds

> **Status**: TODO
> **Priority**: P1 - High
> **Depends on**: secrets-management (`.env.local` pattern)

---

## 1. Problem

Currently, Tilt only builds images for the local development environment. We need dedicated Tilt sections (or separate Tiltfiles) to build Docker images tagged for different environments (dev, staging, production) with appropriate configuration.

---

## 2. Solution

### 2.1 Environment-Aware Tiltfile

Add environment detection to the Tiltfile:

```python
# Read environment from env var or default to 'dev'
env = os.getenv('TILT_ENV', 'dev')

# Load environment-specific env file
if env == 'dev':
    env_file = '.env.local'
elif env == 'staging':
    env_file = '.env.staging'
elif env == 'production':
    env_file = '.env.production'
```

### 2.2 Per-Environment Docker Tags

- `dev`: `service:dev-latest` (local only, no push)
- `staging`: `registry.example.com/service:staging-{git-sha}`
- `production`: `registry.example.com/service:prod-{git-sha}` + `service:latest`

### 2.3 Per-Environment Resources

Each environment gets its own Tilt resource group:
- Dev: local docker-compose with hot reload
- Staging: build + push to staging registry
- Production: build + push to production registry (with approval gate)

---

## 3. Implementation Steps

1. Add `TILT_ENV` environment variable support to Tiltfile
2. Create `.env.staging.example` and `.env.production.example` templates
3. Add `docker_build()` resources for staging/production image builds
4. Add container registry push support
5. Add environment label groups in Tilt UI
6. Document usage: `TILT_ENV=staging tilt up`
