/**
 * CancelButton -- backwards-compatible wrapper around the core Button.
 * Renders a secondary-variant themed button.
 */
import React from 'react';

import { Button, ButtonVariant } from '../core/Button';

interface Props {
  title?: string;
  onPress?: () => void;
  testID?: string;
}

const DEFAULT_TITLE = 'Cancel';
const DEFAULT_TEST_ID = 'cancel-button';
const DEFAULT_HINT = 'Cancels the current action';

function handleNoOp(): void {
  // intentional no-op for optional onPress
}

const CancelButton = ({
  title = DEFAULT_TITLE,
  onPress = handleNoOp,
  testID = DEFAULT_TEST_ID,
}: Props): React.ReactElement => (
  <Button
    accessibilityHint={DEFAULT_HINT}
    accessibilityLabel={title}
    label={title}
    testID={testID}
    variant={ButtonVariant.Secondary}
    onPress={onPress}
  />
);

export default CancelButton;
