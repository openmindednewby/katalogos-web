# Task: Admin Portal - Syncfusion Wrapper Components

> **Reference**: [Project Overview](admin-portal-project-overview.md)
> **Depends On**: `admin-portal-02-styling-architecture.md`
> **Assigned Agent**: `frontend-dev`

## Status: COMPLETED

---

## Completion Summary

**Completed Date**: 2026-02-07

### Files Created

| File | Description |
|------|-------------|
| `src/utils/cn.ts` | Utility for conditionally joining class names |
| `src/utils/is.ts` | Type guard utility for checking defined values |
| `src/utils/index.ts` | Barrel export for utilities |
| `src/config/syncfusion.ts` | Syncfusion license registration |
| `src/components/ui/DataGrid/index.tsx` | DataGrid wrapper component |
| `src/components/ui/Button/index.tsx` | Button wrapper component |
| `src/components/ui/Input/index.tsx` | TextBox/Input wrapper component |
| `src/components/ui/Select/index.tsx` | DropDownList/Select wrapper component |
| `src/components/ui/index.ts` | Barrel export for UI components |
| `src/components/common/LoadingSpinner.tsx` | Updated with size and fullScreen props |
| `src/components/common/ErrorBoundary.tsx` | Error boundary component |
| `src/components/common/index.ts` | Barrel export for common components |
| `src/styles/layers/syncfusion-overrides.css` | CSS overrides for Syncfusion theming |
| `src/styles/index.css` | Updated with Syncfusion CSS imports |
| `src/main.tsx` | Updated to initialize Syncfusion license |
| `src/features/showcase/pages/ComponentsPage/index.tsx` | Updated to showcase wrappers |

### Build Verification

- TypeScript build: PASSED
- Vite production build: PASSED (with expected chunk size warnings for Syncfusion grid)

### Notes

- ESLint has some pre-existing issues in files outside this task scope (`routes.tsx`, `useThemeStore.ts`)
- Syncfusion grid chunk is 1.6MB which triggers Vite warnings, but this is expected for the full grid functionality
- Type assertions were needed for Syncfusion's generic Object types in callbacks

---

## Problem Statement

Create wrapper components around Syncfusion components to provide:
- Consistent API across the application
- Type-safe props with good defaults
- Easy style overrides via props
- Integration with the theme system
- Accessibility enhancements (testID, aria attributes)

---

## Implementation Plan

### Step 1: Create DataGrid Wrapper

#### src/components/ui/DataGrid/index.tsx

```typescript
import { memo, useCallback } from 'react';

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Sort,
  Filter,
  Inject,
  type PageSettingsModel,
  type RowSelectEventArgs,
} from '@syncfusion/ej2-react-grids';

import { cn } from '@/utils/cn';
import { isValueDefined } from '@/utils/is';

import type { ColumnModel } from '@syncfusion/ej2-grids';

const DEFAULT_PAGE_SETTINGS: PageSettingsModel = {
  pageSize: 10,
  pageSizes: [10, 25, 50, 100],
};

interface Props<T extends object> {
  /** Data source for the grid */
  data: T[];
  /** Column definitions */
  columns: ColumnModel[];
  /** Enable pagination (default: true) */
  allowPaging?: boolean;
  /** Enable sorting (default: true) */
  allowSorting?: boolean;
  /** Enable filtering (default: false) */
  allowFiltering?: boolean;
  /** Page settings configuration */
  pageSettings?: PageSettingsModel;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for E2E testing */
  testId?: string;
  /** Height of the grid */
  height?: string | number;
  /** Callback when a row is selected */
  onRowSelected?: (data: T) => void;
  /** Callback when a row is deselected */
  onRowDeselected?: (data: T) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyText?: string;
}

const DataGrid = <T extends object>({
  data,
  columns,
  allowPaging = true,
  allowSorting = true,
  allowFiltering = false,
  pageSettings = DEFAULT_PAGE_SETTINGS,
  className,
  testId,
  height = 'auto',
  onRowSelected,
  onRowDeselected,
  isLoading = false,
  emptyText = 'No data available',
}: Props<T>): JSX.Element => {
  const handleRowSelected = useCallback(
    (args: RowSelectEventArgs) => {
      if (isValueDefined(onRowSelected) && isValueDefined(args.data))
        onRowSelected(args.data as T);
    },
    [onRowSelected],
  );

  const handleRowDeselected = useCallback(
    (args: RowSelectEventArgs) => {
      if (isValueDefined(onRowDeselected) && isValueDefined(args.data))
        onRowDeselected(args.data as T);
    },
    [onRowDeselected],
  );

  // Determine which features to inject
  const features = [];
  if (allowPaging) features.push(Page);
  if (allowSorting) features.push(Sort);
  if (allowFiltering) features.push(Filter);

  return (
    <div
      className={cn('relative', className)}
      data-testid={testId}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/80">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      )}
      <GridComponent
        allowFiltering={allowFiltering}
        allowPaging={allowPaging}
        allowSorting={allowSorting}
        dataSource={data}
        emptyRecordTemplate={() => (
          <div className="py-8 text-center text-text-secondary">{emptyText}</div>
        )}
        height={height}
        pageSettings={pageSettings}
        rowDeselected={handleRowDeselected}
        rowSelected={handleRowSelected}
      >
        <ColumnsDirective>
          {columns.map((column) => (
            <ColumnDirective key={column.field} {...column} />
          ))}
        </ColumnsDirective>
        <Inject services={features} />
      </GridComponent>
    </div>
  );
};

// Memoize the component
const MemoizedDataGrid = memo(DataGrid) as typeof DataGrid;

export default MemoizedDataGrid;
export type { Props as DataGridProps };
```

