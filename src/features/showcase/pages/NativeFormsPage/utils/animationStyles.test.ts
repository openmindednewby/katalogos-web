import { nativeFormAnimationStyles } from './animationStyles';

describe('nativeFormAnimationStyles', () => {
  it('uses theme primary variable for focus-ring-pulse keyframe', () => {
    expect(nativeFormAnimationStyles).toContain(
      'rgb(var(--color-primary-500, 59 130 246) / 0.15)'
    );
    expect(nativeFormAnimationStyles).not.toContain('rgba(0, 141, 92');
  });

  it('uses theme primary variable for button focus-visible shadow', () => {
    expect(nativeFormAnimationStyles).toContain(
      'rgb(var(--color-primary-500, 59 130 246) / 0.3)'
    );
  });

  it('uses modern rgb syntax for button hover shadow', () => {
    expect(nativeFormAnimationStyles).toContain('rgb(0 0 0 / 0.1)');
    expect(nativeFormAnimationStyles).not.toContain('rgba(0, 0, 0, 0.1)');
  });

  it('uses modern rgb syntax for card hover shadow', () => {
    expect(nativeFormAnimationStyles).toContain('rgb(0 0 0 / 0.06)');
    expect(nativeFormAnimationStyles).not.toContain('rgba(0, 0, 0, 0.06)');
  });

  it('contains no hardcoded hex color values', () => {
    const hexColorPattern = /#[0-9a-fA-F]{3,8}/g;
    const matches = nativeFormAnimationStyles.match(hexColorPattern);
    expect(matches).toBeNull();
  });

  it('contains no rgba() function calls', () => {
    expect(nativeFormAnimationStyles).not.toMatch(/rgba\(/);
  });

  it('includes reduced motion media query for accessibility', () => {
    expect(nativeFormAnimationStyles).toContain('prefers-reduced-motion: reduce');
  });

  it('includes named duration constants in output', () => {
    expect(nativeFormAnimationStyles).toContain('200ms');
    expect(nativeFormAnimationStyles).toContain('150ms');
    expect(nativeFormAnimationStyles).toContain('300ms');
    expect(nativeFormAnimationStyles).toContain('600ms');
  });
});
