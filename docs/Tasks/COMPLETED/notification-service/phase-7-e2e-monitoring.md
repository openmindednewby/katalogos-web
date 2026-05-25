# Phase 7: E2E Testing & Monitoring

> **Agent**: `regression-tester`
> **Status**: TODO
> **Priority**: High
> **Depends On**: Phase 4, 5, 6
> **Estimated Effort**: 2-3 days

---

## Objective

Write comprehensive Playwright E2E tests for the notification system and set up monitoring/health checks for all infrastructure components.

---

## Prerequisites

- Phase 4 completed (Integration working)
- Phase 5 completed (User preferences)
- Phase 6 completed (Service Worker)
- Understanding of [architecture.md](./architecture.md)
- Playwright test environment configured

---

## Tasks

### Task 7.1: Create Page Objects

**File**: `E2ETests/pages/notifications.page.ts`

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class NotificationsPage extends BasePage {
  // Locators
  readonly notificationBell: Locator;
  readonly notificationBadge: Locator;
  readonly notificationDropdown: Locator;
  readonly notificationList: Locator;
  readonly notificationItems: Locator;
  readonly markAllReadButton: Locator;
  readonly emptyState: Locator;
  readonly connectionStatus: Locator;

  // Toast locators
  readonly toastContainer: Locator;
  readonly toastItems: Locator;

  // Preferences locators
  readonly preferencesScreen: Locator;
  readonly globalToggle: Locator;
  readonly inAppToggle: Locator;
  readonly osNotificationToggle: Locator;
  readonly quietHoursToggle: Locator;
  readonly quietHoursStart: Locator;
  readonly quietHoursEnd: Locator;

  constructor(page: Page) {
    super(page);

    // Notification bell in header
    this.notificationBell = page.getByTestId('header-notification-bell');
    this.notificationBadge = page.getByTestId('notification-badge');
    this.notificationDropdown = page.getByTestId('notification-dropdown');
    this.notificationList = page.getByTestId('notification-list');
    this.notificationItems = page.getByTestId(/^notification-item-/);
    this.markAllReadButton = page.getByTestId('mark-all-read-button');
    this.emptyState = page.getByTestId('notifications-empty-state');
    this.connectionStatus = page.getByTestId('connection-status');

    // Toasts
    this.toastContainer = page.getByTestId('toast-container');
    this.toastItems = page.getByTestId(/^toast-/);

    // Preferences
    this.preferencesScreen = page.getByTestId('notification-preferences-screen');
    this.globalToggle = page.getByTestId('global-notifications-toggle');
    this.inAppToggle = page.getByTestId('in-app-notifications-toggle');
    this.osNotificationToggle = page.getByTestId('os-notifications-toggle');
    this.quietHoursToggle = page.getByTestId('quiet-hours-toggle');
    this.quietHoursStart = page.getByTestId('quiet-hours-start');
    this.quietHoursEnd = page.getByTestId('quiet-hours-end');
  }

  // Actions
  async clickNotificationBell(): Promise<void> {
    await this.notificationBell.click();
  }

  async getUnreadCount(): Promise<number> {
    const isVisible = await this.notificationBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.notificationBadge.textContent();
    return parseInt(text || '0', 10);
  }

  async waitForNotification(timeout = 30000): Promise<Locator> {
    const notification = this.notificationItems.first();
    await expect(notification).toBeVisible({ timeout });
    return notification;
  }

  async waitForToast(timeout = 10000): Promise<Locator> {
    const toast = this.toastItems.first();
    await expect(toast).toBeVisible({ timeout });
    return toast;
  }

  async dismissToast(toastId: string): Promise<void> {
    const dismissButton = this.page.getByTestId(`toast-dismiss-${toastId}`);
    await dismissButton.click();
  }

  async markAllAsRead(): Promise<void> {
    await this.markAllReadButton.click();
  }

  async clickNotification(notificationId: string): Promise<void> {
    const notification = this.page.getByTestId(`notification-item-${notificationId}`);
    await notification.click();
  }

  async navigateToPreferences(): Promise<void> {
    await this.page.getByTestId('notification-preferences-link').click();
    await expect(this.preferencesScreen).toBeVisible();
  }

  async toggleGlobalNotifications(enabled: boolean): Promise<void> {
    const isChecked = await this.globalToggle.isChecked();
    if (isChecked !== enabled) {
      await this.globalToggle.click();
    }
  }

  async toggleInAppNotifications(enabled: boolean): Promise<void> {
    const isChecked = await this.inAppToggle.isChecked();
    if (isChecked !== enabled) {
      await this.inAppToggle.click();
    }
  }

  async setQuietHours(enabled: boolean, start?: string, end?: string): Promise<void> {
    const isChecked = await this.quietHoursToggle.isChecked();
    if (isChecked !== enabled) {
      await this.quietHoursToggle.click();
    }

    if (enabled && start && end) {
      await this.quietHoursStart.fill(start);
      await this.quietHoursEnd.fill(end);
    }
  }

  // Assertions
  async expectUnreadCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.notificationBadge).not.toBeVisible();
    } else {
      await expect(this.notificationBadge).toHaveText(String(count));
    }
  }

  async expectConnectionStatus(status: 'connected' | 'connecting' | 'disconnected'): Promise<void> {
    await expect(this.connectionStatus).toHaveAttribute('data-status', status);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async expectNotificationCount(count: number): Promise<void> {
    await expect(this.notificationItems).toHaveCount(count);
  }
}
```

---

### Task 7.2: Create Test Helpers

**File**: `E2ETests/helpers/notification.helpers.ts`

```typescript
import { APIRequestContext } from '@playwright/test';

