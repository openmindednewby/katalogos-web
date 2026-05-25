# Input & Form Components

## Checkbox

Toggle checkbox with themed styling and accessible labels.

**Import**: `import Checkbox from '@/components/Shared/Checkbox'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| isChecked | `boolean` | Yes | - | Whether checked |
| onPress | `() => void` | Yes | - | Toggle callback |
| label | `string` | No | - | Static label (overrides state label) |
| yesLabel | `string` | No | `FM('quizTemplates.yes')` | Label for checked state |
| noLabel | `string` | No | `FM('quizTemplates.no')` | Label for unchecked state |
| baseLabel | `string` | No | - | Base label to prepend to state |
| testID | `string` | No | `'checkbox'` | Test ID |

```tsx
<Checkbox
  isChecked={isRequired}
  onPress={handleToggle}
  label={FM('templates.required')}
  testID="required-checkbox"
/>
```

**Accessibility**: `accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`, `accessibilityHint` and `accessibilityLabel` auto-generated from label.

---

## ChoicePill

Selectable pill/chip button with selected state.

**Import**: `import ChoicePill from '@/components/Shared/ChoicePill'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `ReactNode` | Yes | - | Pill label content |
| onPress | `() => void` | Yes | - | Selection callback |
| selected | `boolean` | No | `false` | Whether selected |
| style | `StyleProp<ViewStyle>` | No | - | Additional styles |
| testID | `string` | No | `'choice-pill'` | Test ID |

```tsx
<ChoicePill
  label={FM('filters.active')}
  selected={filter === 'active'}
  onPress={handleSelectActive}
  testID="filter-active"
/>
```

**Accessibility**: `accessibilityRole="button"`, `accessibilityState={{ selected }}`.

---

## FormField

Text input with label, required indicator, and error display.

**Import**: `import { FormField } from '@/components/Forms/FormField'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | Yes | - | Field label |
| required | `boolean` | No | `false` | Show required asterisk |
| error | `string` | No | - | Error message to display |
| containerStyle | `ViewStyle` | No | - | Container style override |
| ...rest | `TextInputProps` | No | - | All React Native TextInput props |

```tsx
<FormField
  label={FM('users.name')}
  required
  value={name}
  onChangeText={setName}
  error={nameError}
  placeholder={FM('users.namePlaceholder')}
/>
```

**Accessibility**: Auto-generates `accessibilityLabel` and `accessibilityHint` from label.

---

## FormSwitch

Toggle switch with label and optional description.

**Import**: `import { FormSwitch } from '@/components/Forms/FormSwitch'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | Yes | - | Switch label |
| value | `boolean` | Yes | - | Current value |
| onValueChange | `(value: boolean) => void` | Yes | - | Change callback |
| disabled | `boolean` | No | `false` | Whether disabled |
| description | `string` | No | - | Description text below label |
| containerStyle | `ViewStyle` | No | - | Container style override |
| testID | `string` | No | `'form-switch'` | Test ID |
| accessibilityHint | `string` | No | label | Custom accessibility hint |

```tsx
<FormSwitch
  label={FM('settings.darkMode')}
  description={FM('settings.darkModeDescription')}
  value={isDarkMode}
  onValueChange={setIsDarkMode}
  testID="dark-mode-switch"
/>
```

**Accessibility**: `accessibilityRole="switch"`, `accessibilityState={{ checked }}`.

---

## ChipSelector

Multi-select chip group for selecting from a set of options.

**Import**: `import { ChipSelector } from '@/components/Forms/ChipSelector'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| options | `Array<{ value: T, label: string }>` | Yes | - | Available options |
| value | `T \| T[]` | Yes | - | Selected value(s) |
| onChange | `(value: T) => void` | Yes | - | Selection callback |
| label | `string` | No | - | Section label |
| multiple | `boolean` | No | `false` | Allow multiple selection |
| disabled | `boolean` | No | `false` | Whether disabled |
| containerStyle | `ViewStyle` | No | - | Container style override |

```tsx
<ChipSelector
  label={FM('templates.difficulty')}
  options={[
    { value: 'easy', label: FM('difficulty.easy') },
    { value: 'hard', label: FM('difficulty.hard') },
  ]}
  value={difficulty}
  onChange={setDifficulty}
/>
```

**Accessibility**: Each chip has `accessibilityRole="button"`, `accessibilityState={{ selected }}`.

---

## FormActions

Save and Cancel button pair for form submission.

**Import**: `import { FormActions } from '@/components/Forms/FormActions'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSave | `() => void` | Yes | - | Save callback |
| onCancel | `() => void` | No | - | Cancel callback (hidden if not provided) |
| saveLabel | `string` | No | `'Save'` | Save button label |
| cancelLabel | `string` | No | `'Cancel'` | Cancel button label |
| saving | `boolean` | No | `false` | Show loading spinner |
| saveDisabled | `boolean` | No | `false` | Disable save button |
| containerStyle | `ViewStyle` | No | - | Container style override |

```tsx
<FormActions
  saveLabel={FM('common.save')}
  cancelLabel={FM('common.cancel')}
  onSave={handleSave}
  onCancel={handleCancel}
  saving={isSaving}
/>
```

**Accessibility**: Both buttons have `accessibilityRole="button"`, `accessibilityHint`, `accessibilityLabel`.
