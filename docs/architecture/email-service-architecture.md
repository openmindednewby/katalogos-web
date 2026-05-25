# Email Service Architecture

## Overview

The email service provides transactional email delivery for the SaaS platform. It follows a **layered abstraction** pattern with two NuGet packages (`Email.Abstractions`, `Email.Smtp`) and a **composite delegation** pattern in IdentityService to support both SMS and email through a single `INotificationService` interface.

## Architecture Diagram

```
                              POST /api/auth/send-otp
                                       │
                                       ▼
                            ┌────────────────────┐
                            │  SendOtpEndpoint    │
                            │  (FastEndpoints)    │
                            └────────┬───────────┘
                                     │
                                     ▼
                     ┌──────────────────────────────┐
                     │  KeycloakIdentityProvider     │
                     │  (Identity.Keycloak)          │
                     │                               │
                     │  SendOtpAsync()               │
                     │  ├─ OtpType.Sms  → SendSms    │
                     │  └─ OtpType.Email → SendEmail  │
                     └──────────────┬───────────────┘
                                    │
                            INotificationService
                                    │
                                    ▼
                  ┌────────────────────────────────────┐
                  │  CompositeNotificationService       │
                  │  (IdentityService.API)               │
                  │                                      │
                  │  SendSmsAsync() ──► TwilioSmsProvider │
                  │  SendEmailAsync() ──► IEmailService   │
                  └─────────────────────┬────────────────┘
                                        │
                                 IEmailService
                                        │
                                        ▼
                            ┌──────────────────────┐
                            │  SmtpEmailService     │
                            │  (Email.Smtp)         │
                            │                       │
                            │  BuildMimeMessage()   │
                            │  SendViaSmtpAsync()   │
                            └──────────┬───────────┘
                                       │
                                  MailKit SMTP
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                      ▼
          ┌─────────────────┐                   ┌──────────────────┐
          │    Mailpit       │                   │  Postal / Any    │
          │  (Development)   │                   │  SMTP Server     │
          │  SMTP: 5019      │                   │  (Production)    │
          │  Web UI: 5020    │                   │  Port 587 (TLS)  │
          └─────────────────┘                   └──────────────────┘
```

## Package Layers

### Layer 1: Email.Abstractions (Zero Dependencies)

```
NuGetPackages/Email.Abstractions/
└── src/Email.Abstractions/
    ├── Abstractions/
    │   ├── IEmailService.cs          # SendAsync + SendTemplatedAsync
    │   └── IEmailTemplateRenderer.cs # RenderAsync(templateName, data)
    ├── Models/
    │   ├── EmailMessage.cs           # sealed record: To, From, Subject, HtmlBody, PlainTextBody
    │   ├── EmailRecipient.cs         # sealed record: Address, Name
    │   └── EmailResult.cs            # sealed record: IsSuccess, ErrorMessage + factory methods
    └── Enums/
        └── EmailTemplateNames.cs     # const strings: otp-code, welcome, password-reset, etc.
```

**Purpose**: Provider-agnostic contracts. Any email backend (SMTP, SendGrid, SES) can implement `IEmailService`. Zero NuGet dependencies — only `netstandard2.0`/`net10.0` framework types.

**Key interfaces**:

| Interface | Methods | Description |
|-----------|---------|-------------|
| `IEmailService` | `SendAsync(EmailMessage)`, `SendTemplatedAsync(templateName, recipient, subject, data)` | Send raw or templated emails |
| `IEmailTemplateRenderer` | `RenderAsync(templateName, data)` | Render `{{Placeholder}}` templates to HTML |

### Layer 2: Email.Smtp (MailKit Implementation)

```
NuGetPackages/Email.Smtp/
└── src/Email.Smtp/
    ├── Configuration/
    │   └── SmtpOptions.cs            # Host, Port, UseSsl, Username, Password, FromAddress, FromName
    ├── Services/
    │   ├── SmtpEmailService.cs       # IEmailService → MailKit SmtpClient
    │   └── SmtpNotificationBridge.cs # INotificationService → IEmailService adapter
    ├── Rendering/
    │   └── EmbeddedResourceTemplateRenderer.cs  # IEmailTemplateRenderer with ConcurrentDictionary cache
    ├── Extensions/
    │   └── EmailServiceExtensions.cs # AddSmtpEmail() + AddSmtpEmailNotifications() DI
    └── Templates/                    # Embedded .html resources
        ├── otp-code.html
        ├── welcome.html
        ├── password-reset.html
        ├── payment-receipt.html
        ├── payment-failed.html
        └── account-deletion.html
```

