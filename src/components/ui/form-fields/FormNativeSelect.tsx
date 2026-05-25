/**
 * Searchable combobox wrapped with React Hook Form Controller.
 * Consumes useTheme() via useFormThemeVars() for per-tenant styling.
 * No Syncfusion dependencies.
 */
import { useMemo, type ReactElement } from 'react';

import { Controller } from 'react-hook-form';

import { useCombobox } from './useCombobox';
import { useFormThemeVars } from './useFormThemeVars';
import { isValueDefined } from '../../../shared/utils/validators';

import type { SelectOption } from './types';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  testID?: string;
  disabled?: boolean;
}

const NO_RESULTS_TEXT = 'No results found';

function buildOptionClassName(isHighlighted: boolean, isActive: boolean): string {
  let className = 'form-native-combobox-option';
  if (isHighlighted) className += ' form-native-combobox-option--highlighted';
  if (isActive) className += ' form-native-combobox-option--active';
  return className;
}

// =============================================================================
// Sub-components (defined before usage)
// =============================================================================

const ComboboxDropdown = ({
  filteredOptions,
  highlightedIndex,
  selectedValue,
  listboxId,
  onOptionClick,
}: {
  filteredOptions: SelectOption[];
  highlightedIndex: number;
  selectedValue: string;
  listboxId: string;
  onOptionClick: (option: SelectOption) => void;
}): ReactElement => {
  if (filteredOptions.length === 0)
    return (
      <ul className="form-native-combobox-dropdown" id={listboxId} role="listbox">
        <li className="form-native-combobox-no-results">{NO_RESULTS_TEXT}</li>
      </ul>
    );

  return (
    <ul className="form-native-combobox-dropdown" id={listboxId} role="listbox">
      {filteredOptions.map((option, index) => {
        const isHighlighted = index === highlightedIndex;
        const isActive = option.value === selectedValue;
        const className = buildOptionClassName(isHighlighted, isActive);

        return (
          <li
            key={option.value}
            aria-selected={isActive}
            className={className}
            id={`combobox-option-${index}`}
            role="option"
            onMouseDown={(e) => {
              e.preventDefault();
              onOptionClick(option);
            }}
          >
            {option.label}
          </li>
        );
      })}
    </ul>
  );
};

interface ComboboxFieldProps {
  name: string;
  value: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  testID?: string;
  disabled?: boolean;
  fieldState: { isTouched: boolean; error?: { message?: string } };
  isSubmitted: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const ComboboxField = ({
  name,
  value,
  label,
  options,
  placeholder,
  testID,
  disabled,
  fieldState,
  isSubmitted,
  onChange,
  onBlur,
}: ComboboxFieldProps): ReactElement => {
  const { style: themeVars } = useFormThemeVars();
  const comboboxParams = useMemo(() => ({ options, value, onChange, onBlur }), [options, value, onChange, onBlur]);
  const {
    isOpen,
    searchText,
    highlightedIndex,
    filteredOptions,
    selectedLabel,
    wrapperRef,
    listboxId,
    handleInputChange,
    handleInputFocus,
    handleOptionClick,
    handleKeyDown,
  } = useCombobox(comboboxParams);

  const showError = (fieldState.isTouched || isSubmitted) && isValueDefined(fieldState.error);
  const inputClassName = showError ? 'form-native-combobox-input has-error' : 'form-native-combobox-input';
  const displayValue = isOpen ? searchText : selectedLabel;
  const hasLabel = isValueDefined(label) && label !== '';
  const activeDescendant = highlightedIndex >= 0 ? `combobox-option-${highlightedIndex}` : undefined;
  const errorId = `${name}-error`;
  const isDropdownVisible = isOpen && disabled !== true;

  return (
    <div className="form-native-field" style={themeVars}>
      {hasLabel ? (
        <label className="form-native-label" htmlFor={name}>
          {label}
        </label>
      ) : null}
      <div ref={wrapperRef} className="form-native-combobox-wrapper">
        <input
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-describedby={showError ? errorId : undefined}
          aria-expanded={isOpen}
          aria-invalid={showError}
          autoComplete="off"
          className={inputClassName}
          data-testid={testID}
          disabled={disabled}
          id={name}
          placeholder={placeholder}
          role="combobox"
          type="text"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
        {isDropdownVisible ? (
          <ComboboxDropdown
            filteredOptions={filteredOptions}
            highlightedIndex={highlightedIndex}
            listboxId={listboxId}
            selectedValue={value}
            onOptionClick={handleOptionClick}
          />
        ) : null}
      </div>
      {showError ? (
        <span className="form-native-error" id={errorId} role="alert">
          {fieldState.error?.message}
        </span>
      ) : null}
    </div>
  );
};

// =============================================================================
// Main export
// =============================================================================

export const FormNativeSelect = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  testID,
  disabled,
}: Props<T>): ReactElement => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState, formState }) => (
      <ComboboxField
        disabled={disabled}
        fieldState={fieldState}
        isSubmitted={formState.isSubmitted}
        label={label}
        name={name}
        options={options}
        placeholder={placeholder}
        testID={testID}
        value={String(field.value ?? '')}
        onBlur={field.onBlur}
        onChange={field.onChange}
      />
    )}
  />
);
