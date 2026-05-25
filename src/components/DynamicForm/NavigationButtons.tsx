import React from 'react';

import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';

import { FM } from '@/localization/helpers';

import type { FormStyles } from '../../theme/utils/styles';

interface Props {
  currentPage: number;
  totalPages: number;
  isLastPage: boolean;
  loading: boolean;
  handleBack: () => void;
  handleNext: () => void;
  styles: FormStyles;
}

const ACTIVITY_INDICATOR_COLOR = '#fff';

const NavigationButtons: React.FC<Props> = ({
  currentPage,
  totalPages: _totalPages,
  isLastPage,
  loading,
  handleBack,
  handleNext,
  styles,
}) => (
  <View style={styles.navButtons}>
    {currentPage > 1 && (
      <TouchableOpacity accessibilityRole="button" style={styles.navButton} onPress={handleBack}>
        <Text style={styles.navButtonText}>{FM('Back')}</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity accessibilityRole="button" style={styles.navButton} onPress={handleNext}>
      {loading ? (
        <ActivityIndicator color={ACTIVITY_INDICATOR_COLOR} />
      ) : (
        <Text style={styles.navButtonText}>
          {isLastPage ? FM('Submit') : FM('Next')}
        </Text>
      )}
    </TouchableOpacity>
  </View>
);

export default NavigationButtons;
