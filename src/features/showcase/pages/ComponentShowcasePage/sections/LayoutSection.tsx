/**
 * Layout components showcase section.
 * Demonstrates: Section, Heading, Title, PageHeaderWithActions, ActionRow.
 */
import type { ReactElement } from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { ActionRow } from '../../../../../components/core/ActionRow';
import { Button, ButtonVariant } from '../../../../../components/core/Button';
import Heading from '../../../../../components/Shared/Heading';
import PageHeaderWithActions from '../../../../../components/Shared/PageHeaderWithActions';
import Section from '../../../../../components/Shared/Section';
import Title from '../../../../../components/Shared/Title';
import ComponentCard from '../ComponentCard';

const SECTION_PADDING = 12;

const styles = StyleSheet.create({
  sectionContent: { padding: SECTION_PADDING },
});

function handleNoOp(): void {
  // intentional no-op for demo
}

const LayoutSection = (): ReactElement => (
  <div>
    <ComponentCard
      descriptionKey="showcase.componentSectionDesc"
      importPath="@/components/Shared/Section"
      nameKey="showcase.componentSection"
    >
      <Section>
        <View style={styles.sectionContent}>
          <Heading text={FM('showcase.sampleText')} />
        </View>
      </Section>
    </ComponentCard>

    <ComponentCard
      descriptionKey="showcase.componentHeadingDesc"
      importPath="@/components/Shared/Heading"
      nameKey="showcase.componentHeading"
    >
      <Heading text={FM('showcase.sampleHeading')} />
    </ComponentCard>

    <ComponentCard
      descriptionKey="showcase.componentTitleDesc"
      importPath="@/components/Shared/Title"
      nameKey="showcase.componentTitle"
    >
      <Title text={FM('showcase.sampleTitle')} />
    </ComponentCard>

    <ComponentCard
      descriptionKey="showcase.componentPageHeaderDesc"
      importPath="@/components/Shared/PageHeaderWithActions"
      nameKey="showcase.componentPageHeader"
    >
      <PageHeaderWithActions
        showAdd
        refreshButtonTestId="demo-refresh"
        title={FM('showcase.samplePageHeader')}
        onAdd={handleNoOp}
        onRefresh={handleNoOp}
      />
    </ComponentCard>

    <ComponentCard
      descriptionKey="showcase.componentActionRowDesc"
      importPath="@/components/core/ActionRow"
      nameKey="showcase.componentActionRow"
    >
      <ActionRow>
        <Button
          accessibilityHint={FM('showcase.variantPrimary')}
          accessibilityLabel={FM('showcase.variantPrimary')}
          label={FM('showcase.variantPrimary')}
          testID="demo-btn-1"
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.variantSecondary')}
          accessibilityLabel={FM('showcase.variantSecondary')}
          label={FM('showcase.variantSecondary')}
          testID="demo-btn-2"
          variant={ButtonVariant.Secondary}
          onPress={handleNoOp}
        />
      </ActionRow>
    </ComponentCard>
  </div>
);

export default LayoutSection;
