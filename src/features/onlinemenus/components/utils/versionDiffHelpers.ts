/**
 * Utility functions for formatting and summarizing menu version diffs.
 */
import ChangeSemanticKey from '@/shared/enums/ChangeSemanticKey';
import { isValueDefined } from '@/utils/is';

import type { MenuVersionDiff } from '../../types';

const ADDED_CHANGE_TYPE = 'Added';
const REMOVED_CHANGE_TYPE = 'Removed';

interface ChangeSummary {
  additions: number;
  removals: number;
  modifications: number;
}

/**
 * Formats a JSON path into a human-readable label.
 * e.g., "Categories[0].Items[1].Price" -> "Categories > Item 2 > Price"
 */
export function formatVersionPath(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, (_match, index: string) => ` ${String(Number(index) + 1)}`)
    .replace(/\./g, ' > ');
}

/**
 * Returns a semantic color key for a given change type.
 * Resolve the actual color from theme semantic tokens in the component.
 */
export function getChangeSemanticKey(changeType: string): ChangeSemanticKey {
  if (changeType === ADDED_CHANGE_TYPE) return ChangeSemanticKey.Success;
  if (changeType === REMOVED_CHANGE_TYPE) return ChangeSemanticKey.Error;
  return ChangeSemanticKey.Warning;
}

/**
 * Computes a summary of changes from a diff list.
 */
export function getChangeSummary(differences: MenuVersionDiff[]): ChangeSummary {
  let additions = 0;
  let removals = 0;
  let modifications = 0;

  for (const diff of differences)
    if (diff.changeType === ADDED_CHANGE_TYPE)
      additions++;
    else if (diff.changeType === REMOVED_CHANGE_TYPE)
      removals++;
    else
      modifications++;


  return { additions, removals, modifications };
}

/**
 * Truncates a value string for display, adding ellipsis if too long.
 */
export function truncateValue(value: string | null, maxLength: number): string {
  if (!isValueDefined(value)) return '-';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}
