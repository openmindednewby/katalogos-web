# Kubernetes Deployment & Infrastructure as Code

> **Status**: TODO
> **Priority**: P2 - Required for Scaling
> **Estimated Scope**: Large (Infrastructure)
> **Estimated Effort**: 4-6 weeks

---

## 1. Problem

- Only Docker Compose for local dev — no container orchestration for production
- No auto-scaling, no rolling deployments, no self-healing
- Single-node deployment = single point of failure
- No Infrastructure as Code — infrastructure can't be reproduced or audited
- No load balancing across service replicas

---

## 2. Target Architecture

### 2.1 Kubernetes Cluster

```
Cluster
├── Namespace: saas-prod
│   ├── Deployment: identity-api (2+ replicas)
│   ├── Deployment: onlinemenu-api (2+ replicas)
│   ├── Deployment: questioner-api (2+ replicas)
│   ├── Deployment: content-api (2+ replicas)
│   ├── Deployment: notification-api (2+ replicas)
│   ├── Deployment: baseclient (2+ replicas, Nginx)
│   ├── StatefulSet: postgresql (per service or shared)
│   ├── StatefulSet: rabbitmq
│   ├── StatefulSet: redis
│   ├── Ingress: nginx-ingress (TLS termination, routing)
│   └── CronJob: db-backup
├── Namespace: saas-staging
│   └── (same structure, 1 replica each)
└── Namespace: monitoring
    ├── Deployment: grafana
    ├── Deployment: loki
    ├── Deployment: prometheus
    └── DaemonSet: cadvisor
```

### 2.2 Cloud Provider

Options: Azure AKS, AWS EKS, Google GKE, or DigitalOcean Kubernetes.

---

## 3. Helm Charts

Create Helm chart per service with common values:

```yaml
# values.yaml
replicaCount: 2
image:
  repository: ghcr.io/openmindednewby/identity-api
  tag: latest
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
livenessProbe:
  httpGet:
    path: /health/live
readinessProbe:
  httpGet:
    path: /health/ready
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilization: 70
```

---

## 4. Infrastructure as Code (Terraform)

```
infrastructure/
├── terraform/
│   ├── main.tf              # Provider, backend
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   ├── modules/
│   │   ├── kubernetes/      # AKS/EKS cluster
│   │   ├── database/        # Managed PostgreSQL
│   │   ├── storage/         # Blob storage for backups
│   │   ├── networking/      # VNet, subnets, NSGs
│   │   ├── dns/             # DNS zones, records
│   │   └── keyvault/        # Secret management
│   └── environments/
│       ├── staging/         # Staging tfvars
│       └── production/      # Production tfvars
├── helm/
│   ├── identity-api/
│   ├── onlinemenu-api/
│   ├── questioner-api/
│   ├── content-api/
│   ├── notification-api/
│   ├── baseclient/
│   └── shared/              # Common templates
└── scripts/
    ├── deploy.sh
    └── rollback.sh
```

---

## 5. Implementation Phases

### Phase 1: Helm Charts (1-2 weeks)
1. Create base Helm chart template for .NET API services
2. Create Helm chart for each service
3. Create Helm chart for frontend (Nginx)
4. Create Helm chart for infrastructure (RabbitMQ, Redis)
5. Test locally with `minikube` or `kind`

### Phase 2: Terraform (1-2 weeks)
1. Set up Terraform backend (remote state in cloud storage)
2. Create modules for K8s cluster, managed PostgreSQL, storage
3. Create staging environment
4. Deploy staging cluster
5. Validate all services run correctly

### Phase 3: CI/CD Integration (1 week)
1. Add Helm deploy step to GitHub Actions
2. Implement rolling deployment strategy
3. Add automated rollback on failed health checks
4. Create deployment runbook

### Phase 4: Production (1 week)
1. Create production environment
2. Set up DNS and TLS certificates (cert-manager)
3. Configure auto-scaling policies
4. Set up monitoring namespace
5. Run load tests to validate scaling

---

## 6. Verification

- [ ] All services running in Kubernetes with health checks
- [ ] Auto-scaling triggers on CPU/memory thresholds
- [ ] Rolling deployments with zero downtime
- [ ] Terraform can reproduce entire infrastructure from scratch
- [ ] Staging and production environments isolated
- [ ] TLS termination at ingress
- [ ] Database accessible only from within cluster
