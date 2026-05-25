/**
 * Renders custom white-label header HTML on public menu pages.
 * Uses dangerouslySetInnerHTML on web; no-op on native.
 */
import React from 'react';

import { Platform, View } from 'react-native';

import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';

interface Props {
  html: string | null;
}

export const WhiteLabelHeader = ({ html }: Props): React.ReactElement | null => {
  if (!isValueDefined(html) || html.trim().length === 0) return null;
  if (Platform.OS !== 'web') return null;

  return (
    <View testID={TestIds.WHITE_LABEL_HEADER}>
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    </View>
  );
};
