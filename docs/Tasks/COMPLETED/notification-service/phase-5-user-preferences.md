# Phase 5: User Preferences

> **Agent**: `frontend-dev` + `backend-dev`
> **Status**: TODO
> **Priority**: Medium
> **Depends On**: Phase 4
> **Estimated Effort**: 2-3 days

---

## Objective

Implement user notification preferences including:
- Global notification toggle (enable/disable all)
- Per-notification-type display preferences (in_app, os_notification, both, none)
- Quiet hours configuration

---

## Prerequisites

- Phase 4 completed (Integration working)
- Understanding of [architecture.md](./architecture.md)

---

## Tasks

### Task 5.1: Backend - Add Preferences Endpoints

**Backend Agent**

**File**: `Notification.Web/Endpoints/Preferences/GetPreferencesEndpoint.cs`

```csharp
using FastEndpoints;
using MediatR;
using Notification.UseCases.Preferences.Queries.GetPreferences;

namespace Notification.Web.Endpoints.Preferences;

public class GetPreferencesEndpoint : EndpointWithoutRequest<PreferencesResponse>
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public GetPreferencesEndpoint(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    public override void Configure()
    {
        Get("/api/notifications/preferences");
        Description(d => d.WithTags("Preferences"));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPreferencesQuery(_tenantService.UserId!.Value), ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(result.Value, ct);
        }
        else
        {
            await SendNotFoundAsync(ct);
        }
    }
}

public record PreferencesResponse(
    bool NotificationsEnabled,
    string QuestionnaireSubmittedDisplay,
    string TemplateUpdatedDisplay,
    string UserInvitedDisplay,
    string MenuUpdatedDisplay,
    string PaymentDueDisplay,
    bool QuietHoursEnabled,
    string? QuietHoursStart,
    string? QuietHoursEnd,
    string? QuietHoursTimezone
);
```

**File**: `Notification.Web/Endpoints/Preferences/UpdatePreferencesEndpoint.cs`

```csharp
using FastEndpoints;
using MediatR;
using Notification.UseCases.Preferences.Commands.UpdatePreferences;

namespace Notification.Web.Endpoints.Preferences;

public class UpdatePreferencesEndpoint : Endpoint<UpdatePreferencesRequest, PreferencesResponse>
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public UpdatePreferencesEndpoint(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    public override void Configure()
    {
        Put("/api/notifications/preferences");
        Description(d => d.WithTags("Preferences"));
    }

    public override async Task HandleAsync(UpdatePreferencesRequest req, CancellationToken ct)
    {
        var command = new UpdatePreferencesCommand(
            UserId: _tenantService.UserId!.Value,
            TenantId: _tenantService.TenantId!.Value,
            NotificationsEnabled: req.NotificationsEnabled,
            QuestionnaireSubmittedDisplay: req.QuestionnaireSubmittedDisplay,
            TemplateUpdatedDisplay: req.TemplateUpdatedDisplay,
            UserInvitedDisplay: req.UserInvitedDisplay,
            MenuUpdatedDisplay: req.MenuUpdatedDisplay,
            PaymentDueDisplay: req.PaymentDueDisplay,
            QuietHoursEnabled: req.QuietHoursEnabled,
            QuietHoursStart: req.QuietHoursStart,
            QuietHoursEnd: req.QuietHoursEnd,
            QuietHoursTimezone: req.QuietHoursTimezone
        );

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(result.Value, ct);
        }
        else
        {
            await SendErrorsAsync(400, ct);
        }
    }
}

public record UpdatePreferencesRequest(
    bool? NotificationsEnabled,
    string? QuestionnaireSubmittedDisplay,
    string? TemplateUpdatedDisplay,
    string? UserInvitedDisplay,
    string? MenuUpdatedDisplay,
    string? PaymentDueDisplay,
    bool? QuietHoursEnabled,
    string? QuietHoursStart,
    string? QuietHoursEnd,
    string? QuietHoursTimezone
);
```

---

### Task 5.2: Backend - Implement UseCases

**Backend Agent**

**File**: `Notification.UseCases/Preferences/Commands/UpdatePreferences/UpdatePreferencesHandler.cs`

