/**
 * A single section within a legal page (title + body text).
 */
import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { useTheme } from '../../../theme/hooks/useTheme';

const SECTION_MARGIN_BOTTOM = 20;
const SECTION_TITLE_SIZE = 18;
const SECTION_TITLE_MARGIN_BOTTOM = 8;
const SECTION_BODY_SIZE = 14;
const SECTION_BODY_LINE_HEIGHT = 22;

const styles = StyleSheet.create({
  section: { marginBottom: SECTION_MARGIN_BOTTOM },
  sectionTitle: { fontSize: SECTION_TITLE_SIZE, fontWeight: '600', marginBottom: SECTION_TITLE_MARGIN_BOTTOM },
  sectionBody: { fontSize: SECTION_BODY_SIZE, lineHeight: SECTION_BODY_LINE_HEIGHT },
});

interface LegalSectionProps {
  title: string;
  body: string;
}

const LegalSection = ({ title, body }: LegalSectionProps): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{body}</Text>
    </View>
  );
};

export default LegalSection;
