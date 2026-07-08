import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import WizardProgressBar from '@/components/Dashboard/components/WizardProgressBar';
import type { WelcomeWizardState } from '@/features/dashboard/hooks/useWelcomeWizard';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import WizardStep from '@/shared/enums/WizardStep';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import {
  CompletedContent,
  Step1Content,
  Step2Content,
  Step3Content,
} from './WizardStepContent';



type WizardState = WelcomeWizardState;

interface Props {
  wizard: WizardState;
}

const CARD_MAX_WIDTH = 500;
const CARD_PADDING = 32;
const CARD_BORDER_RADIUS = 16;
const BORDER_WIDTH = 1;
const PHONE_PADDING = 16;

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: CARD_PADDING },
  card: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
  },
});

const WelcomeWizard = ({ wizard }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const { isPhone } = useBreakpoint();
  const phoneWrapperStyle = isPhone ? { padding: PHONE_PADDING } : undefined;
  const router = useRouter();

  // P1-08: finishing the first-run wizard drops the new owner straight into the
  // menu editor (with their starter menu), not the empty-ish dashboard. Wrapping
  // handleComplete here keeps the navigation side-effect in the container (the
  // wizard hook is at its line budget and owns state/logic, not routing).
  const wizardWithExit = useMemo<WizardState>(
    () => ({ ...wizard, handleComplete: () => { wizard.handleComplete(); router.push('/menus'); } }),
    [wizard, router],
  );

  return (
    <View
      style={[styles.wrapper, { backgroundColor: colors.background }, phoneWrapperStyle]}
      testID={TestIds.WELCOME_WIZARD}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {wizard.step !== WizardStep.Completed && <WizardProgressBar step={wizard.step} />}

        <View testID={TestIds.WELCOME_WIZARD_STEP}>
          {wizard.step === WizardStep.BusinessName && <Step1Content colors={colors} primary={primary} wizard={wizardWithExit} />}
          {wizard.step === WizardStep.Logo && <Step2Content colors={colors} primary={primary} wizard={wizardWithExit} />}
          {wizard.step === WizardStep.CreateMenu && <Step3Content colors={colors} primary={primary} wizard={wizardWithExit} />}
          {wizard.step === WizardStep.Completed && <CompletedContent colors={colors} primary={primary} wizard={wizardWithExit} />}
        </View>
      </View>
    </View>
  );
};

export default WelcomeWizard;