### Step 2: Create Button Wrapper

#### src/components/ui/Button/index.tsx

```typescript
import { memo, forwardRef } from 'react';

import { ButtonComponent, type ButtonPropsModel } from '@syncfusion/ej2-react-buttons';

import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends Omit<ButtonPropsModel, 'cssClass'> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for E2E testing */
  testId?: string;
  /** Accessible label */
  ariaLabel?: string;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'e-primary',
  secondary: 'e-secondary',
  outline: 'e-outline',
  ghost: 'e-flat',
  danger: 'e-danger',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'e-small',
  md: '',
  lg: 'e-large',
};

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      testId,
      ariaLabel,
      fullWidth = false,
      children,
      disabled,
      onClick,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const cssClass = cn(
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'e-block',
      className,
    );

    return (
      <ButtonComponent
        ref={ref}
        aria-label={ariaLabel}
        cssClass={cssClass}
        data-testid={testId}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {children}
      </ButtonComponent>
    );
  },
);

Button.displayName = 'Button';

export default memo(Button);
export type { Props as ButtonProps };
```

### Step 3: Create Input Wrapper

#### src/components/ui/Input/index.tsx

```typescript
import { memo, forwardRef, useId } from 'react';

import { TextBoxComponent, type TextBoxModel } from '@syncfusion/ej2-react-inputs';

import { cn } from '@/utils/cn';
import { isValueDefined } from '@/utils/is';

interface Props extends Omit<TextBoxModel, 'cssClass' | 'floatLabelType'> {
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for E2E testing */
  testId?: string;
  /** Full width input */
  fullWidth?: boolean;
}

const Input = forwardRef<TextBoxComponent, Props>(
  (
    {
      label,
      helperText,
      error,
      className,
      testId,
      fullWidth = false,
      disabled,
      placeholder,
      value,
      type = 'text',
      ...rest
    },
    ref,
  ): JSX.Element => {
    const id = useId();
    const hasError = isValueDefined(error);
    const helperId = `${id}-helper`;

    return (
      <div
        className={cn('flex flex-col gap-1', fullWidth && 'w-full', className)}
        data-testid={testId}
      >
        {isValueDefined(label) && (
          <label
            className="text-sm font-medium text-text-primary"
            htmlFor={id}
          >
            {label}
          </label>
        )}
        <TextBoxComponent
          ref={ref}
          aria-describedby={isValueDefined(helperText) || hasError ? helperId : undefined}
          aria-invalid={hasError}
          cssClass={cn(hasError && 'e-error', fullWidth && 'e-block')}
          disabled={disabled}
          floatLabelType="Never"
          htmlAttributes={{ id }}
          placeholder={placeholder}
          type={type}
          value={value}
          {...rest}
        />
        {(isValueDefined(helperText) || hasError) && (
          <span
            className={cn(
              'text-sm',
              hasError ? 'text-error' : 'text-text-secondary',
            )}
            id={helperId}
          >
            {hasError ? error : helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default memo(Input);
export type { Props as InputProps };
```

### Step 4: Create Select Wrapper

#### src/components/ui/Select/index.tsx