```csharp
using Ardalis.Result;
using MediatR;
using Notification.Core.Interfaces;
using Notification.Core.PreferenceAggregate;

namespace Notification.UseCases.Preferences.Commands.UpdatePreferences;

public class UpdatePreferencesHandler : IRequestHandler<UpdatePreferencesCommand, Result<PreferencesDto>>
{
    private readonly IPreferenceRepository _repository;

    public UpdatePreferencesHandler(IPreferenceRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PreferencesDto>> Handle(UpdatePreferencesCommand request, CancellationToken ct)
    {
        var preferences = await _repository.GetByUserIdAsync(request.UserId, ct);

        if (preferences is null)
        {
            preferences = NotificationPreference.CreateDefault(request.TenantId, request.UserId);
            await _repository.AddAsync(preferences, ct);
        }

        // Update global toggle
        if (request.NotificationsEnabled.HasValue)
        {
            if (request.NotificationsEnabled.Value)
                preferences.EnableNotifications();
            else
                preferences.DisableNotifications();
        }

        // Update display preferences
        if (request.QuestionnaireSubmittedDisplay is not null)
            preferences.UpdateDisplayPreference("questionnaire.submitted",
                ParseDisplayPreference(request.QuestionnaireSubmittedDisplay));

        if (request.TemplateUpdatedDisplay is not null)
            preferences.UpdateDisplayPreference("template.updated",
                ParseDisplayPreference(request.TemplateUpdatedDisplay));

        // ... other preferences ...

        // Update quiet hours
        if (request.QuietHoursEnabled.HasValue)
            preferences.SetQuietHours(
                request.QuietHoursEnabled.Value,
                request.QuietHoursStart,
                request.QuietHoursEnd,
                request.QuietHoursTimezone
            );

        await _repository.UpdateAsync(preferences, ct);

        return Result.Success(MapToDto(preferences));
    }

    private static DisplayPreference ParseDisplayPreference(string value) =>
        Enum.TryParse<DisplayPreference>(value, true, out var result)
            ? result
            : DisplayPreference.InApp;

    private static PreferencesDto MapToDto(NotificationPreference p) => new(
        p.NotificationsEnabled,
        p.QuestionnaireSubmittedDisplay.ToString().ToLower(),
        p.TemplateUpdatedDisplay.ToString().ToLower(),
        p.UserInvitedDisplay.ToString().ToLower(),
        p.MenuUpdatedDisplay.ToString().ToLower(),
        p.PaymentDueDisplay.ToString().ToLower(),
        p.QuietHoursEnabled,
        p.QuietHoursStart?.ToString("HH:mm"),
        p.QuietHoursEnd?.ToString("HH:mm"),
        p.QuietHoursTimezone
    );
}
```

---

### Task 5.3: Backend - Add Unit Tests

**Backend Agent**

**File**: `Notification.UnitTests/UseCases/UpdatePreferencesHandlerTests.cs`

```csharp
public class UpdatePreferencesHandlerTests
{
    [Fact]
    public async Task Handle_WhenDisablingNotifications_ShouldSetDisabledTimestamp()
    {
        // Arrange
        var mockRepo = new Mock<IPreferenceRepository>();
        var existingPrefs = NotificationPreference.CreateDefault(Guid.NewGuid(), Guid.NewGuid());

        mockRepo.Setup(x => x.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPrefs);

        var handler = new UpdatePreferencesHandler(mockRepo.Object);
        var command = new UpdatePreferencesCommand(
            UserId: existingPrefs.UserId,
            TenantId: existingPrefs.TenantId,
            NotificationsEnabled: false
            // other fields null
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.NotificationsEnabled.Should().BeFalse();
        mockRepo.Verify(x => x.UpdateAsync(
            It.Is<NotificationPreference>(p => !p.NotificationsEnabled),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenUpdatingDisplayPreference_ShouldPersistChange()
    {
        // Test display preference updates
    }
}
```

---

### Task 5.4: Frontend - Create API Hooks

**Frontend Agent**