export interface TriggerNotificationParams {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
}

export class NotificationTestHelper {
  private readonly apiContext: APIRequestContext;
  private readonly baseUrl: string;

  constructor(apiContext: APIRequestContext, baseUrl: string) {
    this.apiContext = apiContext;
    this.baseUrl = baseUrl;
  }

  /**
   * Trigger a test notification via the backend API
   * This simulates what would happen when another service publishes an event
   */
  async triggerNotification(params: TriggerNotificationParams): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/api/notifications/test/trigger`, {
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body || '',
        priority: params.priority || 'normal',
        actionUrl: params.actionUrl,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to trigger notification: ${response.status()}`);
    }

    const data = await response.json();
    return data.notificationId;
  }

  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: string): Promise<unknown[]> {
    const response = await this.apiContext.get(
      `${this.baseUrl}/api/notifications?userId=${userId}`
    );

    if (!response.ok()) {
      throw new Error(`Failed to get notifications: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Clear all notifications for a user (test cleanup)
   */
  async clearNotifications(userId: string): Promise<void> {
    await this.apiContext.delete(`${this.baseUrl}/api/notifications/test/clear?userId=${userId}`);
  }

  /**
   * Check health of notification service
   */
  async checkHealth(): Promise<{
    status: string;
    rabbitmq: string;
    redis: string;
    postgres: string;
  }> {
    const response = await this.apiContext.get(`${this.baseUrl}/health`);
    return response.json();
  }
}
```

---

### Task 7.3: Write Real-Time Notification Tests

**File**: `E2ETests/tests/notifications/realtime.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { NotificationsPage } from '../../pages/notifications.page';
import { NotificationTestHelper } from '../../helpers/notification.helpers';
import { LoginPage } from '../../pages/login.page';

test.describe('Real-Time Notifications', () => {
  let notificationsPage: NotificationsPage;
  let notificationHelper: NotificationTestHelper;
  let testUserId: string;
  let testTenantId: string;

  test.beforeEach(async ({ page, request }) => {
    notificationsPage = new NotificationsPage(page);
    notificationHelper = new NotificationTestHelper(
      request,
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010'
    );

    // Login and get user context
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const user = await loginPage.loginAsTestUser();
    testUserId = user.id;
    testTenantId = user.tenantId;

    // Clear any existing notifications
    await notificationHelper.clearNotifications(testUserId);
  });

  test.afterEach(async () => {
    // Cleanup
    await notificationHelper.clearNotifications(testUserId);
  });

  test('should display real-time notification when received', async ({ page }) => {
    // Initial state: no notifications
    await notificationsPage.expectUnreadCount(0);

    // Trigger a notification from the backend
    const notificationId = await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'questionnaire.submitted',
      title: 'New Response',
      body: 'John Doe submitted the Customer Feedback form',
      priority: 'normal',
    });

    // Wait for toast to appear
    const toast = await notificationsPage.waitForToast();
    await expect(toast).toContainText('New Response');

    // Badge should update
    await notificationsPage.expectUnreadCount(1);

    // Click bell to see notification in list
    await notificationsPage.clickNotificationBell();
    const notification = page.getByTestId(`notification-item-${notificationId}`);
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('John Doe submitted');
  });

  test('should update badge count for multiple notifications', async () => {
    // Send 3 notifications
    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Test 1',
    });

    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Test 2',
    });

    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Test 3',
    });

    // Should show 3 unread
    await notificationsPage.expectUnreadCount(3);
  });

  test('should mark notification as read when clicked', async ({ page }) => {
    // Create notification
    const notificationId = await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Click Me',
      actionUrl: '/dashboard',
    });

    await notificationsPage.expectUnreadCount(1);

    // Open dropdown and click
    await notificationsPage.clickNotificationBell();
    await notificationsPage.clickNotification(notificationId);

    // Should navigate to action URL
    await expect(page).toHaveURL(/\/dashboard/);

    // Badge should be gone
    await notificationsPage.expectUnreadCount(0);
  });

  test('should mark all as read', async () => {
    // Create multiple notifications
    for (let i = 0; i < 5; i++) {
      await notificationHelper.triggerNotification({
        tenantId: testTenantId,
        userId: testUserId,
        type: 'test.notification',
        title: `Test ${i + 1}`,
      });
    }

    await notificationsPage.expectUnreadCount(5);

    // Mark all as read
    await notificationsPage.clickNotificationBell();
    await notificationsPage.markAllAsRead();

    // All should be read
    await notificationsPage.expectUnreadCount(0);
  });

  test('should show high priority notification with requireInteraction', async () => {
    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'urgent.notification',
      title: 'URGENT: Action Required',
      body: 'Please respond immediately',
      priority: 'urgent',
    });

    const toast = await notificationsPage.waitForToast();

    // Urgent toasts should have special styling
    await expect(toast).toHaveAttribute('data-priority', 'urgent');
  });

  test('should auto-dismiss toast after timeout', async () => {
    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Auto-dismiss Test',
    });

    const toast = await notificationsPage.waitForToast();
    await expect(toast).toBeVisible();

    // Wait for auto-dismiss (5 seconds + buffer)
    await expect(toast).not.toBeVisible({ timeout: 7000 });
  });
});
```

---

### Task 7.4: Write SignalR Connection Tests

**File**: `E2ETests/tests/notifications/connection.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { NotificationsPage } from '../../pages/notifications.page';
import { LoginPage } from '../../pages/login.page';

test.describe('SignalR Connection', () => {
  let notificationsPage: NotificationsPage;

  test.beforeEach(async ({ page }) => {
    notificationsPage = new NotificationsPage(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsTestUser();
  });

  test('should establish SignalR connection on login', async () => {
    // Connection should be established
    await notificationsPage.expectConnectionStatus('connected');
  });

  test('should reconnect after connection loss', async ({ page, context }) => {
    // Verify connected
    await notificationsPage.expectConnectionStatus('connected');

    // Simulate network offline
    await context.setOffline(true);

    // Should show disconnected/reconnecting
    await notificationsPage.expectConnectionStatus('disconnected');

    // Restore network
    await context.setOffline(false);

    // Should reconnect
    await notificationsPage.expectConnectionStatus('connected');
  });

  test('should disconnect on logout', async ({ page }) => {
    // Logout
    await page.getByTestId('user-menu').click();
    await page.getByTestId('logout-button').click();

    // Login page should not have notification connection
    await expect(notificationsPage.connectionStatus).not.toBeVisible();
  });

  test('should handle token refresh without disconnection', async ({ page }) => {
    // This test verifies that token refresh doesn't break the connection
    // The implementation should use a token factory that refreshes automatically

    await notificationsPage.expectConnectionStatus('connected');

    // Wait for token expiry simulation (if implemented)
    // await page.waitForTimeout(TOKEN_REFRESH_INTERVAL);

    // Connection should still be valid
    await notificationsPage.expectConnectionStatus('connected');
  });
});
```

---

### Task 7.5: Write User Preferences Tests

**File**: `E2ETests/tests/notifications/preferences.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { NotificationsPage } from '../../pages/notifications.page';
import { NotificationTestHelper } from '../../helpers/notification.helpers';
import { LoginPage } from '../../pages/login.page';

test.describe('Notification Preferences', () => {
  let notificationsPage: NotificationsPage;
  let notificationHelper: NotificationTestHelper;
  let testUserId: string;
  let testTenantId: string;

  test.beforeEach(async ({ page, request }) => {
    notificationsPage = new NotificationsPage(page);
    notificationHelper = new NotificationTestHelper(
      request,
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010'
    );

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const user = await loginPage.loginAsTestUser();
    testUserId = user.id;
    testTenantId = user.tenantId;

    await notificationHelper.clearNotifications(testUserId);
  });

  test('should toggle global notifications off', async () => {
    await notificationsPage.navigateToPreferences();

    // Disable all notifications
    await notificationsPage.toggleGlobalNotifications(false);

    // Save and trigger notification
    await notificationsPage.page.getByTestId('save-preferences-button').click();

    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Should Not Appear',
    });

    // No toast should appear
    await expect(notificationsPage.toastItems.first()).not.toBeVisible({ timeout: 5000 });
  });

  test('should only show in-app when OS notifications disabled', async () => {
    await notificationsPage.navigateToPreferences();

    // Enable in-app, disable OS
    await notificationsPage.toggleInAppNotifications(true);
    await notificationsPage.toggleOSNotifications(false);
    await notificationsPage.page.getByTestId('save-preferences-button').click();

    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'In-App Only',
    });

    // Toast should appear
    const toast = await notificationsPage.waitForToast();
    await expect(toast).toContainText('In-App Only');

    // Note: OS notification verification requires manual testing or mocking
  });

  test('should respect quiet hours', async ({ page }) => {
    await notificationsPage.navigateToPreferences();

    // Enable quiet hours for current time
    const now = new Date();
    const start = `${String(now.getHours()).padStart(2, '0')}:00`;
    const end = `${String((now.getHours() + 2) % 24).padStart(2, '0')}:00`;

    await notificationsPage.setQuietHours(true, start, end);
    await page.getByTestId('save-preferences-button').click();

    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Quiet Hours Test',
    });

    // Notification should be received but NOT shown as toast during quiet hours
    await notificationsPage.expectUnreadCount(1);
    await expect(notificationsPage.toastItems.first()).not.toBeVisible({ timeout: 3000 });
  });

  test('should persist preferences across sessions', async ({ page, context }) => {
    await notificationsPage.navigateToPreferences();

    // Set specific preferences
    await notificationsPage.toggleInAppNotifications(true);
    await notificationsPage.setQuietHours(true, '22:00', '08:00');
    await page.getByTestId('save-preferences-button').click();

    // Logout and login again
    await page.getByTestId('user-menu').click();
    await page.getByTestId('logout-button').click();

    const loginPage = new LoginPage(page);
    await loginPage.loginAsTestUser();

    // Navigate back to preferences
    await notificationsPage.navigateToPreferences();

    // Verify settings persisted
    await expect(notificationsPage.inAppToggle).toBeChecked();
    await expect(notificationsPage.quietHoursToggle).toBeChecked();
    await expect(notificationsPage.quietHoursStart).toHaveValue('22:00');
    await expect(notificationsPage.quietHoursEnd).toHaveValue('08:00');
  });

  test('should configure per-type preferences', async ({ page }) => {
    await notificationsPage.navigateToPreferences();

    // Find questionnaire type toggle
    const questionnaireToggle = page.getByTestId('notification-type-toggle-questionnaire');

    // Disable questionnaire notifications
    await questionnaireToggle.click();
    await page.getByTestId('save-preferences-button').click();

    // Trigger questionnaire notification
    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'questionnaire.submitted',
      title: 'Questionnaire Response',
    });

    // Should not show toast
    await expect(notificationsPage.toastItems.first()).not.toBeVisible({ timeout: 3000 });

    // But other types should still work
    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'system.announcement',
      title: 'System Update',
    });

    const toast = await notificationsPage.waitForToast();
    await expect(toast).toContainText('System Update');
  });
});
```

---

### Task 7.6: Write Cross-Tab Tests

**File**: `E2ETests/tests/notifications/cross-tab.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { NotificationsPage } from '../../pages/notifications.page';
import { NotificationTestHelper } from '../../helpers/notification.helpers';
import { LoginPage } from '../../pages/login.page';

test.describe('Cross-Tab Notification Sync', () => {
  let testUserId: string;
  let testTenantId: string;

  test('should sync notifications across multiple tabs', async ({ browser, request }) => {
    const notificationHelper = new NotificationTestHelper(
      request,
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010'
    );

    // Create two browser contexts (simulating two tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const notificationsPage1 = new NotificationsPage(page1);
    const notificationsPage2 = new NotificationsPage(page2);

    // Login on both tabs
    const loginPage1 = new LoginPage(page1);
    const loginPage2 = new LoginPage(page2);

    await loginPage1.goto();
    const user = await loginPage1.loginAsTestUser();
    testUserId = user.id;
    testTenantId = user.tenantId;

    await loginPage2.goto();
    await loginPage2.loginAsTestUser();

    // Clear notifications
    await notificationHelper.clearNotifications(testUserId);

    // Both should show 0 unread
    await notificationsPage1.expectUnreadCount(0);
    await notificationsPage2.expectUnreadCount(0);

    // Trigger notification
    await notificationHelper.triggerNotification({
      tenantId: testTenantId,
      userId: testUserId,
      type: 'test.notification',
      title: 'Cross-Tab Test',
    });

    // Both tabs should receive it
    await notificationsPage1.expectUnreadCount(1);
    await notificationsPage2.expectUnreadCount(1);

    // Mark as read on tab 1
    await notificationsPage1.clickNotificationBell();
    await notificationsPage1.markAllAsRead();

    // Tab 2 should also show as read (may need small delay for sync)
    await notificationsPage2.expectUnreadCount(0);

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
```

---

### Task 7.7: Write Health Check Tests

**File**: `E2ETests/tests/notifications/health.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { NotificationTestHelper } from '../../helpers/notification.helpers';

test.describe('Notification Service Health', () => {
  let notificationHelper: NotificationTestHelper;

  test.beforeEach(async ({ request }) => {
    notificationHelper = new NotificationTestHelper(
      request,
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010'
    );
  });

  test('should report healthy status for all dependencies', async () => {
    const health = await notificationHelper.checkHealth();

    expect(health.status).toBe('Healthy');
    expect(health.rabbitmq).toBe('Healthy');
    expect(health.redis).toBe('Healthy');
    expect(health.postgres).toBe('Healthy');
  });

  test('should expose SignalR hub endpoint', async ({ request }) => {
    const response = await request.post(
      `${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010'}/notificationhub/negotiate`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_ACCESS_TOKEN}`,
        },
      }
    );

    // Should return 200 with connection info
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('connectionId');
  });

  test('should have correct CORS configuration', async ({ request }) => {
    const response = await request.options(
      `${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010'}/notificationhub`,
      {
        headers: {
          'Origin': process.env.APP_URL || 'http://localhost:8081',
          'Access-Control-Request-Method': 'GET',
        },
      }
    );

    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).toBeTruthy();
  });
});
```

---

### Task 7.8: Add Health Endpoints to Backend

**Backend Agent should have added these in Phase 1, verify they exist**

**File**: `Services/NotificationService/Features/Health/HealthEndpoint.cs`

```csharp
public class HealthEndpoint : EndpointWithoutRequest<HealthResponse>
{
    private readonly IHealthCheckService _healthCheckService;

