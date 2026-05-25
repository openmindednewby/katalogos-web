/**
 * SaveButton -- backwards-compatible wrapper around the core Button.
 * Renders a primary-variant themed button.
 */
import React from 'react';

import { Button, ButtonVariant } from '../core/Button';

interface Props {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

const DEFAULT_TITLE = 'Save';
const DEFAULT_TEST_ID = 'save-button';
const DEFAULT_HINT = 'Saves the current changes';

function handleNoOp(): void {
  // intentional no-op for optional onPress
}

const SaveButton = ({
  title = DEFAULT_TITLE,
  onPress = handleNoOp,
  disabled = false,
  testID = DEFAULT_TEST_ID,
}: Props): React.ReactElement => (
  <Button
    accessibilityHint={DEFAULT_HINT}
    accessibilityLabel={title}
    disabled={disabled}
    label={title}
    testID={testID}
    variant={ButtonVariant.Primary}
    onPress={onPress}
  />
);

export default SaveButton;
