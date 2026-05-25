

/**
 * Typography editor section with font family chip selector and heading scale input.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { ChipSelector } from '../../Forms/ChipSelector';
import Heading from '../../Shared/Heading';
import Section from '../../Shared/Section';

import type { TypographyConfig } from '../../../theme/types';

interface Props {
  typography: TypographyConfig | undefined;
  onChange: (typography: TypographyConfig) => void;
  disabled: boolean;
}

const MIN_HEADING_SCALE = 0.5;
const MAX_HEADING_SCALE = 2.0;

// Font names are proper nouns and should not be localized
const FONT_OPTIONS = [
  { value: 'System', label: 'System' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier', label: 'Courier' },
];

const styles = StyleSheet.create({
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  scaleLabel: { fontSize: 14, fontWeight: '600' },
  scaleInput: {
    width: 80,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  scaleHint: { fontSize: 12, marginTop: 4 },
});

const TypographyEditor = ({ typography, onChange, disabled }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const currentFont = typography?.fontFamily ?? 'System';
  const currentScale = typography?.headingScale?.toString() ?? '1';

  const handleFontChange = useCallback(
    (font: string) => {
      onChange({ ...typography, fontFamily: font });
    },
    [typography, onChange],
  );

  const handleScaleChange = useCallback(
    (text: string) => {
      const num = parseFloat(text);
      if (text === '' || text === '.') {
        onChange({ ...typography, headingScale: undefined });
        return;
      }
      const isValidScale = !isNaN(num) && num >= MIN_HEADING_SCALE && num <= MAX_HEADING_SCALE;
      if (isValidScale)
        onChange({ ...typography, headingScale: num });
    },
    [typography, onChange],
  );

  const scaleInputStyle = useMemo(
    () => [
      styles.scaleInput,
      { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
    ],
    [colors.text, colors.surface, colors.border],
  );

  return (
    <Section>
      <Heading>{FM('tenantThemes.typography')}</Heading>
      <ChipSelector
        disabled={disabled}
        label={FM('tenantThemes.fontFamily')}
        options={FONT_OPTIONS}
        value={currentFont}
        onChange={handleFontChange}
      />
      <View style={styles.scaleRow}>
        <Text style={[styles.scaleLabel, { color: colors.text }]}>
          {FM('tenantThemes.headingScale')}
        </Text>
        <TextInput
          accessibilityHint={FM('tenantThemes.headingScaleHint')}
          accessibilityLabel={FM('tenantThemes.headingScale')}
          editable={!disabled}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textSecondary}
          style={scaleInputStyle}
          testID={TestIds.TENANT_THEME_TYPOGRAPHY_SCALE}
          value={currentScale}
          onChangeText={handleScaleChange}
        />
      </View>
      <Text style={[styles.scaleHint, { color: colors.textSecondary }]}>
        {FM('tenantThemes.headingScaleRange')}
      </Text>
    </Section>
  );
};

export default TypographyEditor;
