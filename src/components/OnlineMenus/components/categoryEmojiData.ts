/**
 * Curated emoji data for menu category icons.
 * Organized by category for the picker grid.
 */
import { isValueDefined } from '../../../utils/is';

/** A single emoji entry with its character and descriptive label. */
interface EmojiEntry {
  /** The emoji character (e.g., "🍕") */
  emoji: string;
  /** Descriptive label for accessibility (e.g., "pizza") */
  label: string;
}

/** A group of emojis under a named category. */
interface EmojiGroup {
  /** Translation key suffix for the group label (e.g., "categoryFood") */
  labelKey: string;
  /** Emoji entries in this group */
  emojis: EmojiEntry[];
}

/** Curated emoji groups for restaurant/food categories. */
export const CATEGORY_EMOJI_GROUPS: EmojiGroup[] = [
  {
    labelKey: 'categoryFood',
    emojis: [
      { emoji: '\u{1F355}', label: 'pizza' },
      { emoji: '\u{1F354}', label: 'hamburger' },
      { emoji: '\u{1F32E}', label: 'taco' },
      { emoji: '\u{1F363}', label: 'sushi' },
      { emoji: '\u{1F957}', label: 'salad' },
      { emoji: '\u{1F35D}', label: 'spaghetti' },
      { emoji: '\u{1F958}', label: 'stew' },
      { emoji: '\u{1F35C}', label: 'noodle soup' },
      { emoji: '\u{1F969}', label: 'steak' },
      { emoji: '\u{1F356}', label: 'meat on bone' },
      { emoji: '\u{1F9C6}', label: 'falafel' },
      { emoji: '\u{1F96A}', label: 'sandwich' },
      { emoji: '\u{1F32F}', label: 'burrito' },
      { emoji: '\u{1F371}', label: 'bento box' },
    ],
  },
  {
    labelKey: 'categoryDrinks',
    emojis: [
      { emoji: '\u{1F377}', label: 'wine' },
      { emoji: '\u{1F37A}', label: 'beer' },
      { emoji: '\u{1F964}', label: 'cup with straw' },
      { emoji: '\u2615', label: 'coffee' },
      { emoji: '\u{1F375}', label: 'tea' },
      { emoji: '\u{1F9C3}', label: 'juice box' },
      { emoji: '\u{1F379}', label: 'cocktail' },
      { emoji: '\u{1F942}', label: 'champagne' },
      { emoji: '\u{1FAD6}', label: 'teapot' },
    ],
  },
  {
    labelKey: 'categoryDesserts',
    emojis: [
      { emoji: '\u{1F370}', label: 'cake' },
      { emoji: '\u{1F9C1}', label: 'cupcake' },
      { emoji: '\u{1F369}', label: 'donut' },
      { emoji: '\u{1F36A}', label: 'cookie' },
      { emoji: '\u{1F382}', label: 'birthday cake' },
      { emoji: '\u{1F366}', label: 'ice cream' },
      { emoji: '\u{1F36B}', label: 'chocolate' },
      { emoji: '\u{1F36E}', label: 'custard' },
    ],
  },
  {
    labelKey: 'categoryOther',
    emojis: [
      { emoji: '\u2B50', label: 'star' },
      { emoji: '\u{1F525}', label: 'fire' },
      { emoji: '\u2764\uFE0F', label: 'heart' },
      { emoji: '\u2728', label: 'sparkles' },
      { emoji: '\u{1F31F}', label: 'glowing star' },
      { emoji: '\u{1F48E}', label: 'gem' },
      { emoji: '\u{1F3F7}\uFE0F', label: 'label' },
      { emoji: '\u{1F3AF}', label: 'bullseye' },
      { emoji: '\u{1F4CC}', label: 'pin' },
      { emoji: '\u{1F37D}\uFE0F', label: 'plate with cutlery' },
    ],
  },
];

/** Flat list of all available emojis for validation. */
export function getAllEmojis(): string[] {
  return CATEGORY_EMOJI_GROUPS.flatMap(
    (group) => group.emojis.map((entry) => entry.emoji),
  );
}

/** Check if a string is a valid category emoji from the curated list. */
export function isValidCategoryEmoji(value: string | null | undefined): boolean {
  const hasValue = isValueDefined(value) && value !== '';
  if (!hasValue) return false;
  return getAllEmojis().includes(value);
}
