import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

const styles = StyleSheet.create({
  content: { padding: 24 },
  description: { fontSize: 14, opacity: 0.7 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
});

interface Props {
  titleKey: string;
  titleFallback?: string;
}

const PlaceholderPage = ({ titleKey, titleFallback: _titleFallback }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[layoutStyles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {FM(titleKey)}
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {FM('common.comingSoon')}
        </Text>
      </View>
    </View>
  );
};

export default PlaceholderPage;
