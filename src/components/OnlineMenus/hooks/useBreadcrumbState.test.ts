import { renderHook } from '@testing-library/react-native';

import { useBreadcrumbState } from './useBreadcrumbState';

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

const mockNavigateToMenuList = jest.fn();
const mockNavigateToMetadata = jest.fn();
const mockNavigateToContent = jest.fn();

const CATEGORIES = [
  { id: 'cat-1', name: 'Starters' },
  { id: 'cat-2', name: 'Main Courses' },
];

function renderBreadcrumb(overrides: Record<string, unknown> = {}): ReturnType<typeof renderHook> {
  const defaults = {
    menuName: 'Lunch Menu',
    activeTab: 'metadata',
    activeCategoryId: null,
    categories: CATEGORIES,
    onNavigateToMenuList: mockNavigateToMenuList,
    onNavigateToMetadata: mockNavigateToMetadata,
    onNavigateToContent: mockNavigateToContent,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderHook(() => useBreadcrumbState({ ...defaults, ...overrides } as any));
}

describe('useBreadcrumbState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 3 crumbs for metadata tab', () => {
    const { result } = renderBreadcrumb({ activeTab: 'metadata' });

    expect(result.current).toHaveLength(3);
    expect(result.current[0].label).toBe('onlineMenus.breadcrumb.onlineMenus');
    expect(result.current[1].label).toBe('Lunch Menu');
    expect(result.current[2].label).toBe('onlineMenus.tab.metadata');
  });

  it('returns 3 crumbs for content tab without active category', () => {
    const { result } = renderBreadcrumb({ activeTab: 'content', activeCategoryId: null });

    expect(result.current).toHaveLength(3);
    expect(result.current[2].label).toBe('onlineMenus.tab.content');
  });

  it('returns 4 crumbs for content tab with active category', () => {
    const { result } = renderBreadcrumb({ activeTab: 'content', activeCategoryId: 'cat-1' });

    expect(result.current).toHaveLength(4);
    expect(result.current[2].label).toBe('onlineMenus.tab.content');
    expect(result.current[3].label).toBe('Starters');
  });

  it('returns 3 crumbs for preview tab', () => {
    const { result } = renderBreadcrumb({ activeTab: 'preview' });

    expect(result.current).toHaveLength(3);
    expect(result.current[2].label).toBe('onlineMenus.tab.preview');
  });

  it('first crumb navigates to menu list', () => {
    const { result } = renderBreadcrumb();

    expect(result.current[0].onPress).toBe(mockNavigateToMenuList);
  });

  it('menu name crumb navigates to metadata when not on metadata tab', () => {
    const { result } = renderBreadcrumb({ activeTab: 'content' });

    expect(result.current[1].onPress).toBe(mockNavigateToMetadata);
  });

  it('menu name crumb is non-interactive on metadata tab', () => {
    const { result } = renderBreadcrumb({ activeTab: 'metadata' });

    expect(result.current[1].onPress).toBeUndefined();
  });

  it('content crumb navigates to content overview when category is focused', () => {
    const { result } = renderBreadcrumb({ activeTab: 'content', activeCategoryId: 'cat-1' });

    expect(result.current[2].onPress).toBe(mockNavigateToContent);
  });

  it('terminal crumb is non-interactive', () => {
    const { result } = renderBreadcrumb({ activeTab: 'metadata' });
    const lastCrumb = result.current[result.current.length - 1];

    expect(lastCrumb.onPress).toBeUndefined();
  });

  it('uses create label when menu name is empty', () => {
    const { result } = renderBreadcrumb({ menuName: '' });

    expect(result.current[1].label).toBe('onlineMenus.create');
  });

  it('returns null category name gracefully when category id not found', () => {
    const { result } = renderBreadcrumb({ activeTab: 'content', activeCategoryId: 'nonexistent' });

    expect(result.current).toHaveLength(3);
  });

  it('returns translations tab label for translations tab', () => {
    const { result } = renderBreadcrumb({ activeTab: 'translations' });

    expect(result.current[2].label).toBe('translations.tabTitle');
  });
});
