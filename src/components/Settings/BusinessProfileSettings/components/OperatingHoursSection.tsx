import React from 'react';

import { StyleSheet, Text } from 'react-native';

import DayHoursRow from './DayHoursRow';
import { FM } from '../../../../localization/helpers';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import { TITLE_FONT_SIZE, TITLE_FONT_WEIGHT, MEDIUM_SPACING } from '../constants';

import type DayOfWeek from '../../../../shared/enums/DayOfWeek';
import type { DayHours } from '../hooks/useOperatingHours';

const styles = StyleSheet.create({
  sectionTitle: { fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT, marginBottom: MEDIUM_SPACING },
});

interface Props {
  readonly hours: readonly DayHours[];
  readonly onToggleClosed: (day: DayOfWeek) => void;
  readonly onOpenTimeChange: (day: DayOfWeek, time: string) => void;
  readonly onCloseTimeChange: (day: DayOfWeek, time: string) => void;
}

const OperatingHoursSection = ({
  hours,
  onToggleClosed,
  onOpenTimeChange,
  onCloseTimeChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.businessProfile.hours.heading')}
      </Text>

      {hours.map(entry => (
        <DayHoursRow
          key={entry.day}
          closeTime={entry.close}
          day={entry.day}
          isClosed={entry.isClosed}
          openTime={entry.open}
          onCloseTimeChange={onCloseTimeChange}
          onOpenTimeChange={onOpenTimeChange}
          onToggleClosed={onToggleClosed}
        />
      ))}
    </Section>
  );
};

export default OperatingHoursSection;
