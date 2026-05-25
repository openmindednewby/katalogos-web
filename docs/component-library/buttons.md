# Button Components

## Button (core)

Core themed button with five variants, three sizes, loading and disabled states. All colors derive from `useTheme()`.

**Import**: `import { Button, ButtonVariant, ButtonSize } from '@/components/core/Button'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | Yes | - | Button text |
| onPress | `() => void` | Yes | - | Press callback |
| testID | `string` | Yes | - | Test ID (required) |
| accessibilityLabel | `string` | Yes | - | Accessibility label (required) |
| accessibilityHint | `string` | Yes | - | Accessibility hint (required) |
| variant | `ButtonVariant` | No | `Primary` | Visual variant |
| size | `ButtonSize` | No | `Medium` | Size preset |
| disabled | `boolean` | No | `false` | Whether disabled |
| loading | `boolean` | No | `false` | Show loading spinner |
| icon | `IconName` | No | - | Leading icon from icon registry |
| fullWidth | `boolean` | No | `false` | Stretch to full width |

### Variants (`ButtonVariant`)

| Variant | Value | Description |
|---------|-------|-------------|
| `Primary` | `'primary'` | Solid primary color background |
| `Secondary` | `'secondary'` | Solid secondary/surface background |
| `Outline` | `'outline'` | Border only, transparent background |
| `Ghost` | `'ghost'` | No border or background |
| `Danger` | `'danger'` | Solid error/red background |

### Sizes (`ButtonSize`)

| Size | Value | Description |
|------|-------|-------------|
| `Small` | `'sm'` | Compact size |
| `Medium` | `'md'` | Default size |
| `Large` | `'lg'` | Larger touch target |

```tsx
<Button
  variant={ButtonVariant.Primary}
  size={ButtonSize.Medium}
  label={FM('common.save')}
  icon="checkmark"
  onPress={handleSave}
  testID="save-button"
  accessibilityLabel={FM('common.save')}
  accessibilityHint={FM('common.saveHint')}
/>
```

**Accessibility**: `accessibilityRole="button"`, `accessibilityState={{ disabled, busy }}`. All three a11y props are required.

---

## SaveButton

Primary button preset for save actions. Wraps the core `Button` with `ButtonVariant.Primary`.

**Import**: `import SaveButton from '@/components/Buttons/SaveButton'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | No | `'Save'` | Button label |
| onPress | `() => void` | No | no-op | Press callback |
| disabled | `boolean` | No | `false` | Whether disabled |
| testID | `string` | No | `'save-button'` | Test ID |

```tsx
<SaveButton
  title={FM('common.save')}
  onPress={handleSave}
  disabled={!isValid}
  testID="menu-save"
/>
```

---

## CancelButton

Secondary button preset for cancel actions. Wraps the core `Button` with `ButtonVariant.Secondary`.

**Import**: `import CancelButton from '@/components/Buttons/CancelButton'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | No | `'Cancel'` | Button label |
| onPress | `() => void` | No | no-op | Press callback |
| testID | `string` | No | `'cancel-button'` | Test ID |

```tsx
<CancelButton
  title={FM('common.cancel')}
  onPress={handleCancel}
  testID="menu-cancel"
/>
```

---

## ActionRow (Buttons)

Composite Save + Cancel button pair. Renders `SaveButton` and `CancelButton` side by side.

**Import**: `import ActionRow from '@/components/Buttons/ActionRow'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSave | `() => void` | No | - | Save callback |
| onCancel | `() => void` | No | - | Cancel callback |
| saveTitle | `string` | No | `'Save'` | Save button label |
| cancelTitle | `string` | No | `'Cancel'` | Cancel button label |
| disabledSave | `boolean` | No | - | Disable save button |
| style | `StyleProp<ViewStyle>` | No | - | Additional styles |

```tsx
<ActionRow
  saveTitle={FM('common.save')}
  cancelTitle={FM('common.cancel')}
  onSave={handleSave}
  onCancel={handleCancel}
  disabledSave={!isValid}
/>
```

> **Note**: Prefer the core `ActionRow` + individual `Button` components for new code. This component exists for backward compatibility.
