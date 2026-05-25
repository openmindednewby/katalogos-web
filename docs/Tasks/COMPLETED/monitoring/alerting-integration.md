# Alerting Integration (Slack/PagerDuty)

> **Status**: COMPLETED
> **Priority**: P2 - Operational
> **Estimated Scope**: Small (Infrastructure)
> **Estimated Effort**: 1 day
> **Completed**: 2026-03-19

---

## 1. Problem

Grafana alerts are defined (high error rate, auth failure spike) but have no notification destination configured. Alerts fire silently -- no Slack messages, no emails, no PagerDuty incidents.

---

## 2. Solution

Configure Grafana contact points and notification policies via provisioning YAML files.

### 2.1 Notification Channels

| Channel | Use Case | Alert Types |
|---------|----------|-------------|
| **Slack** (#alerts) | All alerts | Error rate, auth failures, service down |
| **Email** | Critical only | Service down, data integrity issues |
| **PagerDuty** (optional) | On-call escalation | Service down for >5 minutes |

---

## 3. Changes Made

### New Files Created

1. **`infrastructure/observability/provisioning/alerting/contact-points.yaml`**
   - `slack-alerts` contact point (Slack incoming webhook via `${SLACK_ALERTING_WEBHOOK_URL}`)
   - `email-alerts` contact point (email via `${ALERT_EMAIL_TO}`)
   - `pagerduty-critical` contact point (PagerDuty via `${PAGERDUTY_INTEGRATION_KEY}`)

2. **`infrastructure/observability/provisioning/alerting/notification-policies.yaml`**
   - Default route sends to `slack-alerts`
   - Critical severity: routes to `slack-alerts` + `email-alerts` + `pagerduty-critical`
   - Warning severity: routes to `slack-alerts` only
   - Group by: `alertname`, `service`; Group wait: 30s; Group interval: 5m; Repeat: 4h

3. **`infrastructure/observability/provisioning/alerting/templates/slack-message.tmpl`**
   - Rich Slack message with color-coding by severity (red for critical, yellow for warning, green for resolved)
   - Includes alert name, severity, summary, description, service, runbook link, timestamps

4. **`infrastructure/observability/provisioning/alerting/templates/email-message.tmpl`**
   - HTML email template with styled severity badges, alert details, and Grafana link

### Files Modified

5. **`infrastructure/observability/docker-compose.yml`** (Grafana service)
   - Added unified alerting environment variables (`GF_UNIFIED_ALERTING_ENABLED`, disabled legacy alerting)
   - Added SMTP configuration (`GF_SMTP_*`) defaulting to Mailpit in dev
   - Passed alerting env vars (`SLACK_ALERTING_WEBHOOK_URL`, `ALERT_EMAIL_TO`, `PAGERDUTY_INTEGRATION_KEY`)

6. **`.env.example`**
   - Added `GRAFANA_SMTP_HOST`, `GRAFANA_SMTP_USER`, `GRAFANA_SMTP_PASSWORD`
   - Added `SLACK_ALERTING_WEBHOOK_URL`, `ALERT_EMAIL_TO`, `PAGERDUTY_INTEGRATION_KEY`

7. **`infrastructure/observability/provisioning/alerting/alerts.yaml`**
   - Added `service` label to all 3 alert rules
   - Added `runbook_url` annotation to all 3 alert rules

8. **`infrastructure/observability/provisioning/alerting/container-alerts.yaml`**
   - Added `service` label to all 4 alert rules
   - Added `runbook_url` annotation to all 4 alert rules

---

## 4. Verification

- [x] Contact points configured for Slack, Email, and PagerDuty
- [x] Alert messages include service name, severity, description
- [x] Notification policies route critical to Slack + Email + PagerDuty
- [x] Notification policies route warnings to Slack only
- [x] Webhook URLs and API keys use environment variables (not committed)
- [x] SMTP configured for email alerts (defaults to Mailpit in dev)
- [x] All alert rules have `severity` label, `description` annotation, and `runbook_url` annotation
- [x] Templates provide rich formatting for Slack and email
- [ ] Slack message received when alert triggers (requires webhook URL in `.env.local`)
- [ ] Alert resolves and sends recovery notification (requires live test)
- [ ] PagerDuty incident created for critical alerts (requires integration key)
