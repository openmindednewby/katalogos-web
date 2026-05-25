# Content Storage and Distribution System - Architectural Plan

> **Status**: TODO - Research & Planning Phase
> **Priority**: High
> **Estimated Complexity**: Large (New microservice + CDN integration + Multi-format media handling)

---

## Executive Summary

This document outlines the architectural plan for a Content Storage and Distribution System to support the online menu feature. The system must handle multiple content types (documents, images, GIFs, videos) with enterprise-grade security, multi-tenant isolation, and global content distribution.

---

## Technology Decisions

### Object Storage: RustFS (DECIDED)

We have decided to use **RustFS** as our self-hosted, S3-compatible object storage solution.

**Why RustFS:**
- **Apache 2.0 License** - Permissive license with no copyleft restrictions
- **Excellent S3 API Compatibility** - Drop-in replacement for AWS S3
- **High Performance** - Written in Rust for maximum performance and memory safety
- **Active Development** - Actively maintained with growing community
- **Self-Hosted** - Full control over data, deploy anywhere (on-premise, VPS, Kubernetes)
- **Horizontal Scaling** - Designed for distributed deployments
- **No Vendor Lock-in** - S3-compatible API means easy migration if needed

**Deployment:**
- Docker / Docker Compose for development and small deployments
- Kubernetes with Helm charts for production clusters
- Can run on any infrastructure (bare metal, VPS, cloud VMs)

