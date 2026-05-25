# Email Service Integration

> **Status**: TODO
> **Priority**: P1 - Required for Core Features
> **Estimated Scope**: Small-Medium (Backend + Infrastructure)
> **Estimated Effort**: 2-3 days

---

## 1. Problem

SMTP credentials are configured but empty. No transactional email service is integrated. The following features are broken or missing:

- OTP delivery via email (IdentityService — OtpAuthentication package)
- Password reset emails
- Welcome/onboarding emails
- Payment receipt emails (for Payment Service)
- Notification delivery via email (NotificationService)
- Account deletion confirmation emails (for GDPR)

---

## 2. Solution

Integrate a transactional email provider. Options:

| Provider | Pros | Cons | Free Tier |
|----------|------|------|-----------|
| **SendGrid** | Simple API, good deliverability, templates | Twilio-owned (already have Twilio) | 100 emails/day |
| **AWS SES** | Cheapest at scale, reliable | Requires AWS account, sandbox mode | 62K/month (from EC2) |
| **Postmark** | Best deliverability, fast | More expensive | None |
| **Resend** | Modern API, React email templates | Newer service | 3K emails/month |

**Recommendation**: SendGrid (already using Twilio for SMS, natural pairing).

---

## 3. Implementation

### 3.1 Email Abstraction

Create `IEmailService` interface in a shared NuGet package:

```csharp
public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken ct = default);
    Task SendTemplatedAsync(string templateId, EmailRecipient recipient, Dictionary<string, string> data, CancellationToken ct = default);
}
```

### 3.2 Email Templates

| Template | Trigger | Service |
|----------|---------|---------|
| OTP Code | Login with OTP | IdentityService |
| Welcome | User creation | IdentityService |
| Password Reset | Reset request | IdentityService |
| Payment Receipt | Successful charge | PaymentService |
| Payment Failed | Failed charge | PaymentService |
| Account Deletion | Deletion request | IdentityService |

### 3.3 Configuration

```json
{
  "Email": {
    "Provider": "SendGrid",
    "ApiKey": "from-vault",
    "FromEmail": "noreply@yourdomain.com",
    "FromName": "Your SaaS Platform"
  }
}
```

---

## 4. Implementation Steps

1. Create `Email.Abstractions` NuGet package with `IEmailService`
2. Create `Email.SendGrid` NuGet package with SendGrid implementation
3. Register `IEmailService` in IdentityService and NotificationService DI
4. Update OtpAuthentication package to use `IEmailService` for email OTPs
5. Create email templates in SendGrid dashboard (or HTML templates in code)
6. Add email sending to notification delivery pipeline
7. Store SendGrid API key in vault (not appsettings)
8. Add email delivery monitoring to Grafana (success/failure/bounce rates)

---

## 5. Verification

- [ ] OTP email delivered within 10 seconds
- [ ] Email templates render correctly across clients (Gmail, Outlook, Apple Mail)
- [ ] Failed deliveries logged and retried
- [ ] API key stored securely (not in git)
- [ ] Email delivery metrics visible in Grafana
