/**
 * PriceInput - Controlled decimal input for price fields.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { StyleSheet, TextInput } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import ThemeMode from '../../../shared/enums/ThemeMode';
import { themePalette } from '../../../theme/utils/styles';

import type { RootState } from '../../../store/reduxStore';

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
});

interface PriceInputProps {
  price: number | undefined;
  onPriceChange: (price: number) => void;
  testID: string;
}

const PriceInput: React.FC<PriceInputProps> = ({ price, onPriceChange, testID }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const [rawText, setRawText] = useState<string>(String(price ?? 0));
  const lastPriceRef = useRef<number | undefined>(price);

  useEffect(() => {
    if (price !== lastPriceRef.current) {
      const newText = String(price ?? 0);
      const currentParsed = parseFloat(rawText);
      if (isNaN(currentParsed) || currentParsed !== price) setRawText(newText);
      lastPriceRef.current = price;
    }
  }, [price, rawText]);

  const handleTextChange = useCallback((text: string) => {
    const validPattern = /^(\d*\.?\d*)?$/;
    if (!validPattern.test(text)) return;
    setRawText(text);
    if (text === '' || text === '.') return;
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) { lastPriceRef.current = parsed; onPriceChange(parsed); }
  }, [onPriceChange]);

  const handleBlur = useCallback(() => {
    const parsed = parseFloat(rawText);
    const isInvalidInput = rawText === '' || rawText === '.' || isNaN(parsed);
    if (isInvalidInput) setRawText(String(price ?? 0));
    else { setRawText(String(parsed)); lastPriceRef.current = parsed; onPriceChange(parsed); }
  }, [rawText, price, onPriceChange]);

  const borderColor = String(colors.border);
  const textColor = String(colors.text);
  const bgColor = String(colors.surface);

  return (
    <TextInput
      accessibilityHint={FM('onlineMenus.priceInputHint')}
      accessibilityLabel={FM('onlineMenus.priceLabel')}
      keyboardType="decimal-pad"
      style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
      testID={testID}
      value={rawText}
      onBlur={handleBlur}
      onChangeText={handleTextChange}
    />
  );
};

export default PriceInput;
