

/**
 * Brand color editor section with primary, secondary, and accent color inputs.
 */
import React, { useCallback } from 'react';

import { FM } from '@/localization/helpers';

import ColorInput from './ColorInput';
import { TestIds } from '../../../shared/testIds';
import Heading from '../../Shared/Heading';
import Section from '../../Shared/Section';
import { BrandColorField } from '../utils/BrandColorField';

import type { TenantThemeConfig } from '../../../theme/types';

interface Props {
  config: TenantThemeConfig;
  onChange: (field: BrandColorField, value: string) => void;
  disabled: boolean;
}

const BrandColorEditor = ({ config, onChange, disabled }: Props): React.ReactElement => {

  const handlePrimaryChange = useCallback(
    (val: string) => onChange(BrandColorField.Primary, val),
    [onChange],
  );
  const handleSecondaryChange = useCallback(
    (val: string) => onChange(BrandColorField.Secondary, val),
    [onChange],
  );
  const handleAccentChange = useCallback(
    (val: string) => onChange(BrandColorField.Accent, val),
    [onChange],
  );

  return (
    <Section>
      <Heading>{FM('tenantThemes.brandColors')}</Heading>
      <ColorInput
        disabled={disabled}
        label={FM('tenantThemes.primary')}
        testID={TestIds.TENANT_THEME_COLOR_PRIMARY}
        value={config.primary}
        onChangeText={handlePrimaryChange}
      />
      <ColorInput
        disabled={disabled}
        label={FM('tenantThemes.secondary')}
        testID={TestIds.TENANT_THEME_COLOR_SECONDARY}
        value={config.secondary}
        onChangeText={handleSecondaryChange}
      />
      <ColorInput
        disabled={disabled}
        label={FM('tenantThemes.accent')}
        testID={TestIds.TENANT_THEME_COLOR_ACCENT}
        value={config.accent}
        onChangeText={handleAccentChange}
      />
    </Section>
  );
};

export default BrandColorEditor;
