/**
 * Core Button — thin adapter over the shared `@dloizides/ui-buttons` Button.
 *
 * Keeps the app-local `ButtonVariant`/`ButtonSize` enums and `icon: IconName`
 * API so the existing call sites stay unchanged; it maps them to the shared
 * string props and an icon render slot. Colours still come from the app theme
 * (the shared Button reads it through the FeedbackUiProvider bridge), so the
 * rendered result is identical to the previous local implementation.
 */
import React from 'react';

import { Button as SharedButton } from '@dloizides/ui-buttons';

import { isValueDefined } from '../../../../utils/is';
import SvgIcon from '../../../Icons/SvgIcon';
import ButtonSize from '../utils/ButtonSize';
import ButtonVariant from '../utils/ButtonVariant';

import type { IconName } from '../../../Icons/iconPaths';
import type {
  ButtonSize as SharedButtonSize,
  ButtonVariant as SharedButtonVariant,
} from '@dloizides/ui-buttons';

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

const VARIANT_MAP: Record<ButtonVariant, SharedButtonVariant> = {
  [ButtonVariant.Primary]: 'primary',
  [ButtonVariant.Secondary]: 'secondary',
  [ButtonVariant.Outline]: 'outline',
  [ButtonVariant.Ghost]: 'ghost',
  [ButtonVariant.Danger]: 'danger',
};

const SIZE_MAP: Record<ButtonSize, SharedButtonSize> = {
  [ButtonSize.Small]: 'sm',
  [ButtonSize.Medium]: 'md',
  [ButtonSize.Large]: 'lg',
};

function buildIconRenderer(icon: IconName | undefined): ((color: string) => React.ReactNode) | undefined {
  if (!isValueDefined(icon)) return undefined;
  return function renderButtonIcon(color: string): React.ReactNode {
    return <SvgIcon color={color} name={icon} />;
  };
}

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
}: Props): React.ReactElement => (
  <SharedButton
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    disabled={disabled}
    fullWidth={fullWidth}
    label={label}
    loading={loading}
    renderIcon={buildIconRenderer(icon)}
    size={SIZE_MAP[size]}
    testID={testID}
    variant={VARIANT_MAP[variant]}
    onPress={onPress}
  />
);

export default Button;