**File**: `BaseClient/src/lib/api/hooks/useNotificationPreferences.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { NotificationPreferences } from '@dloizides/notification-client';

const QUERY_KEY = ['notification-preferences'];

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<NotificationPreferences> => {
      const response = await apiClient.get('/api/notifications/preferences');
      return response.data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const response = await apiClient.put('/api/notifications/preferences', preferences);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });
}
```

---

### Task 5.5: Frontend - Create Preferences Screen

**Frontend Agent**

**File**: `BaseClient/src/screens/NotificationPreferencesScreen.tsx`

```typescript
import React from 'react';
import { View, ScrollView, Switch, Text, StyleSheet } from 'react-native';
import { useNotificationPreferencesQuery, useUpdateNotificationPreferences } from '../lib/api/hooks/useNotificationPreferences';
import { Picker } from '@react-native-picker/picker';
import { osNotificationService } from '@dloizides/notification-client/workers';

const DISPLAY_OPTIONS = [
  { label: 'In-App Only', value: 'in_app' },
  { label: 'OS Notification Only', value: 'os_notification' },
  { label: 'Both', value: 'both' },
  { label: 'None', value: 'none' },
];

export function NotificationPreferencesScreen() {
  const { data: preferences, isLoading } = useNotificationPreferencesQuery();
  const updateMutation = useUpdateNotificationPreferences();
  const [osPermission, setOsPermission] = React.useState<NotificationPermission>('default');

  React.useEffect(() => {
    setOsPermission(osNotificationService.getPermissionStatus());
  }, []);

  const handleToggleAll = (enabled: boolean) => {
    updateMutation.mutate({ notificationsEnabled: enabled });
  };

  const handleDisplayChange = (type: string, value: string) => {
    updateMutation.mutate({ [type]: value });
  };

  const handleRequestOsPermission = async () => {
    const permission = await osNotificationService.requestPermission();
    setOsPermission(permission);
  };

  if (isLoading || !preferences) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Global Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text>Enable All Notifications</Text>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={handleToggleAll}
            testID="notifications-enabled-toggle"
          />
        </View>
      </View>

      {/* OS Permission */}
      {osPermission !== 'granted' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desktop Notifications</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestOsPermission}
            testID="request-os-permission-button"
          >
            <Text style={styles.buttonText}>Enable Desktop Notifications</Text>
          </TouchableOpacity>
          {osPermission === 'denied' && (
            <Text style={styles.warning}>
              Desktop notifications are blocked. Please enable them in your browser settings.
            </Text>
          )}
        </View>
      )}

      {/* Per-Type Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Types</Text>

        <PreferenceRow
          label="Questionnaire Submissions"
          value={preferences.questionnaireSubmittedDisplay}
          onChange={(v) => handleDisplayChange('questionnaireSubmittedDisplay', v)}
          testID="questionnaire-display-preference"
        />

        <PreferenceRow
          label="Template Updates"
          value={preferences.templateUpdatedDisplay}
          onChange={(v) => handleDisplayChange('templateUpdatedDisplay', v)}
          testID="template-display-preference"
        />

        <PreferenceRow
          label="User Invitations"
          value={preferences.userInvitedDisplay}
          onChange={(v) => handleDisplayChange('userInvitedDisplay', v)}
          testID="user-invited-display-preference"
        />

        <PreferenceRow
          label="Menu Updates"
          value={preferences.menuUpdatedDisplay}
          onChange={(v) => handleDisplayChange('menuUpdatedDisplay', v)}
          testID="menu-display-preference"
        />

        <PreferenceRow
          label="Payment Reminders"
          value={preferences.paymentDueDisplay}
          onChange={(v) => handleDisplayChange('paymentDueDisplay', v)}
          testID="payment-display-preference"
        />
      </View>

      {/* Quiet Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quiet Hours</Text>
        <View style={styles.row}>
          <Text>Enable Quiet Hours</Text>
          <Switch
            value={preferences.quietHoursEnabled}
            onValueChange={(v) => updateMutation.mutate({ quietHoursEnabled: v })}
            testID="quiet-hours-toggle"
          />
        </View>

        {preferences.quietHoursEnabled && (
          <>
            <TimePicker
              label="Start Time"
              value={preferences.quietHoursStart}
              onChange={(v) => updateMutation.mutate({ quietHoursStart: v })}
              testID="quiet-hours-start"
            />
            <TimePicker
              label="End Time"
              value={preferences.quietHoursEnd}
              onChange={(v) => updateMutation.mutate({ quietHoursEnd: v })}
              testID="quiet-hours-end"
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

interface PreferenceRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testID: string;
}

function PreferenceRow({ label, value, onChange, testID }: PreferenceRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
        testID={testID}
      >
        {DISPLAY_OPTIONS.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: { fontSize: 16 },
  picker: { width: 150 },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '600' },
  warning: { color: '#FF3B30', marginTop: 8, fontSize: 14 },
});
```