**Reference:** [RustFS Official](https://rustfs.com/) | [RustFS GitHub](https://github.com/rustfs/rustfs)

### Supporting Technologies (Planned)
| Component | Technology | Status |
|-----------|------------|--------|
| Object Storage | **RustFS** | DECIDED |
| CDN/Caching | NGINX or Traefik | To be decided |
| Image Processing | Imgproxy | Recommended |
| Video Transcoding | FFmpeg (containerized) | Recommended |
| Virus Scanning | ClamAV | Recommended |
| Message Queue | RabbitMQ or Redis Streams | To be decided |

---

## Table of Contents

1. [Requirements Analysis](#requirements-analysis)
2. [Storage Options Analysis](#storage-options-analysis)
3. [CDN Integration Strategies](#cdn-integration-strategies)
4. [Security Best Practices](#security-best-practices)
5. [Scalability Considerations](#scalability-considerations)
6. [Architecture Patterns](#architecture-patterns)
7. [Database Schema Design](#database-schema-design)
8. [API Design](#api-design)
9. [Implementation Tasks](#implementation-tasks)
10. [Cost Analysis](#cost-analysis)
11. [Testing Strategy](#testing-strategy)

---

## Requirements Analysis

### Supported Content Types

| Content Type | Formats | Max File Size | Use Cases |
|--------------|---------|---------------|-----------|
| **Documents** | PDF, DOCX, TXT | 50 MB | Menu PDFs, nutritional info, allergen guides |
| **Images** | JPG, PNG, WebP, HEIC | 25 MB | Menu item photos, logos, backgrounds |
| **Animated Images** | GIF, APNG, WebP | 15 MB | Promotional animations, special offers |
| **Videos** | MP4, MOV, WebM | 500 MB | Menu item videos, restaurant ambiance |

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Upload content with automatic type detection | Must Have |
| FR-02 | Generate optimized variants (thumbnails, different sizes) | Must Have |
| FR-03 | Serve content via CDN with low latency globally | Must Have |
| FR-04 | Tenant isolation - content scoped to tenant | Must Have |
| FR-05 | Virus/malware scanning before storage | Must Have |
| FR-06 | Image optimization and format conversion (WebP) | Should Have |
| FR-07 | Video transcoding to multiple qualities | Should Have |
| FR-08 | Watermarking support for premium content | Could Have |
| FR-09 | Content versioning and history | Should Have |
| FR-10 | Bulk upload support | Should Have |
| FR-11 | Content usage analytics | Could Have |
| FR-12 | Content moderation (NSFW detection) | Could Have |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Upload latency < 3 seconds for images | Performance |
| NFR-02 | CDN cache hit ratio > 95% | Performance |
| NFR-03 | Global content delivery < 100ms TTFB | Performance |
| NFR-04 | 99.9% availability for content retrieval | Availability |
| NFR-05 | Support 10,000 concurrent uploads | Scalability |
| NFR-06 | Complete tenant data isolation | Security |
| NFR-07 | Encryption at rest and in transit | Security |
| NFR-08 | GDPR-compliant data handling | Compliance |

---

## Storage Options Analysis

### Option 1: Azure Blob Storage (Recommended for Azure-based Infrastructure)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Azure Blob Storage Architecture                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Storage Account (per environment)                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │  Container:  │  │  Container:  │  │  Container:  │             │ │
│  │  │   uploads    │  │   processed  │  │   archive    │             │ │
│  │  │  (Hot tier)  │  │  (Hot tier)  │  │  (Cool tier) │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Azure CDN (Standard Microsoft)                  │ │
│  │                    or Azure Front Door (Premium)                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pricing (East US, as of 2025)**:

| Tier | Storage $/GB/month | Operations $/10K | Egress $/GB |
|------|-------------------|------------------|-------------|
| Hot | $0.018 | $0.05 (write), $0.004 (read) | $0.087 |
| Cool | $0.01 | $0.10 (write), $0.01 (read) | $0.087 |
| Archive | $0.002 | $0.10 (write), $5.00 (read) | $0.02 |

**Pros**:
- Native Azure integration if already using Azure services
- Azure CDN integration is seamless
- Lifecycle management policies for automatic tier transitions
- Built-in redundancy options (LRS, GRS, RA-GRS)
- Azure Functions integration for serverless processing
- Managed Identity support for secure access
- Azure Defender for Storage (threat detection)

**Cons**:
- Egress costs can be significant for high-traffic applications
- Azure CDN has fewer PoPs than CloudFront/Cloudflare
- Less flexible pricing tiers compared to S3

**Best For**: Teams already invested in Azure ecosystem

---

### Option 2: AWS S3 (Recommended for AWS-based Infrastructure)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AWS S3 Architecture                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        S3 Bucket (per environment)                  │ │
│  │                                                                      │ │
│  │  /tenants/{tenantId}/                                               │ │
│  │      ├── images/                                                    │ │
│  │      │   ├── original/                                              │ │
│  │      │   ├── thumbnails/                                            │ │
│  │      │   └── optimized/                                             │ │
│  │      ├── videos/                                                    │ │
│  │      │   ├── original/                                              │ │
│  │      │   └── transcoded/                                            │ │
│  │      ├── documents/                                                 │ │
│  │      └── temp/                                                      │ │
│  │                                                                      │ │
│  │  Lifecycle Rules:                                                   │ │
│  │  - Move to S3-IA after 30 days of no access                        │ │
│  │  - Move to Glacier after 90 days                                   │ │
│  │  - Delete temp files after 24 hours                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                         CloudFront CDN                              │ │
│  │                     (400+ PoPs worldwide)                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pricing (US East, as of 2025)**:

| Storage Class | Storage $/GB/month | PUT/POST $/1K | GET $/1K |
|--------------|-------------------|---------------|----------|
| Standard | $0.023 | $0.005 | $0.0004 |
| S3-IA | $0.0125 | $0.01 | $0.001 |
| Glacier Instant | $0.004 | $0.02 | $0.01 |

**Pros**:
- Largest global infrastructure (400+ CloudFront PoPs)
- Most mature object storage service
- Lambda@Edge for serverless image processing at edge
- S3 Select for querying data in place
- Transfer Acceleration for faster uploads
- Intelligent-Tiering for automatic cost optimization
- Best SDK/library support across languages

**Cons**:
- AWS complexity can be overwhelming
- Requires careful IAM configuration
- Cross-region replication costs add up

**Best For**: Large-scale applications needing global reach

---

### Option 3: Google Cloud Storage (Recommended for GCP-based Infrastructure)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          GCS Architecture                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                 Cloud Storage Bucket (multi-regional)               │ │
│  │                                                                      │ │
│  │  Standard Storage → Nearline → Coldline → Archive                  │ │
│  │  (Object Lifecycle Management)                                      │ │
│  │                                                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Cloud CDN + Load Balancer                      │ │
│  │                   or Firebase Hosting (for static)                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pricing (US, as of 2025)**:

| Storage Class | Storage $/GB/month | Class A ops $/10K | Class B ops $/10K |
|--------------|-------------------|-------------------|-------------------|
| Standard | $0.020 | $0.05 | $0.004 |
| Nearline | $0.010 | $0.10 | $0.01 |
| Coldline | $0.004 | $0.10 | $0.05 |

**Pros**:
- Excellent ML/AI integration (Vision API, Video Intelligence)
- Simpler permission model (IAM-only)
- Strong data analytics integration (BigQuery)
- Firebase Storage for mobile app integration
- Built-in image serving with resizing

**Cons**:
- Smaller CDN footprint than AWS/Azure
- Fewer enterprise features
- Less documentation/community examples

**Best For**: AI/ML-heavy applications, mobile-first apps

---

### Option 4: Cloudflare R2 + Images (Budget-Friendly Option)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Cloudflare R2 Architecture                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        Cloudflare R2 Storage                        │ │
│  │                                                                      │ │
│  │  Key Features:                                                      │ │
│  │  - S3-compatible API                                                │ │
│  │  - Zero egress fees (!!)                                            │ │
│  │  - Automatic CDN integration                                        │ │
│  │                                                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│  ┌────────────────────────────────┴───────────────────────────────────┐ │
│  │                                                                      │ │
│  │  ┌─────────────────────┐      ┌─────────────────────┐              │ │
│  │  │  Cloudflare Images  │      │  Cloudflare Stream  │              │ │
│  │  │  - Auto resize      │      │  - Video encoding   │              │ │
│  │  │  - Format convert   │      │  - Adaptive bitrate │              │ │
│  │  │  - CDN delivery     │      │  - Player included  │              │ │
│  │  └─────────────────────┘      └─────────────────────┘              │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pricing (as of 2025)**:

| Service | Price |
|---------|-------|
| R2 Storage | $0.015/GB/month |
| R2 Operations | $4.50/million Class A, $0.36/million Class B |
| R2 Egress | **FREE** |
| Cloudflare Images | $5/month + $1/100K images stored |
| Cloudflare Stream | $5/1000 min stored + $1/1000 min viewed |

**Pros**:
- **Zero egress costs** - huge savings for content-heavy apps
- S3-compatible API - easy migration
- Built-in CDN (300+ PoPs)
- Cloudflare Images handles resizing automatically
- Cloudflare Stream handles video transcoding
- Workers for serverless processing

**Cons**:
- Newer service, less enterprise validation
- No lifecycle policies (yet)
- Limited storage tiers
- Less tooling/SDK maturity
- Cloudflare Images/Stream are separate products

**Best For**: Cost-conscious applications with high egress volumes

---

### Option 5: Self-Hosted Solutions (For On-Premise/VPS/Kubernetes)

This section provides detailed research on open-source, self-hosted alternatives to AWS S3 + CloudFront for organizations that want full control over their infrastructure or have data sovereignty requirements.

---

## Self-Hosted Object Storage (S3 Alternatives)

### 5.1 MinIO

**Overview**: MinIO is the most widely-adopted S3-compatible object storage, known for high performance and simplicity.

**IMPORTANT: 2025 Status Update**: MinIO's community edition entered maintenance mode in late 2025. No new features or enhancements will be accepted, and critical security fixes are evaluated case-by-case. The community version is now source-only (no pre-compiled binaries). Enterprise features (SSO, LDAP, OIDC, admin UI) have been moved to the paid AIStor edition.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MinIO Cluster Architecture                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              MinIO Cluster (Kubernetes/Docker)                      │ │
│  │                                                                      │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │ │
│  │  │  MinIO 1  │  │  MinIO 2  │  │  MinIO 3  │  │  MinIO 4  │       │ │
│  │  │  (Node)   │  │  (Node)   │  │  (Node)   │  │  (Node)   │       │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘       │ │
│  │                       Erasure Coding (4+4)                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │            NGINX + Caching Layer (or Varnish)                       │ │
│  │                     + External CDN (optional)                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features & Capabilities**:
- High performance: 325+ GB/s throughput on 32 nodes with standard hardware
- S3-compatible API (first to support AWS Signature Version 4)
- Supports unstructured data (photos, videos, logs, backups) up to 50TB per object
- Erasure coding for data protection
- S3 Select for querying data in place
- IAM policy syntax compatible with AWS

**S3 API Compatibility**: Excellent - the most widely tested S3 implementation outside of AWS. Supports Signature V2 and V4, IAM policies, S3 Select, multipart uploads.

**Deployment Options**:
| Method | Complexity | Best For |
|--------|------------|----------|
| Docker | Low | Development, single-node testing |
| Docker Compose | Low | Small production, multi-node |
| Kubernetes (Helm) | Medium | Production, scalable deployments |
| Bare Metal | High | Maximum performance, custom setups |

**Resource Requirements**:
| Scale | CPU | RAM | Storage |
|-------|-----|-----|---------|
| Dev/Test | 2 cores | 4GB | 100GB+ |
| Small Production | 4+ cores per node | 16GB+ per node | 4+ drives per node |
| Enterprise | 8+ cores per node | 32GB+ per node | 8+ drives per node |

**Pros**:
- Highest S3 compatibility
- Excellent performance
- Large community and documentation
- Easy to get started
- Kubernetes-native deployment available

**Cons**:
- Community edition now in maintenance mode
- Enterprise features require paid AIStor license
- No active scrubbing for bit rot detection
- AGPL license may be restrictive for some use cases

**Best Use Cases**: Development environments, migration path to cloud S3, organizations needing proven S3 compatibility

**Sources**: [MinIO Official](https://www.min.io/), [MinIO GitHub](https://github.com/minio/minio), [InfoQ Article on MinIO Maintenance Mode](https://www.infoq.com/news/2025/12/minio-s3-api-alternatives/)

---

### 5.2 Garage

**Overview**: Garage is a lightweight, geo-distributed S3-compatible object storage designed for self-hosting outside traditional datacenters. Released under AGPLv3 license by Deuxfleurs (French non-profit).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Garage Architecture                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │           Garage Cluster (Geo-Distributed Nodes)                  │   │
│  │                                                                    │   │
│  │  Zone A (US)         Zone B (EU)         Zone C (APAC)           │   │
│  │  ┌───────────┐       ┌───────────┐       ┌───────────┐           │   │
│  │  │ Node 1    │       │ Node 2    │       │ Node 3    │           │   │
│  │  │ (VPS)     │ ◄───► │ (Home)    │ ◄───► │ (VPS)     │           │   │
│  │  └───────────┘       └───────────┘       └───────────┘           │   │
│  │                                                                    │   │
│  │  Features:                                                        │   │
│  │  - No consensus algorithm (no bottleneck)                         │   │
│  │  - Automatic deduplication                                        │   │
│  │  - Optional Zstd compression                                      │   │
│  │  - Works on consumer hardware                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features & Capabilities**:
- Designed for small, self-hosted, geo-distributed deployments
- No RAFT or consensus algorithm (no central bottleneck)
- All data automatically deduplicated
- Optional Zstd compression
- Runs on modest hardware including Raspberry Pi
- NLnet/NGI0 Commons Fund funding in 2025

**S3 API Compatibility**: Good - implements core S3 operations effectively. Some advanced features like lifecycle policies require additional configuration.

**Deployment Options**:
| Method | Complexity | Best For |
|--------|------------|----------|
| Docker | Low | Single-node, testing |
| Docker Compose | Low | Multi-node development |
| Bare Metal | Low | Production, edge devices |
| Kubernetes | Medium | Orchestrated deployments |

**Resource Requirements**:
| Scale | CPU | RAM | Storage |
|-------|-----|-----|---------|
| Minimum | 1 core | 512MB | 10GB+ |
| Recommended | 2+ cores | 2GB+ | 100GB+ |
| Production | 4+ cores | 4GB+ | 1TB+ |

**Pros**:
- Extremely lightweight (runs on Raspberry Pi)
- Designed for geo-distribution from the start
- No consensus bottleneck
- Modern replacement for MinIO community edition
- Active development with funding
- Apache 2.0 compatible workflows via standard S3 tools

**Cons**:
- Smaller community than MinIO
- Less enterprise validation
- AGPLv3 license
- Some S3 features require workarounds

**Best Use Cases**: Home labs, small businesses, geo-distributed deployments, edge computing, privacy-focused self-hosting

**Sources**: [Garage Official](https://garagehq.deuxfleurs.fr/), [Garage GitHub](https://github.com/deuxfleurs-org/garage), [Garage Self-Hosting Guide](https://medium.com/@kryukz/garage-standalone-your-lightweight-s3-compatible-object-storage-journey-5073bd51b566)

---

### 5.3 SeaweedFS

**Overview**: SeaweedFS is a fast distributed storage system inspired by Facebook's Haystack design, optimized for billions of small files with O(1) disk seek operations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SeaweedFS Architecture                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Master Servers (HA)                          │   │
│  │  - Manage volume servers (not individual files)                   │   │
│  │  - Automatic failover, no SPOF                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│              ┌─────────────────────┼─────────────────────┐              │
│              ▼                     ▼                     ▼              │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐     │
│  │  Volume Server 1  │ │  Volume Server 2  │ │  Volume Server 3  │     │
│  │  - 32GB volumes   │ │  - 32GB volumes   │ │  - 32GB volumes   │     │
│  │  - 40 bytes/file  │ │  - Erasure coding │ │  - Cloud tiering  │     │
│  │    metadata       │ │    optional       │ │    optional       │     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘     │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Filer (Optional)                               │   │
│  │  Supports: S3 API, POSIX FUSE, WebDAV, Hadoop, Cloud Drive       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features & Capabilities**:
- O(1) disk seek for file access (optimized for small files)
- Only 40 bytes metadata overhead per file
- Supports billions of files
- Filer supports multiple interfaces: S3, POSIX FUSE, WebDAV, Hadoop
- Cross-datacenter replication
- Erasure coding support
- Automatic TTL expiration
- Automatic Gzip compression by MIME type
- Cloud tiering to external storage

**S3 API Compatibility**: Good - core operations work well. Advanced features like lifecycle policies may need external configuration.

**Deployment Options**:
| Method | Complexity | Best For |
|--------|------------|----------|
| Docker | Low | Development, testing |
| Docker Compose | Low-Medium | Small production |
| Kubernetes | Medium | Scalable production |
| Bare Metal | Medium | Maximum performance |

**Resource Requirements**:
| Component | CPU | RAM | Notes |
|-----------|-----|-----|-------|
| Master | 1+ core | 512MB+ | Lightweight |
| Volume Server | 2+ cores | 2-4GB | Per server |
| Filer | 2+ cores | 2GB+ | Optional |

**Performance**: 2.1ms average latency for small objects (optimized for small file workloads).

**Pros**:
- Excellent small file performance
- Low metadata overhead
- Multiple access interfaces
- Active development
- Apache 2.0 license

**Cons**:
- More complex architecture (master + volume servers)
- Less S3-focused than MinIO/Garage
- Smaller community for S3 use cases

**Best Use Cases**: Applications with billions of small files, image hosting, log storage, data lakes

**Enterprise Version**: Free under 25TB, includes self-healing storage and customizable erasure coding ratios.

**Sources**: [SeaweedFS GitHub](https://github.com/seaweedfs/seaweedfs), [SeaweedFS Enterprise](https://seaweedfs.com/), [SeaweedFS vs JuiceFS](https://dzone.com/articles/seaweedfs-vs-juicefs-in-design-and-features)

---

### 5.4 Ceph (RADOS Gateway)

**Overview**: Ceph is a unified storage platform providing object, block, and file storage from a single cluster. The RADOS Gateway (RGW) provides S3-compatible object storage.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Ceph Architecture                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        RADOS (Foundation)                         │   │
│  │              Reliable Autonomic Distributed Object Store          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│              ┌─────────────────────┼─────────────────────┐              │
│              ▼                     ▼                     ▼              │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐     │
│  │    RGW (S3/Swift) │ │   RBD (Block)     │ │   CephFS (File)   │     │
│  │  Object Storage   │ │  Block Storage    │ │  File Storage     │     │
│  │  S3 Compatible    │ │  VM Disks         │ │  POSIX            │     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    OSD Nodes (Storage)                            │   │
│  │  - 8-16GB RAM per OSD recommended                                │   │
│  │  - Dedicated SSDs for metadata                                   │   │
│  │  - Active scrubbing for bit rot detection                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features & Capabilities**:
- Unified storage (object, block, file)
- Active scrubbing for bit rot/silent corruption detection
- Geo-replication
- Advanced placement policies
- Self-healing
- Multiple redundancy options (replication, erasure coding)
- S3 and Swift API support

**S3 API Compatibility**: Good - comprehensive S3 support via RGW.

**Deployment Options**:
| Method | Complexity | Best For |
|--------|------------|----------|
| Cephadm | Medium | Production deployments |
| Kubernetes (Rook) | Medium-High | Cloud-native deployments |
| Manual | High | Custom configurations |

**Resource Requirements**:
| Scale | CPU | RAM | Storage |
|-------|-----|-----|---------|
| Minimum | 4+ cores | 8GB+ per OSD | 3+ OSDs |
| Production | 8+ cores/node | 16GB+ per OSD | 5+ nodes |
| Enterprise | 16+ cores/node | 32GB+ per OSD | Dedicated metadata SSDs |

**Pros**:
- Unified storage platform
- Active data scrubbing
- Enterprise-grade features
- Fully open-source
- Mature and battle-tested

**Cons**:
- Steep learning curve
- High resource requirements
- Complex to operate
- Small clusters (<5 nodes) may not justify overhead
- Higher latency for small objects

**Best Use Cases**: Large-scale enterprise deployments, organizations needing unified storage, OpenStack environments

**Sources**: [Ceph vs MinIO Comparison](https://openmetal.io/resources/blog/ceph-vs-minio-choosing-the-right-object-storage-solution/), [MinIO Exit Plan to Ceph](https://kubedo.com/minio-exit-plan-ceph-s3-storage/), [2025 Storage Comparison](https://onidel.com/blog/minio-ceph-seaweedfs-garage-2025)

---

### 5.5 RustFS (Emerging Alternative)

**Overview**: RustFS is a new high-performance, S3-compatible object storage written in Rust, positioned as a modern MinIO alternative with Apache 2.0 license.

**Features & Capabilities**:
- 2.3x faster than MinIO for 4KB object payloads
- 300+ GB/s aggregate read throughput
- 100% S3 protocol compatible
- Metadata-free design (all nodes equal)
- Erasure coding with ~50% storage overhead
- Enterprise features: WORM compliance, encryption, multi-site replication
- Cross-platform: Windows, macOS, Linux
- Supports x86, ARM, RISC-V
- Binary size under 100MB

**S3 API Compatibility**: Excellent - 100% S3 protocol compatible.

**Deployment Options**:
| Method | Complexity | Best For |
|--------|------------|----------|
| Docker | Low | Development, testing |
| Kubernetes (Helm) | Medium | Production |
| Bare Metal | Medium | Maximum performance |

**Resource Requirements**: Lightweight, can run on ARM SOCs and edge devices.

**Pros**:
- Apache 2.0 license (permissive)
- Rust memory safety guarantees
- Very high performance
- Modern architecture
- Kubernetes-native with observability stack

**Cons**:
- Currently in beta
- Newer/smaller community
- Less production validation

**Best Use Cases**: Teams seeking permissively-licensed MinIO alternative, high-performance data lakes, AI/ML workloads

**Sources**: [RustFS Official](https://rustfs.com/), [RustFS GitHub](https://github.com/rustfs/rustfs), [RustFS Guide](https://sealos.io/blog/what-is-rustfs)

---

### 5.6 OpenIO

**Overview**: OpenIO is a software-defined object storage with S3 and Swift compatibility, now primarily backing OVHcloud's object storage after acquisition in 2020.

**Features & Capabilities**:
- ConsciousGrid technology (no rebalancing needed when adding nodes)
- S3 and OpenStack Swift API compatible
- Erasure coding and compression
- Minimal requirements (1 CPU, 512MB RAM, 4GB storage minimum)
- Data tiering
- Runs on x86 and ARM

**S3 API Compatibility**: Good - supports Amazon S3 and OpenStack Swift APIs.

**Current Status**: Acquired by OVH in 2020, open-source project remains on GitHub but may have reduced community activity.

**Best Use Cases**: Organizations evaluating OVHcloud, teams needing Swift compatibility

**Sources**: [OpenIO Official](https://www.openio.io/), [OpenIO GitHub](https://github.com/open-io/oio-sds)

---

## Self-Hosted Object Storage Comparison Matrix

| Feature | MinIO | Garage | SeaweedFS | Ceph RGW | RustFS |
|---------|-------|--------|-----------|----------|--------|
| **License** | AGPL v3 | AGPL v3 | Apache 2.0 | LGPL | Apache 2.0 |
| **S3 Compatibility** | Excellent | Good | Good | Good | Excellent |
| **Small File Performance** | Good | Good | Excellent | Fair | Excellent |
| **Large File Performance** | Excellent | Good | Good | Good | Excellent |
| **Resource Requirements** | Medium | Very Low | Low | High | Low |
| **Operational Complexity** | Low | Low | Medium | High | Low |
| **Geo-Distribution** | Limited | Native | Supported | Advanced | Supported |
| **Community Size** | Large | Growing | Medium | Large | Small |
| **Production Readiness** | Mature* | Production | Production | Mature | Beta |
| **Active Development** | Maintenance | Active | Active | Active | Active |

*MinIO community edition is in maintenance mode as of late 2025.

**Recommendation for Self-Hosted Object Storage**:
- **For new projects**: Garage (lightweight, modern) or RustFS (high performance, Apache 2.0)
- **For existing MinIO users**: Evaluate migration to Garage or RustFS
- **For enterprise/complex needs**: Ceph RGW
- **For small files at scale**: SeaweedFS

---

## Self-Hosted CDN / Caching Layer (CloudFront Alternatives)

For self-hosted deployments, you need a caching/CDN layer in front of your object storage to reduce latency, handle SSL termination, and potentially transform content on the fly.

### 6.1 NGINX with Caching

**Overview**: NGINX is a high-performance web server and reverse proxy with built-in caching capabilities. The most versatile option for self-hosted CDN needs.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     NGINX Caching Architecture                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    NGINX (Edge Cache)                             │   │
│  │                                                                    │   │
│  │  Features:                                                        │   │
│  │  - proxy_cache for response caching                               │   │
│  │  - Built-in SSL/TLS termination                                   │   │
│  │  - Load balancing                                                 │   │
│  │  - Rate limiting                                                  │   │
│  │  - Compression (gzip, brotli)                                     │   │
│  │                                                                    │   │
│  │  Configuration:                                                   │   │
│  │  proxy_cache_path /var/cache/nginx levels=1:2                    │   │
│  │                   keys_zone=content_cache:100m max_size=10g;     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Object Storage (MinIO/Garage/SeaweedFS)              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Caching Capabilities**:
- Disk-based caching with configurable size limits
- Cache key customization
- Cache bypass/purge support
- Stale content serving while revalidating
- Micro-caching for dynamic content

**Configuration Complexity**: Medium - familiar syntax, extensive documentation.

**SSL/TLS Termination**: Built-in, excellent Let's Encrypt integration.

**Image Transformation**: Not native - requires additional modules or separate service.

**Pros**:
- Extremely mature and battle-tested
- High performance
- Extensive documentation
- Large community
- Flexible configuration

**Cons**:
- No native content purging (requires module or workaround)
- Limited transformation features
- More complex caching configuration than purpose-built solutions

**Best For**: General-purpose reverse proxy with caching needs.

**Sources**: [NGINX vs Varnish](https://info.varnish-software.com/blog/understanding-the-differences-between-nginx-and-varnish), [KeyCDN Comparison](https://www.keycdn.com/support/varnish-vs-nginx)

---

### 6.2 Varnish Cache

**Overview**: Varnish is a purpose-built HTTP accelerator designed specifically for caching. Known for extreme performance (300-1000x speedup) and the flexible VCL configuration language.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Varnish Cache Architecture                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                 NGINX (SSL Termination)                           │   │
│  │                 or HAProxy                                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Varnish Cache                                  │   │
│  │                                                                    │   │
│  │  Features:                                                        │   │
│  │  - 300-1000x performance improvement                              │   │
│  │  - VCL (Varnish Configuration Language)                          │   │
│  │  - Built-in purge mechanism                                       │   │
│  │  - Grace mode (serve stale while fetching)                       │   │
│  │  - Edge Side Includes (ESI)                                      │   │
│  │  - Inline C for custom logic                                     │   │
│  │                                                                    │   │
│  │  Used by: Fastly, major media sites                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Object Storage (MinIO/Garage/SeaweedFS)              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Caching Capabilities**:
- In-memory caching (extremely fast)
- Complex cache invalidation rules
- Tag-based purging
- Instant purging capabilities
- Greater flexibility than NGINX for complex caching

**Configuration Complexity**: High - requires learning VCL (domain-specific language).

**SSL/TLS Termination**: NOT native - requires NGINX, HAProxy, or Hitch in front.

**Image Transformation**: Not native.

**Pros**:
- Purpose-built for caching (fastest option)
- Excellent for dynamic content
- Instant purging
- Flexible VCL language
- Used by Fastly CDN

**Cons**:
- No native SSL/TLS support
- Steep learning curve (VCL)
- Requires additional proxy for HTTPS
- Memory-intensive

**Best For**: High-traffic sites with complex caching requirements, media sites.

**Sources**: [Varnish Software](https://info.varnish-software.com/blog/understanding-the-differences-between-nginx-and-varnish), [SpinupWP Comparison](https://spinupwp.com/page-caching-varnish-vs-nginx-fastcgi-cache/)

---

### 6.3 Apache Traffic Server (ATS)

**Overview**: Apache Traffic Server is a high-performance caching proxy originally developed by Yahoo, designed for large-scale CDN deployments with millions of concurrent connections.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  Apache Traffic Server Architecture                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Apache Traffic Server                                │   │
│  │                                                                    │   │
│  │  Features:                                                        │   │
│  │  - CDN-grade caching proxy                                       │   │
│  │  - Millions of concurrent connections                            │   │
│  │  - Granular cache purging                                        │   │
│  │  - SSL/TLS termination                                           │   │
│  │  - HTTP/2 and HTTP/3 support                                     │   │
│  │  - Plugin architecture                                            │   │
│  │                                                                    │   │
│  │  Used by: Apple CDN, Comcast, Yahoo                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Object Storage (MinIO/Garage/SeaweedFS)              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Caching Capabilities**:
- Advanced caching system rivaling dedicated solutions
- Granular cache purging
- CDN-grade performance
- Supports millions of concurrent connections

**Configuration Complexity**: Medium-High.

**SSL/TLS Termination**: Built-in support.

**Image Transformation**: Not native.

**Pros**:
- Enterprise-grade, battle-tested (used by Apple, Comcast)
- Excellent for high-traffic environments
- Built-in SSL/TLS
- HTTP/2 and HTTP/3 support
- Granular cache control

**Cons**:
- Less community documentation than NGINX
- More complex than needed for smaller deployments
- Steeper learning curve

**Best For**: Large-scale CDN deployments, high-traffic environments requiring CDN-level features.

**Sources**: [ATS vs NGINX](https://punjabinfoline.com/en/news-ae7fy1m), [Apache Traffic Server](https://trafficserver.apache.org/)

---

### 6.4 Squid Proxy

**Overview**: Squid is a mature caching proxy server with decades of production use, supporting HTTP, HTTPS, and FTP.

**Caching Capabilities**:
- Hierarchical caching
- Web content caching
- Cache digest for distributed caching
- Configurable refresh patterns

**Configuration Complexity**: Medium - configuration file based.

**SSL/TLS Termination**: Supported via SSL-Bump.

**Image Transformation**: Not native.

**Pros**:
- Very mature and stable
- Extensive documentation
- Good for forward and reverse proxy
- Cache hierarchy support

**Cons**:
- Older architecture
- Less performant than modern alternatives
- Complex SSL handling

**Best For**: Traditional proxy deployments, forward proxy use cases.

**Sources**: [Red Hat Squid Guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/configuring-the-squid-caching-proxy-server), [Squid Wiki](https://wiki.squid-cache.org/)

---

### 6.5 Traefik with Caching

**Overview**: Traefik is a modern cloud-native reverse proxy and load balancer with caching available via plugins or enterprise edition.

**Caching Capabilities**:
- HTTP Cache middleware (Enterprise/Hub)
- Memory or distributed storage
- Souin plugin for community edition
- RFC 7234 compliant

**Configuration Complexity**: Low-Medium - YAML/TOML based, auto-discovery.

**SSL/TLS Termination**: Built-in with automatic Let's Encrypt.

**Image Transformation**: Not native.

**Pros**:
- Cloud-native, Kubernetes-friendly
- Auto-discovery of services
- Automatic SSL with Let's Encrypt
- Modern, active development

**Cons**:
- Advanced caching requires Enterprise or plugins
- Less mature caching than purpose-built solutions
- Plugins may have limitations

**Best For**: Kubernetes environments, modern microservices architectures.

**Sources**: [Traefik Enterprise Cache](https://doc.traefik.io/traefik-enterprise/middlewares/http-cache/), [Souin Plugin](https://plugins.traefik.io/plugins/6294728cffc0cd18356a97c2/souin)

---

### Self-Hosted CDN Comparison Matrix

| Feature | NGINX | Varnish | Apache TS | Squid | Traefik |
|---------|-------|---------|-----------|-------|---------|
| **Performance** | Excellent | Best | Excellent | Good | Very Good |
| **SSL/TLS Native** | Yes | No | Yes | Limited | Yes |
| **Cache Purging** | Module | Built-in | Built-in | Limited | Plugin |
| **Configuration** | Medium | High (VCL) | Medium-High | Medium | Low-Medium |
| **Kubernetes** | Good | Fair | Fair | Fair | Excellent |
| **Community** | Largest | Large | Medium | Medium | Growing |
| **Documentation** | Excellent | Good | Good | Good | Good |

**Recommendation for Self-Hosted CDN**:
- **General purpose**: NGINX (best balance of features and simplicity)
- **Maximum caching performance**: Varnish + NGINX (for SSL)
- **Enterprise/CDN-grade**: Apache Traffic Server
- **Kubernetes-native**: Traefik with Souin plugin

---

## Self-Hosted Image Processing

On-the-fly image transformation is essential for responsive images and bandwidth optimization.

### 7.1 Imgproxy

**Overview**: Imgproxy is the fastest open-source image processing server, built with Go and libvips. Security-focused with URL signing support.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Imgproxy Architecture                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Request: /rs:fit:300:200/plain/s3://bucket/image.jpg                   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       Imgproxy                                    │   │
│  │                                                                    │   │
│  │  Features:                                                        │   │
│  │  - Fastest image processing (2x faster than alternatives)        │   │
│  │  - URL-based transformations                                      │   │
│  │  - Signed URLs for security                                       │   │
│  │  - S3/GCS/Azure/local storage support                            │   │
│  │  - WebP/AVIF auto-conversion                                     │   │
│  │  - Watermarking                                                   │   │
│  │  - Smart cropping (face detection)                               │   │
│  │                                                                    │   │
│  │  Operations: resize, crop, rotate, blur, sharpen, watermark      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Object Storage (S3-compatible)                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Performance**: 2x+ faster than Thumbor and Imagor in benchmarks (JPEG, PNG, WebP, AVIF resizing).

**Features**:
- Resize, crop, rotate, blur, sharpen
- Format conversion (WebP, AVIF, PNG, JPEG, GIF)
- Watermarking
- Smart cropping with face detection
- URL signing for security
- Prometheus metrics

**Deployment**: Docker image available, Kubernetes-ready.

**Pricing**: Open source (MIT license). Pro version adds chained pipelines, video thumbnails, PDF rendering.

**Pros**:
- Best performance
- Security-focused (signed URLs, no arbitrary URLs)
- Runs on your infrastructure
- Low memory usage

**Cons**:
- Some features require Pro version
- URL format learning curve

**Best For**: High-volume image processing, security-conscious deployments.

**Sources**: [Imgproxy Blog Benchmark](https://imgproxy.net/blog/image-processing-servers-benchmark/), [Imgproxy Overview](https://best-of-web.builder.io/library/imgproxy/imgproxy)

---

### 7.2 Thumbor

**Overview**: Thumbor is a smart imaging service with advanced features like face detection and smart cropping, written in Python.

**Features**:
- Smart cropping with face/feature detection
- Filters: brightness, contrast, noise, blur
- Format conversion
- Extensive filter chain
- Plugins for additional features

**Performance**: Slower than Imgproxy (~50% of Imgproxy's throughput). Single CPU core utilization.

**Deployment**: Docker available.

**Pros**:
- More feature-rich than Imgproxy free version
- Advanced smart cropping
- Extensive customization

**Cons**:
- Single-core limitation
- Slower performance
- Python-based (higher resource usage)

**Best For**: Complex image processing with advanced cropping needs.

**Sources**: [Thumbor Alternatives](https://sourceforge.net/software/product/thumbor/alternatives)

---

### 7.3 Imagor

**Overview**: Imagor is a Go-based alternative with Thumbor-compatible API, using libvips for processing.

**Features**:
- Thumbor-compatible API
- Written in Go (like Imgproxy)
- Uses libvips
- Docker-ready

**Performance**: Similar to Thumbor (~50% of Imgproxy's throughput).

**Pros**:
- Drop-in Thumbor replacement
- Go-based (better than Python)
- Active development

**Cons**:
- Slower than Imgproxy
- Smaller community

**Best For**: Migrating from Thumbor with Go runtime.

---

### 7.4 Imaginary (Not Recommended)

**Status**: Appears abandoned as of 2024-2025. Has ongoing memory issues. Not recommended for new projects.

---

### Image Processing Recommendation

| Use Case | Recommended Solution |
|----------|---------------------|
| High-volume, security-focused | Imgproxy |
| Advanced smart cropping | Thumbor |
| Thumbor migration | Imagor |
| Budget/simple needs | Imgproxy (free) |
| Enterprise features | Imgproxy Pro |

---

## Self-Hosted Video Transcoding

### 8.1 FFmpeg (Containerized)

**Overview**: FFmpeg is the industry-standard multimedia framework. For self-hosted deployments, run FFmpeg in containers with job queues.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FFmpeg Transcoding Architecture                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Message Queue (RabbitMQ/Redis)                 │   │
│  │                    Transcode Job Queue                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│              ┌─────────────────────┼─────────────────────┐              │
│              ▼                     ▼                     ▼              │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐     │
│  │  FFmpeg Worker 1  │ │  FFmpeg Worker 2  │ │  FFmpeg Worker N  │     │
│  │  (Docker/K8s Pod) │ │  (Docker/K8s Pod) │ │  (Docker/K8s Pod) │     │
│  │                   │ │                   │ │                   │     │
│  │  - CPU or GPU     │ │  - Scales with    │ │  - Kubernetes     │     │
│  │  - h264_nvenc     │ │    demand         │ │    Job/CronJob    │     │
│  │  - hevc_nvenc     │ │                   │ │                   │     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘     │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Object Storage (Transcoded HLS/DASH segments)        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Docker Images**:
- `linuxserver/ffmpeg` - Updated to FFmpeg 7.1.1 (March 2025)
- `jrottenberg/ffmpeg` - Popular pre-built image
- NVIDIA CUDA images for GPU acceleration

**GPU Acceleration**: NVENC/NVDEC with NVIDIA GPUs can reduce encoding time from 30 seconds to a few seconds for typical videos.

**Kubernetes Deployment**: Use Jobs or batch processing frameworks. Define CPU/memory limits per pod.

**Output Formats**:
- HLS (HTTP Live Streaming) - Best compatibility
- DASH (Dynamic Adaptive Streaming over HTTP) - Open standard
- Multiple quality levels (1080p, 720p, 480p, 360p)

**Pros**:
- Industry standard
- Maximum flexibility
- GPU acceleration support
- Cost-effective at scale

**Cons**:
- Requires infrastructure management
- Need to build job queue system
- Scaling complexity

**Best For**: Cost-conscious deployments at scale, teams with DevOps expertise.

**Sources**: [FFmpeg in Docker](https://img.ly/blog/how-to-run-ffmpeg-inside-a-docker-container/), [FFmpeg on Kubernetes](https://tecktol.com/deploy-ffmpeg-kubernetes/)

---

### 8.2 SRS (Simple Realtime Server)

**Overview**: SRS is a simple, high-efficiency real-time video server supporting RTMP, WebRTC, HLS, HTTP-FLV, SRT, MPEG-DASH with codec support for H.264, H.265, AV1, VP9.

**Features**:
- Live streaming (RTMP ingest to HLS/DASH output)
- WebRTC support
- Multiple codec support
- Written in C++
- Docker-ready

**Best For**: Live streaming scenarios, real-time video processing.

**Sources**: [SRS GitHub](https://github.com/ossrs/srs)

---

### 8.3 Clustercode

**Overview**: Distribute video encoding tasks across a cluster of nodes using FFmpeg.

**Features**:
- Distributed FFmpeg encoding
- Splits videos into segments for parallel processing
- Kubernetes support

**Best For**: Large-scale batch transcoding.

**Sources**: [Clustercode GitHub](https://github.com/ccremer/clustercode)

---

## Complete Self-Hosted Stack Recommendation

Based on the research, here is the recommended production-ready, fully open-source stack:

```
┌─────────────────────────────────────────────────────────────────────────┐
│            Recommended Self-Hosted Content Distribution Stack            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                           ┌─────────────────┐                           │
│                           │    Clients      │                           │
│                           └────────┬────────┘                           │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Layer 1: Edge / CDN (NGINX or Traefik with Caching)            │   │
│  │   - SSL termination (Let's Encrypt)                               │   │
│  │   - Response caching                                              │   │
│  │   - Load balancing                                                │   │
│  │   - Rate limiting                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│              ┌─────────────────────┼─────────────────────┐              │
│              ▼                     ▼                     ▼              │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐     │
│  │   Imgproxy        │ │   Content API     │ │   Video Player    │     │
│  │   (Images)        │ │   (Metadata)      │ │   (HLS.js)        │     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘     │
│              │                     │                     │              │
│              └─────────────────────┼─────────────────────┘              │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Layer 2: Object Storage (Choose One)                            │   │
│  │                                                                    │   │
│  │   Option A: Garage (Lightweight, geo-distributed)                │   │
│  │   Option B: RustFS (High-performance, Apache 2.0)                │   │
│  │   Option C: SeaweedFS (Billions of small files)                  │   │
│  │   Option D: MinIO (S3 compatibility, existing deployments)       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Layer 3: Processing Pipeline (Background Workers)               │   │
│  │                                                                    │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│  │   │ Image       │  │ Video       │  │ Virus       │              │   │
│  │   │ Processing  │  │ Transcoding │  │ Scanning    │              │   │
│  │   │ (ImageSharp)│  │ (FFmpeg)    │  │ (ClamAV)    │              │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Layer 4: Message Queue (RabbitMQ or Redis Streams)             │   │
│  │   - Job queuing for transcoding                                  │   │
│  │   - Event-driven processing                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture Examples

### Docker Compose Structure (Development/Small Production)

```yaml
# docker-compose.yml (conceptual structure)
version: '3.8'

services:
  # CDN/Proxy Layer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - nginx-cache:/var/cache/nginx
      - ./certs:/etc/nginx/certs
    depends_on:
      - garage
      - imgproxy
      - content-api

  # Object Storage
  garage:
    image: dxflrs/garage:v1.0.0
    ports:
      - "3900:3900"  # S3 API
      - "3902:3902"  # Admin API
    volumes:
      - garage-data:/var/lib/garage/data
      - garage-meta:/var/lib/garage/meta
    environment:
      - GARAGE_ALLOW_WORLD_READABLE_SECRETS=true

  # Image Processing
  imgproxy:
    image: darthsim/imgproxy:latest
    ports:
      - "8080:8080"
    environment:
      - IMGPROXY_USE_S3=true
      - IMGPROXY_S3_ENDPOINT=http://garage:3900
      - AWS_ACCESS_KEY_ID=<key>
      - AWS_SECRET_ACCESS_KEY=<secret>
      - IMGPROXY_KEY=<signing-key>
      - IMGPROXY_SALT=<signing-salt>

  # Video Transcoding Worker
  ffmpeg-worker:
    image: linuxserver/ffmpeg
    volumes:
      - ./transcode-scripts:/scripts
    # Run as job processor, not continuous service

  # Virus Scanning
  clamav:
    image: clamav/clamav:stable
    volumes:
      - clamav-db:/var/lib/clamav

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  # Content API (Your Application)
  content-api:
    build: ./ContentService
    depends_on:
      - garage
      - rabbitmq
    environment:
      - S3_ENDPOINT=http://garage:3900
      - RABBITMQ_HOST=rabbitmq

volumes:
  nginx-cache:
  garage-data:
  garage-meta:
  clamav-db:
```

### Kubernetes Deployment Considerations

```yaml
# Key components for Kubernetes deployment:

# 1. Storage: Use StatefulSet for object storage
# - Garage: Minimal resources, good for edge
# - MinIO: Use Operator for production
# - SeaweedFS: Master + Volume server topology

# 2. Caching: Use DaemonSet or Deployment
# - NGINX Ingress Controller with caching
# - Or dedicated NGINX/Varnish pods

# 3. Processing: Use Jobs or Deployments
# - Imgproxy: Deployment with HPA
# - FFmpeg: Kubernetes Jobs triggered by queue

# 4. Resource Estimates (minimum production):
# Object Storage (Garage 3-node):
#   - CPU: 2 cores per node
#   - RAM: 4GB per node
#   - Storage: As needed

# Imgproxy:
#   - CPU: 2-4 cores
#   - RAM: 2GB

# FFmpeg Workers:
#   - CPU: 4+ cores (or GPU)
#   - RAM: 4GB per worker

# NGINX Cache:
#   - CPU: 1-2 cores
#   - RAM: 2GB + cache size

# Total Minimum: 12+ cores, 20GB+ RAM
```

### Resource Estimates Summary

| Component | Min CPU | Min RAM | Storage | Notes |
|-----------|---------|---------|---------|-------|
| Garage (3 nodes) | 6 cores | 6GB | Variable | 2c/2GB per node |
| NGINX (cache) | 2 cores | 4GB | 10-100GB cache | Scale with traffic |
| Imgproxy | 4 cores | 2GB | None | Scales horizontally |
| FFmpeg Worker | 4 cores | 4GB | Temp space | Or GPU |
| ClamAV | 2 cores | 4GB | 2GB DB | Signature DB |
| RabbitMQ | 2 cores | 2GB | Varies | Message persistence |
| **Total Minimum** | **20 cores** | **22GB** | **50GB+ cache** | Production baseline |

---

### Storage Recommendation Matrix

| Criteria | Azure Blob | AWS S3 | GCS | Cloudflare R2 | MinIO |
|----------|------------|--------|-----|---------------|-------|
| **Best Price** | 3 | 3 | 3 | 5 | 4 |
| **Global Reach** | 4 | 5 | 3 | 5 | 2 |
| **Ease of Use** | 4 | 3 | 4 | 4 | 3 |
| **Enterprise Features** | 5 | 5 | 4 | 3 | 3 |
| **SDK Support** | 4 | 5 | 4 | 3 | 4 |
| **Vendor Lock-in Risk** | 3 | 3 | 3 | 4 | 5 |
| **Image Processing** | 3 | 4 | 5 | 5 | 2 |
| **Video Processing** | 3 | 4 | 5 | 5 | 2 |

**Recommendation**:
- **For existing Azure infrastructure**: Azure Blob Storage + Azure CDN
- **For existing AWS infrastructure**: AWS S3 + CloudFront
- **For cost optimization**: Cloudflare R2 + Cloudflare Images/Stream
- **For development/testing**: MinIO (can migrate to S3/R2 later due to API compatibility)

---

## CDN Integration Strategies

### Strategy 1: Direct CDN Origin (Simple)

```
┌──────────┐      ┌──────────┐      ┌──────────────┐
│  Client  │ ───► │   CDN    │ ───► │ Blob Storage │
└──────────┘      └──────────┘      └──────────────┘
                       │
                       │ Cache-Control headers
                       │ determine caching behavior
```

**Configuration**:
```yaml
# CDN Cache Rules
- images/*: Cache 30 days
- videos/*: Cache 7 days
- documents/*: Cache 24 hours
- thumbnails/*: Cache 90 days
```

**Pros**: Simple, minimal infrastructure
**Cons**: No transformation at edge, cache invalidation can be slow

---

### Strategy 2: Image CDN with Transformations (Recommended)

```
┌──────────┐      ┌──────────────────┐      ┌──────────────┐
│  Client  │ ───► │  Image CDN       │ ───► │ Blob Storage │
│          │      │  (Cloudflare/    │      │              │
│          │      │   Imgix/Bunny)   │      │              │
└──────────┘      └──────────────────┘      └──────────────┘
                          │
                          │ On-the-fly transformations:
                          │ - Resize
                          │ - Format conversion
                          │ - Quality adjustment
                          │ - Watermarking
```

**URL Pattern**:
```
https://cdn.example.com/images/{tenantId}/{imageId}?w=400&h=300&format=webp&quality=80
```

**Image CDN Options**:

| Provider | Pricing | Features |
|----------|---------|----------|
| **Cloudflare Images** | $5/mo + $1/100K images | Basic transforms, included CDN |
| **Imgix** | $10/mo + $3/1K transforms | Advanced transforms, analytics |
| **Bunny.net** | $9.5/mo + $0.001/transform | Good value, global edge |
| **ImageKit** | $0 (free tier) - $49/mo | Good transforms, dev-friendly |
| **Cloudinary** | Free tier, then $99+/mo | Most features, ML-powered |

**Recommendation**: Start with Cloudflare Images for cost efficiency, migrate to Cloudinary/Imgix for advanced features if needed.

---

### Strategy 3: Lambda@Edge / Workers (Advanced)

```
┌──────────┐      ┌──────────────────┐      ┌──────────────┐
│  Client  │ ───► │  CDN Edge        │ ───► │ Blob Storage │
│          │      │  + Edge Function │      │              │
│          │      │  (Lambda@Edge/   │      │              │
│          │      │   CF Workers)    │      │              │
└──────────┘      └──────────────────┘      └──────────────┘
                          │
                          │ Custom logic:
                          │ - Auth validation
                          │ - Geo-restrictions
                          │ - A/B testing
                          │ - Custom headers
```

**Use Cases**:
- Validate signed URLs at edge
- Apply geo-restrictions
- Dynamic content negotiation
- Custom caching logic

---

## Security Best Practices

### 1. Secure Upload Patterns

#### 1.1 Signed URL Upload (Recommended)

```
┌────────────┐     1. Request upload URL    ┌─────────────────┐
│   Client   │ ─────────────────────────►   │  Content API    │
│            │                               │                 │
│            │     2. Return signed URL      │                 │
│            │ ◄─────────────────────────    │                 │
│            │                               └─────────────────┘
│            │
│            │     3. Upload directly to storage
│            │ ───────────────────────────────────────────────►
│            │                               ┌─────────────────┐
│            │                               │  Blob Storage   │
│            │     4. Upload confirmation    │                 │
│            │ ◄───────────────────────────  │                 │
└────────────┘                               └─────────────────┘
                                                      │
                                                      │ 5. Storage event
                                                      ▼
                                             ┌─────────────────┐
                                             │  Processing     │
                                             │  Pipeline       │
                                             │  (scan, resize) │
                                             └─────────────────┘
```

**Signed URL Generation**:
```csharp
public class SignedUrlService
{
    public async Task<SignedUploadUrl> GenerateUploadUrlAsync(
        Guid tenantId,
        string fileName,
        string contentType,
        long maxSizeBytes)
    {
        // Validate content type
        if (!IsAllowedContentType(contentType))
            throw new InvalidContentTypeException(contentType);

        // Generate unique blob path
        var blobPath = $"{tenantId}/uploads/{Guid.NewGuid()}/{SanitizeFileName(fileName)}";

        // Generate SAS token (Azure) or presigned URL (S3)
        var sasUri = _blobClient.GenerateSasUri(
            permissions: BlobSasPermissions.Write | BlobSasPermissions.Create,
            expiresOn: DateTimeOffset.UtcNow.AddMinutes(15),
            contentType: contentType,
            contentLength: maxSizeBytes);

        return new SignedUploadUrl
        {
            UploadUrl = sasUri.ToString(),
            BlobPath = blobPath,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15),
            ContentId = Guid.NewGuid()
        };
    }
}
```

#### 1.2 Virus Scanning Pipeline

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  uploads/       │ ───► │  Virus Scanner  │ ───► │  processed/     │
│  (quarantine)   │      │  (ClamAV/       │      │  (approved)     │
│                 │      │   Defender)     │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  │ If infected
                                  ▼
                         ┌─────────────────┐
                         │   quarantine/   │
                         │   (infected)    │
                         │   + Alert       │
                         └─────────────────┘
```

**Scanning Options**:

| Option | Type | Cost | Latency |
|--------|------|------|---------|
| ClamAV (self-hosted) | Open source | Free | Low |
| Azure Defender for Storage | Managed | ~$0.02/GB | Low |
| VirusTotal API | Cloud | $600+/mo | Medium |
| AWS GuardDuty | Managed | ~$0.80/GB | Low |

**Recommended Flow**:
1. Upload goes to `uploads/` container (quarantine)
2. Storage event triggers virus scan function
3. Clean files moved to `processed/` container
4. Infected files moved to `quarantine/infected/`
5. Alert sent to security team

#### 1.3 Content Type Validation

```csharp
public class ContentValidationService
{
    // Magic bytes for file type detection (not just extension)
    private static readonly Dictionary<string, byte[]> MagicBytes = new()
    {
        { "image/jpeg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { "image/png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
        { "image/gif", new byte[] { 0x47, 0x49, 0x46, 0x38 } },
        { "image/webp", new byte[] { 0x52, 0x49, 0x46, 0x46 } },
        { "video/mp4", new byte[] { 0x00, 0x00, 0x00 } }, // ftyp follows
        { "application/pdf", new byte[] { 0x25, 0x50, 0x44, 0x46 } },
    };

    public async Task<ContentValidationResult> ValidateAsync(Stream content, string claimedType)
    {
        var buffer = new byte[12];
        await content.ReadAsync(buffer, 0, 12);
        content.Position = 0;

        // Detect actual type from magic bytes
        var detectedType = DetectContentType(buffer);

        // Validate claimed type matches actual type
        if (detectedType != claimedType)
        {
            return ContentValidationResult.Failed(
                $"Content type mismatch: claimed {claimedType}, detected {detectedType}");
        }

        // Additional validation per type
        return claimedType switch
        {
            var t when t.StartsWith("image/") => await ValidateImageAsync(content),
            var t when t.StartsWith("video/") => await ValidateVideoAsync(content),
            "application/pdf" => await ValidatePdfAsync(content),
            _ => ContentValidationResult.Success()
        };
    }
}
```

### 2. Access Control Patterns

#### 2.1 Tenant Isolation

```
Storage Structure:
/tenants/
    ├── {tenant-a-id}/          # Tenant A's content
    │   ├── images/
    │   ├── videos/
    │   └── documents/
    ├── {tenant-b-id}/          # Tenant B's content
    │   ├── images/
    │   └── ...
    └── shared/                  # Platform assets (logos, etc.)
```

**Access Control Implementation**:
```csharp
public class TenantScopedStorageService : IStorageService
{
    private readonly ICurrentTenantService _tenantService;
    private readonly IBlobStorageClient _blobClient;

    public async Task<BlobInfo> GetBlobAsync(string blobPath)
    {
        // Extract tenant ID from path
        var pathTenantId = ExtractTenantIdFromPath(blobPath);

        // Validate current user has access to this tenant's content
        if (pathTenantId != _tenantService.TenantId)
        {
            throw new UnauthorizedAccessException(
                "Cannot access content from another tenant");
        }

        return await _blobClient.GetBlobAsync(blobPath);
    }

    public string BuildTenantPath(string relativePath)
    {
        return $"tenants/{_tenantService.TenantId}/{relativePath}";
    }
}
```

#### 2.2 Signed URL for Content Access

```csharp
public class ContentAccessService
{
    public async Task<string> GetSignedUrlAsync(
        Guid contentId,
        TimeSpan? validity = null,
        ContentTransformOptions? transforms = null)
    {
        var content = await _repository.GetByIdAsync(contentId);

        if (content == null)
            throw new ContentNotFoundException(contentId);

        // Check tenant access
        if (content.TenantId != _tenantService.TenantId)
            throw new UnauthorizedAccessException();

        // Generate signed URL
        var expiresAt = DateTimeOffset.UtcNow.Add(validity ?? TimeSpan.FromHours(1));

        var signature = GenerateSignature(
            contentId,
            expiresAt,
            transforms,
            _signingKey);

        var baseUrl = $"{_cdnBaseUrl}/{content.CdnPath}";
        var queryParams = new Dictionary<string, string>
        {
            ["expires"] = expiresAt.ToUnixTimeSeconds().ToString(),
            ["sig"] = signature
        };

        if (transforms != null)
        {
            queryParams["w"] = transforms.Width?.ToString();
            queryParams["h"] = transforms.Height?.ToString();
            queryParams["format"] = transforms.Format;
        }

        return BuildUrl(baseUrl, queryParams);
    }
}
```

#### 2.3 Role-Based Access

```csharp
public enum ContentPermission
{
    View,       // Can view/download content
    Upload,     // Can upload new content
    Edit,       // Can edit metadata
    Delete,     // Can delete content
    Manage      // Full access including bulk operations
}

// Permission matrix by role
public static class ContentPermissions
{
    public static readonly Dictionary<string, ContentPermission[]> RolePermissions = new()
    {
        ["Viewer"] = new[] { ContentPermission.View },
        ["Editor"] = new[] { ContentPermission.View, ContentPermission.Upload, ContentPermission.Edit },
        ["Admin"] = Enum.GetValues<ContentPermission>(),
        ["SuperAdmin"] = Enum.GetValues<ContentPermission>()
    };
}
```

### 3. Content Sanitization

#### 3.1 Image Sanitization

```csharp
public class ImageSanitizer
{
    public async Task<Stream> SanitizeAsync(Stream imageStream, string contentType)
    {
        using var image = await Image.LoadAsync(imageStream);

        // Remove EXIF metadata (privacy)
        image.Metadata.ExifProfile = null;
        image.Metadata.IptcProfile = null;
        image.Metadata.XmpProfile = null;

        // Re-encode to strip any hidden data
        var outputStream = new MemoryStream();
        await image.SaveAsync(outputStream, GetEncoder(contentType));
        outputStream.Position = 0;

        return outputStream;
    }
}
```

#### 3.2 PDF Sanitization

```csharp
public class PdfSanitizer
{
    public async Task<Stream> SanitizeAsync(Stream pdfStream)
    {
        // Options:
        // 1. Use pdf-parser libraries to strip JavaScript/forms
        // 2. Re-render as images and reconstruct PDF
        // 3. Use third-party API (Adobe PDF Services, etc.)

        // Example using iText7:
        using var reader = new PdfReader(pdfStream);
        var outputStream = new MemoryStream();
        using var writer = new PdfWriter(outputStream);
        using var pdfDoc = new PdfDocument(reader, writer);

        // Remove JavaScript
        pdfDoc.GetCatalog().Remove(PdfName.JavaScript);

        // Remove forms
        var acroForm = PdfAcroForm.GetAcroForm(pdfDoc, false);
        acroForm?.FlattenFields();

        pdfDoc.Close();
        outputStream.Position = 0;
        return outputStream;
    }
}
```

---

## Scalability Considerations

### 1. Image Optimization Strategies

#### 1.1 Responsive Images

```
Original Image (4000x3000, 5MB)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Image Processing Pipeline                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Generate Variants:                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Thumbnail:  200x150   │ 20KB  │ WebP │ quality=75    │   │
│  │ Small:      400x300   │ 50KB  │ WebP │ quality=80    │   │
│  │ Medium:     800x600   │ 120KB │ WebP │ quality=85    │   │
│  │ Large:      1600x1200 │ 300KB │ WebP │ quality=90    │   │
│  │ Original:   4000x3000 │ 2MB   │ WebP │ quality=95    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Store:                                                      │
│  /images/{id}/                                               │
│      ├── thumb_200.webp                                      │
│      ├── sm_400.webp                                         │
│      ├── md_800.webp                                         │
│      ├── lg_1600.webp                                        │
│      └── original.webp                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Implementation**:
```csharp
public class ImageProcessingService
{
    private static readonly ImageVariant[] DefaultVariants = new[]
    {
        new ImageVariant("thumb", 200, 150, 75, ImageFormat.WebP),
        new ImageVariant("sm", 400, 300, 80, ImageFormat.WebP),
        new ImageVariant("md", 800, 600, 85, ImageFormat.WebP),
        new ImageVariant("lg", 1600, 1200, 90, ImageFormat.WebP),
    };

    public async Task<IEnumerable<ProcessedImage>> ProcessImageAsync(
        Stream imageStream,
        Guid contentId,
        ImageVariant[]? variants = null)
    {
        variants ??= DefaultVariants;
        var results = new List<ProcessedImage>();

        using var image = await Image.LoadAsync(imageStream);

        // Store original (converted to WebP for consistency)
        var originalPath = await SaveVariantAsync(image, contentId, "original", image.Width, image.Height, 95);
        results.Add(new ProcessedImage("original", originalPath, image.Width, image.Height));

        // Generate each variant
        foreach (var variant in variants)
        {
            if (image.Width >= variant.Width && image.Height >= variant.Height)
            {
                var resized = image.Clone(ctx =>
                    ctx.Resize(new ResizeOptions
                    {
                        Size = new Size(variant.Width, variant.Height),
                        Mode = ResizeMode.Max,
                        Sampler = KnownResamplers.Lanczos3
                    }));

                var path = await SaveVariantAsync(resized, contentId, variant.Name, variant.Width, variant.Height, variant.Quality);
                results.Add(new ProcessedImage(variant.Name, path, resized.Width, resized.Height));
            }
        }

        return results;
    }
}
```

#### 1.2 On-Demand vs Pre-generated

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Pre-generated** | Fast delivery, predictable storage | Higher storage cost, processing delay | High-traffic content |
| **On-demand** | Lower storage, no processing delay | First-request latency, edge compute cost | Low-traffic, many variants |
| **Hybrid** | Best of both | More complex | Most production systems |

**Hybrid Strategy**:
```csharp
public async Task<string> GetImageUrlAsync(
    Guid contentId,
    string variant,
    ImageTransformOptions? transforms = null)
{
    // Check if pre-generated variant exists
    var pregenPath = $"images/{contentId}/{variant}.webp";
    if (await _storage.ExistsAsync(pregenPath))
    {
        return _cdn.GetUrl(pregenPath);
    }

    // For custom transforms or missing variants, use image CDN
    if (transforms != null)
    {
        return _imageCdn.GetTransformUrl(
            $"images/{contentId}/original.webp",
            transforms);
    }

    // Queue background generation of missing variant
    await _queue.EnqueueAsync(new GenerateVariantMessage(contentId, variant));

    // Return on-demand URL for now
    return _imageCdn.GetTransformUrl(
        $"images/{contentId}/original.webp",
        new ImageTransformOptions { Width = GetVariantWidth(variant) });
}
```

### 2. Video Transcoding Approaches

#### 2.1 Transcoding Pipeline

```
Original Video (MOV, 4K, 2GB)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Video Transcoding Pipeline                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Extract Metadata                                         │
│     - Duration, resolution, codec, bitrate                   │
│                                                              │
│  2. Generate Thumbnail (from 10% mark)                       │
│                                                              │
│  3. Transcode to Adaptive Bitrate                           │
│     ┌──────────────────────────────────────────────────────┐│
│     │ Quality    │ Resolution │ Bitrate │ Codec           ││
│     │──────────────────────────────────────────────────────││
│     │ 1080p      │ 1920x1080  │ 5 Mbps  │ H.264/H.265     ││
│     │ 720p       │ 1280x720   │ 2.5 Mbps│ H.264           ││
│     │ 480p       │ 854x480    │ 1 Mbps  │ H.264           ││
│     │ 360p       │ 640x360    │ 0.5 Mbps│ H.264           ││
│     └──────────────────────────────────────────────────────┘│
│                                                              │
│  4. Generate HLS/DASH Manifest                              │
│                                                              │
│  5. Store Segments                                          │
│     /videos/{id}/                                           │
│         ├── master.m3u8                                     │
│         ├── 1080p/                                          │
│         │   ├── playlist.m3u8                               │
│         │   └── segment_*.ts                                │
│         ├── 720p/...                                        │
│         ├── 480p/...                                        │
│         ├── 360p/...                                        │
│         └── thumbnail.jpg                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 Transcoding Options

| Option | Type | Cost | Latency | Best For |
|--------|------|------|---------|----------|
| **FFmpeg (self-hosted)** | Open source | Compute only | Medium | Full control, cost savings |
| **Azure Media Services** | Managed | $0.015/min | Medium | Azure integration |
| **AWS Elemental** | Managed | $0.024/min | Low | AWS integration |
| **Cloudflare Stream** | Managed | $5/1K min stored | Low | Simple setup |
| **Mux** | Managed | $0.007/min | Low | Developer-friendly |
| **Coconut.co** | API | $0.03/min | Medium | On-demand transcoding |

**Recommendation**:
- For MVP: Cloudflare Stream or Mux (zero ops overhead)
- For cost optimization at scale: Self-hosted FFmpeg on containers

#### 2.3 Async Processing Pattern

```csharp
public class VideoUploadHandler
{
    public async Task<ContentUploadResult> HandleAsync(VideoUploadCommand command)
    {
        // 1. Create content record with "Processing" status
        var content = new Content
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            FileName = command.FileName,
            ContentType = "video/mp4",
            Status = ContentStatus.Processing,
            UploadedAt = DateTime.UtcNow
        };
        await _repository.AddAsync(content);

        // 2. Upload original to storage
        var originalPath = $"videos/{content.Id}/original.mp4";
        await _storage.UploadAsync(command.VideoStream, originalPath);

        // 3. Queue transcoding job
        await _messageQueue.PublishAsync(new TranscodeVideoMessage
        {
            ContentId = content.Id,
            TenantId = command.TenantId,
            SourcePath = originalPath,
            Qualities = new[] { "1080p", "720p", "480p", "360p" }
        });

        // 4. Return immediately with processing status
        return new ContentUploadResult
        {
            ContentId = content.Id,
            Status = ContentStatus.Processing,
            EstimatedProcessingTime = EstimateProcessingTime(command.FileSizeBytes)
        };
    }
}

// Background worker
public class VideoTranscodeWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var message in _queue.ConsumeAsync<TranscodeVideoMessage>(stoppingToken))
        {
            try
            {
                // Transcode video
                var result = await _transcoder.TranscodeAsync(message);

                // Update content record
                await _repository.UpdateAsync(message.ContentId, c =>
                {
                    c.Status = ContentStatus.Ready;
                    c.Variants = result.GeneratedVariants;
                    c.Duration = result.Duration;
                    c.ThumbnailUrl = result.ThumbnailUrl;
                });

                // Notify via SignalR/webhook
                await _notificationService.NotifyContentReadyAsync(message.ContentId);
            }
            catch (Exception ex)
            {
                await _repository.UpdateAsync(message.ContentId, c =>
                {
                    c.Status = ContentStatus.Failed;
                    c.ErrorMessage = ex.Message;
                });
            }
        }
    }
}
```

### 3. Caching Strategies

#### 3.1 Multi-Layer Caching

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Caching Layers                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Layer 1: Browser Cache                                                  │
│  ├── Cache-Control: public, max-age=31536000, immutable                 │
│  ├── ETag: "{content-hash}"                                              │
│  └── Used for: All static content with versioned URLs                   │
│                                                                          │
│  Layer 2: CDN Edge Cache                                                 │
│  ├── TTL: 30 days for images, 7 days for videos                         │
│  ├── Cache key: URL + Vary headers                                      │
│  └── Purge: On content update via API                                   │
│                                                                          │
│  Layer 3: Origin Shield / Mid-tier Cache                                │
│  ├── Single origin for CDN PoPs to reduce origin load                   │
│  └── 95%+ cache hit ratio target                                        │
│                                                                          │
│  Layer 4: Application Cache (Redis)                                     │
│  ├── Content metadata: 15 min TTL                                       │
│  ├── Signed URL cache: 5 min TTL                                        │
│  └── Transform results: 1 hour TTL                                      │
│                                                                          │
│  Layer 5: Database Query Cache                                          │
│  └── EF Core second-level cache for frequently accessed records         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 3.2 Cache Headers Strategy

```csharp
public class ContentCacheMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        await next(context);

        if (IsContentRequest(context.Request.Path))
        {
            var cacheControl = DetermineCacheControl(context);
            context.Response.Headers.CacheControl = cacheControl;

            // Add ETag for conditional requests
            if (context.Response.Body is MemoryStream ms)
            {
                var hash = ComputeHash(ms);
                context.Response.Headers.ETag = $"\"{hash}\"";
            }
        }
    }

    private string DetermineCacheControl(HttpContext context)
    {
        var path = context.Request.Path.Value;

        return path switch
        {
            // Versioned content (immutable)
            _ when path.Contains("/v/") => "public, max-age=31536000, immutable",

            // Images with hash in URL
            _ when IsImageWithHash(path) => "public, max-age=2592000", // 30 days

            // Videos
            _ when path.StartsWith("/videos/") => "public, max-age=604800", // 7 days

            // Documents (may be updated)
            _ when path.StartsWith("/documents/") => "public, max-age=86400", // 1 day

            // Default
            _ => "public, max-age=3600" // 1 hour
        };
    }
}
```

#### 3.3 Cache Invalidation

```csharp
public class CacheInvalidationService
{
    private readonly ICdnClient _cdnClient;
    private readonly IDistributedCache _redis;

    public async Task InvalidateContentAsync(Guid contentId)
    {
        var content = await _repository.GetByIdAsync(contentId);

        // 1. Invalidate Redis cache
        await _redis.RemoveAsync($"content:{contentId}");
        await _redis.RemoveAsync($"content:metadata:{contentId}");

        // 2. Purge CDN cache
        var pathsToInvalidate = new List<string>
        {
            $"/content/{contentId}/*",
            $"/images/{contentId}/*",
            $"/videos/{contentId}/*"
        };

        await _cdnClient.PurgeAsync(pathsToInvalidate);

        // 3. Publish invalidation event for other services
        await _eventBus.PublishAsync(new ContentInvalidatedEvent(contentId));
    }
}
```

---

## Architecture Patterns

### Option A: Dedicated Content Service (Recommended)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Content Service Architecture                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API Gateway                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│              ┌─────────────────────┼─────────────────────┐              │
│              │                     │                     │              │
│              ▼                     ▼                     ▼              │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐     │
│  │   Content API     │ │   Identity Svc    │ │   Menu Svc        │     │
│  │   (Port 5010)     │ │   (Port 5002)     │ │   (Port 5004)     │     │
│  │                   │ │                   │ │                   │     │
│  │   Responsibilities│ │                   │ │   Uses Content    │     │
│  │   - Upload API    │ │                   │ │   API for images  │     │
│  │   - Metadata CRUD │ │                   │ │                   │     │
│  │   - Access control│ │                   │ │                   │     │
│  │   - CDN URL gen   │ │                   │ │                   │     │
│  └─────────┬─────────┘ └───────────────────┘ └───────────────────┘     │
│            │                                                             │
│            │                                                             │
│  ┌─────────▼────────────────────────────────────────────────────────┐   │
│  │                    Processing Pipeline                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │
│  │  │ Image       │  │ Video       │  │ Document    │               │   │
│  │  │ Processor   │  │ Transcoder  │  │ Processor   │               │   │
│  │  │ (ImageSharp)│  │ (FFmpeg)    │  │ (iText)     │               │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│            │                                                             │
│            ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         Storage Layer                             │   │
│  │                                                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │
│  │  │ ContentDB   │  │   RustFS    │  │ NGINX/CDN   │               │   │
│  │  │ (Postgres)  │  │ (S3-compat)│  │  (Caching)  │               │   │
│  │  │             │  │             │  │             │               │   │
│  │  │ - Metadata  │  │ - Files     │  │ - Delivery  │               │   │
│  │  │ - Versions  │  │ - Variants  │  │ - Caching   │               │   │
│  │  │ - Relations │  │             │  │             │               │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Clean Architecture for Content Service

```
ContentService/
├── src/
│   ├── Content.API/                      # Presentation Layer
│   │   ├── Endpoints/
│   │   │   ├── Upload/
│   │   │   │   ├── RequestUploadUrl.cs
│   │   │   │   ├── CompleteUpload.cs
│   │   │   │   └── BulkUpload.cs
│   │   │   ├── Content/
│   │   │   │   ├── GetContent.cs
│   │   │   │   ├── ListContent.cs
│   │   │   │   ├── UpdateContent.cs
│   │   │   │   └── DeleteContent.cs
│   │   │   ├── Variants/
│   │   │   │   └── GetVariant.cs
│   │   │   └── Public/
│   │   │       └── GetPublicContent.cs
│   │   ├── Middleware/
│   │   │   ├── TenantValidationMiddleware.cs
│   │   │   └── ContentCacheMiddleware.cs
│   │   └── Program.cs
│   │
│   ├── Content.Application/              # Application Layer
│   │   ├── UseCases/
│   │   │   ├── Upload/
│   │   │   │   ├── RequestUploadUrlCommand.cs
│   │   │   │   ├── RequestUploadUrlHandler.cs
│   │   │   │   ├── CompleteUploadCommand.cs
│   │   │   │   └── CompleteUploadHandler.cs
│   │   │   ├── Process/
│   │   │   │   ├── ProcessImageCommand.cs
│   │   │   │   ├── TranscodeVideoCommand.cs
│   │   │   │   └── ScanContentCommand.cs
│   │   │   └── Retrieve/
│   │   │       ├── GetContentQuery.cs
│   │   │       └── GetSignedUrlQuery.cs
│   │   ├── DTOs/
│   │   │   ├── ContentDto.cs
│   │   │   ├── UploadRequestDto.cs
│   │   │   └── ContentVariantDto.cs
│   │   ├── Validators/
│   │   │   ├── UploadRequestValidator.cs
│   │   │   └── ContentTypeValidator.cs
│   │   └── Interfaces/
│   │       ├── IStorageService.cs
│   │       ├── IImageProcessor.cs
│   │       ├── IVideoTranscoder.cs
│   │       └── ICdnService.cs
│   │
│   ├── Content.Domain/                   # Domain Layer
│   │   ├── Entities/
│   │   │   ├── Content.cs
│   │   │   ├── ContentVariant.cs
│   │   │   ├── ContentVersion.cs
│   │   │   └── ContentFolder.cs
│   │   ├── Enums/
│   │   │   ├── ContentType.cs
│   │   │   ├── ContentStatus.cs
│   │   │   └── VariantType.cs
│   │   ├── ValueObjects/
│   │   │   ├── ContentMetadata.cs
│   │   │   ├── Dimensions.cs
│   │   │   └── FileSize.cs
│   │   ├── Events/
│   │   │   ├── ContentUploadedEvent.cs
│   │   │   ├── ContentProcessedEvent.cs
│   │   │   └── ContentDeletedEvent.cs
│   │   └── Interfaces/
│   │       └── IContentRepository.cs
│   │
│   └── Content.Infrastructure/           # Infrastructure Layer
│       ├── Data/
│       │   ├── ContentDbContext.cs
│       │   ├── Configurations/
│       │   │   ├── ContentConfiguration.cs
│       │   │   └── ContentVariantConfiguration.cs
│       │   ├── Repositories/
│       │   │   └── ContentRepository.cs
│       │   └── Migrations/
│       ├── Storage/
│       │   ├── RustFsStorageService.cs      # Primary - uses S3 SDK
│       │   ├── S3CompatibleStorageService.cs # Base class for S3-compatible storage
│       │   └── LocalFileStorageService.cs    # For unit testing only
│       ├── Processing/
│       │   ├── ImageSharpProcessor.cs
│       │   ├── FFmpegTranscoder.cs
│       │   └── ClamAvScanner.cs
│       ├── Cdn/
│       │   ├── NginxCdnService.cs            # Self-hosted NGINX caching
│       │   ├── TraefikCdnService.cs          # Alternative for Kubernetes
│       │   └── ImgproxyCdnService.cs         # Image transformation URLs
│       ├── Cache/
│       │   └── RedisCacheService.cs
│       └── BackgroundJobs/
│           ├── ImageProcessingJob.cs
│           ├── VideoTranscodingJob.cs
│           └── VirusScanningJob.cs
│
├── tests/
│   ├── Content.UnitTests/
│   │   ├── UseCases/
│   │   ├── Validators/
│   │   └── Domain/
│   └── Content.IntegrationTests/
│       ├── Endpoints/
│       └── Storage/
│
├── Dockerfile
└── ContentService.sln
```

### Option B: Integrated into Menu Service

For smaller scale, content handling could be integrated into the Menu Service:

```
OnlineMenuService/
├── Features/
│   ├── Menus/
│   ├── MenuItems/
│   └── Content/              # Add as a feature module
│       ├── Upload/
│       ├── Processing/
│       └── Retrieval/
```

**Recommendation**: Start with dedicated Content Service for:
- Independent scaling of media processing
- Cleaner separation of concerns
- Easier to extend for other services (White Label assets, etc.)
- Better resource isolation (CPU-intensive processing)

---

## Database Schema Design

### Entity Relationship Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              Content                                        │
├────────────────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                            │
│ ExternalId            : Guid (unique, for public APIs)                      │
│ TenantId              : Guid (FK, indexed)                                  │
│ FolderId              : int? (FK to ContentFolder, nullable)                │
│ FileName              : string (255)                                        │
│ OriginalFileName      : string (255)                                        │
│ ContentType           : string (100) - MIME type                            │
│ Category              : enum (Image, Video, Document, Animation)            │
│ Status                : enum (Uploading, Processing, Ready, Failed, Deleted)│
│ BlobStoragePath       : string (500) - path in blob storage                 │
│ CdnBaseUrl            : string (500) - base CDN URL                         │
│ FileSizeBytes         : long                                                │
│ Metadata              : jsonb (custom metadata, dimensions, duration, etc.) │
│ VirusScanStatus       : enum (Pending, Clean, Infected, Error)              │
│ VirusScanDate         : timestamp?                                          │
│ ProcessingError       : string? (error message if failed)                   │
│ Version               : int (for optimistic concurrency)                    │
│ IsPublic              : bool (default false)                                │
│ ExpiresAt             : timestamp? (for temporary content)                  │
│ CreatedByUserId       : Guid                                                │
│ CreatedDate           : timestamp                                           │
│ LastUpdatedDate       : timestamp                                           │
│                                                                             │
│ Indexes:                                                                    │
│   - IX_Content_TenantId_Category                                            │
│   - IX_Content_TenantId_FolderId                                            │
│   - IX_Content_ExternalId (unique)                                          │
│   - IX_Content_Status                                                       │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           ContentVariant                                    │
├────────────────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                            │
│ ContentId             : int (FK)                                            │
│ VariantName           : string (50) - e.g., "thumb", "sm", "md", "1080p"   │
│ VariantType           : enum (Thumbnail, Resize, Transcode, Optimized)     │
│ BlobStoragePath       : string (500)                                        │
│ CdnUrl                : string (500) - full CDN URL                         │
│ MimeType              : string (100)                                        │
│ FileSizeBytes         : long                                                │
│ Width                 : int?                                                │
│ Height                : int?                                                │
│ Duration              : int? (seconds, for video/audio)                     │
│ Bitrate               : int? (kbps, for video)                              │
│ Quality               : int? (compression quality 1-100)                    │
│ Format                : string (50) - e.g., "webp", "mp4", "hls"           │
│ CreatedDate           : timestamp                                           │
│                                                                             │
│ Indexes:                                                                    │
│   - IX_ContentVariant_ContentId                                             │
│   - IX_ContentVariant_ContentId_VariantName (unique)                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                           ContentVersion                                    │
├────────────────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                            │
│ ContentId             : int (FK)                                            │
│ VersionNumber         : int                                                 │
│ BlobStoragePath       : string (500) - archived path                        │
│ FileSizeBytes         : long                                                │
│ Metadata              : jsonb                                               │
│ CreatedByUserId       : Guid                                                │
│ CreatedDate           : timestamp                                           │
│ Comment               : string? (version comment)                           │
│                                                                             │
│ Indexes:                                                                    │
│   - IX_ContentVersion_ContentId                                             │
│   - IX_ContentVersion_ContentId_VersionNumber (unique)                      │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                           ContentFolder                                     │
├────────────────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                            │
│ ExternalId            : Guid (unique)                                       │
│ TenantId              : Guid (FK)                                           │
│ ParentFolderId        : int? (FK, self-referencing for hierarchy)          │
│ Name                  : string (255)                                        │
│ Path                  : string (1000) - materialized path for fast queries  │
│ Description           : string?                                             │
│ SortOrder             : int                                                 │
│ CreatedDate           : timestamp                                           │
│ LastUpdatedDate       : timestamp                                           │
│                                                                             │
│ Indexes:                                                                    │
│   - IX_ContentFolder_TenantId                                               │
│   - IX_ContentFolder_TenantId_ParentFolderId                                │
│   - IX_ContentFolder_Path                                                   │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                           ContentUsage                                      │
├────────────────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                            │
│ ContentId             : int (FK)                                            │
│ ResourceType          : string (100) - e.g., "MenuItem", "Menu", "Template"│
│ ResourceId            : Guid - ID of the resource using this content       │
│ UsageType             : enum (Primary, Gallery, Background, Icon)           │
│ CreatedDate           : timestamp                                           │
│                                                                             │
│ Purpose: Track where content is used to prevent orphaned content            │
│          and enable "used by" queries                                       │
│                                                                             │
│ Indexes:                                                                    │
│   - IX_ContentUsage_ContentId                                               │
│   - IX_ContentUsage_ResourceType_ResourceId                                 │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                           ContentAccessLog                                  │
├────────────────────────────────────────────────────────────────────────────┤
│ Id                    : bigint (PK)                                         │
│ ContentId             : int (FK)                                            │
│ VariantName           : string? (null = original)                           │
│ AccessDate            : timestamp (partitioned by month)                    │
│ IpAddress             : string (45)                                         │
│ UserAgent             : string (500)                                        │
│ Referrer              : string? (500)                                       │
│ Country               : string (2) - ISO country code                       │
│ BytesServed           : long                                                │
│ CacheHit              : bool                                                │
│                                                                             │
│ Purpose: Analytics and audit trail                                          │
│                                                                             │
│ Indexes:                                                                    │
│   - IX_ContentAccessLog_ContentId_AccessDate                                │
│   - Partition by month on AccessDate                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

### Metadata JSONB Schemas

#### Image Metadata

```json
{
  "width": 4000,
  "height": 3000,
  "aspectRatio": "4:3",
  "colorSpace": "sRGB",
  "hasAlpha": false,
  "orientation": 1,
  "dominantColor": "#336699",
  "exif": {
    "camera": "Canon EOS R5",
    "lens": "RF 24-70mm F2.8",
    "focalLength": "50mm",
    "aperture": "f/2.8",
    "iso": 400,
    "dateTaken": "2025-01-15T14:30:00Z",
    "gps": null
  },
  "analysis": {
    "isSafe": true,
    "labels": ["food", "restaurant", "cuisine"],
    "text": []
  }
}
```

#### Video Metadata

```json
{
  "width": 1920,
  "height": 1080,
  "aspectRatio": "16:9",
  "duration": 125.5,
  "frameRate": 30,
  "codec": "h264",
  "audioCodec": "aac",
  "bitrate": 5000000,
  "hasAudio": true,
  "thumbnailTime": 12.5,
  "chapters": [
    { "time": 0, "title": "Intro" },
    { "time": 30, "title": "Main Course" }
  ]
}
```

#### Document Metadata

```json
{
  "pageCount": 12,
  "title": "Allergen Information",
  "author": "Restaurant Name",
  "language": "en",
  "isSearchable": true,
  "hasJavaScript": false,
  "hasForms": false,
  "createdDate": "2025-01-10T09:00:00Z"
}
```

---

## API Design

### Endpoints Overview

```
Content Service API (Port 5010)
================================

# Upload Flow
POST   /api/content/upload-url           # Get signed URL for upload
POST   /api/content/upload-complete      # Notify upload complete, trigger processing
POST   /api/content/upload-direct        # Direct upload (small files only)
POST   /api/content/bulk-upload          # Bulk upload multiple files

# Content Management
GET    /api/content                      # List content (paginated, filtered)
GET    /api/content/{id}                 # Get content details
PATCH  /api/content/{id}                 # Update content metadata
DELETE /api/content/{id}                 # Delete content (soft delete)
POST   /api/content/{id}/restore         # Restore deleted content

# Variants & URLs
GET    /api/content/{id}/variants        # List all variants
GET    /api/content/{id}/url             # Get signed access URL
GET    /api/content/{id}/variants/{name}/url  # Get variant URL

# Folders
GET    /api/content/folders              # List folders
POST   /api/content/folders              # Create folder
PATCH  /api/content/folders/{id}         # Update folder
DELETE /api/content/folders/{id}         # Delete folder
POST   /api/content/{id}/move            # Move content to folder

# Versions
GET    /api/content/{id}/versions        # List versions
POST   /api/content/{id}/versions        # Create new version (replace)
POST   /api/content/{id}/revert/{version}  # Revert to version

# Admin / Housekeeping
GET    /api/content/stats                # Storage stats per tenant
POST   /api/content/cleanup              # Cleanup orphaned content
GET    /api/content/processing-status    # Get processing queue status

# Public (CDN-facing, no auth)
GET    /public/content/{token}/{id}      # Public access via token
GET    /public/content/{token}/{id}/{variant}  # Public variant access
```

### Request/Response DTOs

```csharp
// Upload Request
public record RequestUploadUrlCommand(
    string FileName,
    string ContentType,
    long FileSizeBytes,
    Guid? FolderId = null,
    Dictionary<string, string>? Metadata = null
);

public record RequestUploadUrlResponse(
    Guid ContentId,
    string UploadUrl,
    string Method,          // PUT for most blob storage
    Dictionary<string, string> Headers,
    DateTimeOffset ExpiresAt
);

// Content Response
public record ContentDto(
    Guid Id,
    string FileName,
    string ContentType,
    string Category,
    string Status,
    long FileSizeBytes,
    string? ThumbnailUrl,
    List<ContentVariantDto> Variants,
    ContentMetadataDto Metadata,
    Guid? FolderId,
    bool IsPublic,
    DateTimeOffset CreatedDate,
    DateTimeOffset LastUpdatedDate
);

public record ContentVariantDto(
    string Name,
    string Type,
    string Url,
    string MimeType,
    long FileSizeBytes,
    int? Width,
    int? Height,
    int? Duration
);

public record ContentMetadataDto(
    int? Width,
    int? Height,
    double? Duration,
    string? DominantColor,
    List<string>? Labels,
    Dictionary<string, object>? Custom
);

// List Response
public record ContentListResponse(
    List<ContentDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    string? NextCursor
);

// Filter Request
public record ContentFilterRequest(
    string? Category = null,
    string? Status = null,
    Guid? FolderId = null,
    string? SearchTerm = null,
    DateTimeOffset? CreatedAfter = null,
    DateTimeOffset? CreatedBefore = null,
    string? SortBy = "createdDate",
    string? SortOrder = "desc",
    int Page = 1,
    int PageSize = 50
);
```

---

## Implementation Tasks

### Phase 1: Core Infrastructure (Week 1-2)

#### Task 1.1: Create Content Service Project Structure
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `ContentService.sln` with Clean Architecture layers
- [ ] Configure project references and NuGet packages
- [ ] Set up PostgreSQL database connection
- [ ] Implement multi-tenancy with `ICurrentTenantService`
- [ ] Add health check endpoints
- [ ] Configure Serilog with OpenTelemetry

**NuGet Packages**:
```xml
<PackageReference Include="FastEndpoints" Version="5.x" />
<PackageReference Include="MediatR" Version="12.x" />
<PackageReference Include="FluentValidation" Version="11.x" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.x" />
<PackageReference Include="SixLabors.ImageSharp" Version="3.x" />
<PackageReference Include="Azure.Storage.Blobs" Version="12.x" />
<PackageReference Include="AWSSDK.S3" Version="3.x" />
```

#### Task 1.2: Implement Database Schema
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `Content` entity and configuration
- [ ] Create `ContentVariant` entity and configuration
- [ ] Create `ContentVersion` entity (for versioning)
- [ ] Create `ContentFolder` entity (for organization)
- [ ] Create `ContentUsage` entity (for tracking usage)
- [ ] Create EF Core migrations
- [ ] Add indexes for performance

#### Task 1.3: Implement Storage Abstraction (RustFS)
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `IStorageService` interface (S3-compatible)
- [ ] Implement `RustFsStorageService` using AWS S3 SDK (RustFS is S3-compatible)
- [ ] Set up RustFS Docker container for local development
- [ ] Configure RustFS buckets: `uploads`, `processed`, `archive`
- [ ] Implement signed URL generation (S3 presigned URLs)
- [ ] Implement multipart upload support for large files
- [ ] Add storage health checks
- [ ] Create RustFS Kubernetes Helm chart for production deployment

#### Task 1.4: Implement Upload Flow
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `RequestUploadUrlCommand` / Handler
- [ ] Create `CompleteUploadCommand` / Handler
- [ ] Implement content type validation (magic bytes)
- [ ] Implement file size validation
- [ ] Create upload endpoints

### Phase 2: Content Processing (Week 2-3)

#### Task 2.1: Implement Virus Scanning
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `IVirusScannerService` interface
- [ ] Implement ClamAV integration (for self-hosted)
- [ ] Implement Azure Defender integration (optional)
- [ ] Create scanning background job
- [ ] Handle quarantine flow for infected files

#### Task 2.2: Implement Image Processing
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `IImageProcessor` interface
- [ ] Implement `ImageSharpProcessor`
- [ ] Generate thumbnails (multiple sizes)
- [ ] Convert to WebP format
- [ ] Strip EXIF metadata (privacy)
- [ ] Extract dominant color
- [ ] Create processing background job

#### Task 2.3: Implement Video Processing
**Owner**: Backend Team
**Priority**: P1

- [ ] Create `IVideoTranscoder` interface
- [ ] Implement FFmpeg transcoder (containerized)
- [ ] Generate video thumbnails
- [ ] Transcode to multiple qualities
- [ ] Generate HLS/DASH manifests (for adaptive streaming)
- [ ] Extract video metadata (duration, resolution)
- [ ] Create transcoding background job

#### Task 2.4: Implement Document Processing
**Owner**: Backend Team
**Priority**: P2

- [ ] Create `IDocumentProcessor` interface
- [ ] Extract PDF metadata (page count, title)
- [ ] Generate PDF thumbnails (first page)
- [ ] Sanitize PDFs (remove JavaScript, forms)
- [ ] Create processing background job

### Phase 3: Content Retrieval & CDN (Week 3-4)

#### Task 3.1: Implement CDN Integration
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `ICdnService` interface
- [ ] Implement CloudFront CDN service
- [ ] Implement Azure CDN service (alternative)
- [ ] Implement signed URL generation for CDN
- [ ] Implement cache invalidation

#### Task 3.2: Implement Content Access API
**Owner**: Backend Team
**Priority**: P0

- [ ] Create `GetContentQuery` / Handler
- [ ] Create `ListContentQuery` / Handler with pagination
- [ ] Create `GetSignedUrlQuery` / Handler
- [ ] Implement content filtering and search
- [ ] Add cache headers middleware

#### Task 3.3: Implement Content Management API
**Owner**: Backend Team
**Priority**: P1

- [ ] Create `UpdateContentCommand` / Handler
- [ ] Create `DeleteContentCommand` / Handler (soft delete)
- [ ] Create `MoveContentCommand` / Handler
- [ ] Implement folder CRUD
- [ ] Implement version management

### Phase 4: Backend Testing (Week 4)

#### Task 4.1: Unit Tests
**Owner**: Backend Team
**Priority**: P0

- [ ] Test upload flow handlers
- [ ] Test content type validation
- [ ] Test image processing logic
- [ ] Test signed URL generation
- [ ] Test tenant isolation
- [ ] Test cache invalidation

#### Task 4.2: Integration Tests
**Owner**: Backend Team
**Priority**: P1

- [ ] Test full upload flow (with mocked storage)
- [ ] Test processing pipeline
- [ ] Test API endpoints
- [ ] Test database operations
- [ ] Test with TestContainers for storage

### Phase 5: Frontend Integration (Week 4-5)

#### Task 5.1: Create API Client
**Owner**: Frontend Team
**Priority**: P0

- [ ] Create content API types
- [ ] Create `useUploadContent` hook
- [ ] Create `useContent` query hook
- [ ] Create `useContentList` query hook
- [ ] Handle upload progress tracking

#### Task 5.2: Create Upload Components
**Owner**: Frontend Team
**Priority**: P0

- [ ] Create `ContentUploader` component
- [ ] Create `ImagePicker` component
- [ ] Create `DragDropZone` component
- [ ] Create upload progress indicator
- [ ] Create error handling UI

#### Task 5.3: Create Content Display Components
**Owner**: Frontend Team
**Priority**: P0

- [ ] Create `ContentImage` component (with responsive loading)
- [ ] Create `ContentVideo` component (with player)
- [ ] Create `ContentGallery` component
- [ ] Create `ContentPicker` modal
- [ ] Create `ContentPreview` component

#### Task 5.4: Frontend Unit Tests
**Owner**: Frontend Team
**Priority**: P1

- [ ] Test upload hooks behavior
- [ ] Test content display components
- [ ] Test error handling
- [ ] Test responsive image loading

### Phase 6: E2E Testing (Week 5)

#### Task 6.1: E2E Tests
**Owner**: Automation Team
**Priority**: P1

- [ ] Test image upload flow
- [ ] Test video upload flow
- [ ] Test content display on menu
- [ ] Test content deletion
- [ ] Test tenant isolation
- [ ] Test error scenarios

---

## Cost Analysis

### Estimated Monthly Costs (1TB Storage, 10TB Egress)

| Provider | Storage | Egress | Operations | Processing | Total |
|----------|---------|--------|------------|------------|-------|
| **Azure Blob + CDN** | $18 | $870 | $50 | $0 | ~$940 |
| **AWS S3 + CloudFront** | $23 | $850 | $50 | $0 | ~$920 |
| **Cloudflare R2 + Images** | $15 | $0 | $5 | $50 | ~$70 |
| **GCS + Cloud CDN** | $20 | $800 | $40 | $0 | ~$860 |

**Note**: Cloudflare R2's zero egress fees make it significantly cheaper for content-heavy applications.

### Recommendations by Scale

| Monthly Traffic | Recommended Stack |
|-----------------|-------------------|
| < 100GB egress | AWS S3 or Azure Blob (existing cloud) |
| 100GB - 1TB | Consider Cloudflare R2 |
| 1TB - 10TB | Cloudflare R2 + Images/Stream |
| > 10TB | Cloudflare R2 or negotiate enterprise pricing |

---

## Testing Strategy

### Unit Tests

| Layer | Test Focus | Coverage Target |
|-------|------------|-----------------|
| Domain | Entity validation, value objects | 90% |
| Application | Use case logic, validators | 85% |
| Infrastructure | Storage operations (mocked) | 80% |

### Integration Tests

| Scope | Test Focus | Tools |
|-------|------------|-------|
| API | Endpoint contracts | WebApplicationFactory |
| Storage | Upload/download flows | TestContainers + MinIO |
| Processing | Image/video processing | Real files, mocked storage |

### E2E Tests

| Flow | Test Cases | Priority |
|------|------------|----------|
| Image Upload | Upload, process, display | P0 |
| Video Upload | Upload, transcode, playback | P1 |
| Content Management | Update, delete, organize | P1 |
| Access Control | Tenant isolation, permissions | P0 |

---

## Success Criteria

- [ ] Images upload and display correctly on menus
- [ ] Videos transcode and play with adaptive bitrate
- [ ] PDFs are scannable and viewable
- [ ] CDN delivers content with < 100ms TTFB globally
- [ ] Virus scanning prevents malicious uploads
- [ ] Tenant isolation is enforced at storage level
- [ ] 80%+ unit test coverage on new code
- [ ] All E2E tests pass
- [ ] No security vulnerabilities in upload flow

---

## Open Questions

### Resolved

| # | Question | Decision | Date |
|---|----------|----------|------|
| 3 | **Storage Provider** | **RustFS** - Self-hosted, S3-compatible, Apache 2.0 license, high performance | 2026-01-24 |
| 8 | **Self-Hosted vs Cloud** | **Self-hosted** - Full control, deploy anywhere | 2026-01-24 |
| 9 | **MinIO Migration** | N/A - Using RustFS from the start | 2026-01-24 |
| 10 | **License Requirements** | **Apache 2.0 preferred** - RustFS satisfies this | 2026-01-24 |

### Open

1. **Image CDN Provider**: Should we use Cloudflare Images, Imgix, or build custom?
   - **Recommendation**: Imgproxy (self-hosted, fastest, security-focused, MIT license)
2. **Video Transcoding**: Self-hosted FFmpeg vs managed (Cloudflare Stream, Mux)?
   - **Recommendation**: FFmpeg in Kubernetes Jobs with GPU acceleration (self-hosted)
4. **Content Moderation**: Do we need NSFW detection for user-uploaded content?
5. **Retention Policy**: How long to keep deleted content before permanent deletion?
6. **Watermarking**: Is watermarking needed for premium/protected content?
   - Imgproxy Pro supports watermarking
7. **Analytics**: What level of content analytics do we need (views, bandwidth, etc.)?

---

## References

### Cloud Providers
- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

### Self-Hosted Object Storage
- [MinIO Official](https://www.min.io/)
- [MinIO GitHub](https://github.com/minio/minio)
- [Garage Official](https://garagehq.deuxfleurs.fr/)
- [Garage GitHub](https://github.com/deuxfleurs-org/garage)
- [SeaweedFS GitHub](https://github.com/seaweedfs/seaweedfs)
- [RustFS Official](https://rustfs.com/)
- [RustFS GitHub](https://github.com/rustfs/rustfs)
- [Ceph Documentation](https://docs.ceph.com/)

### Self-Hosted CDN/Caching
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Varnish Cache](https://varnish-cache.org/)
- [Apache Traffic Server](https://trafficserver.apache.org/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Squid Proxy](http://www.squid-cache.org/)

### Image Processing
- [Imgproxy](https://imgproxy.net/)
- [Imgproxy Benchmark](https://imgproxy.net/blog/image-processing-servers-benchmark/)
- [Thumbor](https://thumbor.readthedocs.io/)
- [ImageSharp Documentation](https://docs.sixlabors.com/articles/imagesharp/)

### Video Processing
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [FFmpeg Docker](https://hub.docker.com/r/linuxserver/ffmpeg)
- [SRS Media Server](https://github.com/ossrs/srs)

### General
- [CDN Caching Best Practices](https://web.dev/http-cache/)
- [Signed URL Security Patterns](https://cloud.google.com/storage/docs/access-control/signed-urls)
- [2025 Object Storage Comparison](https://onidel.com/blog/minio-ceph-seaweedfs-garage-2025)

---

## Related Documents

- [Payment Service Plan](./payment-service-implementation.md)
- [Logging Service Plan](./logging-service-implementation.md)
- [White Label Service Plan](./white-label-service-architecture.md)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-01-24 | Claude | Initial research and planning document created |
| 2026-01-24 | Claude | Added comprehensive self-hosted alternatives research: Object Storage (MinIO, Garage, SeaweedFS, Ceph, RustFS, OpenIO), CDN/Caching (NGINX, Varnish, Apache TS, Squid, Traefik), Image Processing (Imgproxy, Thumbor, Imagor), Video Transcoding (FFmpeg, SRS), and complete self-hosted stack architecture recommendations with Docker Compose and Kubernetes deployment considerations |
| 2026-01-24 | Claude | **DECISION**: Selected **RustFS** as the object storage solution. Reasons: Apache 2.0 license, excellent S3 compatibility, high performance (Rust), active development, self-hosted with full control. Updated architecture diagrams, implementation tasks, and resolved related open questions. |
| 2026-01-24 | Claude | **ARCHITECTURAL DECISION**: RustFS Instance & Bucket Strategy - Recommended Option A (Single Instance, Multiple Buckets). Added detailed analysis of 3 options, bucket strategy (4 buckets: public, private, staging, archive), path naming conventions, public/private access patterns, IAM policies, NGINX CDN configuration, and unified Content Service architecture. See "RustFS Instance & Bucket Architecture" section. |

---

## RustFS Instance & Bucket Architecture

> **Decision Date**: 2026-01-24
> **Status**: DECIDED - Option A (Single Instance with Multiple Buckets)

### Context

Multiple services need content storage:
- **Online Menus**: Menu item photos, promotional videos, PDF menus, allergen guides
- **White Label**: Tenant logos, theme assets, custom backgrounds
- **Future**: User avatars, document storage, other services

Key requirements:
- Multi-tenant isolation
- Mix of public (customer-facing) and private (admin-only) content
- Self-hosted using RustFS (S3-compatible)
- CDN caching for performance
- Scalable and cost-effective

### Options Evaluated

#### Option A: Single RustFS Instance with Multiple Buckets (RECOMMENDED)

```
RustFS Cluster (3-node HA)
├── bucket: content-public      # CDN-served, no auth for reads
│   └── /{tenantId}/{service}/{type}/{year}/{month}/{contentId}/
├── bucket: content-private     # Auth required, presigned URLs
│   └── /{tenantId}/{service}/{type}/{year}/{month}/{contentId}/
├── bucket: content-staging     # Upload processing, virus scan
│   └── /{tenantId}/temp/{uploadId}/
└── bucket: content-archive     # Soft-deleted content
    └── /{tenantId}/{originalPath}/
```

| Pros | Cons |
|------|------|
| Single deployment footprint | Single point of failure (mitigated by HA) |
| Unified backup/restore | Shared I/O bandwidth |
| Shared storage efficiency | Larger blast radius |
| Simpler networking | |
| Easier scaling | |
| Cost-effective | |

**Verdict**: RECOMMENDED for current scale and requirements.

#### Option B: Dedicated RustFS Instance per Service (NOT RECOMMENDED)

```
RustFS Instance 1 (Online Menus)  RustFS Instance 2 (White Label)
├── menus-public                   ├── whitelabel-assets
└── menus-private                  └── whitelabel-themes
```

| Pros | Cons |
|------|------|
| Fault isolation | 3x operational overhead |
| Independent scaling | Resource waste |
| Team autonomy | Networking complexity |
| | Cross-service content sharing complicated |

**Verdict**: Overhead doesn't justify benefits at current scale.

#### Option C: Dedicated by Access Pattern (CONDITIONALLY RECOMMENDED)

```
RustFS Instance 1 (Public)       RustFS Instance 2 (Private)
├── public-menus                  ├── private-uploads
├── public-whitelabel             └── quarantine
└── public-assets
```

| Pros | Cons |
|------|------|
| Network-level security boundary | Content lifecycle complexity |
| Optimized CDN integration | 2x operational overhead |
| Different SLAs | Cross-instance coordination required |

**Verdict**: Good for very high-security requirements, but adds complexity.

### Final Architecture

```
                                 ┌─────────────────────────────┐
                                 │       API Gateway           │
                                 │   (Kong / Traefik / NGINX)  │
                                 └──────────┬──────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
          ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
          │  Content API    │    │ White Label API │    │  Online Menu    │
          │   Service       │    │    Service      │    │    Service      │
          └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                   │                      │                      │
                   └──────────────────────┼──────────────────────┘
                                          │
                                          ▼
                             ┌────────────────────────┐
                             │   Content Service      │
                             │   (Unified Facade)     │
                             │      Port 5010         │
                             └──────────┬─────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
          ▼                             ▼                             ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  NGINX CDN Layer    │    │    RustFS Cluster   │    │    Redis Cache      │
│  (Public Content)   │    │   (3-node HA)       │    │  (Metadata/URLs)    │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
          │                             │
          │                    ┌────────┴────────┐
          │                    │                 │
          ▼                    ▼                 ▼
┌─────────────────────┐    ┌──────────────┐ ┌──────────────┐
│   End Users         │    │content-public│ │content-private│
│   (Public Access)   │    └──────────────┘ └──────────────┘
└─────────────────────┘
```

### Bucket Strategy

| Bucket | Purpose | Access | CDN Cached | Lifecycle |
|--------|---------|--------|------------|-----------|
| `content-public` | Customer-facing content (menu images, logos) | Public read, Auth write | Yes | Keep 1 year inactive |
| `content-private` | Admin-only, sensitive documents | Auth required (presigned URLs) | No | Keep 2 years |
| `content-staging` | Upload processing, virus scanning | Auth required | No | Delete after 24 hours |
| `content-archive` | Soft-deleted content | Auth required | No | Delete after 90 days |

### Path Naming Convention

```
{bucket}/{tenantId}/{service}/{contentType}/{year}/{month}/{contentId}/
         └── Tenant isolation (IAM boundary)
                    └── Service namespace
                              └── Type-specific processing
                                             └── Time partitioning (listing optimization)
                                                          └── Content folder
```

**Example Structure:**
```
content-public/
├── tenant-abc123/
│   ├── online-menus/
│   │   ├── images/
│   │   │   └── 2026/01/
│   │   │       └── img-uuid-1234/
│   │   │           ├── original.jpg
│   │   │           ├── thumb_200x200.webp
│   │   │           └── large_1200x800.webp
│   │   └── videos/
│   │       └── 2026/01/
│   │           └── vid-uuid-5678/
│   │               ├── original.mp4
│   │               ├── 720p.mp4
│   │               └── thumbnail.jpg
│   └── white-label/
│       ├── logos/
│       │   └── primary-logo.png
│       └── themes/
│           └── login-background.jpg
│
content-private/
└── tenant-abc123/
    ├── admin-docs/
    │   └── internal-pricing.pdf
    └── quarantine/
        └── failed-scan-uuid.bin
```

### Public vs Private Access Patterns

#### Public Content (content-public bucket)

```
End User ──► NGINX/CDN ──► RustFS (content-public)
                │
                └── Cache Layer (7 days for images, 3 days for videos)

URL Pattern: https://cdn.example.com/public/{tenant}/{service}/{type}/{path}
```

- **No authentication required** for reads
- **CDN cached** at NGINX layer
- **CORS enabled** for cross-origin access
- **Immutable URLs** with content hashing for cache busting

#### Private Content (content-private bucket)

```
Admin User ──► Content API ──► [Auth Check] ──► Generate Presigned URL
                                                        │
                                                        ▼
                                              RustFS (content-private)
```

- **JWT authentication required**
- **Presigned URLs** with 15-minute TTL
- **Tenant validation** in Content API
- **Audit logging** for access

### NGINX CDN Configuration

```nginx
# Public content caching
location ~ ^/public/(?<tenant>[^/]+)/(?<path>.+)$ {
    proxy_cache content_cache;
    proxy_cache_valid 200 7d;    # Images cached 7 days
    proxy_cache_valid 404 1m;

    proxy_pass http://rustfs_cluster/content-public/$tenant/$path;

    add_header Cache-Control "public, max-age=604800, immutable";
    add_header X-Cache-Status $upstream_cache_status;
    add_header Access-Control-Allow-Origin "*";
}
```

### IAM Policy (Tenant Isolation)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TenantScopedAccess",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": [
        "arn:aws:s3:::content-public/${aws:PrincipalTag/tenantId}/*",
        "arn:aws:s3:::content-private/${aws:PrincipalTag/tenantId}/*"
      ]
    }
  ]
}
```

### Content Service (Unified)

One Content Service handles all storage operations:

```
Content Service (Port 5010)
├── POST   /api/content/upload           # Request upload URL
├── POST   /api/content/complete         # Complete upload
├── GET    /api/content/{id}             # Get content metadata
├── GET    /api/content/{id}/url         # Get access URL (public or presigned)
├── DELETE /api/content/{id}             # Soft delete
│
└── Service-Specific Endpoints:
    ├── POST /api/content/online-menus/images
    ├── POST /api/content/online-menus/videos
    ├── POST /api/content/white-label/logos
    └── POST /api/content/white-label/themes
```

### Decision Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| Single vs Multiple Instances? | Single Instance (HA) | Operational simplicity at current scale |
| Bucket Strategy? | 4 Buckets | Clear access patterns, lifecycle management |
| Path Structure? | {tenant}/{service}/{type}/{time}/{id}/ | Tenant isolation, efficient listing |
| Public/Private? | Bucket-level separation | Simpler than instance-level, IAM enforced |
| Content Service? | One Unified Service | Centralized processing, consistent behavior |
| CDN? | NGINX in front of RustFS | Cache at edge, protect origin |
