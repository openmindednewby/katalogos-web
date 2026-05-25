/** Attribution section for white-label settings (powered-by toggle). */
import React from 'react';

import { Switch, Text, View } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import Section from '../../../Shared/Section';
import { whiteLabelStyles } from '../styles';

import type { ThemeModeColors } from '../../../../theme/types/themeModeColors';

interface Props {
  showPoweredBy: boolean;
  colors: ThemeModeColors;
  onToggle: (value: boolean) => void;
}

const AttributionSection = ({ showPoweredBy, colors, onToggle }: Props): React.ReactElement => (
  <Section>
    <Text style={[whiteLabelStyles.sectionTitle, { color: colors.text }]}>
      {FM('settings.whiteLabel.attribution.heading')}
    </Text>
    <View style={whiteLabelStyles.toggleRow}>
      <Text style={[whiteLabelStyles.toggleLabel, { color: colors.text }]}>
        {FM('settings.whiteLabel.attribution.showPoweredBy')}
      </Text>
      <Switch
        accessibilityHint={FM('settings.whiteLabel.attribution.showPoweredByHint')}
        accessibilityLabel={FM('settings.whiteLabel.attribution.showPoweredBy')}
        testID={TestIds.WHITE_LABEL_POWERED_BY_TOGGLE}
        value={showPoweredBy}
        onValueChange={onToggle}
      />
    </View>
    <Text style={[whiteLabelStyles.toggleDescription, { color: colors.textSecondary }]}>
      {FM('settings.whiteLabel.attribution.showPoweredByDescription')}
    </Text>
  </Section>
);

export default AttributionSection;
