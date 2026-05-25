


/**
 * Form and input layout styles.
 */
import { StyleSheet } from 'react-native';

const LIGHT_BORDER_COLOR = '#ddd';
const TRANSPARENT_COLOR = 'transparent';
const WHITE_COLOR = '#fff';
const INACTIVE_TEXT_COLOR = '#555';
const SUBTLE_TEXT_COLOR = '#666';

export const formStyles = StyleSheet.create({
  // Section card
  sectionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_BORDER_COLOR,
    borderRadius: 6,
    backgroundColor: TRANSPARENT_COLOR,
  },
  sectionHeading: {
    fontWeight: '700',
    fontSize: 16,
  },

  // Tabs
  tabsWrapper: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  tabButtonActiveText: {
    color: WHITE_COLOR,
  },
  tabButtonInactiveText: {
    color: INACTIVE_TEXT_COLOR,
  },

  // Form row helpers
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 6,
  },
  inputSpacing: {
    marginTop: 8,
  },

  // Questions section
  questionsWrapper: {
    marginTop: 12,
  },
  questionsLabel: {
    fontWeight: '700',
    marginBottom: 6,
  },
  questionsSubLabel: {
    color: SUBTLE_TEXT_COLOR,
    marginBottom: 8,
    fontSize: 12,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
  },
});
