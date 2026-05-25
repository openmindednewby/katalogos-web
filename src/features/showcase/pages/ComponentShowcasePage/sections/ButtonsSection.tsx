/**
 * Buttons components showcase section.
 * Demonstrates: Button (all variants/sizes/states), SaveButton, CancelButton.
 */
import type { ReactElement } from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import CancelButton from '../../../../../components/Buttons/CancelButton';
import SaveButton from '../../../../../components/Buttons/SaveButton';
import { Button, ButtonVariant, ButtonSize } from '../../../../../components/core/Button';
import ComponentCard from '../ComponentCard';

const VARIANT_GAP = 8;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: VARIANT_GAP },
  rowSpaced: { flexDirection: 'row', flexWrap: 'wrap', gap: VARIANT_GAP, marginBottom: VARIANT_GAP },
});

function handleNoOp(): void {
  // intentional no-op for demo
}

const ButtonsSection = (): ReactElement => (
  <div>
    <ComponentCard
      descriptionKey="showcase.componentButtonDesc"
      importPath="@/components/core/Button"
      nameKey="showcase.componentButton"
    >
      <View style={styles.rowSpaced}>
        <Button
          accessibilityHint={FM('showcase.variantPrimary')}
          accessibilityLabel={FM('showcase.variantPrimary')}
          label={FM('showcase.variantPrimary')}
          testID="demo-btn-primary"
          variant={ButtonVariant.Primary}
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.variantSecondary')}
          accessibilityLabel={FM('showcase.variantSecondary')}
          label={FM('showcase.variantSecondary')}
          testID="demo-btn-secondary"
          variant={ButtonVariant.Secondary}
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.variantOutline')}
          accessibilityLabel={FM('showcase.variantOutline')}
          label={FM('showcase.variantOutline')}
          testID="demo-btn-outline"
          variant={ButtonVariant.Outline}
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.variantGhost')}
          accessibilityLabel={FM('showcase.variantGhost')}
          label={FM('showcase.variantGhost')}
          testID="demo-btn-ghost"
          variant={ButtonVariant.Ghost}
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.variantDanger')}
          accessibilityLabel={FM('showcase.variantDanger')}
          label={FM('showcase.variantDanger')}
          testID="demo-btn-danger"
          variant={ButtonVariant.Danger}
          onPress={handleNoOp}
        />
      </View>

      <View style={styles.rowSpaced}>
        <Button
          accessibilityHint={FM('showcase.optionSmall')}
          accessibilityLabel={FM('showcase.optionSmall')}
          label={FM('showcase.optionSmall')}
          size={ButtonSize.Small}
          testID="demo-btn-sm"
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.optionMedium')}
          accessibilityLabel={FM('showcase.optionMedium')}
          label={FM('showcase.optionMedium')}
          size={ButtonSize.Medium}
          testID="demo-btn-md"
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.optionLarge')}
          accessibilityLabel={FM('showcase.optionLarge')}
          label={FM('showcase.optionLarge')}
          size={ButtonSize.Large}
          testID="demo-btn-lg"
          onPress={handleNoOp}
        />
      </View>

      <View style={styles.row}>
        <Button
          disabled
          accessibilityHint={FM('showcase.stateDisabled')}
          accessibilityLabel={FM('showcase.stateDisabled')}
          label={FM('showcase.stateDisabled')}
          testID="demo-btn-disabled"
          onPress={handleNoOp}
        />
        <Button
          loading
          accessibilityHint={FM('showcase.stateLoading')}
          accessibilityLabel={FM('showcase.stateLoading')}
          label={FM('showcase.stateLoading')}
          testID="demo-btn-loading"
          onPress={handleNoOp}
        />
        <Button
          accessibilityHint={FM('showcase.variantPrimary')}
          accessibilityLabel={FM('showcase.variantPrimary')}
          icon="edit"
          label={FM('showcase.variantPrimary')}
          testID="demo-btn-icon"
          onPress={handleNoOp}
        />
      </View>
    </ComponentCard>

    <ComponentCard
      descriptionKey="showcase.componentSaveButtonDesc"
      importPath="@/components/Buttons/SaveButton"
      nameKey="showcase.componentSaveButton"
    >
      <View style={styles.row}>
        <SaveButton testID="demo-save" title={FM('common.save')} onPress={handleNoOp} />
        <SaveButton disabled testID="demo-save-disabled" title={FM('showcase.stateDisabled')} />
      </View>
    </ComponentCard>

    <ComponentCard
      descriptionKey="showcase.componentCancelButtonDesc"
      importPath="@/components/Buttons/CancelButton"
      nameKey="showcase.componentCancelButton"
    >
      <CancelButton testID="demo-cancel" title={FM('common.cancel')} onPress={handleNoOp} />
    </ComponentCard>
  </div>
);

export default ButtonsSection;