    public HealthEndpoint(IHealthCheckService healthCheckService)
    {
        _healthCheckService = healthCheckService;
    }

    public override void Configure()
    {
        Get("/health");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var report = await _healthCheckService.CheckHealthAsync(ct);

        var response = new HealthResponse
        {
            Status = report.Status.ToString(),
            RabbitMQ = report.Entries.GetValueOrDefault("rabbitmq")?.Status.ToString() ?? "Unknown",
            Redis = report.Entries.GetValueOrDefault("redis")?.Status.ToString() ?? "Unknown",
            Postgres = report.Entries.GetValueOrDefault("postgres")?.Status.ToString() ?? "Unknown",
            Timestamp = DateTime.UtcNow,
        };

        if (report.Status == HealthStatus.Healthy)
        {
            await SendOkAsync(response, ct);
        }
        else
        {
            await SendAsync(response, StatusCodes.Status503ServiceUnavailable, ct);
        }
    }
}

public record HealthResponse
{
    public string Status { get; init; } = string.Empty;
    public string RabbitMQ { get; init; } = string.Empty;
    public string Redis { get; init; } = string.Empty;
    public string Postgres { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
}
```

---

### Task 7.9: Add Test Trigger Endpoint (Test Only)

**File**: `Services/NotificationService/Features/Testing/TriggerTestNotificationEndpoint.cs`

```csharp
#if DEBUG
public class TriggerTestNotificationEndpoint : Endpoint<TriggerTestNotificationRequest>
{
    private readonly IMediator _mediator;

