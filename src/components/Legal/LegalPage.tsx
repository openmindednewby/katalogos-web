import type { ReactElement } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FM } from '../../localization/helpers';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import { LandingLayout } from '../Landing';
import {
  LANDING_MAX_WIDTH,
  LANDING_SECTION_PADDING_HORIZONTAL,
  LANDING_SECTION_PADDING_VERTICAL,
} from '../Landing/constants';
import { SEOHead } from '../Shared/SEOHead';
import LegalSection from './components/LegalSection';

const TITLE_FONT_SIZE = 32;
const TITLE_MARGIN_BOTTOM = 8;
const UPDATED_FONT_SIZE = 13;
const UPDATED_MARGIN_BOTTOM = 32;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    paddingVertical: LANDING_SECTION_PADDING_VERTICAL,
  },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', marginBottom: TITLE_MARGIN_BOTTOM, letterSpacing: -0.5 },
  lastUpdated: { fontSize: UPDATED_FONT_SIZE, marginBottom: UPDATED_MARGIN_BOTTOM },
});

interface Props {
  titleKey: string;
  lastUpdatedKey: string;
  lastUpdatedDate: string;
  sectionsKeyPrefix: string;
  seoDescriptionKey?: string;
  sectionIds: readonly string[];
  testID: string;
}

/** Full-page legal renderer. */
const LegalPage = ({
  titleKey,
  lastUpdatedKey,
  lastUpdatedDate,
  sectionsKeyPrefix,
  seoDescriptionKey,
  sectionIds,
  testID,
}: Props): ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const description = isValueDefined(seoDescriptionKey) ? FM(seoDescriptionKey) : FM(titleKey);

  return (
    <LandingLayout>
      <SEOHead noIndex description={description} title={FM(titleKey)} />
      <ScrollView style={styles.scroll}>
        <View style={styles.inner} testID={testID}>
          <Text style={[styles.title, { color: colors.text }]}>{FM(titleKey)}</Text>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            {FM(lastUpdatedKey, lastUpdatedDate)}
          </Text>

          {sectionIds.map((sectionId) => (
            <LegalSection
              key={sectionId}
              body={FM(`${sectionsKeyPrefix}.${sectionId}.body`)}
              title={FM(`${sectionsKeyPrefix}.${sectionId}.title`)}
            />
          ))}
        </View>
      </ScrollView>
    </LandingLayout>
  );
};

export default LegalPage;
