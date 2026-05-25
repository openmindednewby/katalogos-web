/**
 * ExperimentListScreen -- main screen listing all A/B test experiments.
 * Gated to Enterprise tier via useSubscription.
 */
import React, { useCallback, useState } from 'react';

import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native';

import { experimentStyles } from './styles';
import { useSubscription } from '../../lib/subscription/hooks/useSubscription';
import SubscriptionTier from '../../lib/subscription/utils/SubscriptionTier';
import { FM } from '../../localization/helpers';
import { useListExperiments } from '../../server/customHooks/experiments/useListExperiments';
import { useMenuOptions } from '../../server/customHooks/experiments/useMenuOptions';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import { Button } from '../core/Button';
import ButtonVariant from '../core/Button/utils/ButtonVariant';
import Breadcrumb from '../Shared/Breadcrumb';
import EmptyListState from '../Shared/EmptyListState';
import Heading from '../Shared/Heading';
import Section from '../Shared/Section';
import UpgradePrompt from '../Shared/UpgradePrompt';
import CreateExperimentModal from './components/CreateExperimentModal';
import ExperimentDetailView from './components/ExperimentDetailView';
import ExperimentStatusBadge from './components/ExperimentStatusBadge';

import type { ExperimentDto } from '../../server/customHooks/experiments/types';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const ExperimentListScreen = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];
  const { isEnterpriseTier, tier } = useSubscription();
  const { data, isLoading, isError } = useListExperiments(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
  const { menus: menuOptions, isLoading: menusLoading } = useMenuOptions();

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreate = useCallback(() => { setIsCreateVisible(true); }, []);
  const handleCloseCreate = useCallback(() => { setIsCreateVisible(false); }, []);
  const handleSelectExperiment = useCallback((id: string) => { setSelectedId(id); }, []);
  const handleBackToList = useCallback(() => { setSelectedId(null); }, []);

  if (!isEnterpriseTier)
    return (
      <View style={[experimentStyles.container, { backgroundColor: colors.background }]} testID={TestIds.EXPERIMENT_LIST_SCREEN}>
        <ScrollView contentContainerStyle={experimentStyles.scrollContent}>
          <Breadcrumb />
          <Heading>{FM('experiments.title')}</Heading>
          <Text style={[experimentStyles.description, { color: colors.textSecondary }]}>
            {FM('experiments.description')}
          </Text>
          <Section>
            <UpgradePrompt currentTier={tier} requiredTier={SubscriptionTier.Enterprise} />
          </Section>
        </ScrollView>
      </View>
    );

  if (isValueDefined(selectedId))
    return (
      <View style={[experimentStyles.container, { backgroundColor: colors.background }]} testID={TestIds.EXPERIMENT_LIST_SCREEN}>
        <ExperimentDetailView experimentId={selectedId} onBack={handleBackToList} />
      </View>
    );

  if (isLoading)
    return (
      <View style={[experimentStyles.container, { backgroundColor: colors.background }]} testID={TestIds.EXPERIMENT_LIST_LOADING}>
        <ActivityIndicator color={primary} size="large" />
      </View>
    );

  if (isError)
    return (
      <View style={[experimentStyles.container, { backgroundColor: colors.background }]} testID={TestIds.EXPERIMENT_LIST_ERROR}>
        <Text style={[experimentStyles.description, { color: errorColor }]}>{FM('experiments.errors.loadFailed')}</Text>
      </View>
    );

  const items = data?.items ?? [];

  const renderItem = ({ item }: { item: ExperimentDto }): React.ReactElement => (
    <View style={[experimentStyles.card, { borderColor: colors.border, backgroundColor: colors.surface }]} testID={TestIds.EXPERIMENT_CARD}>
      <View style={experimentStyles.cardHeader}>
        <Text style={[experimentStyles.cardName, { color: colors.text }]} testID={TestIds.EXPERIMENT_CARD_NAME}>
          {item.name}
        </Text>
        <ExperimentStatusBadge status={item.status} />
      </View>
      <Text style={[experimentStyles.cardMenuLabel, { color: colors.textSecondary }]} testID={TestIds.EXPERIMENT_CARD_MENU_NAME}>
        {FM('experiments.card.menuLabel')}: {item.menuName}
      </Text>
      <Button
        accessibilityHint={FM('experiments.card.viewDetailsHint')}
        accessibilityLabel={FM('experiments.card.viewDetails')}
        label={FM('experiments.card.viewDetails')}
        testID={TestIds.EXPERIMENT_CARD_VIEW_BUTTON}
        variant={ButtonVariant.Primary}
        onPress={() => handleSelectExperiment(item.id)}
      />
    </View>
  );

  return (
    <View style={[experimentStyles.container, { backgroundColor: colors.background }]} testID={TestIds.EXPERIMENT_LIST_SCREEN}>
      <Breadcrumb />
      <Heading>{FM('experiments.title')}</Heading>
      <Text style={[experimentStyles.description, { color: colors.textSecondary }]}>
        {FM('experiments.description')}
      </Text>

      <View style={experimentStyles.createButtonWrapper}>
        <Button
          accessibilityHint={FM('experiments.createButtonHint')}
          accessibilityLabel={FM('experiments.createButton')}
          label={FM('experiments.createButton')}
          testID={TestIds.EXPERIMENT_LIST_CREATE_BUTTON}
          variant={ButtonVariant.Primary}
          onPress={handleCreate}
        />
      </View>

      <FlatList
        contentContainerStyle={experimentStyles.scrollContent}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyListState messageKey="experiments.emptyList" testID={TestIds.EXPERIMENT_LIST_EMPTY} />}
        renderItem={renderItem}
      />

      <CreateExperimentModal menus={menuOptions} menusLoading={menusLoading} visible={isCreateVisible} onClose={handleCloseCreate} />
    </View>
  );
};

export default ExperimentListScreen;
