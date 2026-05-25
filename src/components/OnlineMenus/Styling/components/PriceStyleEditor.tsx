

import React, { useCallback, useState } from 'react';

import { Text, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import {
  ColorInputControl,
  CurrencyPositionControl,
  FontSizeControl,
  FontWeightControl,
  ToggleControl,
} from './PriceStyleControls';
import PriceStylePreview from './PriceStylePreview';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import CurrencyPosition from '../../../../types/enums/CurrencyPosition';
import FontWeight from '../../../../types/enums/FontWeight';
import { isValidHexColor } from '../utils/colorSchemeConstants';
import { DEFAULT_FONT_SIZE, parseCurrencyPosition } from '../utils/priceStyleConstants';
import { priceStyleEditorStyles as styles } from '../utils/priceStyleEditorStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { PriceStyle } from '../../../../types/menuStyleTypes';

interface Props {
  value: PriceStyle;
  onChange: (value: PriceStyle) => void;
  disabled?: boolean;
}

const PriceStyleEditor: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const [fontWeightMenuVisible, setFontWeightMenuVisible] = useState(false);
  const [colorError, setColorError] = useState(false);

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const borderColor = String(colors.border);
  const bgColor = String(colors.surface);
  const errorColor = String(colors.error);
  const primaryColor = String(colors.primary);

  // Computed values with defaults
  const currentFontWeight = value.fontWeight ?? FontWeight.Bold;
  const currentFontSize = value.fontSize ?? DEFAULT_FONT_SIZE;
  const currentColor = value.color ?? '';
  const currentCurrencyPosition = value.currencyPosition ?? CurrencyPosition.Before;
  const currentShowCurrency = value.showCurrency ?? true;
  const currentStrikethrough = value.strikethroughWhenUnavailable ?? true;

  // Handlers
  const handleFontSizeChange = useCallback(
    (fontSize: number) => onChange({ ...value, fontSize: Math.round(fontSize) }),
    [onChange, value],
  );

  const handleFontWeightChange = useCallback(
    (fontWeight: FontWeight) => onChange({ ...value, fontWeight }),
    [onChange, value],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      const isValid = color === '' || isValidHexColor(color.toUpperCase());
      setColorError(!isValid && color !== '');
      onChange({ ...value, color });
    },
    [onChange, value],
  );

  const handleCurrencyPositionChange = useCallback(
    (position: string) => onChange({ ...value, currencyPosition: parseCurrencyPosition(position) }),
    [onChange, value],
  );

  const handleShowCurrencyChange = useCallback(
    (showCurrency: boolean) => onChange({ ...value, showCurrency }),
    [onChange, value],
  );

  const handleStrikethroughChange = useCallback(
    (strikethroughWhenUnavailable: boolean) => onChange({ ...value, strikethroughWhenUnavailable }),
    [onChange, value],
  );

  return (
    <View style={styles.container} testID={TestIds.PRICE_STYLE_EDITOR}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {FM('priceStyle.title')}
      </Text>

      <View style={styles.controlsContainer}>
        <FontSizeControl
          borderColor={borderColor}
          disabled={disabled}
          primaryColor={primaryColor}
          textColor={textColor}
          textSecondary={textSecondary}
          value={currentFontSize}
          onChange={handleFontSizeChange}
        />

        <FontWeightControl
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          menuVisible={fontWeightMenuVisible}
          setMenuVisible={setFontWeightMenuVisible}
          textColor={textColor}
          value={currentFontWeight}
          onChange={handleFontWeightChange}
        />

        <ColorInputControl
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          errorColor={errorColor}
          hasError={colorError}
          textColor={textColor}
          textSecondary={textSecondary}
          value={currentColor}
          onChange={handleColorChange}
        />

        <CurrencyPositionControl
          textColor={textColor}
          value={currentCurrencyPosition}
          onChange={handleCurrencyPositionChange}
        />

        <ToggleControl
          accessibilityHint={FM('priceStyle.showCurrencyHint')}
          accessibilityLabel={FM('priceStyle.showCurrencyLabel')}
          disabled={disabled}
          label={FM('priceStyle.showCurrency')}
          testID={TestIds.PRICE_STYLE_SHOW_CURRENCY_TOGGLE}
          textColor={textColor}
          value={currentShowCurrency}
          onChange={handleShowCurrencyChange}
        />

        <ToggleControl
          accessibilityHint={FM('priceStyle.strikethroughHint')}
          accessibilityLabel={FM('priceStyle.strikethroughLabel')}
          disabled={disabled}
          label={FM('priceStyle.strikethrough')}
          testID={TestIds.PRICE_STYLE_STRIKETHROUGH_TOGGLE}
          textColor={textColor}
          value={currentStrikethrough}
          onChange={handleStrikethroughChange}
        />

        <PriceStylePreview
          bgColor={bgColor}
          borderColor={borderColor}
          color={currentColor}
          currencyPosition={currentCurrencyPosition}
          fontSize={currentFontSize}
          fontWeight={currentFontWeight}
          showCurrency={currentShowCurrency}
          showStrikethrough={currentStrikethrough}
          textColor={textColor}
          textSecondary={textSecondary}
        />
      </View>
    </View>
  );
};

export default PriceStyleEditor;
