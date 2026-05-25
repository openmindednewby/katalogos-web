/**
 * Branding upload section for logo and favicon.
 * Displays current images and provides upload/remove actions.
 */
import React, { useMemo } from 'react';

import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { DISABLED_OPACITY } from '../../../../shared/constants';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';


interface Props {
  logoUrl: string | null;
  faviconUrl: string | null;
  onUploadLogo: () => void;
  onUploadFavicon: () => void;
  onRemoveLogo: () => void;
  onRemoveFavicon: () => void;
  disabled: boolean;
}

const LOGO_WIDTH = 160;
const LOGO_HEIGHT = 60;
const FAVICON_SIZE = 32;

const styles = StyleSheet.create({
  description: { fontSize: 13, marginBottom: 16 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  assetLabel: { fontSize: 14, fontWeight: '600', width: 80 },
  previewContainer: { alignItems: 'center', gap: 8 },
  logoPreview: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  faviconPreview: { width: FAVICON_SIZE, height: FAVICON_SIZE },
  noImage: { fontSize: 13, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: '500' },
  disabledButton: { opacity: DISABLED_OPACITY },
});

const BrandingUpload = ({
  logoUrl,
  faviconUrl,
  onUploadLogo,
  onUploadFavicon,
  onRemoveLogo,
  onRemoveFavicon,
  disabled,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primaryHex = theme.palette.primary['500'];

  const buttonStyle = useMemo(
    () => [styles.actionButton, { borderColor: primaryHex }],
    [primaryHex],
  );
  const buttonTextStyle = useMemo(
    () => [styles.actionText, { color: primaryHex }],
    [primaryHex],
  );
  const removeButtonStyle = useMemo(
    () => [styles.actionButton, { borderColor: theme.semantic.error['500'] }],
    [theme.semantic.error],
  );
  const removeTextStyle = useMemo(
    () => [styles.actionText, { color: theme.semantic.error['500'] }],
    [theme.semantic.error],
  );

  const hasLogo = isValueDefined(logoUrl) && logoUrl !== '';
  const hasFavicon = isValueDefined(faviconUrl) && faviconUrl !== '';

  return (
    <Section>
      <Heading>{FM('settings.themeSettings.branding')}</Heading>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {FM('settings.themeSettings.brandingDescription')}
      </Text>

      <View style={styles.assetRow} testID={`${TestIds.THEME_BRANDING_UPLOAD}-logo`}>
        <Text style={[styles.assetLabel, { color: colors.text }]}>
          {FM('settings.themeSettings.logo')}
        </Text>
        <View style={styles.previewContainer}>
          {hasLogo ? (
            <Image
              accessibilityIgnoresInvertColors
              accessibilityHint={FM('settings.themeSettings.logoPreviewHint')}
              accessibilityLabel={FM('settings.themeSettings.logoPreview')}
              resizeMode="contain"
              source={{ uri: logoUrl }}
              style={styles.logoPreview}
              testID={`${TestIds.THEME_BRANDING_UPLOAD}-logo-preview`}
            />
          ) : (
            <Text style={[styles.noImage, { color: colors.textSecondary }]}>
              {FM('settings.themeSettings.noLogo')}
            </Text>
          )}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              accessibilityHint={FM('settings.themeSettings.uploadLogoHint')}
              accessibilityLabel={FM('settings.themeSettings.uploadLogo')}
              accessibilityRole="button"
              disabled={disabled}
              style={[buttonStyle, disabled ? styles.disabledButton : undefined]}
              testID={`${TestIds.THEME_BRANDING_UPLOAD}-logo-upload`}
              onPress={onUploadLogo}
            >
              <Text style={buttonTextStyle}>{FM('settings.themeSettings.uploadLogo')}</Text>
            </TouchableOpacity>
            {hasLogo ? (
              <TouchableOpacity
                accessibilityHint={FM('settings.themeSettings.removeLogoHint')}
                accessibilityLabel={FM('settings.themeSettings.removeLogo')}
                accessibilityRole="button"
                disabled={disabled}
                style={[removeButtonStyle, disabled ? styles.disabledButton : undefined]}
                testID={`${TestIds.THEME_BRANDING_UPLOAD}-logo-remove`}
                onPress={onRemoveLogo}
              >
                <Text style={removeTextStyle}>{FM('settings.themeSettings.removeLogo')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.assetRow} testID={`${TestIds.THEME_BRANDING_UPLOAD}-favicon`}>
        <Text style={[styles.assetLabel, { color: colors.text }]}>
          {FM('settings.themeSettings.uploadFavicon')}
        </Text>
        <View style={styles.previewContainer}>
          {hasFavicon ? (
            <Image
              accessibilityIgnoresInvertColors
              accessibilityHint={FM('settings.themeSettings.uploadFaviconHint')}
              accessibilityLabel={FM('settings.themeSettings.uploadFavicon')}
              resizeMode="contain"
              source={{ uri: faviconUrl }}
              style={styles.faviconPreview}
              testID={`${TestIds.THEME_BRANDING_UPLOAD}-favicon-preview`}
            />
          ) : (
            <Text style={[styles.noImage, { color: colors.textSecondary }]}>
              {FM('settings.themeSettings.noLogo')}
            </Text>
          )}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              accessibilityHint={FM('settings.themeSettings.uploadFaviconHint')}
              accessibilityLabel={FM('settings.themeSettings.uploadFavicon')}
              accessibilityRole="button"
              disabled={disabled}
              style={[buttonStyle, disabled ? styles.disabledButton : undefined]}
              testID={`${TestIds.THEME_BRANDING_UPLOAD}-favicon-upload`}
              onPress={onUploadFavicon}
            >
              <Text style={buttonTextStyle}>{FM('settings.themeSettings.uploadFavicon')}</Text>
            </TouchableOpacity>
            {hasFavicon ? (
              <TouchableOpacity
                accessibilityHint={FM('settings.themeSettings.removeFaviconHint')}
                accessibilityLabel={FM('settings.themeSettings.removeFavicon')}
                accessibilityRole="button"
                disabled={disabled}
                style={[removeButtonStyle, disabled ? styles.disabledButton : undefined]}
                testID={`${TestIds.THEME_BRANDING_UPLOAD}-favicon-remove`}
                onPress={onRemoveFavicon}
              >
                <Text style={removeTextStyle}>{FM('settings.themeSettings.removeFavicon')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Section>
  );
};

export default BrandingUpload;