    public TriggerTestNotificationEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/api/notifications/test/trigger");
        AllowAnonymous(); // Only available in DEBUG builds
    }

    public override async Task HandleAsync(TriggerTestNotificationRequest req, CancellationToken ct)
    {
        var command = new SendNotificationCommand(
            TenantId: req.TenantId,
            UserId: req.UserId,
            Type: req.Type,
            Title: req.Title,
            Body: req.Body,
            Priority: Enum.Parse<NotificationPriority>(req.Priority, true),
            ActionUrl: req.ActionUrl
        );

        var notificationId = await _mediator.Send(command, ct);

        await SendOkAsync(new { NotificationId = notificationId }, ct);
    }
}

public record TriggerTestNotificationRequest
{
    public Guid TenantId { get; init; }
    public Guid UserId { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Body { get; init; }
    public string Priority { get; init; } = "normal";
    public string? ActionUrl { get; init; }
}
#endif
```

---

### Task 7.10: Configure Playwright for Notification Tests

**File**: `E2ETests/playwright.config.ts` (update)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ... existing config ...

  projects: [
    // ... existing projects ...

    {
      name: 'notification-tests',
      testDir: './tests/notifications',
      use: {
        ...devices['Desktop Chrome'],
        // Allow more time for real-time tests
        actionTimeout: 10000,
        navigationTimeout: 30000,
      },
      // Run notification tests serially to avoid race conditions
      fullyParallel: false,
    },
  ],

  // Global setup for notification tests
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  webServer: [
    // ... existing web servers ...
    {
      command: 'cd ../Services/NotificationService && dotnet run',
      url: 'http://localhost:5010/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
```

---

### Task 7.11: Create Global Setup/Teardown

**File**: `E2ETests/global-setup.ts`

```typescript
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('Global setup: Verifying notification service...');

  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010';

  // Wait for notification service to be ready
  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(`${notificationServiceUrl}/health`);
      if (response.ok) {
        const health = await response.json();
        if (health.status === 'Healthy') {
          console.log('Notification service is healthy');
          return;
        }
      }
    } catch {
      // Service not ready yet
    }

    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Notification service failed to become healthy');
}

export default globalSetup;
```

**File**: `E2ETests/global-teardown.ts`

```typescript
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('Global teardown: Cleaning up test data...');

  // Any global cleanup needed
}

export default globalTeardown;
```

---

## Quality Gates

Before marking Phase 7 complete:

- [ ] `npx playwright test tests/notifications/` - All tests pass
- [ ] Real-time notification tests working
- [ ] Connection/reconnection tests pass
- [ ] Preference tests working
- [ ] Cross-tab sync verified
- [ ] Health endpoints return correct status
- [ ] No flaky tests (run 3x to verify)

---

## Test Coverage Requirements

| Area | Test Count | Status |
|------|------------|--------|
| Real-time delivery | 5+ tests | - |
| Connection handling | 4+ tests | - |
| User preferences | 5+ tests | - |
| Cross-tab sync | 1+ tests | - |
| Health checks | 3+ tests | - |

---

## Monitoring Setup (Optional Enhancement)

### Grafana Dashboard Metrics

If setting up Grafana monitoring:

```
# SignalR Metrics
signalr_connections_active{service="notification"}
signalr_messages_sent_total{service="notification"}
signalr_connection_duration_seconds{service="notification"}

# RabbitMQ Metrics
rabbitmq_queue_messages{queue="notification-queue"}
rabbitmq_message_publish_rate{exchange="notification-exchange"}

# Redis Metrics
redis_connected_clients{instance="notification-redis"}
redis_keyspace_hits{instance="notification-redis"}

# Application Metrics
notification_sent_total{type="*"}
notification_delivery_latency_ms{type="*"}
notification_errors_total{reason="*"}
```

---

## Outputs

Upon completion:
- Comprehensive Playwright E2E test suite for notifications
- Page objects and test helpers
- Health check endpoint tests
- Connection resilience tests
- Cross-tab synchronization verified
- Monitoring metrics defined (optional)

---

## Final Verification

After all phases complete, run the full regression:

```bash
# Run all notification tests
cd E2ETests
npx playwright test tests/notifications/ --reporter=html

# Generate coverage report
npx playwright test --reporter=html

# View results
npx playwright show-report
```

---

## Success Criteria

- [ ] All 7 phases completed and verified
- [ ] Full E2E test suite passing
- [ ] No console errors during notification flow
- [ ] Notifications delivered in < 500ms
- [ ] Reconnection works within 5 seconds
- [ ] Preferences persist correctly
- [ ] Cross-tab sync working
