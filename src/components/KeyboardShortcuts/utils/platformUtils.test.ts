import { getModifierLabel, isMacPlatform } from './platformUtils';

jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));

describe('platformUtils', () => {
  it('returns a string for getModifierLabel', () => {
    const label = getModifierLabel();
    expect(typeof label).toBe('string');
    expect(['Ctrl', 'Cmd']).toContain(label);
  });

  it('returns a boolean for isMacPlatform', () => {
    expect(typeof isMacPlatform()).toBe('boolean');
  });

  it('getModifierLabel and isMacPlatform are consistent', () => {
    const isMac = isMacPlatform();
    const label = getModifierLabel();
    if (isMac) expect(label).toBe('Cmd');
    else expect(label).toBe('Ctrl');
  });
});
