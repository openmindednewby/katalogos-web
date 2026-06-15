import React from 'react';

import { useRouter } from 'expo-router';

import { FeedbackUiProvider } from '@dloizides/ui-feedback';

import { FM } from '../../localization/helpers';
import { useTheme } from '../../theme/hooks/useTheme';

interface Props {
  children: React.ReactNode;
}

/**
 * Adapts the app's local theme + i18n (+ router) to the injectable provider of
 * @dloizides/ui-feedback. Mount once, below ThemeProvider.
 */
const FeedbackUiAdapter = ({ children }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <FeedbackUiProvider navigate={(route) => { router.push(route); }} t={FM} theme={theme}>
      {children}
    </FeedbackUiProvider>
  );
};

export default FeedbackUiAdapter;
