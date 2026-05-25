

/**
 * GlobalStylingTab - Unified tabbed interface for all global menu styling options.
 *
 * Combines Layout, Colors, Typography, Media, Header, and Spacing editors with
 * collapsible sections for better UX.
 */
import React, { useCallback, useState } from 'react';

import { Pressable, ScrollView, Text, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import CollapsibleSection from './CollapsibleSection';
import ColorSchemeEditor from './ColorSchemeEditor';
import HeaderEditor from './HeaderEditor';
import LayoutTemplateSelector from './LayoutTemplateSelector';
import MediaPositionEditor from './MediaPositionEditor';
import SpacingEditor from './SpacingEditor';
import TypographyEditor from './TypographyEditor';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import LayoutTemplate from '../../../../types/enums/LayoutTemplate';
import MediaFit from '../../../../types/enums/MediaFit';
import MediaPosition from '../../../../types/enums/MediaPosition';
import MediaSize from '../../../../types/enums/MediaSize';
import { globalStylingTabStyles as styles } from '../utils/globalStylingTabStyles';


import type { RootState } from '../../../../store/reduxStore';
import type { HeaderSettings, MediaSettings } from '../../../../types/menuStyleTypes';
import type { MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  value: MenuContents;
  onChange: (value: MenuContents) => void;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const TAB_LAYOUT = 'layout';
const TAB_COLORS = 'colors';
const TAB_TYPOGRAPHY = 'typography';
const TAB_MEDIA = 'media';
const TAB_HEADER = 'header';
const TAB_SPACING = 'spacing';

const TAB_BUTTONS = [
  { value: TAB_LAYOUT, label: 'Layout' },
  { value: TAB_COLORS, label: 'Colors' },
  { value: TAB_TYPOGRAPHY, label: 'Type' },
  { value: TAB_MEDIA, label: 'Media' },
  { value: TAB_HEADER, label: 'Header' },
  { value: TAB_SPACING, label: 'Spacing' },
];

// =============================================================================
// Component
// =============================================================================

const GlobalStylingTab: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const [activeTab, setActiveTab] = useState<string>(TAB_LAYOUT);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([TAB_LAYOUT]));

  const textColor = String(colors.text);
  const surfaceColor = String(colors.surface);
  const borderColor = String(colors.border);
  const primaryColor = String(colors.primary);
  const textOnPrimary = String(colors.textOnPrimary);

  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    setExpandedSections((prev) => new Set(prev).add(newTab));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleLayoutChange = useCallback(
    (template: LayoutTemplate) => {
      onChange({ ...value, layout: { ...value.layout, template } });
    },
    [onChange, value],
  );

  const handleColorSchemeChange = useCallback(
    (colorScheme: MenuContents['colorScheme']) => onChange({ ...value, colorScheme }),
    [onChange, value],
  );

  const handleTypographyChange = useCallback(
    (typography: MenuContents['typography']) => onChange({ ...value, typography }),
    [onChange, value],
  );

  const handleMediaChange = useCallback(
    (mediaSettings: MediaSettings) => {
      onChange({ ...value, defaultMediaSettings: mediaSettings });
    },
    [onChange, value],
  );

  const handleSpacingChange = useCallback(
    (spacing: MenuContents['spacing']) => onChange({ ...value, spacing }),
    [onChange, value],
  );

  const handleHeaderChange = useCallback(
    (header: HeaderSettings) => onChange({ ...value, header }),
    [onChange, value],
  );

  const sectionProps = { disabled, textColor, surfaceColor, borderColor };
  const mediaDefaults = { position: MediaPosition.Left, size: MediaSize.Medium, fit: MediaFit.Cover };

  return (
    <View style={styles.container} testID={TestIds.GLOBAL_STYLING_TAB}>
      <View style={styles.tabContainer}>
        <ScrollView horizontal contentContainerStyle={styles.tabScrollContent} showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
          {TAB_BUTTONS.map((tab) => {
            const isSelected = tab.value === activeTab;
            return (
              <Pressable
                key={tab.value}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.tabButton,
                  { backgroundColor: isSelected ? primaryColor : surfaceColor, borderColor },
                  isSelected && styles.tabButtonSelected,
                ]}
                testID={`tab-${tab.value}`}
                onPress={() => handleTabChange(tab.value)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: isSelected ? textOnPrimary : textColor },
                    isSelected && styles.tabButtonTextSelected,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {activeTab === TAB_LAYOUT && (
        <CollapsibleSection {...sectionProps} isExpanded={expandedSections.has(TAB_LAYOUT)} testId={TestIds.GLOBAL_STYLING_TAB_LAYOUT} title={FM('globalStyling.layout')} onToggle={() => toggleSection(TAB_LAYOUT)}>
          <LayoutTemplateSelector disabled={disabled} value={value.layout?.template ?? LayoutTemplate.ModernGrid} onChange={handleLayoutChange} />
        </CollapsibleSection>
      )}

      {activeTab === TAB_COLORS && (
        <CollapsibleSection {...sectionProps} isExpanded={expandedSections.has(TAB_COLORS)} testId={TestIds.GLOBAL_STYLING_TAB_COLORS} title={FM('globalStyling.colors')} onToggle={() => toggleSection(TAB_COLORS)}>
          <ColorSchemeEditor disabled={disabled} value={value.colorScheme ?? {}} onChange={handleColorSchemeChange} />
        </CollapsibleSection>
      )}

      {activeTab === TAB_TYPOGRAPHY && (
        <CollapsibleSection {...sectionProps} isExpanded={expandedSections.has(TAB_TYPOGRAPHY)} testId={TestIds.GLOBAL_STYLING_TAB_TYPOGRAPHY} title={FM('globalStyling.typography')} onToggle={() => toggleSection(TAB_TYPOGRAPHY)}>
          <TypographyEditor disabled={disabled} value={value.typography ?? {}} onChange={handleTypographyChange} />
        </CollapsibleSection>
      )}

      {activeTab === TAB_MEDIA && (
        <CollapsibleSection {...sectionProps} isExpanded={expandedSections.has(TAB_MEDIA)} testId={TestIds.GLOBAL_STYLING_TAB_MEDIA} title={FM('globalStyling.media')} onToggle={() => toggleSection(TAB_MEDIA)}>
          <MediaPositionEditor disabled={disabled} value={{ ...mediaDefaults, ...value.defaultMediaSettings }} onChange={handleMediaChange} />
        </CollapsibleSection>
      )}

      {activeTab === TAB_HEADER && (
        <CollapsibleSection {...sectionProps} isExpanded={expandedSections.has(TAB_HEADER)} testId={TestIds.GLOBAL_STYLING_TAB_HEADER} title={FM('globalStyling.header')} onToggle={() => toggleSection(TAB_HEADER)}>
          <HeaderEditor disabled={disabled} value={value.header ?? {}} onChange={handleHeaderChange} />
        </CollapsibleSection>
      )}

      {activeTab === TAB_SPACING && (
        <CollapsibleSection {...sectionProps} isExpanded={expandedSections.has(TAB_SPACING)} testId={TestIds.GLOBAL_STYLING_TAB_SPACING} title={FM('globalStyling.spacing')} onToggle={() => toggleSection(TAB_SPACING)}>
          <SpacingEditor disabled={disabled} value={value.spacing ?? {}} onChange={handleSpacingChange} />
        </CollapsibleSection>
      )}
    </View>
  );
};

export default GlobalStylingTab;

export { TAB_LAYOUT, TAB_COLORS, TAB_TYPOGRAPHY, TAB_MEDIA, TAB_HEADER, TAB_SPACING, TAB_BUTTONS };