**Dependencies**: `Email.Abstractions`, `Identity.Abstractions`, `MailKit 4.15.1`

**Key components**:

| Component | Role |
|-----------|------|
| `SmtpEmailService` | Implements `IEmailService`. Creates a MailKit `SmtpClient` per send, connects with optional TLS/auth, sends MIME message. |
| `SmtpNotificationBridge` | Adapter: implements `INotificationService` by delegating `SendEmailAsync` to `IEmailService`. SMS returns false with a warning log. |
| `EmbeddedResourceTemplateRenderer` | Loads `.html` templates from assembly embedded resources, caches them in a static `ConcurrentDictionary`, replaces `{{Key}}` placeholders. |
| `SmtpOptions` | Configuration POCO bound from `appsettings.json` section `"Smtp"`. |

**DI extension methods**:

```csharp
// Register IEmailService + IEmailTemplateRenderer only
services.AddSmtpEmail(options => config.GetSection("Smtp").Bind(options));

// Register IEmailService + IEmailTemplateRenderer + INotificationService (bridge)
services.AddSmtpEmailNotifications(options => config.GetSection("Smtp").Bind(options));
```

### Layer 3: IdentityService Integration

IdentityService uses a **Composite pattern** rather than the bridge adapter:

```csharp
// ProgramExtensions.cs — DI registration
builder.Services.AddScoped<TwilioSmsProvider>();           // Concrete SMS
builder.Services.AddSmtpEmail(options => ...);             // IEmailService + renderer
builder.Services.AddScoped<INotificationService,
    CompositeNotificationService>();                        // Composite of both
```

**CompositeNotificationService** delegates to the right provider:

| Method | Delegates To |
|--------|-------------|
| `SendSmsAsync(phone, message)` | `TwilioSmsProvider.SendSmsAsync()` |
| `SendEmailAsync(email, subject, body)` | `IEmailService.SendAsync()` via `EmailMessage` construction |

**Why Composite instead of Bridge?** The `SmtpNotificationBridge` (in Email.Smtp package) returns `false` for SMS. IdentityService needs **both** channels, so `CompositeNotificationService` wraps a real `TwilioSmsProvider` for SMS and `IEmailService` for email.

## Data Flow: Email OTP

```
1. Client sends POST /api/auth/send-otp
   Body: { "type": 1, "identifier": "user@example.com", "tenantId": "..." }
   (type: 1 = Email, 0 = SMS)

2. SendOtpEndpoint validates request, calls IIdentityProvider.SendOtpAsync()

3. KeycloakIdentityProvider.SendOtpAsync():
   a. Generates random OTP code (6 digits)
   b. Stores code in DB via IOtpService.StoreCodeAsync()
   c. Checks OtpType:
      - Email → _notificationService.SendEmailAsync(email, "Your Verification Code", "Your verification code is: 123456")

4. CompositeNotificationService.SendEmailAsync():
   a. Constructs EmailMessage { To, FromAddress, FromName, Subject, HtmlBody, PlainTextBody }
   b. Calls IEmailService.SendAsync(message)

5. SmtpEmailService.SendAsync():
   a. Builds MimeMessage from EmailMessage (From, To, Subject, HTML + plain text body)
   b. Opens MailKit SmtpClient connection to configured host:port
   c. Optionally authenticates (skipped for Mailpit)
   d. Sends MIME message
   e. Disconnects
   f. Returns EmailResult.Success() or EmailResult.Failure(error)

6. In development: Mailpit captures the email on port 5019, viewable at http://localhost:5020
```

## Template System

HTML email templates are **embedded resources** compiled into the `Email.Smtp` assembly. They use `{{Placeholder}}` syntax for simple string replacement.

### Available Templates

| Template | File | Placeholders |
|----------|------|-------------|
| `otp-code` | `Templates/otp-code.html` | `AppName`, `Code`, `ExpiryMinutes` |
| `welcome` | `Templates/welcome.html` | `AppName`, `UserName`, `TenantName`, `DashboardUrl` |
| `password-reset` | `Templates/password-reset.html` | `AppName`, `ResetUrl`, `ExpiryMinutes` |
| `payment-receipt` | `Templates/payment-receipt.html` | `AppName`, `PlanName`, `Amount`, `Date`, `InvoiceNumber` |
| `payment-failed` | `Templates/payment-failed.html` | `AppName`, `PlanName`, `Amount`, `BillingUrl` |
| `account-deletion` | `Templates/account-deletion.html` | `AppName` |

