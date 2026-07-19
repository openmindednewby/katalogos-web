import React from 'react';

import { Text } from 'react-native';

import { render, screen } from '@testing-library/react-native';

import Checkbox from './Checkbox';
import ChoicePill from './ChoicePill';
import Tabs from './Tabs';
import { ChipSelector } from '../Forms/ChipSelector';
import { FormActions } from '../Forms/FormActions';
import { FormField } from '../Forms/FormField';
import { FormSwitch } from '../Forms/FormSwitch';

// Mock useTheme
jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#001219', textSecondary: '#555555', background: '#ffffff', surface: '#f7f7f7', surfaceElevated: '#ffffff', border: '#e6e6e6', divider: '#eeeeee' },
      // Full 50-900 scales, exactly as `generateColorScale` produces at runtime. A
      // '500'-only stub is not a realistic theme: ChoicePill reads `badgeColors`, which
      // walks the 100/600/700/800/900 steps to find a pair that provably clears AA, so a
      // stub made the component crash here while working fine in the app.
      palette: {
        primary: { '50': '#e5eff1', '100': '#c4e4eb', '200': '#79d4e7', '300': '#24caed', '400': '#059dbd', '500': '#005f73', '600': '#004c5c', '700': '#023843', '800': '#02242c', '900': '#02151a' },
        secondary: { '50': '#f6f8f8', '100': '#edf3f1', '200': '#d8e9e3', '300': '#c2e1d6', '400': '#abdaca', '500': '#94d2bd', '600': '#62bd9e', '700': '#429579', '800': '#2d6250', '900': '#1c3a30' },
        accent: { '50': '#f5f3ed', '100': '#f1e8d6', '200': '#efd4a3', '300': '#f3c268', '400': '#fab12b', '500': '#ee9b00', '600': '#be7c00', '700': '#8b5c04', '800': '#5a3d05', '900': '#352404' },
      },
      semantic: { success: { '500': '#2d6a4f' }, warning: { '500': '#ee9b00' }, error: { '500': '#ae2012' }, info: { '500': '#005f73' } },
      typography: { fontFamily: 'System', headingScale: 1.25 },
      mode: 'light',
      branding: { logoUrl: null, faviconUrl: null },
    },
    mode: 'light',
    toggleMode: jest.fn(),
    setMode: jest.fn(),
    setTenantConfig: jest.fn(),
  }),
}));

describe('Tabs accessibility', () => {
  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'settings', label: 'Settings' },
  ];

  it('renders container with tablist role', () => {
    render(
      <Tabs activeKey="general" tabs={tabs} onChange={jest.fn()} />,
    );

    const container = screen.getByTestId('tab-container');
    expect(container.props.accessibilityRole).toBe('tablist');
  });

  it('renders each tab with tab role and correct accessibilityLabel', () => {
    render(
      <Tabs activeKey="general" tabs={tabs} onChange={jest.fn()} />,
    );

    const generalTab = screen.getByTestId('tab-button-general');
    expect(generalTab.props.accessibilityRole).toBe('tab');
    expect(generalTab.props.accessibilityLabel).toBe('General');

    const settingsTab = screen.getByTestId('tab-button-settings');
    expect(settingsTab.props.accessibilityRole).toBe('tab');
    expect(settingsTab.props.accessibilityLabel).toBe('Settings');
  });

  it('passes accessibilityState.selected=true for active tab and false for inactive', () => {
    render(
      <Tabs activeKey="general" tabs={tabs} onChange={jest.fn()} />,
    );

    const generalTab = screen.getByTestId('tab-button-general');
    expect(generalTab.props.accessibilityState).toEqual({ selected: true });

    const settingsTab = screen.getByTestId('tab-button-settings');
    expect(settingsTab.props.accessibilityState).toEqual({ selected: false });
  });

  it('provides descriptive accessibilityHint for each tab', () => {
    render(
      <Tabs activeKey="general" tabs={tabs} onChange={jest.fn()} />,
    );

    const generalTab = screen.getByTestId('tab-button-general');
    expect(generalTab.props.accessibilityHint).toBe('Switches to General tab');

    const settingsTab = screen.getByTestId('tab-button-settings');
    expect(settingsTab.props.accessibilityHint).toBe('Switches to Settings tab');
  });
});

describe('Checkbox accessibility', () => {
  it('passes accessibilityState.checked=true when isChecked is true', () => {
    render(
      <Checkbox isChecked label="Accept terms" onPress={jest.fn()} />,
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityState).toEqual({ checked: true });
  });

  it('passes accessibilityState.checked=false when isChecked is false', () => {
    render(
      <Checkbox isChecked={false} label="Accept terms" onPress={jest.fn()} />,
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityState).toEqual({ checked: false });
  });

  it('uses the label prop as accessibilityLabel when provided', () => {
    render(
      <Checkbox isChecked={false} label="Accept terms" onPress={jest.fn()} />,
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityLabel).toBe('Accept terms');
  });

  it('derives accessibilityLabel from renderLabel when label prop is not provided', () => {
    render(
      <Checkbox isChecked baseLabel="Required" onPress={jest.fn()} />,
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityLabel).toBe('Required Yes');
  });

  it('has checkbox accessibilityRole', () => {
    render(
      <Checkbox isChecked={false} label="Test" onPress={jest.fn()} />,
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityRole).toBe('checkbox');
  });
});

