import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Title from './Title';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { FM } from '../../localization/helpers';
import { useTheme } from '../../theme/hooks/useTheme';

const CONTAINER_MARGIN_BOTTOM = 12;
const ACTIONS_GAP = 12;
const REFRESH_MARGIN_LEFT = 12;
const PHONE_TITLE_ACTIONS_GAP = 8;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: CONTAINER_MARGIN_BOTTOM,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACTIONS_GAP,
  },
  refreshButton: {
    marginLeft: REFRESH_MARGIN_LEFT,
  },
});

const phoneContainerStyle = {
  flexDirection: 'column' as const,
  alignItems: 'flex-start' as const,
  gap: PHONE_TITLE_ACTIONS_GAP,
};
const phoneActionsStyle = { flexWrap: 'wrap' as const };

interface Props {
  title: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshLabel?: string;
  refreshButtonTestId?: string;
  onAdd?: () => void;
  addLabel?: string;
  showAdd?: boolean;
  onCreatePress?: () => void;
  createButtonTestId?: string;
  children?: React.ReactNode;
}

const PageHeaderWithActions = ({
  title,
  onRefresh,
  refreshing = false,
  refreshLabel,
  refreshButtonTestId,
  onAdd,
  addLabel,
  showAdd = false,
  onCreatePress,
  createButtonTestId,
  children,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { isPhone } = useBreakpoint();

  const primaryColor = theme.palette.primary['500'];
  const resolvedRefreshLabel = refreshLabel ?? FM('common.refresh');
  const resolvedAddLabel = addLabel ?? FM('common.add');
  const refreshTextStyle = React.useMemo(
    () => ({ color: refreshing ? theme.colors.textSecondary : primaryColor }),
    [primaryColor, theme.colors.textSecondary, refreshing],
  );
  const addTextStyle = React.useMemo(() => ({ color: primaryColor }), [primaryColor]);

  const handleAddClick = onCreatePress ?? onAdd;
  const shouldShowAdd = showAdd || typeof onCreatePress === 'function';

  return (
    <View style={[styles.container, isPhone && phoneContainerStyle]}>
      <Title text={title} />

      <View style={[styles.actions, isPhone && phoneActionsStyle]}>
        {typeof onRefresh === 'function' && (
          <TouchableOpacity
            accessibilityHint={FM('common.refreshHint')}
            accessibilityLabel={resolvedRefreshLabel}
            accessibilityRole="button"
            disabled={refreshing}
            style={styles.refreshButton}
            testID={refreshButtonTestId}
            onPress={onRefresh}
          >
            <Text style={refreshTextStyle}>{resolvedRefreshLabel}</Text>
          </TouchableOpacity>
        )}

        {shouldShowAdd && typeof handleAddClick === 'function' ? (
          <TouchableOpacity
            accessibilityHint={FM('common.addHint')}
            accessibilityLabel={resolvedAddLabel}
            accessibilityRole="button"
            testID={createButtonTestId}
            onPress={handleAddClick}
          >
            <Text style={addTextStyle}>{resolvedAddLabel}</Text>
          </TouchableOpacity>
        ) : null}

        {children}
      </View>
    </View>
  );
};

export default PageHeaderWithActions;