### Template Rendering Pipeline

```
SendTemplatedAsync("otp-code", recipient, "Your Code", { "Code": "123456" })
    │
    ▼
EmbeddedResourceTemplateRenderer.RenderAsync("otp-code", data)
    │
    ├─ Cache hit? → Return cached HTML with replacements
    │
    └─ Cache miss? → LoadTemplate("otp-code")
                      │
                      ├─ Load "Email.Smtp.Templates.otp-code.html" from assembly
                      ├─ Store in ConcurrentDictionary
                      └─ Replace {{Code}} → "123456", {{AppName}} → "SaaS Platform"
                          │
                          ▼
                      Fully rendered HTML email body
```

**Current usage note**: OTP emails currently use the plain text path (`SendEmailAsync` via `CompositeNotificationService`), not the templated path. The styled `otp-code.html` template is available for future use when services call `IEmailService.SendTemplatedAsync()` directly.

## Infrastructure

### Development: Mailpit

```yaml
# NotificationService/docker-compose.yml
mailpit:
  image: axllent/mailpit:latest
  ports:
    - "5019:1025"   # SMTP
    - "5020:8025"   # Web UI
```

Mailpit captures all SMTP traffic without delivering emails. The Web UI at `http://localhost:5020` provides a searchable inbox, message preview, and REST API for testing.

### Configuration

```json
// appsettings.json
{
  "Smtp": {
    "Host": "mailpit",
    "Port": 1025,
    "UseSsl": false,
    "FromAddress": "noreply@localhost",
    "FromName": "SaaS Platform"
  }
}
```

For production (e.g., Postal self-hosted):

```json
{
  "Smtp": {
    "Host": "postal.yourdomain.com",
    "Port": 587,
    "UseSsl": true,
    "Username": "api-key",
    "Password": "your-api-key",
    "FromAddress": "noreply@yourdomain.com",
    "FromName": "Your SaaS"
  }
}
```

## Design Decisions

### 1. Two-Package Split
`Email.Abstractions` has zero dependencies, making it safe to reference from any project. `Email.Smtp` brings in MailKit (~2 MB) and is only needed by the service that actually sends emails.

### 2. Embedded Templates
HTML templates are compiled into the DLL as embedded resources. This means:
- No file system dependency at runtime
- Templates are versioned with the package
- `ConcurrentDictionary` cache means templates are loaded once per app lifetime

### 3. Composite over Bridge
IdentityService needs both SMS (Twilio) and email (SMTP). The `SmtpNotificationBridge` in the package only handles email. Rather than registering two separate `INotificationService` implementations, a `CompositeNotificationService` dispatches to the right channel.

### 4. MailKit over System.Net.Mail
`System.Net.Mail.SmtpClient` is deprecated. MailKit is the Microsoft-recommended replacement — modern async API, proper TLS support, and active maintenance.

### 5. Connection-per-Send
Each `SendAsync` creates a new `SmtpClient` connection. Acceptable for transactional volume. For bulk sending, connection pooling would be needed.

## Package Dependency Graph

```
Email.Abstractions (zero deps)
       │
       ▼
Email.Smtp (MailKit, Identity.Abstractions)
       │
       ▼
IdentityService.API
├── Email.Smtp (via AddSmtpEmail)
├── Identity.Keycloak (via IIdentityProvider)
├── Notifications (via TwilioSmsProvider)
└── OtpAuthentication (via IOtpService)
```

## Testing

### Unit Tests (14 tests)
`IdentityService.Tests/CompositeNotificationServiceTests.cs`:
- SMS delegation to TwilioSmsProvider
- Email delegation to IEmailService
- EmailMessage construction (recipient, subject, body, from address/name)
- Error handling and logging on failure
- CancellationToken propagation

### E2E Tests (15 tests across 3 browsers)
`E2ETests/tests/identity/email-otp.spec.ts`:
- Mailpit health check
- Email OTP delivery verification
- OTP code matching between API response and email body
- Sender address validation
- Multiple independent email delivery

Uses `E2ETests/helpers/mailpit.helpers.ts` — Mailpit REST API helper with polling-based `waitForEmail()`.
