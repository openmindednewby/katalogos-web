# White Label Service - Architectural Plan

> **Status**: TODO - Planning Phase
> **Priority**: High
> **Estimated Complexity**: Large (Multi-service, Frontend + Backend)

---

## Executive Summary

The White Label Service enables tenants to fully customize the application's appearance, branding, and feature set. This creates a seamless branded experience where end-users interact with what appears to be their tenant's own application rather than a generic SaaS platform.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Architecture Options](#architecture-options)
3. [Recommended Architecture](#recommended-architecture)
4. [Database Schema Design](#database-schema-design)
5. [API Design](#api-design)
6. [Frontend Integration](#frontend-integration)
7. [Asset Management](#asset-management)
8. [Caching Strategy](#caching-strategy)
9. [Security Considerations](#security-considerations)
10. [Implementation Tasks](#implementation-tasks)
11. [Testing Strategy](#testing-strategy)

---

## Problem Statement

### Current State
- Tenant entity has basic branding fields (`LogoUrl`, `PrimaryColor`) in IdentityService
- Frontend theme is hardcoded based on environment feature flags
- No dynamic theming capability per tenant
- No custom domain support
- No email template customization
- No feature toggling per tenant tier

### Desired State
- Full theme customization (colors, fonts, spacing, border radius)
- Logo and asset management (favicon, app icons, email headers)
- Custom domain support (tenant.example.com or custom-domain.com)
- Email template branding
- Feature flags per tenant/tier
- White-labeled mobile app builds (future)

---

## Architecture Options

### Option A: Extend IdentityService (NOT Recommended)

**Description**: Add all white-label fields directly to the existing Tenant entity in IdentityService.

**Pros**:
- Simple implementation
- No new service to deploy
- Single source of truth for tenant data

**Cons**:
- Violates Single Responsibility Principle
- IdentityService becomes bloated
- Asset management doesn't belong in identity context
- Harder to scale independently
- Tightly couples branding with authentication

### Option B: Dedicated White Label Service (RECOMMENDED)

**Description**: Create a new microservice specifically for white-labeling, theme management, and asset storage.

**Pros**:
- Clean separation of concerns
- Independent scaling for asset-heavy operations
- Can use specialized storage (blob storage for assets)
- Follows existing microservices pattern
- Easier to extend with new branding features
- Can cache aggressively without affecting identity operations

**Cons**:
- Additional service to maintain
- Cross-service communication for tenant lookups
- Slightly more complex deployment

### Option C: Hybrid Approach

**Description**: Store basic theme config in IdentityService, but use separate blob storage and CDN for assets.

**Pros**:
- Balances simplicity with scalability
- Assets served from CDN

**Cons**:
- Split responsibilities
- Harder to reason about where data lives
- Still couples theme to identity

---

## Recommended Architecture

**Selected: Option B - Dedicated White Label Service**

### Service Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway / CDN                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ IdentityService │    │ WhiteLabelSvc   │    │  Other Services │
│   (Port 5002)   │    │   (Port 5008)   │    │                 │
└────────┬────────┘    └────────┬────────┘    └─────────────────┘
         │                      │
         │         ┌────────────┴────────────┐
         │         │                         │
         ▼         ▼                         ▼
┌─────────────┐  ┌─────────────┐    ┌─────────────────┐
│IdentityDB  │  │WhiteLabelDB │    │  Blob Storage   │
│ (Postgres) │  │ (Postgres)  │    │ (Azure/S3/MinIO)│
└─────────────┘  └─────────────┘    └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │      CDN        │
                                    │ (CloudFront/    │
                                    │  Azure CDN)     │
                                    └─────────────────┘
```

### Service Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **WhiteLabelService** | Theme config, feature flags, domain mapping, email templates |
| **Blob Storage** | Logo files, favicons, app icons, email header images |
| **CDN** | Serve assets with low latency, global distribution |
| **Redis Cache** | Cache theme configs per tenant for fast lookups |

---

## Database Schema Design

### Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                      TenantThemeConfiguration                   │
├─────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                │
│ ExternalId            : Guid (unique, for public APIs)          │
│ TenantId              : Guid (unique, FK to Identity.Tenants)   │
│ ThemeName             : string (nullable, "Corporate Blue")     │
│ ColorPalette          : jsonb (see ColorPaletteSchema)          │
│ Typography            : jsonb (see TypographySchema)            │
│ ComponentStyles       : jsonb (see ComponentStylesSchema)       │
│ IsActive              : bool (default true)                     │
│ CreatedDate           : timestamp                               │
│ LastUpdatedDate       : timestamp                               │
│ CreatedByUserId       : Guid                                    │
│ LastUpdatedByUserId   : Guid                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         TenantAssets                            │
├─────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                │
│ ExternalId            : Guid (unique)                           │
│ TenantId              : Guid (FK)                               │
│ AssetType             : enum (Logo, Favicon, AppIcon,           │
│                               EmailHeader, LoginBackground)     │
│ FileName              : string                                  │
│ MimeType              : string                                  │
│ BlobStoragePath       : string                                  │
│ CdnUrl                : string (cached/computed)                │
│ FileSizeBytes         : long                                    │
│ Dimensions            : jsonb (width, height for images)        │
│ IsActive              : bool                                    │
│ CreatedDate           : timestamp                               │
│ LastUpdatedDate       : timestamp                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TenantCustomDomain                         │
├─────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                │
│ ExternalId            : Guid (unique)                           │
│ TenantId              : Guid (FK)                               │
│ Domain                : string (unique, "app.clientname.com")   │
│ VerificationStatus    : enum (Pending, Verified, Failed)        │
│ VerificationToken     : string (DNS TXT record value)           │
│ SslStatus             : enum (Pending, Active, Failed)          │
│ SslExpiryDate         : timestamp (nullable)                    │
│ IsPrimary             : bool                                    │
│ CreatedDate           : timestamp                               │
│ VerifiedDate          : timestamp (nullable)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TenantEmailTemplate                        │
├─────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                │
│ ExternalId            : Guid (unique)                           │
│ TenantId              : Guid (FK)                               │
│ TemplateType          : enum (Welcome, PasswordReset, OTP,      │
│                               Invoice, Notification)            │
│ Subject               : string                                  │
│ HtmlBody              : text (Liquid/Handlebars template)       │
│ PlainTextBody         : text                                    │
│ IsActive              : bool                                    │
│ CreatedDate           : timestamp                               │
│ LastUpdatedDate       : timestamp                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TenantFeatureFlag                          │
├─────────────────────────────────────────────────────────────────┤
│ Id                    : int (PK)                                │
│ TenantId              : Guid (FK)                               │
│ FeatureKey            : string (e.g., "questioner.enabled")     │
│ IsEnabled             : bool                                    │
│ Configuration         : jsonb (optional extra config)           │
│ EffectiveFrom         : timestamp (nullable, for scheduling)    │
│ EffectiveUntil        : timestamp (nullable)                    │
│ CreatedDate           : timestamp                               │
│ LastUpdatedDate       : timestamp                               │
│ Index: (TenantId, FeatureKey) UNIQUE                            │
└─────────────────────────────────────────────────────────────────┘
```

### JSONB Schemas

#### ColorPaletteSchema
```json
{
  "light": {
    "primary": "#1976D2",
    "primaryLight": "#42A5F5",
    "primaryDark": "#1565C0",
    "secondary": "#FF9800",
    "secondaryLight": "#FFB74D",
    "secondaryDark": "#F57C00",
    "accent": "#00BCD4",
    "success": "#4CAF50",
    "warning": "#FFC107",
    "error": "#F44336",
    "info": "#2196F3",
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "text": "#212121",
    "textSecondary": "#757575",
    "border": "#E0E0E0",
    "disabled": "#BDBDBD"
  },
  "dark": {
    "primary": "#90CAF9",
    "primaryLight": "#BBDEFB",
    "primaryDark": "#64B5F6",
    "secondary": "#FFB74D",
    "background": "#121212",
    "surface": "#1E1E1E",
    "text": "#FFFFFF",
    "textSecondary": "#B0B0B0",
    "border": "#424242"
  }
}
```

#### TypographySchema
```json
{
  "fontFamily": {
    "primary": "Inter",
    "secondary": "Roboto",
    "monospace": "JetBrains Mono"
  },
  "fontSize": {
    "xs": 12,
    "sm": 14,
    "base": 16,
    "lg": 18,
    "xl": 20,
    "xxl": 24,
    "xxxl": 32
  },
  "fontWeight": {
    "light": 300,
    "regular": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  },
  "lineHeight": {
    "tight": 1.25,
    "normal": 1.5,
    "relaxed": 1.75
  }
}
```

#### ComponentStylesSchema
```json
{
  "borderRadius": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": 9999
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32
  },
  "button": {
    "borderRadius": "md",
    "paddingVertical": "sm",
    "paddingHorizontal": "md"
  },
  "card": {
    "borderRadius": "lg",
    "shadow": "md"
  },
  "input": {
    "borderRadius": "md",
    "borderWidth": 1
  }
}
```

---

## API Design

### Endpoints Overview

```
White Label Service (Port 5008)
================================

# Theme Configuration
GET    /api/whitelabel/themes/{tenantId}           - Get tenant theme
PUT    /api/whitelabel/themes/{tenantId}           - Update tenant theme
POST   /api/whitelabel/themes/{tenantId}/preview   - Generate preview
DELETE /api/whitelabel/themes/{tenantId}           - Reset to default

# Assets
GET    /api/whitelabel/assets/{tenantId}           - List tenant assets
POST   /api/whitelabel/assets/{tenantId}           - Upload asset
GET    /api/whitelabel/assets/{tenantId}/{assetId} - Get asset metadata
DELETE /api/whitelabel/assets/{tenantId}/{assetId} - Delete asset

# Custom Domains
GET    /api/whitelabel/domains/{tenantId}          - List domains
POST   /api/whitelabel/domains/{tenantId}          - Add domain
GET    /api/whitelabel/domains/{tenantId}/{domainId}/verify - Verify domain
DELETE /api/whitelabel/domains/{tenantId}/{domainId} - Remove domain

# Feature Flags
GET    /api/whitelabel/features/{tenantId}         - Get all features
PUT    /api/whitelabel/features/{tenantId}         - Bulk update features
GET    /api/whitelabel/features/{tenantId}/{key}   - Get specific feature
PUT    /api/whitelabel/features/{tenantId}/{key}   - Update specific feature

# Email Templates
GET    /api/whitelabel/emails/{tenantId}           - List templates
GET    /api/whitelabel/emails/{tenantId}/{type}    - Get template
PUT    /api/whitelabel/emails/{tenantId}/{type}    - Update template
POST   /api/whitelabel/emails/{tenantId}/{type}/preview - Preview template

# Public Endpoints (No Auth - Used by Frontend)
GET    /api/public/whitelabel/config               - Get config by domain/tenant
GET    /api/public/whitelabel/assets/{assetPath}   - Redirect to CDN
```

### DTOs

```csharp
// Request/Response DTOs

public record TenantThemeConfigurationDto(
    Guid TenantId,
    string? ThemeName,
    ColorPaletteDto ColorPalette,
    TypographyDto Typography,
    ComponentStylesDto ComponentStyles,
    List<TenantAssetDto> Assets,
    List<TenantFeatureFlagDto> Features,
    DateTime LastUpdatedDate
);

public record ColorPaletteDto(
    ThemeColorsDto Light,
    ThemeColorsDto Dark
);

public record ThemeColorsDto(
    string Primary,
    string PrimaryLight,
    string PrimaryDark,
    string Secondary,
    string Accent,
    string Success,
    string Warning,
    string Error,
    string Info,
    string Background,
    string Surface,
    string Text,
    string TextSecondary,
    string Border,
    string Disabled
);

public record TypographyDto(
    FontFamilyDto FontFamily,
    Dictionary<string, int> FontSize,
    Dictionary<string, int> FontWeight,
    Dictionary<string, double> LineHeight
);

public record FontFamilyDto(
    string Primary,
    string Secondary,
    string Monospace
);

public record ComponentStylesDto(
    Dictionary<string, int> BorderRadius,
    Dictionary<string, int> Spacing,
    ButtonStyleDto Button,
    CardStyleDto Card,
    InputStyleDto Input
);

public record TenantAssetDto(
    Guid ExternalId,
    string AssetType,
    string FileName,
    string CdnUrl,
    long FileSizeBytes,
    DimensionsDto? Dimensions
);

public record DimensionsDto(int Width, int Height);

public record TenantFeatureFlagDto(
    string FeatureKey,
    bool IsEnabled,
    Dictionary<string, object>? Configuration,
    DateTime? EffectiveFrom,
    DateTime? EffectiveUntil
);

// For public endpoint (minimal data, fast)
public record PublicWhiteLabelConfigDto(
    Guid TenantId,
    string TenantName,
    ColorPaletteDto ColorPalette,
    TypographyDto Typography,
    ComponentStylesDto ComponentStyles,
    string? LogoUrl,
    string? FaviconUrl,
    List<string> EnabledFeatures
);
```

---

## Frontend Integration

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 WhiteLabelProvider                       │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │ - Fetches config on app init                        ││   │
│  │  │ - Caches config in AsyncStorage                     ││   │
│  │  │ - Provides ThemeContext                             ││   │
│  │  │ - Provides FeatureFlagContext                       ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│          ┌───────────────────┼───────────────────┐             │
│          │                   │                   │             │
│          ▼                   ▼                   ▼             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │ useTheme()    │  │ useFeature()  │  │ useBranding() │      │
│  │ hook          │  │ hook          │  │ hook          │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Files

```
BaseClient/src/
├── providers/
│   └── WhiteLabelProvider.tsx      # Context provider
├── hooks/
│   ├── useTheme.ts                 # Theme access hook
│   ├── useFeatureFlag.ts           # Feature flag hook
│   └── useBranding.ts              # Logo/assets hook
├── lib/
│   └── http/
│       └── endpoints/
│           └── whitelabel.ts       # API client
├── theme/
│   ├── palette.ts                  # Fallback/default palette
│   ├── dynamicPalette.ts           # Merge server config with defaults
│   └── ThemeContext.tsx            # Theme context
└── types/
    └── whitelabel.ts               # TypeScript types
```

### Example: WhiteLabelProvider

```tsx
// BaseClient/src/providers/WhiteLabelProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { getWhiteLabelConfig } from '../lib/http/endpoints/whitelabel';
import { defaultPalette } from '../theme/palette';
import { mergePalette } from '../theme/dynamicPalette';
import type { WhiteLabelConfig, Theme, FeatureFlags } from '../types/whitelabel';

interface WhiteLabelContextValue {
  theme: Theme;
  features: FeatureFlags;
  branding: {
    logoUrl: string | null;
    faviconUrl: string | null;
    tenantName: string;
  };
  isLoading: boolean;
  error: Error | null;
  refreshConfig: () => Promise<void>;
}

const WhiteLabelContext = createContext<WhiteLabelContextValue | null>(null);

const CACHE_KEY = '@whitelabel_config';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [cachedConfig, setCachedConfig] = useState<WhiteLabelConfig | null>(null);

  // Load from cache on mount
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (cached) {
        const { config, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          setCachedConfig(config);
        }
      }
    });
  }, []);

  // Fetch from server
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['whitelabel', 'config'],
    queryFn: getWhiteLabelConfig,
    staleTime: CACHE_TTL_MS,
    cacheTime: CACHE_TTL_MS * 2,
  });

  // Update cache when server data arrives
  useEffect(() => {
    if (data) {
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        config: data,
        timestamp: Date.now(),
      }));
    }
  }, [data]);

  const config = data ?? cachedConfig;

  const theme = config
    ? mergePalette(defaultPalette, config.colorPalette, config.typography, config.componentStyles)
    : defaultPalette;

  const features: FeatureFlags = config?.enabledFeatures.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as FeatureFlags) ?? {};

  const branding = {
    logoUrl: config?.logoUrl ?? null,
    faviconUrl: config?.faviconUrl ?? null,
    tenantName: config?.tenantName ?? 'App',
  };

  return (
    <WhiteLabelContext.Provider
      value={{
        theme,
        features,
        branding,
        isLoading,
        error,
        refreshConfig: refetch
      }}
    >
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    throw new Error('useWhiteLabel must be used within WhiteLabelProvider');
  }
  return context;
}

export function useTheme() {
  return useWhiteLabel().theme;
}

export function useFeatureFlag(key: string): boolean {
  return useWhiteLabel().features[key] ?? false;
}

export function useBranding() {
  return useWhiteLabel().branding;
}
```

### Tenant Resolution Strategy

```typescript
// How to identify which tenant's config to load

// Option 1: Domain-based (for web)
const getTenantFromDomain = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // e.g., "tenant1.app.com" -> "tenant1"
    // or custom domain lookup via API
    return hostname;
  }
  return null;
};

// Option 2: From JWT token (after login)
const getTenantFromToken = () => {
  const token = getStoredToken();
  if (token) {
    const decoded = decodeJwt(token);
    return decoded.tenant_id;
  }
  return null;
};

// Option 3: App config (for mobile builds)
const getTenantFromConfig = () => {
  return process.env.EXPO_PUBLIC_TENANT_ID;
};

// Combined strategy
const resolveTenant = async () => {
  // 1. Check if hardcoded in config (white-labeled mobile build)
  const configTenant = getTenantFromConfig();
  if (configTenant) return { type: 'config', value: configTenant };

  // 2. Check domain (web)
  const domainTenant = getTenantFromDomain();
  if (domainTenant && domainTenant !== 'localhost') {
    return { type: 'domain', value: domainTenant };
  }

  // 3. Check JWT (after login)
  const tokenTenant = getTenantFromToken();
  if (tokenTenant) return { type: 'token', value: tokenTenant };

  // 4. Default/fallback
  return { type: 'default', value: null };
};
```

---

## Asset Management

### Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Asset Upload Flow                          │
└─────────────────────────────────────────────────────────────────┘

  Client                WhiteLabelService              Blob Storage
    │                         │                             │
    │  POST /assets           │                             │
    │  (multipart/form-data)  │                             │
    │ ────────────────────►   │                             │
    │                         │                             │
    │                         │  1. Validate file           │
    │                         │  2. Generate unique path    │
    │                         │  3. Upload to blob          │
    │                         │ ─────────────────────────►  │
    │                         │                             │
    │                         │  4. Store metadata in DB    │
    │                         │  5. Invalidate CDN cache    │
    │                         │                             │
    │   AssetDto (with CDN URL) │                           │
    │ ◄────────────────────── │                             │
    │                         │                             │
```

### Storage Path Convention

```
/tenants/{tenantId}/
├── logos/
│   ├── primary-logo.png
│   ├── primary-logo-dark.png
│   └── logo-icon.png
├── favicons/
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
├── app-icons/
│   ├── android/
│   │   ├── mipmap-mdpi/
│   │   ├── mipmap-hdpi/
│   │   ├── mipmap-xhdpi/
│   │   ├── mipmap-xxhdpi/
│   │   └── mipmap-xxxhdpi/
│   └── ios/
│       └── AppIcon.appiconset/
├── email-headers/
│   └── header-logo.png
└── backgrounds/
    ├── login-bg.jpg
    └── splash-bg.png
```

### Image Processing Requirements

| Asset Type | Max Size | Formats | Dimensions | Processing |
|------------|----------|---------|------------|------------|
| Logo | 2MB | PNG, SVG | 400x100 max | Resize, optimize |
| Favicon | 500KB | ICO, PNG | 16x16 to 192x192 | Generate sizes |
| App Icon | 5MB | PNG | 1024x1024 | Generate all sizes |
| Email Header | 1MB | PNG, JPG | 600x200 max | Optimize |
| Background | 5MB | JPG, PNG | 1920x1080 max | Compress |

### Image Processing Service

```csharp
// Services/WhiteLabelService/src/WhiteLabel.Application/Services/IAssetProcessingService.cs

public interface IAssetProcessingService
{
    Task<AssetProcessingResult> ProcessLogoAsync(Stream fileStream, string mimeType);
    Task<AssetProcessingResult> ProcessFaviconAsync(Stream fileStream);
    Task<AssetProcessingResult> ProcessAppIconAsync(Stream fileStream);
    Task<AssetProcessingResult> ProcessEmailHeaderAsync(Stream fileStream, string mimeType);
    Task<AssetProcessingResult> ProcessBackgroundAsync(Stream fileStream, string mimeType);
}

public record AssetProcessingResult(
    bool Success,
    string? ErrorMessage,
    List<ProcessedAsset> GeneratedAssets
);

public record ProcessedAsset(
    string FileName,
    string MimeType,
    Stream Content,
    int Width,
    int Height,
    long SizeBytes
);
```

---

## Caching Strategy

### Multi-Layer Caching

```
┌─────────────────────────────────────────────────────────────────┐
│                      Caching Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Client-Side (AsyncStorage)                           │
│  ├── TTL: 5 minutes                                            │
│  ├── Stale-while-revalidate pattern                            │
│  └── Fallback when offline                                     │
│                                                                 │
│  Layer 2: CDN Edge Cache (for assets)                          │
│  ├── TTL: 24 hours                                             │
│  ├── Cache key: tenant + asset path                            │
│  └── Purge on asset update                                     │
│                                                                 │
│  Layer 3: Redis (for config API)                               │
│  ├── TTL: 15 minutes                                           │
│  ├── Cache key: tenant_id:whitelabel:config                    │
│  └── Invalidate on any config change                           │
│                                                                 │
│  Layer 4: EF Core Second-Level Cache                           │
│  ├── TTL: 30 minutes                                           │
│  └── Entity-level caching                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Key Schema

```
Redis Cache Keys:
- whitelabel:config:{tenantId}           -> Full theme config JSON
- whitelabel:features:{tenantId}         -> Feature flags JSON
- whitelabel:domains                     -> Domain -> TenantId mapping
- whitelabel:assets:{tenantId}:{type}    -> Asset metadata
```

### Cache Invalidation Events

| Event | Invalidate Keys |
|-------|-----------------|
| Theme updated | `config:{tenantId}` |
| Feature flag changed | `features:{tenantId}`, `config:{tenantId}` |
| Asset uploaded/deleted | `assets:{tenantId}:{type}`, purge CDN |
| Domain added/removed | `domains` |

---

## Security Considerations

### Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authorization Matrix                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Endpoint                    │ Roles Required                  │
│  ─────────────────────────────────────────────────────────────  │
│  GET  /api/public/*          │ None (public)                   │
│  GET  /api/whitelabel/*      │ TenantAdmin, SuperAdmin         │
│  PUT  /api/whitelabel/*      │ TenantAdmin, SuperAdmin         │
│  POST /api/whitelabel/assets │ TenantAdmin, SuperAdmin         │
│  DELETE /api/whitelabel/*    │ SuperAdmin only                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### File Upload Security

1. **File Type Validation**: Magic number check, not just extension
2. **Size Limits**: Enforced at API gateway and service level
3. **Virus Scanning**: Integrate with ClamAV or cloud-based scanner
4. **Content Sanitization**: Strip EXIF data, sanitize SVG
5. **Signed URLs**: Time-limited access for private assets

### Domain Verification

```
Domain Verification Flow:
1. Tenant adds custom domain
2. System generates unique TXT record token
3. Tenant adds TXT record to DNS
4. System verifies TXT record exists
5. System provisions SSL certificate
6. Domain marked as verified
```

---

## Implementation Tasks

### Phase 1: Backend Foundation (Backend Dev Agent)

- [ ] **1.1** Create WhiteLabelService project structure
  - Follow existing service patterns (OnlineMenuSaaS structure)
  - Set up Clean Architecture layers (API, Application, Domain, Infrastructure)
  - Configure EF Core with PostgreSQL
  - Add health check endpoints

- [ ] **1.2** Implement database entities and migrations
  - TenantThemeConfiguration entity
  - TenantAssets entity
  - TenantFeatureFlag entity
  - TenantCustomDomain entity (future)
  - TenantEmailTemplate entity (future)

- [ ] **1.3** Create Core API Endpoints
  - GET/PUT `/api/whitelabel/themes/{tenantId}`
  - GET/POST/DELETE `/api/whitelabel/assets/{tenantId}`
  - GET/PUT `/api/whitelabel/features/{tenantId}`
  - GET `/api/public/whitelabel/config`

- [ ] **1.4** Implement Asset Processing
  - Image validation and processing service
  - Blob storage integration (Azure/S3/MinIO)
  - CDN URL generation

- [ ] **1.5** Add Caching Layer
  - Redis cache for theme configs
  - Cache invalidation on updates

- [ ] **1.6** Create WhiteLabel NuGet Package
  - Shared DTOs for cross-service communication
  - `IWhiteLabelClient` for other services to consume

- [ ] **1.7** Write Backend Unit Tests
  - Theme configuration CRUD
  - Asset processing
  - Feature flag logic
  - Cache invalidation

### Phase 2: Frontend Integration (Frontend Dev Agent)

- [ ] **2.1** Create WhiteLabelProvider
  - React Context for theme/features/branding
  - AsyncStorage caching
  - Stale-while-revalidate pattern

- [ ] **2.2** Create API Client
  - `getWhiteLabelConfig()` endpoint
  - React Query integration

- [ ] **2.3** Implement Dynamic Theming
  - Merge server palette with defaults
  - Apply theme to all components
  - Support dark/light mode toggle

- [ ] **2.4** Create Custom Hooks
  - `useTheme()` - access theme values
  - `useFeatureFlag(key)` - check feature status
  - `useBranding()` - access logo/tenant info

- [ ] **2.5** Update Existing Components
  - Replace hardcoded colors with theme values
  - Add feature flag guards where needed
  - Update logo components to use dynamic URLs

- [ ] **2.6** Create Admin Theme Editor (Future)
  - Color picker UI
  - Live preview
  - Asset upload UI

- [ ] **2.7** Write Frontend Unit Tests
  - WhiteLabelProvider behavior
  - Theme merging logic
  - Feature flag hook logic

### Phase 3: E2E Testing (Regression Tester Agent)

- [ ] **3.1** Theme Configuration E2E Tests
  - Test theme changes reflect in UI
  - Test theme persistence across sessions
  - Test fallback to default theme

- [ ] **3.2** Asset Management E2E Tests
  - Test logo upload and display
  - Test favicon update
  - Test invalid file rejection

- [ ] **3.3** Feature Flag E2E Tests
  - Test feature enable/disable
  - Test conditional UI rendering
  - Test feature flag persistence

### Phase 4: Integration & Deployment

- [ ] **4.1** Docker Configuration
  - Dockerfile for WhiteLabelService
  - Docker Compose integration
  - Tilt configuration

- [ ] **4.2** Environment Configuration
  - Blob storage credentials
  - CDN configuration
  - Redis connection

- [ ] **4.3** Documentation
  - API documentation
  - Admin guide for theme configuration
  - Developer guide for extending themes

---

## Testing Strategy

### Unit Tests

| Layer | Test Focus | Tools |
|-------|-----------|-------|
| Domain | Entity validation, value objects | xUnit |
| Application | Use case logic, validators | xUnit + Moq |
| Infrastructure | Repository operations | xUnit + In-Memory DB |
| Frontend | Hook behavior, context logic | Jest |

### Integration Tests

| Scope | Test Focus | Tools |
|-------|-----------|-------|
| API | Endpoint contracts, auth | xUnit + WebApplicationFactory |
| Database | Migrations, queries | xUnit + TestContainers |
| Cache | Redis operations | xUnit + TestContainers |

### E2E Tests

| Flow | Test Cases | Tools |
|------|-----------|-------|
| Theme Application | Colors render correctly | Playwright |
| Logo Display | Correct logo shows per tenant | Playwright |
| Feature Flags | Features show/hide correctly | Playwright |

---

## Success Criteria

- [ ] Tenant admins can customize all colors via API
- [ ] Logo changes reflect immediately in frontend
- [ ] Theme persists across app restarts
- [ ] Feature flags control UI visibility
- [ ] Assets served via CDN with < 100ms latency
- [ ] Cache invalidation works within 30 seconds
- [ ] 90%+ unit test coverage on new code
- [ ] All E2E tests pass
- [ ] Documentation complete

---

## Open Questions / Future Considerations

1. **Custom Fonts**: Should we support custom font uploads? (Adds complexity)
2. **CSS Variables**: For web, use CSS custom properties for instant updates?
3. **Mobile White-Label Builds**: Automated CI/CD for tenant-specific app builds?
4. **Email Templates**: Liquid vs Handlebars for template engine?
5. **Domain SSL**: Let's Encrypt integration vs manual certificate management?
6. **Audit Trail**: Should theme changes be versioned for rollback?

---

## Appendix: File Structure

### Backend Service Structure

```
Services/WhiteLabelService/
├── src/
│   ├── WhiteLabel.API/
│   │   ├── Endpoints/
│   │   │   ├── Themes/
│   │   │   │   ├── GetTenantTheme.cs
│   │   │   │   └── UpdateTenantTheme.cs
│   │   │   ├── Assets/
│   │   │   │   ├── ListAssets.cs
│   │   │   │   ├── UploadAsset.cs
│   │   │   │   └── DeleteAsset.cs
│   │   │   ├── Features/
│   │   │   │   ├── GetFeatureFlags.cs
│   │   │   │   └── UpdateFeatureFlags.cs
│   │   │   └── Public/
│   │   │       └── GetPublicConfig.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── WhiteLabel.Application/
│   │   ├── UseCases/
│   │   │   ├── Themes/
│   │   │   ├── Assets/
│   │   │   └── Features/
│   │   ├── DTOs/
│   │   ├── Validators/
│   │   └── Services/
│   │       ├── IAssetProcessingService.cs
│   │       └── ICacheService.cs
│   ├── WhiteLabel.Domain/
│   │   ├── Entities/
│   │   │   ├── TenantThemeConfiguration.cs
│   │   │   ├── TenantAsset.cs
│   │   │   └── TenantFeatureFlag.cs
│   │   ├── Enums/
│   │   │   └── AssetType.cs
│   │   └── ValueObjects/
│   │       ├── ColorPalette.cs
│   │       └── Typography.cs
│   └── WhiteLabel.Infrastructure/
│       ├── Data/
│       │   ├── WhiteLabelDbContext.cs
│       │   ├── Migrations/
│       │   └── Config/
│       ├── Repositories/
│       ├── BlobStorage/
│       │   ├── IBlobStorageService.cs
│       │   ├── AzureBlobStorageService.cs
│       │   └── MinIOStorageService.cs
│       └── Cache/
│           └── RedisCacheService.cs
├── tests/
│   ├── WhiteLabel.UnitTests/
│   └── WhiteLabel.IntegrationTests/
├── docker-compose.yml
└── Dockerfile
```

### Frontend Structure

```
BaseClient/src/
├── providers/
│   └── WhiteLabelProvider.tsx
├── hooks/
│   ├── useTheme.ts
│   ├── useFeatureFlag.ts
│   └── useBranding.ts
├── lib/http/endpoints/
│   └── whitelabel.ts
├── theme/
│   ├── palette.ts (default)
│   ├── dynamicPalette.ts
│   └── ThemeContext.tsx
└── types/
    └── whitelabel.ts
```