```typescript
import { memo, forwardRef, useId } from 'react';

import {
  DropDownListComponent,
  type DropDownListModel,
  type ChangeEventArgs,
} from '@syncfusion/ej2-react-dropdowns';

import { cn } from '@/utils/cn';
import { isValueDefined } from '@/utils/is';

interface SelectOption {
  value: string | number;
  label: string;
}

interface Props extends Omit<DropDownListModel, 'cssClass' | 'dataSource' | 'fields'> {
  /** Select options */
  options: SelectOption[];
  /** Select label */
  label?: string;
  /** Helper text below select */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for E2E testing */
  testId?: string;
  /** Full width select */
  fullWidth?: boolean;
  /** Change handler */
  onChange?: (value: string | number) => void;
}

const Select = forwardRef<DropDownListComponent, Props>(
  (
    {
      options,
      label,
      helperText,
      error,
      className,
      testId,
      fullWidth = false,
      placeholder = 'Select an option',
      value,
      onChange,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const id = useId();
    const hasError = isValueDefined(error);
    const helperId = `${id}-helper`;

    function handleChange(args: ChangeEventArgs): void {
      if (isValueDefined(onChange) && isValueDefined(args.value))
        onChange(args.value as string | number);
    }

    return (
      <div
        className={cn('flex flex-col gap-1', fullWidth && 'w-full', className)}
        data-testid={testId}
      >
        {isValueDefined(label) && (
          <label
            className="text-sm font-medium text-text-primary"
            htmlFor={id}
          >
            {label}
          </label>
        )}
        <DropDownListComponent
          ref={ref}
          aria-describedby={isValueDefined(helperText) || hasError ? helperId : undefined}
          aria-invalid={hasError}
          change={handleChange}
          cssClass={cn(hasError && 'e-error', fullWidth && 'e-block')}
          dataSource={options}
          fields={{ text: 'label', value: 'value' }}
          htmlAttributes={{ id }}
          placeholder={placeholder}
          value={value}
          {...rest}
        />
        {(isValueDefined(helperText) || hasError) && (
          <span
            className={cn(
              'text-sm',
              hasError ? 'text-error' : 'text-text-secondary',
            )}
            id={helperId}
          >
            {hasError ? error : helperText}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default memo(Select);
export type { Props as SelectProps, SelectOption };
```

### Step 5: Create Barrel Export

#### src/components/ui/index.ts

```typescript
export { default as DataGrid } from './DataGrid';
export type { DataGridProps } from './DataGrid';

export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Select } from './Select';
export type { SelectProps, SelectOption } from './Select';
```

### Step 6: Create LoadingSpinner Component

#### src/components/common/LoadingSpinner/index.tsx

```typescript
import { memo } from 'react';

import { cn } from '@/utils/cn';

interface Props {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Full screen overlay */
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

const LoadingSpinner = memo(
  ({ size = 'md', className, fullScreen = false }: Props): JSX.Element => {
    const spinner = (
      <div
        aria-label="Loading"
        className={cn(
          'animate-spin rounded-full border-primary-500 border-t-transparent',
          sizeClasses[size],
          className,
        )}
        role="status"
      />
    );

    if (fullScreen)
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          {spinner}
        </div>
      );

    return spinner;
  },
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
```

### Step 7: Create ErrorBoundary Component

#### src/components/common/ErrorBoundary/index.tsx

```typescript
import { Component, type ReactNode } from 'react';

import { Button } from '@/components/ui';
import { FM } from '@/localization/helpers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback !== undefined) return fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-text-primary">
            {FM('error.boundary.title')}
          </h2>
          <p className="text-center text-text-secondary">
            {error?.message ?? FM('error.boundary.message')}
          </p>
          <Button onClick={this.handleReset}>{FM('common.action.retry')}</Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
```

---

## Files to Create

| File | Action |
|------|--------|
| `src/components/ui/DataGrid/index.tsx` | Create |
| `src/components/ui/Button/index.tsx` | Create |
| `src/components/ui/Input/index.tsx` | Create |
| `src/components/ui/Select/index.tsx` | Create |
| `src/components/ui/index.ts` | Create |
| `src/components/common/LoadingSpinner/index.tsx` | Create |
| `src/components/common/ErrorBoundary/index.tsx` | Create |

---

## Success Criteria

- [ ] All wrapper components render correctly
- [ ] Type-safe props with good defaults
- [ ] Theme integration works (CSS variables)
- [ ] Accessibility attributes are present (testId, aria-*)
- [ ] Components work in both light and dark mode
- [ ] Error states display correctly
- [ ] Loading states work as expected
- [ ] Unit tests pass for component logic

---

## Unit Test Example

```typescript
// src/components/ui/DataGrid/DataGrid.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import DataGrid from './index';

describe('DataGrid', () => {
  const mockData = [
    { id: 1, name: 'Test 1' },
    { id: 2, name: 'Test 2' },
  ];

  const mockColumns = [
    { field: 'id', headerText: 'ID' },
    { field: 'name', headerText: 'Name' },
  ];

  it('calls onRowSelected when a row is clicked', () => {
    const onRowSelected = vi.fn();

    // Test the callback logic, not the rendering
    const mockArgs = { data: mockData[0] };
    // ... test implementation

    expect(onRowSelected).toHaveBeenCalledWith(mockData[0]);
  });

  it('shows loading overlay when isLoading is true', () => {
    render(
      <DataGrid
        columns={mockColumns}
        data={mockData}
        isLoading
        testId="test-grid"
      />,
    );

    // Verify loading spinner is present
    expect(screen.getByTestId('test-grid').querySelector('.animate-spin')).toBeTruthy();
  });
});
```

---

*Created: 2026-02-07*
