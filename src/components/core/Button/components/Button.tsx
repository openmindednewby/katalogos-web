


/**
 * Core Button component consuming the tenant theme system.
 *
 * Supports five variants (primary, secondary, outline, ghost, danger),
 * three sizes (sm/md/lg), and loading/disabled states.
 * All colors are derived from useTheme() -- no direct Redux access.
 */
import React, { useMemo } from 'react';

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import SvgIcon from '../../../Icons/SvgIcon';
import { buildButtonStyles, DISABLED_OPACITY } from '../utils/Button.styles';
import ButtonSize from '../utils/ButtonSize';
import ButtonVariant from '../utils/ButtonVariant';

import type { IconName } from '../../../Icons/iconPaths';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVE_OPACITY = 0.7;
const SPINNER_SIZE_SMALL = 16;
const SPINNER_SIZE_DEFAULT = 20;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSpinnerSize(size: ButtonSize): number {
  if (size === ButtonSize.Small) return SPINNER_SIZE_SMALL;
  return SPINNER_SIZE_DEFAULT;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Button = ({
  variant = ButtonVariant.Primary,
  size = ButtonSize.Medium,
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: Props): React.ReactElement => {
  const { theme } = useTheme();

  const styles = useMemo(
    () => buildButtonStyles(theme, variant, size),
    [theme, variant, size],
  );

  const isDisabled = disabled || loading;

  const containerStyle = useMemo(
    () => [
      styles.container,
      fullWidth ? { width: '100%' as const } : undefined,
      isDisabled ? { opacity: DISABLED_OPACITY } : undefined,
    ],
    [styles.container, fullWidth, isDisabled],
  );

  return (
    <TouchableOpacity
      accessible
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={ACTIVE_OPACITY}
      disabled={isDisabled}
      style={containerStyle}
      testID={testID}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator
          color={styles.iconColor}
          size={getSpinnerSize(size)}
        /> : null}
      {!loading && isValueDefined(icon) && (
        <SvgIcon color={styles.iconColor} name={icon} />
      )}
      {!loading && <Text style={styles.text}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Button;
