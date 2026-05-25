# GDPR Compliance

> **Status**: TODO
> **Priority**: P1 - Legal Requirement
> **Estimated Scope**: Large (Frontend + Backend + Legal)
> **Estimated Effort**: 2-3 weeks

---

## 1. Problem

No GDPR compliance infrastructure exists. EU customers require:
- Cookie consent before tracking
- Privacy policy and terms of service pages
- Right to access personal data (data export)
- Right to erasure (account deletion)
- Data processing records
- Breach notification procedures

---

## 2. Required Components

### 2.1 Frontend

| Component | Route | Description |
|-----------|-------|-------------|
| Cookie Consent Banner | Global (all pages) | Banner with Accept/Reject/Customize options |
| Privacy Policy Page | `/privacy` | Public, accessible without login |
| Terms of Service Page | `/terms` | Public, accessible without login |
| Data Export Request | `/settings/privacy` | Authenticated, request data export |
| Account Deletion Request | `/settings/privacy` | Authenticated, request account deletion |
| Consent Preferences | `/settings/privacy` | Manage cookie/tracking consent |

### 2.2 Backend (IdentityService)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/me/data-export` | POST | Queue data export job |
| `/api/users/me/data-export/{id}` | GET | Download exported data (JSON/ZIP) |
| `/api/users/me/delete-request` | POST | Request account deletion (with grace period) |
| `/api/users/me/delete-request/{id}` | DELETE | Cancel pending deletion |
| `/api/consent` | GET/PUT | Get/update consent preferences |

### 2.3 Data Export Format

Export all personal data across services as JSON/ZIP:
- User profile (IdentityService)
- Tenant membership and roles
- Notification history (NotificationService)
- Quiz responses (QuestionerService)
- Uploaded content metadata (ContentService)
- Menu activity logs (OnlineMenuSaaS)

### 2.4 Account Deletion

- 30-day grace period before permanent deletion
- Email confirmation required
- Cascade delete across all services via RabbitMQ events
- Anonymize data where deletion is not possible (audit logs)

---

## 3. Legal Documents

Draft with legal counsel:
- **Privacy Policy** — Data collection, processing, storage, third parties, retention
- **Terms of Service** — Usage terms, liability, SLA, dispute resolution
- **Cookie Policy** — What cookies are used, purpose, duration
- **Data Processing Agreement** — For B2B customers (EU requirement)

---

## 4. Implementation Steps

### Phase 1: Legal Pages (3-4 days)
1. Create `/privacy` and `/terms` public routes in BaseClient
2. Add cookie consent banner component (use `react-cookie-consent` or custom)
3. Store consent in localStorage + backend
4. Add consent check before loading any analytics (when implemented)

### Phase 2: Data Rights Backend (1 week)
1. Add data export endpoints to IdentityService
2. Create cross-service data aggregation (via RabbitMQ request/reply or direct API)
3. Add account deletion endpoint with grace period
4. Create `UserDeletedEvent` consumed by all services for cascade cleanup
5. Add consent storage to IdentityService database

### Phase 3: Frontend Settings (3-4 days)
1. Create `/settings/privacy` page with data export and deletion request
2. Add consent management UI
3. Add deletion confirmation flow with email verification
4. Show pending deletion status with cancel option

---

## 5. Verification

- [ ] Cookie banner appears on first visit
- [ ] Privacy policy and terms pages accessible without login
- [ ] Data export generates downloadable file with all user data
- [ ] Account deletion has 30-day grace period with cancel option
- [ ] Deletion cascades to all services
- [ ] Consent preferences persist and are respected
