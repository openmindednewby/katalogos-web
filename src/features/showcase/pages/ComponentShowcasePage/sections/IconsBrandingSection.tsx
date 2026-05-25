/**
 * Icons & Branding components showcase section.
 * Demonstrates: SvgIcon (all available icons), TenantLogo.
 */
import type { ReactElement } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import TenantLogo from '../../../../../components/core/TenantLogo';
import SvgIcon from '../../../../../components/Icons/SvgIcon';
import { useTheme } from '../../../../../theme/hooks/useTheme';
import ComponentCard from '../ComponentCard';

import type { IconName } from '../../../../../components/Icons/iconPaths';

const ICON_SIZE = 24;
const ICON_GAP = 12;
const LABEL_FONT_SIZE = 10;
const ICON_CELL_WIDTH = 56;
const LABEL_MARGIN_TOP = 4;
const DESC_MARGIN_TOP = 8;

const styles = StyleSheet.create({
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ICON_GAP },
  iconCell: { alignItems: 'center', width: ICON_CELL_WIDTH },
  iconLabel: { fontSize: LABEL_FONT_SIZE, marginTop: LABEL_MARGIN_TOP },
  logoDesc: { fontSize: LABEL_FONT_SIZE, marginTop: DESC_MARGIN_TOP },
});

/** Representative sample of icons to display in the showcase. */
const SAMPLE_ICONS: IconName[] = [
  'home', 'menu', 'close', 'edit', 'trash', 'eye', 'link', 'refresh',
  'bell', 'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight',
  'grid', 'list', 'document', 'checkmark', 'settings', 'shield',
  'qrCode', 'download', 'copy', 'code', 'lightning', 'building',
];

const IconsBrandingSection = (): ReactElement => {
  const { theme } = useTheme();

  return (
    <div>
      <ComponentCard
        descriptionKey="showcase.componentSvgIconDesc"
        importPath="@/components/Icons/SvgIcon"
        nameKey="showcase.componentSvgIcon"
      >
        <View style={styles.iconGrid}>
          {SAMPLE_ICONS.map((name) => (
            <View key={name} style={styles.iconCell}>
              <SvgIcon color={theme.colors.text} name={name} size={ICON_SIZE} />
              <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentTenantLogoDesc"
        importPath="@/components/core/TenantLogo"
        nameKey="showcase.componentTenantLogo"
      >
        <TenantLogo />
        <Text style={[styles.logoDesc, { color: theme.colors.textSecondary }]}>
          {FM('showcase.componentTenantLogoDesc')}
        </Text>
      </ComponentCard>
    </div>
  );
};

export default IconsBrandingSection;
