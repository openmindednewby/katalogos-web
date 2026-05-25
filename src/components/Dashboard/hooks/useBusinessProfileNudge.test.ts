jest.mock('../../../utils/is', () => ({
  isValueDefined: (v: unknown) => v !== null && v !== undefined,
}));

interface ProfileState {
  phone?: string | null;
  addressLine1?: string | null;
}

interface QueryState {
  isLoading: boolean;
  isError: boolean;
  profile: ProfileState | null;
}

function isNonEmpty(value: string | null | undefined): boolean {
  const { isValueDefined } = require('../../../utils/is') as { isValueDefined: (v: unknown) => boolean };
  return isValueDefined(value) && value !== '';
}

function shouldShowNudge(hasContent: boolean, queryState: QueryState): boolean {
  if (!hasContent) return false;
  if (queryState.isLoading || queryState.isError) return false;

  const profile = queryState.profile;
  if (profile === null) return false;

  return !isNonEmpty(profile.phone) || !isNonEmpty(profile.addressLine1);
}

describe('useBusinessProfileNudge logic', () => {
  it('returns false when there is no content', () => {
    expect(shouldShowNudge(false, {
      isLoading: false,
      isError: false,
      profile: { phone: null, addressLine1: null },
    })).toBe(false);
  });

  it('returns false when profile is loading', () => {
    expect(shouldShowNudge(true, {
      isLoading: true,
      isError: false,
      profile: null,
    })).toBe(false);
  });

  it('returns false when profile query errored', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: true,
      profile: null,
    })).toBe(false);
  });

  it('returns false when profile is null', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: false,
      profile: null,
    })).toBe(false);
  });

  it('returns true when phone and address are both empty', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: false,
      profile: { phone: null, addressLine1: null },
    })).toBe(true);
  });

  it('returns true when phone is filled but address is empty', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: false,
      profile: { phone: '+1-555-0123', addressLine1: null },
    })).toBe(true);
  });

  it('returns true when address is filled but phone is empty', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: false,
      profile: { phone: null, addressLine1: '123 Main St' },
    })).toBe(true);
  });

  it('returns false when both phone and address are filled', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: false,
      profile: { phone: '+1-555-0123', addressLine1: '123 Main St' },
    })).toBe(false);
  });

  it('returns true when phone is empty string', () => {
    expect(shouldShowNudge(true, {
      isLoading: false,
      isError: false,
      profile: { phone: '', addressLine1: '123 Main St' },
    })).toBe(true);
  });
});
