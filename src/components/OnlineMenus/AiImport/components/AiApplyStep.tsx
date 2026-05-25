/**
 * Apply step: lets user choose merge strategy before applying AI import.
 */
import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import AiImportMergeStrategy from '../../../../shared/enums/AiImportMergeStrategy';
import { TestIds } from '../../../../shared/testIds';

interface Props {
  strategy: AiImportMergeStrategy;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  onSetStrategy: (strategy: AiImportMergeStrategy) => void;
}

const RADIO_SIZE = 20;
const RADIO_INNER_SIZE = 10;
const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 8;
const CARD_MARGIN_BOTTOM = 12;

const localStyles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
    marginBottom: CARD_MARGIN_BOTTOM,
    gap: 12,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: RADIO_INNER_SIZE,
    height: RADIO_INNER_SIZE,
    borderRadius: RADIO_INNER_SIZE / 2,
  },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  optionDescription: { fontSize: 13, opacity: 0.7 },
});

const AiApplyStep: React.FC<Props> = ({ strategy, textColor, borderColor, primaryColor, onSetStrategy }) => {
  const isReplace = strategy === AiImportMergeStrategy.Replace;
  const isMerge = strategy === AiImportMergeStrategy.Merge;

  return (
    <View style={localStyles.container}>
      <Text style={[localStyles.title, { color: textColor }]}>
        {FM('aiImport.apply.strategyLabel')}
      </Text>

      <Pressable
        accessibilityHint={FM('aiImport.apply.replaceHint')}
        accessibilityLabel={FM('aiImport.apply.replaceLabel')}
        accessibilityRole="radio"
        accessibilityState={{ selected: isReplace }}
        style={[localStyles.optionCard, { borderColor: isReplace ? primaryColor : borderColor }]}
        testID={TestIds.AI_IMPORT_STRATEGY_REPLACE}
        onPress={() => { onSetStrategy(AiImportMergeStrategy.Replace); }}
      >
        <View style={[localStyles.radio, { borderColor: isReplace ? primaryColor : borderColor }]}>
          {isReplace ? <View style={[localStyles.radioInner, { backgroundColor: primaryColor }]} /> : null}
        </View>
        <View style={localStyles.optionContent}>
          <Text style={[localStyles.optionLabel, { color: textColor }]}>
            {FM('aiImport.apply.replaceLabel')}
          </Text>
          <Text style={[localStyles.optionDescription, { color: textColor }]}>
            {FM('aiImport.apply.replaceDescription')}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityHint={FM('aiImport.apply.mergeHint')}
        accessibilityLabel={FM('aiImport.apply.mergeLabel')}
        accessibilityRole="radio"
        accessibilityState={{ selected: isMerge }}
        style={[localStyles.optionCard, { borderColor: isMerge ? primaryColor : borderColor }]}
        testID={TestIds.AI_IMPORT_STRATEGY_MERGE}
        onPress={() => { onSetStrategy(AiImportMergeStrategy.Merge); }}
      >
        <View style={[localStyles.radio, { borderColor: isMerge ? primaryColor : borderColor }]}>
          {isMerge ? <View style={[localStyles.radioInner, { backgroundColor: primaryColor }]} /> : null}
        </View>
        <View style={localStyles.optionContent}>
          <Text style={[localStyles.optionLabel, { color: textColor }]}>
            {FM('aiImport.apply.mergeLabel')}
          </Text>
          <Text style={[localStyles.optionDescription, { color: textColor }]}>
            {FM('aiImport.apply.mergeDescription')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default AiApplyStep;