---

### Task 5.6: Frontend - Add Navigation

**Frontend Agent**

Add route to settings/preferences:

```typescript
// In your navigation config
<Stack.Screen
  name="NotificationPreferences"
  component={NotificationPreferencesScreen}
  options={{ title: 'Notification Settings' }}
/>

// In Settings screen, add link:
<SettingsItem
  label="Notifications"
  onPress={() => navigation.navigate('NotificationPreferences')}
  testID="settings-notifications"
/>
```

---

### Task 5.7: Frontend - Add Unit Tests

**Frontend Agent**

**File**: `BaseClient/src/screens/__tests__/NotificationPreferencesScreen.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationPreferencesScreen } from '../NotificationPreferencesScreen';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock the API hooks
jest.mock('../../lib/api/hooks/useNotificationPreferences', () => ({
  useNotificationPreferencesQuery: () => ({
    data: {
      notificationsEnabled: true,
      questionnaireSubmittedDisplay: 'both',
      templateUpdatedDisplay: 'in_app',
      userInvitedDisplay: 'both',
      menuUpdatedDisplay: 'in_app',
      paymentDueDisplay: 'both',
      quietHoursEnabled: false,
    },
    isLoading: false,
  }),
  useUpdateNotificationPreferences: () => ({
    mutate: jest.fn(),
  }),
}));

describe('NotificationPreferencesScreen', () => {
  const queryClient = new QueryClient();

  it('renders all preference options', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationPreferencesScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('notifications-enabled-toggle')).toBeTruthy();
    expect(screen.getByTestId('questionnaire-display-preference')).toBeTruthy();
    expect(screen.getByTestId('template-display-preference')).toBeTruthy();
  });

  it('calls mutate when toggling notifications', async () => {
    const mockMutate = jest.fn();
    jest.mock('../../lib/api/hooks/useNotificationPreferences', () => ({
      ...jest.requireActual('../../lib/api/hooks/useNotificationPreferences'),
      useUpdateNotificationPreferences: () => ({ mutate: mockMutate }),
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationPreferencesScreen />
      </QueryClientProvider>
    );

    fireEvent(screen.getByTestId('notifications-enabled-toggle'), 'valueChange', false);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ notificationsEnabled: false });
    });
  });
});
```

---

## Quality Gates

Before marking Phase 5 complete:

### Backend
- [ ] `dotnet build` - No errors
- [ ] `dotnet test` - All tests pass
- [ ] Preferences API returns correct data
- [ ] Preferences persist correctly to database

### Frontend
- [ ] `npm run lint:fix` - No errors
- [ ] `npm run test:coverage` - All tests pass
- [ ] `npx expo export --platform web` - Build succeeds
- [ ] Preferences screen renders correctly
- [ ] Changes persist after refresh

### Integration
- [ ] Toggle notifications → notifications stop/start delivering
- [ ] Change display preference → notification appears correctly
- [ ] Quiet hours work as expected

---

## Outputs

Upon completion:
- Notification preferences API endpoints
- Preferences screen in settings
- Global toggle functionality
- Per-type display preferences
- Quiet hours configuration

---

## Next Phase

After completing Phase 5, proceed to:
- **[Phase 6: Service Worker](./phase-6-service-worker.md)** - OS notifications
- **[Phase 7: E2E & Monitoring](./phase-7-e2e-monitoring.md)** - Tests
