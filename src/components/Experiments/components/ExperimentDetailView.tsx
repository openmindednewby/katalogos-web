/**
 * ExperimentDetailView -- detailed view with metrics and start/stop controls.
 */
import React, { useCallback, useMemo } from 'react';

import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ExperimentStatusBadge from './ExperimentStatusBadge';
import MetricsComparison from './MetricsComparison';
import { notifyError, notifySuccess } from '../../../lib/notifications';
import { FM } from '../../../localization/helpers';
import { useGetExperiment } from '../../../server/customHooks/experiments/useGetExperiment';
import { useStartExperiment } from '../../../server/customHooks/experiments/useStartExperiment';
import { useStopExperiment } from '../../../server/customHooks/experiments/useStopExperiment';
import ExperimentStatus from '../../../shared/enums/ExperimentStatus';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';
import { Button } from '../../core/Button';
import ButtonVariant from '../../core/Button/utils/ButtonVariant';
import { experimentStyles } from '../styles';

interface Props {
  experimentId: string;
  onBack: () => void;
}

const ExperimentDetailView = ({ experimentId, onBack }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const errorColor = theme.semantic.error['500'];
  const successColor = theme.semantic.success['500'];

  const { data: experiment, isLoading } = useGetExperiment(experimentId);

  const startCallbacks = useMemo(() => ({
    onSuccess: () => notifySuccess(FM('experiments.messages.startSuccess')),
    onError: () => notifyError(FM('experiments.errors.startFailed')),
  }), []);

  const stopCallbacks = useMemo(() => ({
    onSuccess: () => notifySuccess(FM('experiments.messages.stopSuccess')),
    onError: () => notifyError(FM('experiments.errors.stopFailed')),
  }), []);

  const { mutate: startExperiment, isPending: isStarting } = useStartExperiment(startCallbacks);
  const { mutate: stopExperiment, isPending: isStopping } = useStopExperiment(stopCallbacks);

  const handleStart = useCallback(() => {
    startExperiment({ experimentId });
  }, [experimentId, startExperiment]);

  const handleStop = useCallback(() => {
    stopExperiment({ experimentId });
  }, [experimentId, stopExperiment]);

  if (isLoading)
    return (
      <View style={experimentStyles.loadingContainer} testID={TestIds.EXPERIMENT_DETAIL_LOADING}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (!isValueDefined(experiment))
    return (
      <View style={experimentStyles.errorContainer}>
        <Text style={[experimentStyles.description, { color: errorColor }]}>{FM('experiments.errors.loadFailed')}</Text>
      </View>
    );

  const statusStr = experiment.status;
  const isDraft = statusStr === String(ExperimentStatus.Draft);
  const isRunning = statusStr === String(ExperimentStatus.Running);
  const isCompleted = statusStr === String(ExperimentStatus.Completed);

  return (
    <ScrollView contentContainerStyle={experimentStyles.scrollContent} testID={TestIds.EXPERIMENT_DETAIL}>
      <View style={experimentStyles.backButton}>
        <Button
          accessibilityHint={FM('experiments.backButtonHint')}
          accessibilityLabel={FM('experiments.backButton')}
          label={FM('experiments.backButton')}
          testID={TestIds.EXPERIMENT_DETAIL_BACK_BUTTON}
          variant={ButtonVariant.Ghost}
          onPress={onBack}
        />
      </View>

      <View style={experimentStyles.cardHeader}>
        <Text style={[experimentStyles.heading, { color: colors.text }]}>
          {experiment.name}
        </Text>
        <ExperimentStatusBadge status={experiment.status} />
      </View>

      <Text style={[experimentStyles.cardMenuLabel, { color: colors.textSecondary }]}>
        {FM('experiments.card.menuLabel')}: {experiment.menuName}
      </Text>

      <View style={experimentStyles.controlsRow}>
        {isDraft ? (
          <Button
            accessibilityHint={FM('experiments.detail.startButtonHint')}
            accessibilityLabel={FM('experiments.detail.startButton')}
            disabled={isStarting}
            label={FM('experiments.detail.startButton')}
            loading={isStarting}
            testID={TestIds.EXPERIMENT_DETAIL_START_BUTTON}
            variant={ButtonVariant.Primary}
            onPress={handleStart}
          />
        ) : null}

        {isRunning ? (
          <Button
            accessibilityHint={FM('experiments.detail.stopButtonHint')}
            accessibilityLabel={FM('experiments.detail.stopButton')}
            disabled={isStopping}
            label={FM('experiments.detail.stopButton')}
            loading={isStopping}
            testID={TestIds.EXPERIMENT_DETAIL_STOP_BUTTON}
            variant={ButtonVariant.Danger}
            onPress={handleStop}
          />
        ) : null}
      </View>

      <MetricsComparison metrics={experiment.metrics} />

      {isCompleted && isValueDefined(experiment.winner) ? (
        <View
          style={[experimentStyles.winnerContainer, { borderColor: successColor, backgroundColor: colors.surface }]}
          testID={TestIds.EXPERIMENT_DETAIL_WINNER}
        >
          <Text style={[experimentStyles.metricLabel, { color: colors.textSecondary }]}>
            {FM('experiments.detail.winnerLabel')}
          </Text>
          <Text style={[experimentStyles.winnerText, { color: successColor }]}>
            {experiment.winner}
          </Text>
        </View>
      ) : null}

      {isCompleted && !isValueDefined(experiment.winner) ? (
        <View style={[experimentStyles.winnerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]} testID={TestIds.EXPERIMENT_DETAIL_WINNER}>
          <Text style={[experimentStyles.winnerText, { color: colors.textSecondary }]}>
            {FM('experiments.detail.noWinner')}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default ExperimentDetailView;
