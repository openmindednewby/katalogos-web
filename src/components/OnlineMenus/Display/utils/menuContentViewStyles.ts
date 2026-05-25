import { StyleSheet } from 'react-native';

/**
 * Styles for MenuContentView and sub-components.
 * These are base styles that get enhanced with dynamic styling from MenuContents.
 */
export const menuContentViewStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header styles
  header: {
    marginBottom: 16,
  },
  banner: {
    width: '100%',
    marginBottom: 12,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoLeft: {
    alignItems: 'flex-start',
  },
  logoCenter: {
    alignItems: 'center',
  },
  logoRight: {
    alignItems: 'flex-end',
  },
  title: {
    marginBottom: 8,
  },
  titleLeft: {
    textAlign: 'left',
  },
  titleCenter: {
    textAlign: 'center',
  },
  titleRight: {
    textAlign: 'right',
  },
  description: {
    marginBottom: 16,
  },

  // Category section styles
  categoriesContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryTitle: {
    marginBottom: 4,
  },
  categoryDescription: {
    marginBottom: 8,
  },
  categoryMedia: {
    marginBottom: 12,
  },
  categoryDivider: {
    height: 1,
    marginVertical: 16,
  },

  // Item styles
  itemsContainer: {
    flexDirection: 'column',
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemCard: {
    marginBottom: 12,
  },
  itemCardGrid: {
    flex: 1,
    minWidth: 150,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    flexShrink: 0,
  },
  itemDescription: {
    marginTop: 4,
  },
  itemMedia: {
    marginBottom: 8,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
  },

  // Touch feedback
  pressable: {
    overflow: 'hidden',
  },
});

/**
 * Logo size dimensions in pixels.
 */
export const LOGO_SIZES = {
  small: 40,
  medium: 60,
  large: 80,
} as const;

/**
 * Default banner height in pixels.
 */
export const DEFAULT_BANNER_HEIGHT = 200;
