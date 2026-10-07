import React from 'react';

import { useRouter } from 'expo-router';

import { FeedbackUiProvider } from '@dloizides/ui-feedback';

import { FM } from '../../localization/helpers';
import { useTheme } from '../../theme/hooks/useTheme';

import type { UiTheme } from '@dloizides/ui-feedback';

interface Props {
  children: React.ReactNode;
}

/** Adapts the app's local theme + i18n (+ router) to the injectable provider of */
const FeedbackUiAdapter = ({ children }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <FeedbackUiProvider
      navigate={(route) => { router.push(route); }}
      t={FM}
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ResolvedTheme is runtime-compatible with UiTheme; only the ColorScale index signature differs
      theme={theme as unknown as UiTheme}
    >
      {children}
    </FeedbackUiProvider>
  );
};

export default FeedbackUiAdapter;