describe('ChoicePill accessibility', () => {
  it('passes accessibilityState.selected matching selected prop', () => {
    render(
      <ChoicePill selected label="Option A" onPress={jest.fn()} />,
    );

    const pill = screen.getByTestId('choice-pill');
    expect(pill.props.accessibilityState).toEqual({ selected: true });
  });

  it('passes accessibilityState.selected=false when not selected', () => {
    render(
      <ChoicePill label="Option B" selected={false} onPress={jest.fn()} />,
    );

    const pill = screen.getByTestId('choice-pill');
    expect(pill.props.accessibilityState).toEqual({ selected: false });
  });

  it('derives accessibilityLabel from string label', () => {
    render(
      <ChoicePill label="My Label" onPress={jest.fn()} />,
    );

    const pill = screen.getByTestId('choice-pill');
    expect(pill.props.accessibilityLabel).toBe('My Label');
  });

  it('sets accessibilityLabel to undefined when label is not a string', () => {
    render(
      <ChoicePill label={<Text>JSX</Text>} onPress={jest.fn()} />,
    );

    const pill = screen.getByTestId('choice-pill');
    expect(pill.props.accessibilityLabel).toBeUndefined();
  });
});

describe('FormActions accessibility', () => {
  it('save button has correct accessibilityLabel from saveLabel prop', () => {
    render(
      <FormActions saveLabel="Submit" onSave={jest.fn()} />,
    );

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton.props.accessibilityLabel).toBe('Submit');
  });

  it('cancel button has correct accessibilityLabel from cancelLabel prop', () => {
    render(
      <FormActions
        cancelLabel="Discard"
        saveLabel="Submit"
        onCancel={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    const cancelButton = screen.getByTestId('cancel-button');
    expect(cancelButton.props.accessibilityLabel).toBe('Discard');
  });

  it('threads pre-localized hints through to both buttons', () => {
    render(
      <FormActions
        cancelHint="Discard unsaved changes"
        cancelLabel="Cancel"
        saveHint="Save the current changes"
        saveLabel="Save"
        onCancel={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(screen.getByTestId('save-button').props.accessibilityHint).toBe('Save the current changes');
    expect(screen.getByTestId('cancel-button').props.accessibilityHint).toBe('Discard unsaved changes');
  });

  it('renders a save-only row when no onCancel is supplied', () => {
    render(
      <FormActions saveLabel="Submit" onSave={jest.fn()} />,
    );

    expect(screen.queryByTestId('cancel-button')).toBeNull();
  });
});

describe('FormField accessibility', () => {
  it('TextInput has accessibilityLabel matching the label prop', () => {
    render(
      <FormField label="Email Address" />,
    );

    const input = screen.getByTestId('form-field-input');
    expect(input.props.accessibilityLabel).toBe('Email Address');
  });

  it('TextInput has descriptive accessibilityHint', () => {
    render(
      <FormField label="Username" />,
    );

    const input = screen.getByTestId('form-field-input');
    expect(input.props.accessibilityHint).toBe('Enter Username');
  });
});

describe('FormSwitch accessibility', () => {
  it('Switch has accessibilityLabel matching the label prop', () => {
    render(
      <FormSwitch label="Enable Notifications" value={false} onValueChange={jest.fn()} />,
    );

    const switchElement = screen.getByTestId('form-switch');
    expect(switchElement.props.accessibilityLabel).toBe('Enable Notifications');
  });

  it('Switch has accessibilityHint defaulting to label', () => {
    render(
      <FormSwitch label="Dark Mode" value={false} onValueChange={jest.fn()} />,
    );

    const switchElement = screen.getByTestId('form-switch');
    expect(switchElement.props.accessibilityHint).toBe('Dark Mode');
  });

  it('Switch uses custom accessibilityHint when provided', () => {
    render(
      <FormSwitch accessibilityHint="Toggles dark mode" label="Dark Mode" value={false} onValueChange={jest.fn()} />,
    );

    const switchElement = screen.getByTestId('form-switch');
    expect(switchElement.props.accessibilityHint).toBe('Toggles dark mode');
  });
});

describe('ChipSelector accessibility', () => {
  const options = [
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
  ];

  it('each chip has accessibilityLabel matching option label', () => {
    render(
      <ChipSelector options={options} value="red" onChange={jest.fn()} />,
    );

    const redChip = screen.getByTestId('chip-selector-chip-red');
    expect(redChip.props.accessibilityLabel).toBe('Red');

    const blueChip = screen.getByTestId('chip-selector-chip-blue');
    expect(blueChip.props.accessibilityLabel).toBe('Blue');
  });

  it('selected chip has accessibilityState.selected=true', () => {
    render(
      <ChipSelector options={options} value="red" onChange={jest.fn()} />,
    );

    const redChip = screen.getByTestId('chip-selector-chip-red');
    expect(redChip.props.accessibilityState).toMatchObject({ selected: true });

    const blueChip = screen.getByTestId('chip-selector-chip-blue');
    expect(blueChip.props.accessibilityState).toMatchObject({ selected: false });
  });

  it('each chip has descriptive accessibilityHint', () => {
    render(
      <ChipSelector options={options} value="red" onChange={jest.fn()} />,
    );

    const redChip = screen.getByTestId('chip-selector-chip-red');
    expect(redChip.props.accessibilityHint).toBe('Selects Red');

    const blueChip = screen.getByTestId('chip-selector-chip-blue');
    expect(blueChip.props.accessibilityHint).toBe('Selects Blue');
  });
});
