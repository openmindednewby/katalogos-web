/** ScheduleEditor - Editor for menu time-based scheduling with HH:mm validation. */
import React, { useCallback, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { ScheduleEditorForm } from './ScheduleEditorForm';
import { scheduleEditorStyles as styles } from './scheduleEditorStyles';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { createDefaultSchedule, toggleDay } from '../utils/scheduleUtils';

import type { MenuSchedule } from '../../../types/menuTypes';

interface Props {
  schedule: MenuSchedule | null | undefined;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  textSecondary: string;
  errorColor: string;
  onSave: (schedule: MenuSchedule) => void;
  onRemove: () => void;
  isSaving?: boolean;
}

const ScheduleEditor: React.FC<Props> = ({
  schedule, borderColor, textColor, backgroundColor,
  primaryColor, textOnPrimary, textSecondary, errorColor, onSave, onRemove, isSaving,
}) => {
  const hasExisting = isValueDefined(schedule);
  const [local, setLocal] = useState<MenuSchedule>(hasExisting ? schedule : createDefaultSchedule());
  const [isEnabled, setIsEnabled] = useState(hasExisting);

  const handleToggle = useCallback(() => { setIsEnabled((p) => !p); }, []);
  const handleDay = useCallback((day: number) => {
    setLocal((p) => ({ ...p, scheduledDays: toggleDay(p.scheduledDays, day) }));
  }, []);
  const handleSave = useCallback(() => { onSave(local); }, [local, onSave]);

  return (
    <View style={[styles.container, { borderColor, backgroundColor }]} testID={TestIds.SCHEDULE_EDITOR}>
      <Text style={[styles.title, { color: textColor }]}>{FM('onlineMenus.schedule.title')}</Text>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.schedule.enableScheduleHint')}
        accessibilityLabel={FM('onlineMenus.schedule.enableSchedule')}
        accessibilityRole="switch"
        accessibilityState={{ checked: isEnabled }}
        style={[styles.btn, { backgroundColor: isEnabled ? primaryColor : borderColor }]}
        testID={TestIds.SCHEDULE_ENABLE_TOGGLE}
        onPress={handleToggle}
      >
        <Text style={[styles.btnText, { color: isEnabled ? textOnPrimary : textColor }]}>
          {FM('onlineMenus.schedule.enableSchedule')}
        </Text>
      </TouchableOpacity>
      {isEnabled ? (
        <ScheduleEditorForm
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          errorColor={errorColor}
          hasExisting={hasExisting}
          isSaving={isSaving === true}
          local={local}
          primaryColor={primaryColor}
          setLocal={setLocal}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          textSecondary={textSecondary}
          onDayToggle={handleDay}
          onRemove={onRemove}
          onSave={handleSave}
        />
      ) : null}
    </View>
  );
};

export default ScheduleEditor;
