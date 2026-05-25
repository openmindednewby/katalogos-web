/**
 * Inputs & Forms components showcase section.
 * Demonstrates: Checkbox, ChoicePill, FormField, FormSwitch, ChipSelector, FormActions.
 */
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { ChipSelector } from '../../../../../components/Forms/ChipSelector';
import { FormActions } from '../../../../../components/Forms/FormActions';
import { FormField } from '../../../../../components/Forms/FormField';
import { FormSwitch } from '../../../../../components/Forms/FormSwitch';
import Checkbox from '../../../../../components/Shared/Checkbox';
import ChoicePill from '../../../../../components/Shared/ChoicePill';
import ComponentCard from '../ComponentCard';

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row' },
});

function handleNoOp(): void {
  // intentional no-op for demo
}

const InputsSection = (): ReactElement => {
  const chipOptions = [
    { value: 'sm', label: FM('showcase.optionSmall') },
    { value: 'md', label: FM('showcase.optionMedium') },
    { value: 'lg', label: FM('showcase.optionLarge') },
  ];

  const [checked, setChecked] = useState(false);
  const [selectedPill, setSelectedPill] = useState(0);
  const [switchValue, setSwitchValue] = useState(true);
  const [chipValue, setChipValue] = useState('md');

  const handleCheck = useCallback(() => {
    setChecked((prev) => !prev);
  }, []);

  const handlePillA = useCallback(() => setSelectedPill(0), []);
  const handlePillB = useCallback(() => setSelectedPill(1), []);
  const handlePillC = useCallback(() => setSelectedPill(2), []);

  const handleSwitchChange = useCallback((val: boolean) => {
    setSwitchValue(val);
  }, []);

  const handleChipChange = useCallback((val: string) => {
    setChipValue(val);
  }, []);

  return (
    <div>
      <ComponentCard
        descriptionKey="showcase.componentCheckboxDesc"
        importPath="@/components/Shared/Checkbox"
        nameKey="showcase.componentCheckbox"
      >
        <Checkbox
          isChecked={checked}
          label={FM('showcase.sampleSwitchLabel')}
          testID="demo-checkbox"
          onPress={handleCheck}
        />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentChoicePillDesc"
        importPath="@/components/Shared/ChoicePill"
        nameKey="showcase.componentChoicePill"
      >
        <View style={styles.pillRow}>
          <ChoicePill
            label={FM('showcase.pillOptionA')}
            selected={selectedPill === 0}
            testID="demo-pill-a"
            onPress={handlePillA}
          />
          <ChoicePill
            label={FM('showcase.pillOptionB')}
            selected={selectedPill === 1}
            testID="demo-pill-b"
            onPress={handlePillB}
          />
          <ChoicePill
            label={FM('showcase.pillOptionC')}
            selected={selectedPill === 2}
            testID="demo-pill-c"
            onPress={handlePillC}
          />
        </View>
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentFormFieldDesc"
        importPath="@/components/Forms/FormField"
        nameKey="showcase.componentFormField"
      >
        <FormField
          required
          label={FM('showcase.sampleFormLabel')}
          placeholder={FM('showcase.sampleFormPlaceholder')}
        />
        <FormField
          error={FM('showcase.sampleFormError')}
          label={FM('showcase.sampleFormLabel')}
          placeholder={FM('showcase.sampleFormPlaceholder')}
        />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentFormSwitchDesc"
        importPath="@/components/Forms/FormSwitch"
        nameKey="showcase.componentFormSwitch"
      >
        <FormSwitch
          description={FM('showcase.sampleSwitchDescription')}
          label={FM('showcase.sampleSwitchLabel')}
          testID="demo-switch"
          value={switchValue}
          onValueChange={handleSwitchChange}
        />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentChipSelectorDesc"
        importPath="@/components/Forms/ChipSelector"
        nameKey="showcase.componentChipSelector"
      >
        <ChipSelector
          label={FM('showcase.optionMedium')}
          options={chipOptions}
          value={chipValue}
          onChange={handleChipChange}
        />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentFormActionsDesc"
        importPath="@/components/Forms/FormActions"
        nameKey="showcase.componentFormActions"
      >
        <FormActions
          cancelLabel={FM('common.cancel')}
          saveLabel={FM('common.save')}
          onCancel={handleNoOp}
          onSave={handleNoOp}
        />
      </ComponentCard>
    </div>
  );
};

export default InputsSection;
