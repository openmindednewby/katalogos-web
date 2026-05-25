/**
 * Tests for versionDiffHelpers utility functions.
 * Tests path formatting, semantic key mapping, summary computation, and value truncation.
 */
import { VersionChangeType } from '@/shared/enums/VersionChangeType';

import { formatVersionPath, getChangeSemanticKey, getChangeSummary, truncateValue } from './versionDiffHelpers';

import type { MenuVersionDiff } from '../../types';

describe('formatVersionPath', () => {
  it('converts array indices to 1-based numbers', () => {
    expect(formatVersionPath('Categories[0]')).toBe('Categories 1');
  });

  it('converts dots to arrow separators', () => {
    expect(formatVersionPath('Categories.Name')).toBe('Categories > Name');
  });

  it('handles nested paths with indices', () => {
    expect(formatVersionPath('Categories[0].Items[1].Price')).toBe('Categories 1 > Items 2 > Price');
  });

  it('handles simple paths without indices', () => {
    expect(formatVersionPath('Name')).toBe('Name');
  });

  it('handles multiple indices', () => {
    expect(formatVersionPath('Categories[2].Items[5]')).toBe('Categories 3 > Items 6');
  });
});

describe('getChangeSemanticKey', () => {
  it('returns success for Added', () => {
    expect(getChangeSemanticKey(VersionChangeType.Added)).toBe('success');
  });

  it('returns error for Removed', () => {
    expect(getChangeSemanticKey(VersionChangeType.Removed)).toBe('error');
  });

  it('returns warning for Modified', () => {
    expect(getChangeSemanticKey(VersionChangeType.Modified)).toBe('warning');
  });

  it('returns warning for unknown change types', () => {
    expect(getChangeSemanticKey('Unknown')).toBe('warning');
  });
});

describe('getChangeSummary', () => {
  it('counts additions correctly', () => {
    const diffs: MenuVersionDiff[] = [
      { path: 'a', changeType: VersionChangeType.Added, oldValue: null, newValue: 'x' },
      { path: 'b', changeType: VersionChangeType.Added, oldValue: null, newValue: 'y' },
    ];
    const summary = getChangeSummary(diffs);
    expect(summary.additions).toBe(2);
    expect(summary.removals).toBe(0);
    expect(summary.modifications).toBe(0);
  });

  it('counts removals correctly', () => {
    const diffs: MenuVersionDiff[] = [
      { path: 'a', changeType: VersionChangeType.Removed, oldValue: 'x', newValue: null },
    ];
    const summary = getChangeSummary(diffs);
    expect(summary.removals).toBe(1);
  });

  it('counts modifications correctly', () => {
    const diffs: MenuVersionDiff[] = [
      { path: 'a', changeType: VersionChangeType.Modified, oldValue: 'x', newValue: 'y' },
    ];
    const summary = getChangeSummary(diffs);
    expect(summary.modifications).toBe(1);
  });

  it('counts mixed changes correctly', () => {
    const diffs: MenuVersionDiff[] = [
      { path: 'a', changeType: VersionChangeType.Added, oldValue: null, newValue: 'x' },
      { path: 'b', changeType: VersionChangeType.Removed, oldValue: 'y', newValue: null },
      { path: 'c', changeType: VersionChangeType.Modified, oldValue: 'old', newValue: 'new' },
      { path: 'd', changeType: VersionChangeType.Added, oldValue: null, newValue: 'z' },
    ];
    const summary = getChangeSummary(diffs);
    expect(summary.additions).toBe(2);
    expect(summary.removals).toBe(1);
    expect(summary.modifications).toBe(1);
  });

  it('returns all zeros for empty array', () => {
    const summary = getChangeSummary([]);
    expect(summary.additions).toBe(0);
    expect(summary.removals).toBe(0);
    expect(summary.modifications).toBe(0);
  });
});

describe('truncateValue', () => {
  it('returns dash for null values', () => {
    const MAX_LENGTH = 50;
    expect(truncateValue(null, MAX_LENGTH)).toBe('-');
  });

  it('returns the full value when under max length', () => {
    const MAX_LENGTH = 50;
    expect(truncateValue('short', MAX_LENGTH)).toBe('short');
  });

  it('truncates and adds ellipsis when over max length', () => {
    const MAX_LENGTH = 5;
    expect(truncateValue('long string here', MAX_LENGTH)).toBe('long ...');
  });

  it('returns full value when exactly at max length', () => {
    const MAX_LENGTH = 5;
    expect(truncateValue('abcde', MAX_LENGTH)).toBe('abcde');
  });
});
