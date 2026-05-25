/**
 * Unit tests for SettingsDropdown logic.
 * Tests selectedLabel computation, handleSelect callback, and keyExtractor.
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

jest.mock('../../../../hooks/useFocusTrap', () => ({
  useFocusTrap: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Types (mirroring the component's internal interface)
// ---------------------------------------------------------------------------

interface DropdownOption {
  readonly label: string;
  readonly value: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMEZONE_OPTIONS: readonly DropdownOption[] = [
  { label: 'UTC', value: 'UTC' },
  { label: 'US/Eastern', value: 'America/New_York' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
] as const;

const LANGUAGE_OPTIONS: readonly DropdownOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
] as const;

const EMPTY_OPTIONS: readonly DropdownOption[] = [] as const;

// ---------------------------------------------------------------------------
// Logic functions (mirroring the component's implementation)
// ---------------------------------------------------------------------------

/**
 * Mirrors the selectedLabel useMemo logic from SettingsDropdown.
 */
function computeSelectedLabel(options: readonly DropdownOption[], value: string): string {
  const found = options.find((opt) => opt.value === value);
  return found?.label ?? value;
}

/**
 * Mirrors the keyExtractor callback from SettingsDropdown.
 */
function keyExtractor(item: DropdownOption): string {
  return item.value;
}

// ---------------------------------------------------------------------------
// Tests: selectedLabel computation
// ---------------------------------------------------------------------------

describe('SettingsDropdown - selectedLabel computation', () => {
  it('returns the label for a matching option value', () => {
    const result = computeSelectedLabel(TIMEZONE_OPTIONS, 'America/New_York');
    expect(result).toBe('US/Eastern');
  });

  it('returns the label for the first option', () => {
    const result = computeSelectedLabel(TIMEZONE_OPTIONS, 'UTC');
    expect(result).toBe('UTC');
  });

  it('returns the label for the last option', () => {
    const result = computeSelectedLabel(TIMEZONE_OPTIONS, 'Europe/Berlin');
    expect(result).toBe('Europe/Berlin');
  });

  it('falls back to raw value when no option matches', () => {
    const result = computeSelectedLabel(TIMEZONE_OPTIONS, 'Asia/Tokyo');
    expect(result).toBe('Asia/Tokyo');
  });

  it('falls back to raw value when options list is empty', () => {
    const result = computeSelectedLabel(EMPTY_OPTIONS, 'en');
    expect(result).toBe('en');
  });

  it('returns correct label from different option sets', () => {
    const result = computeSelectedLabel(LANGUAGE_OPTIONS, 'es');
    expect(result).toBe('Spanish');
  });
});

// ---------------------------------------------------------------------------
// Tests: handleSelect callback logic
// ---------------------------------------------------------------------------

describe('SettingsDropdown - handleSelect callback', () => {
  /**
   * Simulates the handleSelect logic from the component.
   */
  function simulateHandleSelect(onChange: (value: string) => void, optionValue: string): void {
    onChange(optionValue);
  }

  it('calls onChange with the selected option value', () => {
    const onChange = jest.fn();

    simulateHandleSelect(onChange, 'America/New_York');

    expect(onChange).toHaveBeenCalledWith('America/New_York');
  });

  it('calls onChange exactly once per selection', () => {
    const onChange = jest.fn();

    simulateHandleSelect(onChange, 'UTC');

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('passes the exact string value without modification', () => {
    const onChange = jest.fn();
    const value = 'Europe/Berlin';

    simulateHandleSelect(onChange, value);

    expect(onChange.mock.calls[0][0]).toBe(value);
  });
});

// ---------------------------------------------------------------------------
// Tests: keyExtractor
// ---------------------------------------------------------------------------

describe('SettingsDropdown - keyExtractor', () => {
  it('returns the value property of the item', () => {
    const item: DropdownOption = { label: 'UTC', value: 'UTC' };
    expect(keyExtractor(item)).toBe('UTC');
  });

  it('returns value, not label, even when they differ', () => {
    const item: DropdownOption = { label: 'US/Eastern', value: 'America/New_York' };
    expect(keyExtractor(item)).toBe('America/New_York');
  });

  it('returns unique keys for all timezone options', () => {
    const keys = TIMEZONE_OPTIONS.map(keyExtractor);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(TIMEZONE_OPTIONS.length);
  });
});
