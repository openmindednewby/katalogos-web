import type { ReactElement, ReactNode } from 'react';

import { ScrollView, View, StyleSheet } from 'react-native';

import LandingFooter from './LandingFooter';
import LandingNavbar from './LandingNavbar';
import { useTheme } from '../../../theme/hooks/useTheme';

interface Props {
  children: ReactNode;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
});

/**
 * Shared layout wrapper for all landing pages.
 * Renders LandingNavbar at top, children in scrollable middle, LandingFooter at bottom.
 */
const LandingLayout = ({ children }: Props): ReactElement => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LandingNavbar />
      <ScrollView contentContainerStyle={styles.content}>
        {children}
        <LandingFooter />
      </ScrollView>
    </View>
  );
};

export default LandingLayout;
