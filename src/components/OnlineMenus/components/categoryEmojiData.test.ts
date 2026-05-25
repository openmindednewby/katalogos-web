/**
 * Unit tests for categoryEmojiData.
 *
 * Tests focus on LOGIC:
 * - Data structure integrity
 * - getAllEmojis helper
 * - isValidCategoryEmoji validation
 */
import {
  CATEGORY_EMOJI_GROUPS,
  getAllEmojis,
  isValidCategoryEmoji,
} from './categoryEmojiData';

describe('CATEGORY_EMOJI_GROUPS', () => {
  it('contains four groups', () => {
    const EXPECTED_GROUP_COUNT = 4;
    expect(CATEGORY_EMOJI_GROUPS).toHaveLength(EXPECTED_GROUP_COUNT);
  });

  it('each group has a labelKey and at least one emoji', () => {
    CATEGORY_EMOJI_GROUPS.forEach((group) => {
      expect(group.labelKey).toBeTruthy();
      expect(group.emojis.length).toBeGreaterThan(0);
    });
  });

  it('each emoji entry has non-empty emoji and label', () => {
    CATEGORY_EMOJI_GROUPS.forEach((group) => {
      group.emojis.forEach((entry) => {
        expect(entry.emoji).toBeTruthy();
        expect(entry.label).toBeTruthy();
      });
    });
  });

  it('has no duplicate emojis across all groups', () => {
    const allEmojis = getAllEmojis();
    const uniqueEmojis = new Set(allEmojis);
    expect(uniqueEmojis.size).toBe(allEmojis.length);
  });

  it('group labelKeys match expected values', () => {
    const keys = CATEGORY_EMOJI_GROUPS.map((g) => g.labelKey);
    expect(keys).toEqual([
      'categoryFood',
      'categoryDrinks',
      'categoryDesserts',
      'categoryOther',
    ]);
  });
});

describe('getAllEmojis', () => {
  it('returns a flat array of all emoji characters', () => {
    const allEmojis = getAllEmojis();
    const totalFromGroups = CATEGORY_EMOJI_GROUPS.reduce(
      (sum, g) => sum + g.emojis.length, 0,
    );
    expect(allEmojis).toHaveLength(totalFromGroups);
  });

  it('returns only string values', () => {
    const allEmojis = getAllEmojis();
    allEmojis.forEach((emoji) => {
      expect(typeof emoji).toBe('string');
    });
  });
});

describe('isValidCategoryEmoji', () => {
  it('returns true for an emoji in the curated list', () => {
    const firstEmoji = CATEGORY_EMOJI_GROUPS[0].emojis[0].emoji;
    expect(isValidCategoryEmoji(firstEmoji)).toBe(true);
  });

  it('returns false for an emoji not in the curated list', () => {
    expect(isValidCategoryEmoji('\u{1F600}')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidCategoryEmoji(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidCategoryEmoji(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidCategoryEmoji('')).toBe(false);
  });

  it('returns false for non-emoji string', () => {
    expect(isValidCategoryEmoji('abc')).toBe(false);
  });
});
