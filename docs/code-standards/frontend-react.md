# Code Standards

> **Related Documents:**
> - [State Management Architecture](state-management-architecture.md) - **CRITICAL** for TanStack Query + SignalR real-time features
> - [API Hooks Guide](api-hooks-guide.md) - Orval hook generation

[Code Standards](#code-standards)

- [Code Standards](#code-standards)
  - [Client App (React - Front End)](#client-app-react---front-end)
    - [General](#general)
    - [Don't use magic strings use Enums](#dont-use-magic-strings-use-enums)
    - [Dont use the ternary conditional operator ? : in HTML](#dont-use-the-ternary-conditional-operator---in-html)
    - [Naming Conventions](#naming-conventions)
      - [Use PascalCase for](#use-pascalcase-for)
      - [Use camelCase for](#use-camelcase-for)
      - [Specific Naming Patterns](#specific-naming-patterns)
      - [Use UPPERCASE with snake_case for](#use-uppercase-with-snake_case-for)
      - [Standard Naming Conventions](#standard-naming-conventions)
    - [Functions](#functions)
    - [Conditions (if, else, switch)](#conditions-if-else-switch)
      - [Use Early Returns Where Possible](#use-early-returns-where-possible)
      - [Encourage One liner If Cases.](#encourage-one-liner-if-cases)
    - [Folder Structure](#folder-structure)
      - [Views Folder](#views-folder)
    - [Components](#components)
      - [Component Structure Order](#component-structure-order)
      - [Props](#props)
      - [useEffect](#useeffect)
    - [The !](#the-)
      - [example](#example)
    - [Redux (Legacy)](#redux-legacy---avoid-for-new-code)
    - [Zustand (Preferred)](#zustand-preferred-for-client-state)
      - [Zustand vs Redux Comparison](#zustand-vs-redux-comparison)
      - [When to Use Zustand vs Redux](#when-to-use-zustand-vs-redux)
      - [Zustand Store Structure](#zustand-store-structure)
      - [Zustand Code Standards](#zustand-code-standards)
      - [Zustand Best Practices Summary](#zustand-best-practices-summary)
    - [State Management](#state-management)
    - [Locale](#locale)
    - [Forms](#forms)
      - [How to make a form](#how-to-make-a-form)
        - [FormType and FormFields example](#formtype-and-formfields-example)
        - [getInitialFormState example](#getinitialformstate-example)
        - [buildQueryParameters example](#buildqueryparameters-example)
        - [Form example (index.tsx)](#form-example-indextsx)
    - [Tables](#tables)
      - [How to make a table](#how-to-make-a-table)
      - [How to sort based on the date](#how-to-sort-based-on-the-date)
    - [Styling](#styling)
    - [React Fragment](#react-fragment)
    - [Accessibility](#accessibility)
    - [Error Handling (HTTP API Calls only)](#error-handling-http-api-calls-only)
      - [Considerations](#considerations)
      - [Error Handling Approaches](#error-handling-approaches)
        - [Update HTTP Interceptor Response (Check Body for 200 status code)](#update-http-interceptor-response-check-body-for-200-status-code)
    - [Tanstack Query (How to manage API calls)](#tanstack-query-how-to-manage-api-calls)
      - [POST Example with useMutation](#post-example-with-usemutation)
        - [Service File](#service-file)
        - [Component File](#component-file)
      - [GET Example with useQuery](#get-example-with-usequery)
      - [How to Invalidate Query](#how-to-invalidate-query)
    - [Navigation funciton](#navigation-funciton)
      - [Example Navigation Function](#example-navigation-function)
  - [Unit Testing (Jest)](#unit-testing-jest)
  - [Playwright](#playwright)

## Client App (React - Front End)

### General

- Do not create low level custom shared components. Make use of antDesign as much as possible. Re use components if there are no differences.
  - Only create custom shared component to add additional functionality.
- **fail fast principle** we throw exceptions for anything not handled explicitly instead of hiding the bugs
- **SOLID**
  - Each function should have 1 purpose
- **YAGNI**
- **KISS**
- **DRY**
  - if it is duplicated 2-3 times its ok, its at the discretion of the developer to refactor and make it shared. If it is dublicated more than 3 times it must be refactored and shared
- Each component should have/do one single responsibility/ semantic meaning. If a file gets too large its a warning sign that the single responsibility principle is violated
- Avoid prop drilling. For complicated components, prefer to move state to **Zustand** (preferred) or Redux (legacy) instead of passing state through multiple props
- Prefer to minimize passing custom props to avoid dependencies, hence, copying and passing React components work as they are.
- Avoid writing comments, do not write comments, instead make the the code clean and self explanatory
- **do not use prefix or post fix or abbreviations, use whole words (e.g. use NameFilter instead of NameFilt).**
- Define functions return type if its not void/undefined!! **Especially when they are public**
- Make use of **isValueDefined** to check for null and undefined cases!
- Break complex functionality/components into smaller ones.
  - **Files should not be more than 300 lines, around 100-200 lines is acceptable**
- use react function components not class components
- Keep consistency in the creation of the tables (there is a specific way to we create and structure a table) or for any other component. Follow the same approach as other components in the code base and keep the code base structured and consistent.

### Don't use magic strings use Const Enums

Magic strings are hard-coded string values used directly in logic without:

- central definition,
- validation,
- auto-completion,
- or type–safety.
  They make code harder to maintain, refactor, and debug.

**Always use `const enum` — never regular `enum` or string literal union types.**

```ts
// ❌ BAD: Magic strings
if (linkType === "Ticket") { ... }

// ❌ BAD: String literal union type (no autocomplete, no refactoring support)
type LinkType = 'Ticket' | 'Article';

// ❌ BAD: Regular enum (creates runtime object)
enum LinkType {
  Ticket = "Ticket",
  Article = "Article",
}

// ✅ GOOD: Const enum (inlined at compile time, full IDE support)
const enum LinkType {
  Ticket = 'Ticket',
  Article = 'Article',
}

if (linkType === LinkType.Ticket) {
  //...
} else if (linkType === LinkType.Article) {
  //...
}
```

#### Enum File Isolation (ENFORCED BY LINTER)

Each exported enum should live in its own dedicated file. Only related helpers (functions, types, or constants that reference the enum) may share the file.

```ts
// ❌ BAD: Enum mixed with unrelated exports in the same file
export const enum ExportType { Csv = 'csv', Excel = 'excel' }
export interface TableColumn { ... }  // Unrelated to ExportType

// ❌ BAD: Multiple exported enums in one file
export const enum ErrorActionType { Retry = 'retry', Dismiss = 'dismiss' }
export const enum ErrorSeverity { Low = 'low', High = 'high' }

// ✅ GOOD: Enum in its own file with related helper
// file: exportType.ts
export const enum ExportType { Csv = 'csv', Excel = 'excel' }
export const exportTypeToLabel = (t: ExportType): string => { ... };
```

Both rules (`prefer-const-enum` and `enum-file-isolation`) are enforced as warnings by ESLint. They will be upgraded to errors after the existing codebase is migrated.

### Dont use the ternary conditional operator ? : in HTML

Only use the ternary conditional operator ? : in HTML if it is a small one liner. In general avoid its usage

**avoid**

```tsx
{
  isNotEmptyArray(relatedLinks) ? (
    relatedLinks.map((link) => (
      <Link
        key={`${link.linkType}-${link.linkId}`}
        link={link}
        onDelete={handleDeleteLink}
      />
    ))
  ) : (
    <DTText type="secondary">
      {FM("knowledgeBase.ticket.noRelatedLinks")}
    </DTText>
  );
}
```

**do**

```tsx
{
  isNotEmptyArray(relatedLinks) &&
    relatedLinks.map((link) => (
      <Link
        key={`${link.linkType}-${link.linkId}`}
        link={link}
        onDelete={handleDeleteLink}
      />
    ));
}
{
  !isNotEmptyArray(relatedLinks) && (
    <DTText type="secondary">
      {FM("knowledgeBase.ticket.noRelatedLinks")}
    </DTText>
  );
}
```

### Naming Conventions

- **Interfaces**
  - Interface names are with pascal case
  - Interface fields are with camel case
    - Unless we are mapping the interface to an object we receive from the API
- Variables are with camel case
- React Functions are with pascal case
- Normal functions are with camel case
- use the function key word instead of () => when declaring normal functions
  - If its one liner function use arrow () =>

#### Use PascalCase for

- Components
- Type definitions
- Enums
- Interfaces
- Component folders and directories (e.g. DocumentDetails/index.tsx)
- All other folders use camelCase
- Name parent components files as index.tsx inside directories with the component names

#### Use camelCase for

- Variables
- Functions
- Methods
- Hooks
- Properties
- Props

#### Specific Naming Patterns

- Prefix event handlers with 'handle': handleClick, handleSubmit
- Prefix boolean variables with verbs: isLoading, hasError, canSubmit
- Prefix custom hooks with 'use': useAuth, useForm
- Use complete words over abbreviations except for:
  - props (properties) (All component Props have an interface named Props)
  - FM (Format Message specific function used for localization translation)
  - FD (Format Date specific function used for date localization translation)

#### Use UPPERCASE with snake_case for

- Environment variables (e.g. VITE_HTTP_TIMEOUT_SECONDS=120)

#### Standard Naming Conventions

- **onClick** action is named onClick (unless there is more than 1 onClick in which we add a PostFix _onClickCountry_)
- **onChange** action is named onChange (unless there is more than 1 onClick in which we add a PostFix _onClickCountry_)

### Functions

- Function names are with camelCase
- Define the return type of functions unless the type is **void** or **undefined**
- Should do only 1 thing and do it well (single responsibility principle)
- Event functions should be named with a "handle" prefix, like "handleClick" for onClick and "handleKeyDown" for onKeyDown

#### Function Declaration Style (ENFORCED by `enforce-function-style`)

| Context | Declaration | Example |
|---------|------------|---------|
| Exported functions | `export function foo()` | `export function createStore(): Store { ... }` |
| Private multi-line helpers | `function foo()` | `function computeState(): State { ... }` |
| Private single-expression | `const foo = () => expr;` | `const delay = (ms: number) => new Promise(r => setTimeout(r, ms));` |
| Callbacks / closures | Arrow `() => {}` | `items.map((x) => x.id)` |
| React components | Arrow (existing rule) | `const Button: FC = () => <button />` (enforced by `react/function-component-definition`) |

**Why**: `function` declarations hoist and provide a clear visual hierarchy. Single-expression arrows are concise. React components stay as arrows per existing convention.

#### Module Ordering (ENFORCED by `enforce-function-style`)

Statements within a module should follow this order:
1. **Exports** — `export function`, `export const`, `export default`
2. **Private functions** — `function` declarations and `const`-assigned function expressions
3. **Constants** — Non-function `const` declarations

Imports, type declarations, and re-exports are exempt from ordering.

#### Function Size Limits (ENFORCED by `smart-max-lines`)

- **React Components** (functions returning JSX): max 200 lines
- **Regular Functions**: max 50 lines (error), warning at 30 lines
- Recommended: 10-20 lines for regular functions, 100-150 for components

### Conditions (if, else, switch)

- if more than 2 _if_ statements are used, use a switch statement if possible
- throw exception when unexpected/not-covert value/case is returned instead of hiding it with a default value (**fail fast principle**)
- if a condition is more than 3 statements, create a constant or function and name it appropriately
  - eg:

```ts
const shouldUpdateDeliveryAddress =
      isValueDefined(contactAddress) &&
      isValueDefined(deliveryAddress) &&
      value === SameAsContactAddress.SameAsContactAddress;

      if (shouldUpdateDeliveryAddress) {
```

#### Use Early Returns Where Possible

- Use early returns whenever possible to make the code more readable.

```ts
//Do this
useEffect(() => {
  if (!isValueDefined(value)) return;

  //...the rest of the logic
}, []);

//Don't do this
useEffect(() => {
  if (isValueDefined(value)) {
    //...the rest of the logic
  }

  return;
}, []);
```

#### Extract Complex Conditions (ENFORCED BY LINTER)

If a condition has **more than 2 expressions**, extract it to a named variable or function. This is enforced by ESLint.

```ts
// ❌ BAD: More than 2 conditions inline (LINTER ERROR)
if (isValueDefined(contactAddress) && isValueDefined(deliveryAddress) && value === SameAs.ContactAddress) {
  // ...
}

// ✅ GOOD: Extract to named variable
const shouldUpdateDeliveryAddress =
  isValueDefined(contactAddress) &&
  isValueDefined(deliveryAddress) &&
  value === SameAs.ContactAddress;

if (shouldUpdateDeliveryAddress) {
  // ...
}

// ❌ BAD: Complex ternary condition
const result = (a && b && c) ? 'yes' : 'no';

// ✅ GOOD: Extract condition
const isFullyValid = a && b && c;
const result = isFullyValid ? 'yes' : 'no';
```

**Why?** Named variables make conditions self-documenting and easier to debug.

#### Single-Statement If/Else Without Braces (ENFORCED BY LINTER)

When an if/else statement has only a **single statement** in its body, write it **without braces**. This is enforced by ESLint's `curly: multi` rule.

```typescript
// ❌ BAD: Single statement with braces (LINTER ERROR)
if (hasError(error)) {
  return <Text style={styles.errorText}>{error}</Text>;
}

// ✅ GOOD: Single statement without braces (short - fits on one line)
if (hasError(error)) return <Text>{error}</Text>;

// ✅ GOOD: Single statement without braces (long - Prettier formats across lines)
if (hasError(error))
  return <Text style={[styles.errorText, themeStyles.errorText]}>{error}</Text>;

// ❌ BAD: Multiple single-statement ifs with braces
if (submissionId) {
  dispatch(getDocumentTypes(submissionId));
} else {
  dispatch(getDocumentTypes());
}

// ✅ GOOD: Single-line statements without braces
if (!isValueDefined(submissionId)) dispatch(getDocumentTypes(submissionId));
if (isValueDefined(submissionId)) dispatch(getDocumentTypes());

// ✅ GOOD: Multi-statement blocks MUST have braces
if (hasError) {
  logError(error);
  showNotification(error.message);
  return null;
}
```

**Rule:** Braces are only required when the block contains **multiple statements**. Prettier handles line formatting.

### Folder Structure

#### Views Folder

- all of the private pages are placed under Views folder in a hierarchy manner. (sun tjun the art of war - managing many is the same as managing few, its just a matter of division)

### Components

#### Component Structure Order

1. **Zustand stores** (useUiStore, useSelectionStore) - preferred for new code
2. **Redux state** (useAppDispatch, useAppSelector) - legacy, maintain only
3. **TanStack Query hooks** (useQuery, useMutation, or real-time wrappers like `useRealtimeTemplatesList`)
4. **local state** (useState)
5. **any other hook** like useLocal, useNavigate
6. **define constant variables** from the hooks above
7. **useEffect** hook with logic
8. **function definitions** (onClick, onChange)
9. **Conditional Logic With Return Statement** `(if (!user?.profileResponse || !roleIsAuthorized) return <Navigate to="/login" />;)`

> **Note:** For real-time features, prefer using wrapped hooks (e.g., `useRealtimeTemplatesList`) over raw Orval hooks. See [State Management Architecture](state-management-architecture.md).

```tsx
const UpdateCase = memo(() => {
  const app = useAppSelector((state: RootState) => state.app);
  const layout = useAppSelector((state: RootState) => state.layout);
  const app = useAppSelector((state: RootState) => state.app);

  const { data, isSuccess, isLoading, refetch } =
    useGetJurisdictionOptions(courtId);
  const { data: availableJurisdictions } =
    useGetManageSystemAvailableJurisdictions(courtId!);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const containerStyle = useCustomContainerStyle();
  const lawFirmId = getSelectedLawFirmId(layout.selectedLawFirmId);
  const [form] = DTForm.useForm<FormType>();
  const watchDistrictField = DTForm.useWatch(FormFields.DistrictField, form);

  useEffect(() => {
    //...the rest of the logic
  }, []);

  async function onFinish(value: FormType) {
    //...the rest of the logic
  }
  return <></>;
});
```

#### Props

- Always create a private interface named **Props** for props passed to the component
- Avoid _prop drilling_. If we need to pass a prop through multiple layers/components (more than 1 - max 2 components) using props is not ideal, consider moving the state to **Zustand** (preferred) or Redux (legacy).

**Example**

```tsx

interface Props {
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
}
const ScaleFiled = ({ value, setValue }: Props) => {
```

#### useEffect

- use **getAsync** or **postAsync** etc in all useEffect hooks that require to wrap inside a function the async function

```tsx
useEffect(() => {
  async function getAsync(): Promise<void> {
    const response = await getReferalStatus(caseDetails!.Id);
    setAlreadyRefered(response.data === 1);
  }
  getAsync();
}, [caseDetails!.Id]);
```

### The !

- Use the **!** in cases where typescript type checking is wrong but with care
- prefer adding on top of the file the /_eslint-disable @typescript-eslint/no-non-null-assertion_/ instead of inline

#### example

```typescript
/* eslint-disable @typescript-eslint/no-non-null-assertion */
useEffect(() => {
  async function getAsync(): Promise<void> {
    const response = await getLawFirmLawyers(selectedLawFirm!.Id);
    setLawyers([...response.data.Items]);
  }

  if (isValueDefined(selectedLawFirm?.Id)) getAsync();
}, [selectedLawFirm]);
```

### Redux (Legacy - Avoid for New Code)

> **IMPORTANT:** For new features, prefer **Zustand** over Redux. Redux should only be used for maintaining existing code.

- do not store everything (limit 5mb) for whole app
- do not store binary files
- store shared

### Zustand (Preferred for Client State)

Zustand is a lightweight, flexible state management library that we prefer over Redux for client-side state. It offers simpler setup, better TypeScript support, and smaller bundle size.

#### Zustand vs Redux Comparison

| Feature | Zustand | Redux |
|---------|---------|-------|
| **Bundle Size** | ~1KB | ~7KB (+ toolkit ~12KB) |
| **Boilerplate** | Minimal | High (actions, reducers, selectors) |
| **TypeScript** | Excellent (native) | Good (requires extra setup) |
| **DevTools** | Optional middleware | Built-in with Redux DevTools |
| **Learning Curve** | Low | High |
| **Async Actions** | Native (just use async/await) | Requires thunks/sagas |
| **Re-renders** | Fine-grained (auto-optimized) | Requires manual `useSelector` optimization |
| **Middleware** | Simple functions | Complex middleware system |
| **Use Case** | UI state, preferences, simple global state | Complex state with time-travel debugging needs |

#### When to Use Zustand vs Redux

| Scenario | Use Zustand | Use Redux |
|----------|-------------|-----------|
| UI preferences (sidebar, theme) | ✅ | ❌ |
| Selected rows/items | ✅ | ❌ |
| Modal/drawer state | ✅ | ❌ |
| Form wizards (multi-step) | ✅ | ❌ |
| Shopping cart | ✅ | ❌ |
| Existing Redux codebase | ❌ | ✅ (maintain only) |
| Complex undo/redo | ❌ | ✅ |
| Time-travel debugging needed | ❌ | ✅ |

#### Zustand Store Structure

```
src/
├── stores/
│   ├── index.ts              # Re-exports all stores
│   ├── useUiStore.ts         # UI preferences (sidebar, theme mode)
│   ├── useSelectionStore.ts  # Selected items across tables
│   └── useWizardStore.ts     # Multi-step form state
```

#### Zustand Code Standards

##### 1. Store File Naming

- Use `use{StoreName}Store.ts` naming convention
- One store per file
- Keep stores focused (single responsibility)

```typescript
// ✅ GOOD: Focused store names
useUiStore.ts
useSelectionStore.ts
useCartStore.ts

// ❌ BAD: Generic or multi-purpose
useStore.ts
useGlobalStore.ts
useEverythingStore.ts
```

##### 2. Store Definition Pattern

```typescript
// src/stores/useUiStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define state interface
interface UiState {
  // State
  isSidebarOpen: boolean;
  isDarkMode: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleDarkMode: () => void;
}

// Create store with middleware
export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isSidebarOpen: true,
        isDarkMode: false,

        // Actions
        toggleSidebar: () => set((state) => ({
          isSidebarOpen: !state.isSidebarOpen
        })),

        setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

        toggleDarkMode: () => set((state) => ({
          isDarkMode: !state.isDarkMode
        })),
      }),
      {
        name: 'ui-storage', // localStorage key
      }
    ),
    { name: 'UiStore' } // DevTools name
  )
);
```

##### 3. Using Stores in Components

```typescript
// ✅ GOOD: Select only what you need (auto-optimized re-renders)
function Sidebar() {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside className={isSidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}

// ✅ GOOD: Multiple selectors for fine-grained control
function Header() {
  const isDarkMode = useUiStore((state) => state.isDarkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);
  // Component only re-renders when isDarkMode or toggleDarkMode changes
}

// ❌ BAD: Selecting entire store (causes unnecessary re-renders)
function Component() {
  const store = useUiStore(); // Re-renders on ANY state change
}
```

##### 4. Async Actions

```typescript
interface DataState {
  items: Item[];
  isLoading: boolean;
  error: string | null;

  fetchItems: () => Promise<void>;
  addItem: (item: Item) => Promise<void>;
}

export const useDataStore = create<DataState>()(
  devtools((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    fetchItems: async () => {
      set({ isLoading: true, error: null });
      try {
        const items = await api.getItems();
        set({ items, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    addItem: async (item) => {
      const currentItems = get().items; // Access current state
      try {
        const newItem = await api.createItem(item);
        set({ items: [...currentItems, newItem] });
      } catch (error) {
        set({ error: error.message });
      }
    },
  }))
);
```

##### 5. Computed Values / Derived State

```typescript
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
}));

// ✅ GOOD: Compute derived values in component or custom hook
function useCartTotal() {
  const items = useCartStore((state) => state.items);
  return useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
}

// Usage in component
function CartSummary() {
  const total = useCartTotal();
  return <div>Total: ${total}</div>;
}
```

##### 6. Slices Pattern (for larger stores)

```typescript
// src/stores/slices/uiSlice.ts
import type { StateCreator } from 'zustand';

export interface UiSlice {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({
    isSidebarOpen: !state.isSidebarOpen
  })),
});

// src/stores/slices/themeSlice.ts
export interface ThemeSlice {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({
    isDarkMode: !state.isDarkMode
  })),
});

// src/stores/useAppStore.ts
import { create } from 'zustand';
import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createThemeSlice, type ThemeSlice } from './slices/themeSlice';

type AppStore = UiSlice & ThemeSlice;

export const useAppStore = create<AppStore>()((...args) => ({
  ...createUiSlice(...args),
  ...createThemeSlice(...args),
}));
```

##### 7. Testing Zustand Stores

```typescript
// src/stores/__tests__/useUiStore.test.ts
import { useUiStore } from '../useUiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUiStore.setState({ isSidebarOpen: true, isDarkMode: false });
  });

  it('toggles sidebar state', () => {
    const { toggleSidebar } = useUiStore.getState();

    expect(useUiStore.getState().isSidebarOpen).toBe(true);

    toggleSidebar();

    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('sets sidebar open state directly', () => {
    const { setSidebarOpen } = useUiStore.getState();

    setSidebarOpen(false);

    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });
});
```

#### Zustand Best Practices Summary

| Practice | Do | Don't |
|----------|----|----- |
| Store scope | One responsibility per store | One giant store for everything |
| Selectors | Select only needed state | Select entire store object |
| Persistence | Use `persist` middleware for user preferences | Persist server data (use TanStack Query) |
| DevTools | Enable in development | Disable in production for performance |
| Naming | `use{Name}Store` | Generic names like `useStore` |
| Actions | Keep in store definition | Dispatch actions from components |
| Async | Use async/await directly | Create separate action creators |
| Types | Define interfaces for state | Use `any` types |

### State Management

> **Full Documentation:** [State Management Architecture](state-management-architecture.md)

#### Where State Should Live

| State Type | Location | Example |
|------------|----------|---------|
| Server Data | TanStack Query Cache | Templates, users, menus |
| Real-time Updates | TanStack Query Cache (via SignalR) | Live row updates |
| **UI Preferences** | **Zustand** (preferred) | Sidebar open, theme mode |
| **Selected Items** | **Zustand** (preferred) | Selected table rows, active filters |
| **Multi-step Forms** | **Zustand** (preferred) | Wizard state, form progress |
| Simple Local State | useState | Toggle visibility, input focus |
| Form State | React Hook Form / useState | Form inputs, validation |
| Route State | URL/Router | Current page, query params |
| Legacy Global State | Redux (maintain only) | Existing Redux stores |

> **Rule:** Use **Zustand** for client state that needs to be shared across components. Use **TanStack Query** for server state. Use **useState** for component-local state.

#### Real-Time Features (SignalR + TanStack Query)

When implementing real-time features, follow the **Custom Hook Abstraction** pattern:

```typescript
// ❌ BAD: Exposing queryClient in component
function TemplateList() {
  const queryClient = useQueryClient();
  useEffect(() => {
    connection.on('TemplateUpdated', (data) => {
      queryClient.setQueryData(['templates'], ...); // DON'T DO THIS
    });
  }, []);
}

// ✅ GOOD: Use real-time wrapper hook (complexity hidden)
function TemplateList() {
  const { data } = useRealtimeTemplatesList(); // SignalR handled internally
  return <Table data={data?.templates} />;
}
```

**Key Rules:**
- **NEVER** expose `queryClient.setQueryData()` in component code
- **ALWAYS** wrap Orval-generated hooks with real-time capabilities in `src/lib/hooks/{service}/`
- Use `getXxxQueryKey()` functions from Orval for cache updates
- See [State Management Architecture](state-management-architecture.md) for full implementation patterns

### Locale (MANDATORY — FM() Only)

**ALWAYS use `FM()` from `localization/helpers.ts` for ALL user-facing strings.** Never use `t()` from `useTranslation()` or `react-i18next` directly.

#### Why FM() over t()

- `FM()` has **no fallback mechanism** — if a key is missing from JSON, the raw key string (e.g., `dashboard.menus.title`) is displayed in the UI, making missing translations immediately visible
- `t('key', 'fallback')` silently hides missing translations behind hardcoded fallback strings, which masks the problem
- `FM()` enforces a **JSON-first workflow**: you must add the key to the locale file before using it
- Single import from `localization/helpers` — no hook boilerplate needed

#### Rules

1. **Import `FM` from `../../localization/helpers`** (adjust relative path as needed)
2. **Do NOT use `useTranslation()` hook** — remove it if present, replace all `t()` calls with `FM()`
3. **Do NOT use fallback strings** — no `t('key', 'My Fallback')`. If the key doesn't exist in JSON, add it
4. **Add ALL keys to `src/localization/locales/en.json`** — this is the ONLY file loaded by i18n. The `locales/en/` subdirectory (`core.json`, `features.json`, `layout.json`) is NOT loaded at runtime
5. **Use `{{p1}}`, `{{p2}}`, `{{p3}}` placeholders** in JSON for parameterized messages

#### Usage

```tsx
import { FM } from '../../localization/helpers';

// Simple translation
<Text>{FM('dashboard.menus.title')}</Text>

// With parameters — JSON: "welcomeBack": "Welcome back, {{p1}}"
<Text>{FM('dashboard.welcomeBack', displayName)}</Text>

// Accessibility props
<TouchableOpacity
  accessibilityLabel={FM('dashboard.menus.guidedCta')}
  accessibilityHint={FM('dashboard.menus.guidedCtaHint')}
>

// In data structures (outside JSX)
const options = [
  { label: FM('common.field.district.nicosia'), value: DistrictFiledEnum.Nicosia },
  { label: FM('common.field.district.limassol'), value: DistrictFiledEnum.Limassol },
];
```

#### Anti-patterns (DO NOT DO)

```tsx
// BAD — uses t() from useTranslation hook
const { t } = useTranslation();
<Text>{t('dashboard.title')}</Text>

// BAD — hardcoded fallback hides missing key
<Text>{t('dashboard.title', 'Dashboard')}</Text>

// BAD — hardcoded string
<Text>Welcome back</Text>

// GOOD — FM() with key that exists in JSON
<Text>{FM('dashboard.title')}</Text>
```

### Forms

- Do not bind redux global storage as form values as it causes performance issues (event on every character)
- **Custom components need to implement value and onChange props to work with antD forms and need to be direct children of Form.Item**

#### How to make a form

- see component **NoticeBoardLawyerFormSection** as an example

break the form in the following files

- import type { FormType } from './formType';
- import { FormFields } from './formType';
- './getInitialFormState';
- './buildQueryParameters';
- index.tsx -> for NoticeBoardLawyerFormSection witch contains the form

##### FormType and FormFields example

```tsx
export enum FormFields {
  DistrictField = "districtField", //Επαρχία
  CourtField = "courtField", //Δικαστήριο
  JurisdictionField = "jurisdictionField", //Δικαιοδοσία *
  RegistryField = "registryField", // Μητρώο *
  CaseNumberField = "CaseNumberField", //Αριθμός υπόθεσης
  JudgeField = "JudgeField", //Δικαστής
  ShowMyCases = "ShowMyCases", //Έφεση
  FromDateField = "FromDateField", //Από
  ToDateField = "ToDateField", //Μέχρι
}

export interface FormType {
  [FormFields.DistrictField]: DistrictFiledEnum | undefined;
  [FormFields.CourtField]: CourtIds | string | undefined;
  [FormFields.JurisdictionField]: number | undefined;
  [FormFields.RegistryField]: number | undefined;
  [FormFields.CaseNumberField]: string | undefined;
  [FormFields.JudgeField]: string | undefined;
  [FormFields.ShowMyCases]: boolean;
  [FormFields.FromDateField]: dayjs.Dayjs | undefined;
  [FormFields.ToDateField]: dayjs.Dayjs | undefined;
}
```

##### getInitialFormState example

```tsx
export function getInitialFormState(): FormType {
  return {
    [FormFields.DistrictField]: undefined,
    [FormFields.CourtField]: undefined,
    [FormFields.JurisdictionField]: undefined,
    [FormFields.RegistryField]: undefined,
    [FormFields.CaseNumberField]: undefined,
    [FormFields.JudgeField]: undefined,
    [FormFields.ShowMyCases]: false,
    [FormFields.FromDateField]: dayjs().startOf("day"),
    [FormFields.ToDateField]: dayjs().endOf("month"),
  };
}
```

##### buildQueryParameters example

```tsx
export function buildQueryParameters(
  value: FormType,
  lawFirmId: string | -1,
  UserCode: string
): QueryParameters {
  const DateFrom: string | undefined =
    value.FromDateField!.format("DD/MM/YYYY");
  const DateTo: string | undefined = value.ToDateField!.format("DD/MM/YYYY");

  const queryParameters: QueryParameters = {
    CourtId: value.courtField!,
    JurisdictionId: value.jurisdictionField!,
    Processid: value.registryField!,
    CaseNumber: value.CaseNumberField ?? "",
    JudgeId: value.JudgeField ?? "",
    DateFrom,
    DateTo,
    UserCode,
    OrganisationCode: lawFirmId.toString(), //this is always -1 for some reason JIMTODO to check this with another user
    ShowMyCases: mapBooleanToNumber(value.ShowMyCases ?? false),
  };
  return queryParameters;
}
```

##### Form example (index.tsx)

```tsx
const NoticeBoardLawyerFormSection = memo(
  ({ setTableRows, setTableRowsByDate }: Props) => {
    const app = useAppSelector((state: RootState) => state.app);
    const layout = useAppSelector((state: RootState) => state.layout);
    const user = useAppSelector((state: RootState) => state.user);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [judges, setJudges] = useState<Judge[]>();

    const containerStyle = useCustomContainerStyle();
    const [form] = DTForm.useForm<FormType>();

    const watchDistrictField = DTForm.useWatch(FormFields.DistrictField, form);
    const watchCourtField = DTForm.useWatch(FormFields.CourtField, form);
    const watchJurisdictionField = DTForm.useWatch(
      FormFields.JurisdictionField,
      form
    );
    const watchRegistryField = DTForm.useWatch(FormFields.RegistryField, form);

    const lawFirmId = getSelectedLawFirmId(layout.selectedLawFirmId);

    useEffect(() => {
      form.setFieldsValue(getInitialFormState());
    }, []);

    async function onFinish(value: FormType) {
      setIsSubmitting(true);
      const queryParameters: QueryParameters = buildQueryParameters(
        value,
        lawFirmId,
        user.profileResponse!.Id
      );
      const response = await getLawyerCalendarMeetings(queryParameters);
      const mappedResponse = mapResponse(response.data.Items);
      const groupedRowsByDate = getGroupedRowsByDate(mappedResponse);
      setTableRows(mappedResponse.rows);
      setTableRowsByDate(groupedRowsByDate);
      setIsSubmitting(false);
    }

    function onReset(): void {
      form.resetFields();
    }

    return (
      <>
        <div style={containerStyle}>
          <DTForm<FormType>
            form={form}
            layout={"vertical"}
            initialValues={{ layout: "vertical" }}
            className="table-demo-control-bar"
            onValuesChange={(_form) => {}}
            size="middle"
            style={{ marginBottom: 16 }}
            onFinish={onFinish}
            onReset={onReset}
          >
            <DTFlex wrap gap="small" justify="flex-start" align="flex-start">
              <DTForm.Item<FormType>
                name={FormFields.DistrictField}
                rules={[buildSimpleFormFieldRule("common.field.district")]}
                label={FM("common.field.district")}
              >
                <DistrictField />
              </DTForm.Item>
            </DTFlex>

            <DTFlex
              wrap
              gap="small"
              justify="flex-start"
              align="flex-start"
              style={{ marginBottom: 8 }}
            >
              <DTForm.Item<FormType>
                name={FormFields.CourtField}
                rules={[buildSimpleFormFieldRule("common.field.court")]}
                label={FM("common.field.court")}
              >
                <CourtField district={watchDistrictField} />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.JurisdictionField}
                rules={[buildSimpleFormFieldRule("common.field.jurisdiction")]}
                label={FM("common.field.jurisdiction")}
              >
                <JurisdictionField
                  courtId={watchCourtField}
                  mode={JurisdictionFieldFetchMode.DoNotIncludeUserCode}
                />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.RegistryField}
                rules={[buildSimpleFormFieldRule("common.field.registry")]}
                label={FM("common.field.registry")}
              >
                <RegistryField
                  courtId={watchCourtField}
                  jurisdictionCode={watchJurisdictionField?.toString()}
                  mode={RegistryFieldFetchMode.IncludeIsOpening}
                  isOpening={false}
                />
              </DTForm.Item>
            </DTFlex>

            <DTFlex wrap gap="small" justify="flex-start" align="flex-start">
              <DTForm.Item<FormType>
                name={FormFields.CaseNumberField}
                label={FM("common.field.caseNumber")}
              >
                <DTInput
                  style={{ minWidth: 270 }}
                  placeholder={FM("common.field.caseNumber")}
                  allowClear
                />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.JudgeField}
                label={FM("common.field.judge")}
              >
                <JudgesField
                  courtId={watchCourtField}
                  jurisdictionCode={watchJurisdictionField?.toString()}
                  registryCode={watchRegistryField?.toString()}
                  setItemsExternally={setJudges}
                  allowClear={true}
                />
              </DTForm.Item>

              <div style={{ minWidth: 287 }}>
                <DTForm.Item<FormType>
                  name={FormFields.ShowMyCases}
                  valuePropName="checked"
                  label={" "}
                >
                  <DTCheckbox>{FM("noticeBoard.myCases")}</DTCheckbox>
                </DTForm.Item>
              </div>
            </DTFlex>

            <DTDivider />
            <DTTitle level={2}>{FM("search.case.submissionDate")}</DTTitle>

            <DTFlex wrap gap="small" justify="flex-start" align="flex-start">
              <DTForm.Item<FormType>
                name={FormFields.FromDateField}
                label={FM("common.form.date.from")}
                rules={[buildSimpleFormFieldRule("common.form.date.from")]}
              >
                <DTDatePicker {...datePickerDefaultProps} />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.ToDateField}
                label={FM("common.form.date.to")}
                rules={[buildSimpleFormFieldRule("common.form.date.to")]}
              >
                <DTDatePicker {...datePickerDefaultProps} />
              </DTForm.Item>
            </DTFlex>
            <DTFlex wrap gap="small" justify="flex-end" align="flex-start">
              <DTForm.Item<FormType> label={null}>
                <DTButton
                  style={{ marginTop: "30px" }}
                  htmlType="button"
                  onClick={onReset}
                >
                  {FM("common.action.clear")}
                </DTButton>
              </DTForm.Item>

              <DTForm.Item<FormType> label={null}>
                <DTButton
                  size={app.buttonSize}
                  loading={isSubmitting}
                  style={{ marginTop: "30px" }}
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                >
                  {FM("common.action.search")}
                </DTButton>
              </DTForm.Item>
            </DTFlex>
          </DTForm>
        </div>
      </>
    );
  }
);

export default NoticeBoardLawyerFormSection;
```

### Tables

#### How to make a table

COMMING SOON!!

#### How to sort based on the date

```tsx
{
  title: FM('common.table.column.date'),
  dataIndex: 'CreationDateString',
  sorter: (a, b) => new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime(),
  sortOrder: "descend",
  filters: filters.CreationDateString,
  onFilter: (value, record) => record.CreationDateString.includes(value as string),
  filterSearch: true,
},
```

### Styling

- Avoid using .less to place styles as in React this are in fact global and not local styles
- Instead for local styles use inline styles ()if they are long extract them into a constant even move them into a different file), All other styles should just be set in antD theme token.
- use antD flex component DTFlex instead of creating custom flex css
- **Avoid added styles in css components as much as possible, in stead just configure properly the antD theme token once and reuse it where possible. In necessary cases you may add a few inline styles.**

### React Fragment

- Always use short had notation of react key fragment `<>` instead of the full text `React.Fragment` unless you need to pass some props
  - For example in some cases it is needed to pass the `key` prop, in that case it is acceptable/preferred to use the `React.Fragment` instead of a div

### Accessibility

- Implement accessibility features on elements. For example, a tag should have a tabindex="0", aria-label, on:click, and on:keydown, and similar attributes.
- All `TouchableOpacity` and interactive elements MUST have:
  - `testID` - for E2E testing
  - `accessibilityLabel` - for screen readers
  - `accessibilityHint` - describes what happens when activated

### ESLint Rules Reference

The following rules are enforced by ESLint. Violations will cause lint failures.

#### File and Function Size Limits

| Limit | Max | Recommended | Rule |
|-------|-----|-------------|------|
| File length | 300 lines | 100-200 lines | `max-lines` |
| **React components** | 200 lines | 100-150 lines | `smart-max-lines/smart-max-lines` |
| **Regular functions** | 50 lines (error) | 10-20 lines | `smart-max-lines/smart-max-lines` |
| **Regular functions** | 30 lines (warning) | 10-20 lines | `smart-max-lines/smart-max-lines` |
| Function parameters | 4 | 3 or fewer | `max-params` |
| Nesting depth | 4 levels | 2-3 levels | `max-depth` |
| Callback nesting | 3 levels | 2 levels | `max-nested-callbacks` |
| Cyclomatic complexity | 15 | 10 or fewer | `complexity` |

**Note:** The linter automatically detects React components (functions returning JSX) and applies the 200-line limit. Regular utility functions, hooks, and callbacks use the stricter 50-line limit with warnings at 30 lines.

#### Type Assertions / Casting (PROHIBITED)

**Type assertions (casting) are completely prohibited in production code.** If you need to cast, you are likely doing something wrong.

Type assertions like `as Record<string, unknown>` or `as SomeType` bypass TypeScript's type checking and can hide bugs. The linter will error on any use of `as` casting.

```typescript
// ❌ PROHIBITED: Type assertions
const data = response.data as User[];
const config = obj as Record<string, unknown>;
const user = data as unknown as User;

// ✅ CORRECT: Use proper generic types
const response = await api.get<User[]>('/users');
const data: User[] = response.data;

// ✅ CORRECT: Use type guards for runtime checks
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value && 'name' in value;
}

if (isUser(data)) {
  // data is now typed as User - no casting needed
  console.log(data.name);
}

// ✅ CORRECT: Use proper imports instead of require()
// BAD: const mod = require('module') as Record<string, unknown>;
import { something } from 'module';

// ✅ ALLOWED: 'as const' for literal type narrowing (special case)
const COLORS = ['red', 'blue', 'green'] as const;
const CONFIG = { timeout: 5000, retries: 3 } as const;
```

**How to fix common casting patterns:**

| Pattern | Problem | Solution |
|---------|---------|----------|
| `response.data as User[]` | API response untyped | Use generic: `api.get<User[]>()` |
| `obj as Record<string, unknown>` | Unknown object shape | Define interface or use type guard |
| `value as unknown as Type` | Double casting | Fix the source type or use type guard |
| `require('x') as Type` | Dynamic require | Use static `import` statement |
| `event.target as HTMLInputElement` | DOM event typing | Use generic event: `ChangeEvent<HTMLInputElement>` |

**Exception:** Unit tests are allowed to use type assertions for mocking purposes.

#### Type Safety (Errors - Must Fix)

```typescript
// ❌ BAD: Using 'any' type
const data: any = fetchData();

// ✅ GOOD: Proper typing
const data: UserResponse = fetchData();

// ❌ BAD: Non-null assertion
const name = user!.name;

// ✅ GOOD: Proper null check
const name = user?.name ?? 'Unknown';

// ❌ BAD: Truthy check on string/number
if (value) { ... }

// ✅ GOOD: Explicit comparison
if (value !== '' && value !== undefined) { ... }
```

#### Magic Numbers and Strings

```typescript
// ❌ BAD: Magic numbers
if (status === 200) { ... }
const timeout = 5000;

// ✅ GOOD: Named constants
const HTTP_OK = 200;
const TIMEOUT_MS = 5000;
if (status === HTTP_OK) { ... }

// ❌ BAD: Magic strings
if (role === 'admin') { ... }

// ✅ GOOD: Enums
const enum UserRole {
  Admin = 'admin',
  User = 'user',
}
if (role === UserRole.Admin) { ... }
```

**Note:** The following numbers are allowed without constants: `0`, `1`, `-1`, `2`, `100`, and array indexes.

#### Color Literals (Error - Must Fix)

```typescript
// ❌ BAD: Inline color values
<View style={{ backgroundColor: '#FF0000' }} />
<View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />

// ✅ GOOD: Theme tokens or constants
const OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.5)';
<View style={{ backgroundColor: theme.colors.error }} />
<View style={{ backgroundColor: OVERLAY_BACKGROUND }} />
```

#### Import Organization

Imports must be organized in this order (enforced by `import/order`):

1. React and React Native
2. Expo packages
3. External packages (npm)
4. Internal packages (`@/**`)
5. Parent/sibling imports
6. Index imports
7. Type imports

```typescript
// Correct import order:
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import * as Linking from 'expo-linking';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

import { helpers } from '../utils';
import { styles } from './styles';

import type { UserProps } from './types';
```

#### Const Enums Required

```typescript
// ❌ BAD: Regular enum (creates runtime object)
enum Status {
  Active = 'active',
}

// ✅ GOOD: Const enum (inlined at compile time)
const enum Status {
  Active = 'active',
}
```

#### Exhaustive Switch Statements

```typescript
// ❌ BAD: Missing case or default
switch (status) {
  case Status.Active:
    return 'Active';
  // Missing other cases!
}

// ✅ GOOD: All cases handled
switch (status) {
  case Status.Active:
    return 'Active';
  case Status.Inactive:
    return 'Inactive';
  default:
    throw new Error(`Unhandled status: ${status}`);
}
```

#### React Native Specific Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `no-inline-styles` | Error | Extract styles to StyleSheet or constants |
| `no-color-literals` | Error | Use theme tokens or constants |
| `no-unused-styles` | Error | Remove unused StyleSheet properties |
| `no-raw-text` | Error | Wrap text in Text component |
| `no-single-element-style-arrays` | Error | Don't use `style={[singleStyle]}` |

#### Quick Lint Commands

```bash
# Check for errors
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# Strict mode (warnings become errors)
npm run lint:strict
```

### Error Handling (HTTP API Calls only)

**Use interceptor with helper function for error display, use tanstack for state management, mapping, caching and etc.**

#### Considerations

- Backend does not change the header state code instead returns the error in the response and keeps the status code as 200 (most of time)

```json
//**most common result object**
"Result": {
    "MyCallBack": null,
    "Code": "200",
    "Message": null,
    "ResponseStatus": null,
    "ServerName": null,
    "ServerIp": null
}

//other common response
"MyCallBack": null,
"Code": "200",
"Message": null,
"ResponseStatus": null,
"ServerName": null,
"ServerIp": null

//also some times this is not there
"Ok"
```

#### Error Handling Approaches

- Update interceptor with new helper function to determine if the body of the response is error

##### Update HTTP Interceptor Response (Check Body for 200 status code)

### Tanstack Query (How to manage API calls)

> **For Real-Time Features:** See [State Management Architecture](state-management-architecture.md) for SignalR + TanStack Query integration patterns.

- folder structure ex(`services/caseDocuments/useGetDocumentList.ts`)
  - services/
    - `<featureName>/`
      - interfaces OR shared (if more that interfaces are shared PER FEATURE)
    - shared (for common interfaces and API Calls/HOOKS)
- **Real-time hooks** should be placed in `src/lib/hooks/{service}/` and wrap Orval-generated hooks

#### POST Example with useMutation

- make use of **isPending**

##### Service File

```ts
//POST
export const useLogin = (
  options?: UseMutationOptions<Result<LoginResponse>, Error, LoginPayload>
): UseMutationResult<Result<LoginResponse>, Error, LoginPayload> => {
  return useMutation({
    mutationFn: login,
    ...options,
  });
};

const login = async (
  loginPayload: LoginPayload
): Promise<Result<LoginResponse>> => {
  return await loginRequest(loginPayload);
};

async function loginRequest(loginPayload: LoginPayload) {
  return await post<LoginPayload, LoginResponse>(
    Endpoints.Login,
    loginPayload,
    false,
    true
  );
}
```

##### Component File

```ts
const { data, isLoading, isSuccess, refetch } = useCourtCodes(
  user.profileResponse?.Id
);

const {
  mutate: login,
  isPending,
  // isError,
  // data,
  // error,
} = useLogin({
  onSuccess: (response) => {
    dispatch(setLoginResponse(response.data));
    const role = mapSystemRolesToRole(response.data.Roles);
    dispatch(setAggregatedRouterRole(role));
    refetch();
  },
  // onError: (error) => {
  //   // form.
  //   console.error('Login failed:', error);
  // },
});

function onSubmit(values: FormType) {
  const payload: LoginPayload = {
    username: values[FormFields.UserName]!,
    password: values[FormFields.Password]!,
  };

  login(payload);
}
```

#### GET Example with useQuery

- make use of **isLoading** not isPending or isFetching

```ts
//in component
const { data, isLoading, isSuccess } = useCourtCodes(user.profileResponse?.Id);

// in service
export const useCourtCodes = (userId: string | undefined) => {
  return useQuery({
    queryKey: [Endpoints.CourtCodes, userId],
    queryFn: async (): Promise<Result<CourtCodesResponse>> =>
      courtCodes(userId!),
    enabled: isValueDefined(userId), // query runs only when truthy
  });
};

const courtCodes = async (
  userId: string
): Promise<Result<CourtCodesResponse>> => {
  return await courtCodesRequest(userId);
};
```

#### How to Invalidate Query

```ts
//Option 1 Use refetch callback
const {
  data: pendingCaseData,
  isLoading,
  isSuccess,
  refetch: refetchPendingCase,
} = useGetPendingCase(lawFirmId);

//Option 2 - Manual invalidation (use sparingly)
const queryClient = useQueryClient();
const { data, isLoading, isSuccess } = useGetDocumentNotes(externalId);

function refetchQueries() {
  queryClient.invalidateQueries({
    queryKey: [Endpoints.GetDocumentNotes, externalId],
  });
}
```

> **For Real-Time Features:** Prefer SignalR-based cache updates over manual invalidation. With real-time hooks, data updates automatically when other users make changes. See [State Management Architecture](state-management-architecture.md).

### Navigation funciton

- All navigation functions sould be placed in `ClientApp\src\utils\navigationActions`

#### Example Navigation Function

```tsx
export function navigateToDocumentDetails(
  navigate: NavigateFunction<AdditionalState>,
  id: number,
  caseId: number,
  caseName: string
) {
  const additionalStateParams = { Id: caseId, Name: caseName };
  const state: AdditionalState = { id: id, additionalStateParams };

  navigate(`/documents/${id}`, {
    state,
  });
}

//called example
<DTButton
  size={"small"}
  type={"link"}
  onClick={() =>
    navigateToDocumentDetails(navigate, record.id, caseId, caseName)
  }
>
  {record.SubmissionDateString}
</DTButton>;
```

## Unit Testing (Jest)

- Unit tests should focus on public/exported functions (utilities, services, hooks helpers) and treat component internals as implementation details.
- Do not write unit tests that mount and snapshot whole components just to raise coverage; full user flows and component integration are covered via Playwright.

## Playwright

- Test should follow the arrange-act-assert method <https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/>
- Identifires should replaced inside constants
- Tests shoul be written in way to run in all the environments
- `$env:BASE_URL = 'https://192.168.210.105/iJustice'; npx playwright test --debug`
- `$env:BASE_URL = 'https://localhost:5173/iJustice'; npx playwright test caseDetails.spec.ts --headed --repeat-each 5`
- `$env:BASE_URL = 'https://localhost:5173/iJustice'; $env:MODE = 'test'; npx playwright test caseDetails.spec.ts --headed --repeat-each 5`
