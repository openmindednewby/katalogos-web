/**
 * Helper functions and types for TenantListItem.
 * Extracted to keep the component under the 200-line limit.
 */
import { isValueDefined } from '../../utils/is';
import { sanitizeText } from '../../utils/sanitize';

const TEXT_TRUNCATION_LIMIT = 200;
const USER_DISPLAY_LIMIT = 100;

interface UserLike {
  username?: string;
  email?: string | null;
}

interface ItemWithUser {
  user?: UserLike | null;
}

function hasUserField(item: unknown): item is ItemWithUser {
  return typeof item === 'object' && isValueDefined(item) && 'user' in item;
}

interface ItemData {
  title: string;
  rawStatus: unknown;
  itemID: string;
  numericStatus: number;
  userDisplay: string;
  showUser: boolean;
}

/**
 * Safely accesses a property from an item by key.
 */
function getItemProperty(item: unknown, key: PropertyKey): unknown {
  const isNonNullObject = typeof item === 'object' && isValueDefined(item);
  if (!isNonNullObject || !(key in item)) return undefined;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrowing unknown object to indexable record
  const record = item as Record<PropertyKey, unknown>;
  return record[key];
}

function deriveNumericStatus(rawStatus: unknown): number {
  if (typeof rawStatus === 'boolean') return rawStatus ? 1 : 0;
  return Number(rawStatus ?? 0);
}

export function extractItemData(
  item: unknown,
  titleKey: PropertyKey,
  statusKey: PropertyKey,
  idKey: PropertyKey
): ItemData {
  const title = sanitizeText(String(getItemProperty(item, titleKey) ?? ''), TEXT_TRUNCATION_LIMIT);
  const rawStatus = getItemProperty(item, statusKey);
  const itemID = String(getItemProperty(item, idKey) ?? '');
  const numericStatus = deriveNumericStatus(rawStatus);
  const user = hasUserField(item) ? item.user : undefined;
  const userDisplay = sanitizeText(String(user?.username ?? user?.email ?? ''), USER_DISPLAY_LIMIT);
  const showUser = isValueDefined(user) && userDisplay.length > 0;
  return { title, rawStatus, itemID, numericStatus, userDisplay, showUser };
}

interface ActivateState {
  isCurrentlyActive: boolean;
  activateToggleTestID: string | undefined;
}

export function deriveActivateState(
  rawStatus: unknown,
  activateButtonTestID: string | undefined,
  deactivateButtonTestID: string | undefined
): ActivateState {
  const isCurrentlyActive = rawStatus === true || rawStatus === 1;
  const activateToggleTestID = isCurrentlyActive ? deactivateButtonTestID : activateButtonTestID;
  return { isCurrentlyActive, activateToggleTestID };
}

export function deriveRawStatusForActions(rawStatus: unknown): boolean | number | undefined {
  if (typeof rawStatus === 'boolean' || typeof rawStatus === 'number') return rawStatus;
  return undefined;
}
