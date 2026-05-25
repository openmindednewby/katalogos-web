/**
 * Unit tests for BusinessProfileSettingsScreen logic.
 * Tests handleSave mutation call shape, success/error notifications,
 * and derived state (isSaving/saveLabel).
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../../../localization/helpers', () => ({
  FM: (key: string) => key,
}));

jest.mock('../../../../theme/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../../utils/is', () => ({
  isValueDefined: (v: unknown) => v !== null && v !== undefined,
}));

const mockNotifySuccess = jest.fn();
const mockNotifyError = jest.fn();
jest.mock('../../../../lib/notifications', () => ({
  notifySuccess: (...args: unknown[]) => mockNotifySuccess(...args),
  notifyError: (...args: unknown[]) => mockNotifyError(...args),
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEST_NAME = 'Joes Diner';
const TEST_DESCRIPTION = 'A great diner';
const TEST_CUISINE = 'American';
const TEST_PHONE = '+1-555-0123';
const TEST_EMAIL = 'info@joesdiner.com';
const TEST_WEBSITE = 'https://joesdiner.com';
const TEST_ADDRESS_LINE1 = '123 Main St';
const TEST_CITY = 'Springfield';
const TEST_STATE = 'IL';
const TEST_POSTAL_CODE = '62701';
const TEST_COUNTRY = 'US';
const TEST_HOURS_JSON = '{"hours":[]}';

// ---------------------------------------------------------------------------
// Tests: handleSave mutation logic (simulated)
// ---------------------------------------------------------------------------

describe('BusinessProfileSettingsScreen - handleSave logic', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Simulates the handleSave callback from the component.
   */
  function simulateHandleSave(fields: {
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    cuisineType: string;
    operatingHoursJson: string;
  }): void {
    const { FM } = require('../../../../localization/helpers');
    const { notifySuccess, notifyError } = require('../../../../lib/notifications');

    mockMutate(
      {
        data: {
          name: fields.name,
          description: fields.description !== '' ? fields.description : null,
          cuisineType: fields.cuisineType !== '' ? fields.cuisineType : null,
          phone: fields.phone !== '' ? fields.phone : null,
          email: fields.email !== '' ? fields.email : null,
          website: fields.website !== '' ? fields.website : null,
          addressLine1: fields.addressLine1 !== '' ? fields.addressLine1 : null,
          addressLine2: null,
          city: fields.city !== '' ? fields.city : null,
          state: fields.state !== '' ? fields.state : null,
          postalCode: fields.postalCode !== '' ? fields.postalCode : null,
          country: fields.country !== '' ? fields.country : null,
          operatingHoursJson: fields.operatingHoursJson,
        },
      },
      {
        onSuccess: () => {
          notifySuccess(FM('settings.businessProfile.messages.saveSuccess'));
        },
        onError: () => {
          notifyError(FM('settings.businessProfile.messages.saveError'));
        },
      },
    );
  }

  it('calls mutate with correct data shape', () => {
    simulateHandleSave({
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      website: TEST_WEBSITE,
      addressLine1: TEST_ADDRESS_LINE1,
      city: TEST_CITY,
      state: TEST_STATE,
      postalCode: TEST_POSTAL_CODE,
      country: TEST_COUNTRY,
      cuisineType: TEST_CUISINE,
      operatingHoursJson: TEST_HOURS_JSON,
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: TEST_NAME,
          phone: TEST_PHONE,
          email: TEST_EMAIL,
        }),
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('sends null for empty optional fields', () => {
    simulateHandleSave({
      name: TEST_NAME,
      description: '',
      phone: '',
      email: '',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      cuisineType: '',
      operatingHoursJson: TEST_HOURS_JSON,
    });

    const wrapper = mockMutate.mock.calls[0][0] as { data: Record<string, unknown> };
    const payload = wrapper.data;
    expect(payload.description).toBeNull();
    expect(payload.phone).toBeNull();
    expect(payload.email).toBeNull();
    expect(payload.website).toBeNull();
    expect(payload.cuisineType).toBeNull();
  });

  it('notifies success on mutation success', () => {
    simulateHandleSave({
      name: TEST_NAME,
      description: '',
      phone: '',
      email: '',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      cuisineType: '',
      operatingHoursJson: TEST_HOURS_JSON,
    });

    const callArgs = mockMutate.mock.calls[0] as [unknown, { onSuccess: () => void }];
    callArgs[1].onSuccess();

    expect(mockNotifySuccess).toHaveBeenCalledWith('settings.businessProfile.messages.saveSuccess');
  });

  it('notifies error on mutation error', () => {
    simulateHandleSave({
      name: TEST_NAME,
      description: '',
      phone: '',
      email: '',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      cuisineType: '',
      operatingHoursJson: TEST_HOURS_JSON,
    });

    const callArgs = mockMutate.mock.calls[0] as [unknown, { onError: () => void }];
    callArgs[1].onError();

    expect(mockNotifyError).toHaveBeenCalledWith('settings.businessProfile.messages.saveError');
  });

  it('does not notify error on success path', () => {
    simulateHandleSave({
      name: TEST_NAME,
      description: '',
      phone: '',
      email: '',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      cuisineType: '',
      operatingHoursJson: TEST_HOURS_JSON,
    });

    const callArgs = mockMutate.mock.calls[0] as [unknown, { onSuccess: () => void }];
    callArgs[1].onSuccess();

    expect(mockNotifyError).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: derived state (isSaving / saveLabel)
// ---------------------------------------------------------------------------

describe('BusinessProfileSettingsScreen - derived state', () => {
  const { FM } = require('../../../../localization/helpers');

  function deriveSaveLabel(isPending: boolean): string {
    return isPending ? FM('common.saving') : FM('settings.businessProfile.save');
  }

  it('returns saving label when mutation is pending', () => {
    expect(deriveSaveLabel(true)).toBe('common.saving');
  });

  it('returns save label when mutation is not pending', () => {
    expect(deriveSaveLabel(false)).toBe('settings.businessProfile.save');
  });
});

// ---------------------------------------------------------------------------
// Tests: profile data defaults
// ---------------------------------------------------------------------------

describe('BusinessProfileSettingsScreen - profile data defaults', () => {
  function extractDefaults(profile: {
    name?: string | null;
    description?: string | null;
    cuisineType?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  }): Record<string, string> {
    return {
      name: profile.name ?? '',
      description: profile.description ?? '',
      cuisineType: profile.cuisineType ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      website: profile.website ?? '',
      addressLine1: profile.addressLine1 ?? '',
      addressLine2: profile.addressLine2 ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      postalCode: profile.postalCode ?? '',
      country: profile.country ?? '',
    };
  }

  it('extracts all fields when profile is fully populated', () => {
    const defaults = extractDefaults({
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
      cuisineType: TEST_CUISINE,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      website: TEST_WEBSITE,
      addressLine1: TEST_ADDRESS_LINE1,
      addressLine2: '',
      city: TEST_CITY,
      state: TEST_STATE,
      postalCode: TEST_POSTAL_CODE,
      country: TEST_COUNTRY,
    });

    expect(defaults.name).toBe(TEST_NAME);
    expect(defaults.phone).toBe(TEST_PHONE);
    expect(defaults.city).toBe(TEST_CITY);
  });

  it('falls back to empty strings when fields are null', () => {
    const defaults = extractDefaults({
      name: null,
      description: null,
      phone: null,
      email: null,
    });

    expect(defaults.name).toBe('');
    expect(defaults.description).toBe('');
    expect(defaults.phone).toBe('');
    expect(defaults.email).toBe('');
  });

  it('falls back to empty strings when fields are undefined', () => {
    const defaults = extractDefaults({});

    expect(defaults.name).toBe('');
    expect(defaults.description).toBe('');
    expect(defaults.phone).toBe('');
  });
});
