import React from 'react';

import ModalDropdown from '../../../Shared/ModalDropdown';

interface DropdownOption {
  readonly label: string;
  readonly value: string;
}

interface Props {
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  value: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
}

const SettingsDropdown = ({
  testID,
  accessibilityLabel,
  accessibilityHint,
  value,
  options,
  onChange,
}: Props): React.ReactElement => (
  <ModalDropdown<string>
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    options={options}
    testID={testID}
    value={value}
    onChange={onChange}
  />
);

export default SettingsDropdown;
