/**
 * Tests for useDesignerState hook — reducer transitions and initial state.
 * Focuses on logic, not rendering.
 */
import { renderHook, act } from '@testing-library/react-native';

import { buildInitialState, useDesignerState } from './useDesignerState';
import { TemplateType } from '../enums/TemplateType';


jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

describe('useDesignerState', () => {
  const initial = buildInitialState('My Restaurant', 'https://example.com/menu/abc');

  it('builds initial state with correct defaults', () => {
    expect(initial.template).toBe(TemplateType.TableTent);
    expect(initial.restaurantName).toBe('My Restaurant');
    expect(initial.publicUrl).toBe('https://example.com/menu/abc');
    expect(initial.qrFgColor).toBe('#000000');
    expect(initial.qrBgColor).toBe('#ffffff');
    expect(initial.accentColor).toBe('#1a73e8');
    expect(initial.tagline).toBe('');
    expect(initial.logoDataUri).toBe('');
  });

  it('sets template via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setTemplate(TemplateType.Poster);
    });

    expect(result.current.state.template).toBe(TemplateType.Poster);
  });

  it('sets restaurant name via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setRestaurantName('New Name');
    });

    expect(result.current.state.restaurantName).toBe('New Name');
  });

  it('sets tagline via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setTagline('Best food in town');
    });

    expect(result.current.state.tagline).toBe('Best food in town');
  });

  it('sets call to action via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setCallToAction('Scan me!');
    });

    expect(result.current.state.callToAction).toBe('Scan me!');
  });

  it('sets QR foreground color via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setQrFgColor('#ff0000');
    });

    expect(result.current.state.qrFgColor).toBe('#ff0000');
  });

  it('sets QR background color via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setQrBgColor('#00ff00');
    });

    expect(result.current.state.qrBgColor).toBe('#00ff00');
  });

  it('sets accent color via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setAccentColor('#333333');
    });

    expect(result.current.state.accentColor).toBe('#333333');
  });

  it('sets logo data URI via dispatcher', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setLogoDataUri('data:image/png;base64,abc123');
    });

    expect(result.current.state.logoDataUri).toBe('data:image/png;base64,abc123');
  });

  it('preserves other state when updating a single field', () => {
    const { result } = renderHook(() => useDesignerState(initial));

    act(() => {
      result.current.dispatchers.setTagline('Updated tagline');
    });

    expect(result.current.state.restaurantName).toBe('My Restaurant');
    expect(result.current.state.template).toBe(TemplateType.TableTent);
    expect(result.current.state.tagline).toBe('Updated tagline');
  });
});
