# CDN Configuration

> **Status**: TODO
> **Priority**: P2 - Performance & Cost
> **Estimated Scope**: Small-Medium (Infrastructure + Frontend)
> **Estimated Effort**: 2-3 days

---

## 1. Problem

- Frontend static assets served from Nginx with no edge caching
- Content files (images, videos) served from SeaweedFS with no geo-distribution
- No cache headers on static assets
- Every request hits origin server regardless of location

---

## 2. Solution

### 2.1 CDN Provider Options

| Provider | Pros | Cons | Free Tier |
|----------|------|------|-----------|
| **Cloudflare** | Free tier generous, DDoS protection, easy DNS | Limited config on free | Unlimited bandwidth |
| **AWS CloudFront** | Tight S3 integration, global | Pay per request | 1TB/month first year |
| **Azure CDN** | Azure integration | Less global coverage | 5GB/month |

**Recommendation**: Cloudflare (free tier covers initial needs, includes DDoS protection and DNS management).

---

## 3. What to Cache

| Asset Type | Cache Duration | Source |
|-----------|---------------|--------|
| JS/CSS bundles (hashed) | 1 year | BaseClient Nginx |
| index.html | No cache (revalidate) | BaseClient Nginx |
| manifest.json, service-worker.js | No cache | BaseClient Nginx |
| Public menu images | 1 day | SeaweedFS / ContentService |
| API responses | No CDN cache (dynamic) | Backend services |
| Fonts, icons | 1 year | BaseClient Nginx |

### 3.1 Cache Headers in Nginx

```nginx
# Hashed assets (immutable)
location ~* \.(js|css|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML (always revalidate)
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, must-revalidate";
}
```

---

## 4. Implementation Steps

1. Set up Cloudflare account and add domain
2. Configure DNS records to point to origin server
3. Set up page rules for caching strategy
4. Update `BaseClient/nginx.conf` with proper cache headers
5. Configure ContentService presigned URLs to go through CDN
6. Add `cdn.yourdomain.com` CNAME for content assets
7. Test cache hit rates in Cloudflare dashboard
8. Add CDN purge step to deployment pipeline (for frontend updates)

---

## 5. Verification

- [ ] Static assets served from CDN edge (check response headers)
- [ ] Cache hit ratio > 80% for static assets
- [ ] index.html always fetched fresh from origin
- [ ] Content images load through CDN
- [ ] Deployment pipeline purges CDN cache
- [ ] TTFB improved for geographically distant users
