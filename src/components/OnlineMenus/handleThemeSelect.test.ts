import { applyThemeToMenuContents } from './ThemeSelector';

import type { MenuTheme } from './ThemeSelector';
import type { MenuContents } from '../../types/menuTypes';

describe('applyThemeToMenuContents (BUG-MENU-004)', () => {
  const darkTheme: MenuTheme = {
    name: 'dark',
    titleFontSize: 32,
    backgroundColor: '#1A1A1A',
    textColor: '#FFFFFF',
  };

  it('preserves existing categories when applying a theme', () => {
    const existing: MenuContents = {
      categories: [
        { name: 'Appetizers', items: [{ name: 'Soup', price: 5 }] },
        { name: 'Mains', items: [{ name: 'Steak', price: 20 }] },
      ],
      titleFont: 'Arial',
      titleFontSize: 24,
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
    };

    const result = applyThemeToMenuContents(darkTheme, existing);

    expect(result.backgroundColor).toBe('#1A1A1A');
    expect(result.textColor).toBe('#FFFFFF');
    expect(result.titleFontSize).toBe(32);

    expect(result.categories).toHaveLength(2);
    expect(result.categories?.[0]?.name).toBe('Appetizers');
    expect(result.categories?.[1]?.name).toBe('Mains');
    expect(result.categories?.[0]?.items?.[0]?.name).toBe('Soup');
  });

  it('handles null/undefined contents gracefully', () => {
    const result = applyThemeToMenuContents(darkTheme, null);

    expect(result.backgroundColor).toBe('#1A1A1A');
    expect(result.textColor).toBe('#FFFFFF');
    expect(result.categories).toEqual([]);
  });

  it('simulates functional updater pattern avoids stale state', () => {
    const initialState: MenuContents = {
      categories: [{ name: 'Starters' }],
      backgroundColor: '#FFF',
      textColor: '#000',
    };

    const updatedState: MenuContents = {
      ...initialState,
      categories: [
        ...initialState.categories ?? [],
        { name: 'Desserts' },
      ],
    };

    const staleResult = applyThemeToMenuContents(darkTheme, initialState);
    expect(staleResult.categories).toHaveLength(1);

    const correctResult = applyThemeToMenuContents(darkTheme, updatedState);
    expect(correctResult.categories).toHaveLength(2);
    expect(correctResult.categories?.[1]?.name).toBe('Desserts');
  });
});
