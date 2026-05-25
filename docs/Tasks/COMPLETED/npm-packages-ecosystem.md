# NPM Packages Ecosystem Implementation

> **Status**: COMPLETED - Package published as @dloizides/utils v1.0.0
> **Priority**: Medium
> **Estimated Scope**: Medium (New infrastructure + Package development)

---

## 1. Executive Summary

This document outlines the implementation plan for creating a public npm package ecosystem for the SaaS platform. The first package (`@baseclient/utils`) will contain shared utility functions like `isValueDefined`, `isNotEmptyArray`, and `isNotEmptyString`. The infrastructure will mirror the NuGet packages structure with proper unit tests, documentation, and automation scripts.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Create npm packages folder structure similar to NugetPackages | Must Have |
| FR-02 | Extract utility functions into reusable package | Must Have |
| FR-03 | Full TypeScript support with type definitions | Must Have |
| FR-04 | Unit tests with 100% coverage | Must Have |
| FR-05 | Comprehensive API documentation | Must Have |
| FR-06 | Automated build and publish scripts | Must Have |
| FR-07 | Version management and changelog | Should Have |
| FR-08 | CI/CD integration for publishing | Should Have |
| FR-09 | Tree-shaking support for optimal bundle size | Should Have |
| FR-10 | ESM and CommonJS module support | Should Have |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Package size < 5KB minified | Performance |
| NFR-02 | Zero runtime dependencies | Maintainability |
| NFR-03 | Support for Node.js 18+ and modern browsers | Compatibility |
| NFR-04 | Semantic versioning compliance | Standards |
| NFR-05 | MIT License | Legal |

---

## 3. Current Utilities to Extract

### 3.1 From `BaseClient/src/utils/is.ts`

```typescript
export function isValueDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

export function isNotEmptyArray<T>(value: readonly T[] | null | undefined): value is readonly T[] {
  return Array.isArray(value) && value.length > 0;
}
```

### 3.2 From `BaseClient/src/shared/utils/validators.ts`

```typescript
export const isNotEmptyString = (s?: string): boolean =>
  typeof s === 'string' && s.trim().length > 0;

export const isValueDefined = <T>(v?: T | null): v is T =>
  v !== undefined && v !== null;  // Duplicate - consolidate
```

### 3.3 Additional Utilities to Consider

| Utility | Description | Priority |
|---------|-------------|----------|
| `isNullOrUndefined` | Inverse of isValueDefined | Should Have |
| `isEmptyArray` | Check if array is empty | Should Have |
| `isEmptyString` | Check if string is empty or whitespace | Should Have |
| `isObject` | Check if value is plain object | Could Have |
| `isFunction` | Check if value is a function | Could Have |
| `hasProperty` | Type-safe property check | Could Have |
| `assertDefined` | Assertion function with error throwing | Could Have |

---

## 4. Folder Structure

```
SaaS/
├── NpmPackages/                           # New folder (mirrors NugetPackages)
│   ├── README.md                          # NPM ecosystem overview
│   ├── .github/
│   │   └── workflows/
│   │       └── npm-publish.yml            # CI/CD for publishing
│   │
│   ├── scripts/
│   │   ├── build-all.sh                   # Build all packages
│   │   ├── test-all.sh                    # Test all packages
│   │   ├── publish-all.sh                 # Publish all packages
│   │   ├── version-bump.sh                # Version management
│   │   └── link-local.sh                  # Local development linking
│   │
│   ├── packages/
│   │   └── utils/                         # @baseclient/utils package
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── tsconfig.build.json
│   │       ├── jest.config.js
│   │       ├── rollup.config.js           # Or tsup for bundling
│   │       ├── README.md
│   │       ├── CHANGELOG.md
│   │       ├── LICENSE
│   │       ├── src/
│   │       │   ├── index.ts               # Main export
│   │       │   ├── guards/
│   │       │   │   ├── index.ts
│   │       │   │   ├── isValueDefined.ts
│   │       │   │   ├── isNotEmptyArray.ts
│   │       │   │   ├── isNotEmptyString.ts
│   │       │   │   └── isNullOrUndefined.ts
│   │       │   └── assertions/
│   │       │       ├── index.ts
│   │       │       └── assertDefined.ts
│   │       ├── __tests__/
│   │       │   ├── isValueDefined.test.ts
│   │       │   ├── isNotEmptyArray.test.ts
│   │       │   ├── isNotEmptyString.test.ts
│   │       │   └── assertDefined.test.ts
│   │       └── dist/                      # Built output (gitignored)
│   │           ├── index.js               # CommonJS
│   │           ├── index.mjs              # ESM
│   │           ├── index.d.ts             # Type definitions
│   │           └── index.d.mts            # ESM type definitions
│   │
│   └── shared/                            # Shared build configuration
│       ├── tsconfig.base.json
│       ├── jest.base.config.js
│       └── rollup.base.config.js
```

---

## 5. Package Configuration

### 5.1 Package.json (`@baseclient/utils`)

```json
{
  "name": "@baseclient/utils",
  "version": "1.0.0",
  "description": "Type-safe utility functions for TypeScript projects",
  "keywords": [
    "typescript",
    "utilities",
    "type-guards",
    "validation"
  ],
  "author": "BaseClient Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/baseclient-utils"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      }
    },
    "./guards": {
      "require": {
        "types": "./dist/guards/index.d.ts",
        "default": "./dist/guards/index.js"
      },
      "import": {
        "types": "./dist/guards/index.d.mts",
        "default": "./dist/guards/index.mjs"
      }
    }
  },
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md"
  ],
  "sideEffects": false,
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist",
    "prepublishOnly": "npm run clean && npm run build && npm run test",
    "version": "npm run build",
    "postversion": "git push && git push --tags"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "rimraf": "^5.0.0",
    "ts-jest": "^29.1.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {},
  "dependencies": {}
}
```

### 5.2 tsup.config.ts (Modern bundler)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/guards/index.ts', 'src/assertions/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
});
```

### 5.3 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## 6. Implementation Details

### 6.1 Source Code Structure

#### `src/index.ts` (Main export)
```typescript
// Type Guards
export { isValueDefined } from './guards/isValueDefined';
export { isNotEmptyArray } from './guards/isNotEmptyArray';
export { isNotEmptyString } from './guards/isNotEmptyString';
export { isNullOrUndefined } from './guards/isNullOrUndefined';
export { isEmptyArray } from './guards/isEmptyArray';
export { isEmptyString } from './guards/isEmptyString';

// Assertions
export { assertDefined } from './assertions/assertDefined';

// Re-export namespaced
export * as guards from './guards';
export * as assertions from './assertions';
```

#### `src/guards/isValueDefined.ts`
```typescript
/**
 * Type guard that checks if a value is neither null nor undefined.
 *
 * @param value - The value to check
 * @returns True if the value is defined (not null and not undefined)
 *
 * @example
 * ```typescript
 * const value: string | null | undefined = getValue();
 * if (isValueDefined(value)) {
 *   // value is narrowed to string
 *   console.log(value.length);
 * }
 * ```
 */
export function isValueDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}
```

#### `src/guards/isNotEmptyArray.ts`
```typescript
/**
 * Type guard that checks if a value is a non-empty array.
 *
 * @param value - The value to check
 * @returns True if the value is an array with at least one element
 *
 * @example
 * ```typescript
 * const items: string[] | undefined = getItems();
 * if (isNotEmptyArray(items)) {
 *   // items is narrowed to string[] with at least one element
 *   console.log(items[0]); // Safe to access
 * }
 * ```
 */
export function isNotEmptyArray<T>(
  value: readonly T[] | null | undefined
): value is readonly T[] & { length: number } {
  return Array.isArray(value) && value.length > 0;
}
```

#### `src/guards/isNotEmptyString.ts`
```typescript
/**
 * Checks if a value is a non-empty string (after trimming whitespace).
 *
 * @param value - The value to check
 * @returns True if the value is a string with non-whitespace content
 *
 * @example
 * ```typescript
 * isNotEmptyString('hello');     // true
 * isNotEmptyString('  ');        // false
 * isNotEmptyString('');          // false
 * isNotEmptyString(undefined);   // false
 * ```
 */
export function isNotEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
```

#### `src/assertions/assertDefined.ts`
```typescript
/**
 * Asserts that a value is defined (not null or undefined).
 * Throws an error if the value is null or undefined.
 *
 * @param value - The value to assert
 * @param message - Optional error message
 * @throws Error if value is null or undefined
 *
 * @example
 * ```typescript
 * const user = getUser(); // User | null
 * assertDefined(user, 'User must exist');
 * // user is now narrowed to User
 * console.log(user.name);
 * ```
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message ?? 'Value must be defined');
  }
}
```

---

## 7. Unit Tests

### 7.1 Test Structure

```
__tests__/
├── guards/
│   ├── isValueDefined.test.ts
│   ├── isNotEmptyArray.test.ts
│   ├── isNotEmptyString.test.ts
│   └── isNullOrUndefined.test.ts
└── assertions/
    └── assertDefined.test.ts
```

### 7.2 Example Test File (`isValueDefined.test.ts`)

```typescript
import { isValueDefined } from '../src/guards/isValueDefined';

describe('isValueDefined', () => {
  describe('returns false for nullish values', () => {
    it('should return false for null', () => {
      expect(isValueDefined(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValueDefined(undefined)).toBe(false);
    });
  });

  describe('returns true for falsy but defined values', () => {
    it('should return true for zero', () => {
      expect(isValueDefined(0)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isValueDefined('')).toBe(true);
    });

    it('should return true for false', () => {
      expect(isValueDefined(false)).toBe(true);
    });

    it('should return true for NaN', () => {
      expect(isValueDefined(NaN)).toBe(true);
    });
  });

  describe('returns true for truthy values', () => {
    it('should return true for non-empty string', () => {
      expect(isValueDefined('hello')).toBe(true);
    });

    it('should return true for positive number', () => {
      expect(isValueDefined(42)).toBe(true);
    });

    it('should return true for object', () => {
      expect(isValueDefined({})).toBe(true);
    });

    it('should return true for array', () => {
      expect(isValueDefined([])).toBe(true);
    });

    it('should return true for function', () => {
      expect(isValueDefined(() => {})).toBe(true);
    });
  });

  describe('type narrowing', () => {
    it('should narrow type correctly', () => {
      const value: string | null | undefined = 'test';
      if (isValueDefined(value)) {
        // TypeScript should narrow this to string
        const length: number = value.length;
        expect(length).toBe(4);
      }
    });
  });
});
```

### 7.3 Jest Configuration

```javascript
// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  }
};
```

---

## 8. Automation Scripts

### 8.1 Build All Packages (`scripts/build-all.sh`)

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building all npm packages..."

for package_dir in "$ROOT_DIR/packages"/*; do
  if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
    package_name=$(basename "$package_dir")
    echo "Building $package_name..."
    (cd "$package_dir" && npm run build)
    echo "$package_name built successfully!"
  fi
done

echo "All packages built successfully!"
```

### 8.2 Test All Packages (`scripts/test-all.sh`)

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Testing all npm packages..."

for package_dir in "$ROOT_DIR/packages"/*; do
  if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
    package_name=$(basename "$package_dir")
    echo "Testing $package_name..."
    (cd "$package_dir" && npm run test:coverage)
    echo "$package_name tests passed!"
  fi
done

echo "All packages tested successfully!"
```

### 8.3 Publish All Packages (`scripts/publish-all.sh`)

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DRY_RUN=${DRY_RUN:-false}

echo "Publishing all npm packages..."

if [ "$DRY_RUN" = "true" ]; then
  echo "DRY RUN MODE - No packages will be published"
fi

for package_dir in "$ROOT_DIR/packages"/*; do
  if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
    package_name=$(basename "$package_dir")
    echo "Publishing $package_name..."

    if [ "$DRY_RUN" = "true" ]; then
      (cd "$package_dir" && npm publish --dry-run --access public)
    else
      (cd "$package_dir" && npm publish --access public)
    fi

    echo "$package_name published successfully!"
  fi
done

echo "All packages published!"
```

### 8.4 Version Bump (`scripts/version-bump.sh`)

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
VERSION_TYPE=${1:-patch}  # patch, minor, major

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

echo "Bumping version ($VERSION_TYPE) for all packages..."

for package_dir in "$ROOT_DIR/packages"/*; do
  if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
    package_name=$(basename "$package_dir")
    echo "Bumping $package_name..."
    (cd "$package_dir" && npm version "$VERSION_TYPE" --no-git-tag-version)
    new_version=$(node -p "require('$package_dir/package.json').version")
    echo "$package_name bumped to $new_version"
  fi
done

echo "All packages version bumped!"
```

### 8.5 Local Development Link (`scripts/link-local.sh`)

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BASECLIENT_DIR="$ROOT_DIR/../BaseClient"

echo "Linking packages for local development..."

# Build and link all packages
for package_dir in "$ROOT_DIR/packages"/*; do
  if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
    package_name=$(node -p "require('$package_dir/package.json').name")
    echo "Building and linking $package_name..."
    (cd "$package_dir" && npm run build && npm link)

    # Link in BaseClient
    if [ -d "$BASECLIENT_DIR" ]; then
      (cd "$BASECLIENT_DIR" && npm link "$package_name")
      echo "Linked $package_name in BaseClient"
    fi
  fi
done

echo "All packages linked for local development!"
```

---

## 9. CI/CD Configuration

### 9.1 GitHub Actions Workflow (`.github/workflows/npm-publish.yml`)

```yaml
name: NPM Package CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'NpmPackages/**'
  pull_request:
    branches: [main]
    paths:
      - 'NpmPackages/**'
  release:
    types: [published]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: NpmPackages

    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: NpmPackages/packages/*/package-lock.json

      - name: Install dependencies (all packages)
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm ci)
          done

      - name: Lint
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm run lint)
          done

      - name: Type check
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm run typecheck)
          done

      - name: Test with coverage
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm run test:coverage)
          done

      - name: Build
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm run build)
          done

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'release'
    defaults:
      run:
        working-directory: NpmPackages

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm ci)
          done

      - name: Build
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm run build)
          done

      - name: Publish to npm
        run: |
          for dir in packages/*/; do
            (cd "$dir" && npm publish --access public)
          done
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 10. Documentation

### 10.1 Package README.md Template

```markdown
# @baseclient/utils

> Type-safe utility functions for TypeScript projects

[![npm version](https://badge.fury.io/js/@baseclient%2Futils.svg)](https://www.npmjs.com/package/@baseclient/utils)
[![CI](https://github.com/your-org/baseclient/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/your-org/baseclient/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @baseclient/utils
# or
yarn add @baseclient/utils
# or
pnpm add @baseclient/utils
```

## Features

- **Type Guards**: `isValueDefined`, `isNotEmptyArray`, `isNotEmptyString`
- **Assertions**: `assertDefined`
- **Zero Dependencies**: No runtime dependencies
- **Tree-shakeable**: Only import what you need
- **TypeScript First**: Full type inference and narrowing

## Usage

### Type Guards

```typescript
import { isValueDefined, isNotEmptyArray, isNotEmptyString } from '@baseclient/utils';

// isValueDefined - Check if value is not null or undefined
const user = getUserOrNull();
if (isValueDefined(user)) {
  console.log(user.name); // TypeScript knows user is defined
}

// isNotEmptyArray - Check if array has elements
const items = getItems();
if (isNotEmptyArray(items)) {
  console.log(items[0]); // Safe to access first element
}

// isNotEmptyString - Check if string has content
const input = formData.get('name');
if (isNotEmptyString(input)) {
  saveUser(input); // String is guaranteed to have content
}
```

### Assertions

```typescript
import { assertDefined } from '@baseclient/utils';

function processUser(user: User | null) {
  assertDefined(user, 'User is required');
  // user is now narrowed to User
  return user.name.toUpperCase();
}
```

### Subpath Imports

```typescript
// Import only guards
import { isValueDefined } from '@baseclient/utils/guards';

// Import only assertions
import { assertDefined } from '@baseclient/utils/assertions';
```

## API Reference

### Type Guards

| Function | Description |
|----------|-------------|
| `isValueDefined<T>(value)` | Returns `true` if value is not `null` or `undefined` |
| `isNotEmptyArray<T>(value)` | Returns `true` if value is an array with length > 0 |
| `isNotEmptyString(value)` | Returns `true` if value is a non-empty string |
| `isNullOrUndefined(value)` | Returns `true` if value is `null` or `undefined` |
| `isEmptyArray(value)` | Returns `true` if value is an empty array |
| `isEmptyString(value)` | Returns `true` if value is empty or whitespace |

### Assertions

| Function | Description |
|----------|-------------|
| `assertDefined<T>(value, message?)` | Throws if value is `null` or `undefined` |

## License

MIT
```

---

## 11. Migration Plan

### 11.1 Update BaseClient to Use Package

After publishing the package:

1. **Install the package**:
   ```bash
   cd BaseClient
   npm install @baseclient/utils
   ```

2. **Update imports** in affected files:
   ```typescript
   // Before
   import { isValueDefined } from '../utils/is';
   import { isNotEmptyString } from '../shared/utils/validators';

   // After
   import { isValueDefined, isNotEmptyString } from '@baseclient/utils';
   ```

3. **Remove old utility files**:
   - Delete `BaseClient/src/utils/is.ts`
   - Update `BaseClient/src/shared/utils/validators.ts` to remove duplicates

4. **Update test imports accordingly**

---

## 12. Implementation Tasks

### Phase 1: Infrastructure Setup

#### Task 1.1: Create Folder Structure
- [ ] Create `NpmPackages/` directory
- [ ] Create `packages/utils/` directory structure
- [ ] Create `scripts/` directory with automation scripts
- [ ] Create `shared/` directory with base configurations
- [ ] Create root `README.md` for NPM ecosystem

#### Task 1.2: Configure Package
- [ ] Create `package.json` with proper metadata
- [ ] Create `tsconfig.json` for TypeScript
- [ ] Create `tsup.config.ts` for bundling
- [ ] Create `jest.config.js` for testing
- [ ] Create `.eslintrc.js` for linting
- [ ] Create `LICENSE` file (MIT)

### Phase 2: Implementation

#### Task 2.1: Implement Type Guards
- [ ] Implement `isValueDefined` with JSDoc
- [ ] Implement `isNotEmptyArray` with JSDoc
- [ ] Implement `isNotEmptyString` with JSDoc
- [ ] Implement `isNullOrUndefined` with JSDoc
- [ ] Implement `isEmptyArray` with JSDoc
- [ ] Implement `isEmptyString` with JSDoc
- [ ] Create barrel exports (`index.ts`)

#### Task 2.2: Implement Assertions
- [ ] Implement `assertDefined` with JSDoc
- [ ] Create barrel exports

#### Task 2.3: Write Unit Tests
- [ ] Tests for `isValueDefined` (100% coverage)
- [ ] Tests for `isNotEmptyArray` (100% coverage)
- [ ] Tests for `isNotEmptyString` (100% coverage)
- [ ] Tests for other guards (100% coverage)
- [ ] Tests for `assertDefined` (100% coverage)
- [ ] Ensure all edge cases covered

### Phase 3: Automation & CI/CD

#### Task 3.1: Create Automation Scripts
- [ ] Create `build-all.sh`
- [ ] Create `test-all.sh`
- [ ] Create `publish-all.sh`
- [ ] Create `version-bump.sh`
- [ ] Create `link-local.sh`
- [ ] Make scripts executable

#### Task 3.2: Set Up CI/CD
- [ ] Create GitHub Actions workflow
- [ ] Configure npm authentication
- [ ] Test workflow with dry-run publish
- [ ] Document release process

### Phase 4: Documentation & Publishing

#### Task 4.1: Documentation
- [ ] Write package `README.md`
- [ ] Create `CHANGELOG.md`
- [ ] Add usage examples
- [ ] Document API reference

#### Task 4.2: Initial Publish
- [ ] Build package
- [ ] Run all tests
- [ ] Publish to npm (v1.0.0)
- [ ] Verify package on npmjs.com

### Phase 5: Migration

#### Task 5.1: Update BaseClient
- [ ] Install `@baseclient/utils` in BaseClient
- [ ] Update all imports
- [ ] Remove old utility files
- [ ] Update tests
- [ ] Run full verification suite

#### Task 5.2: E2E Verification
- [ ] Run BaseClient unit tests
- [ ] Run BaseClient lint
- [ ] Run BaseClient build
- [ ] Run Playwright E2E tests

---

## 13. Success Criteria

### Must Pass Before Release

- [ ] All unit tests passing (100% coverage)
- [ ] Package builds successfully (CJS + ESM + types)
- [ ] No lint errors
- [ ] Package size < 5KB minified
- [ ] Tree-shaking works correctly
- [ ] TypeScript types are correct
- [ ] Documentation complete
- [ ] CI/CD pipeline working

### Post-Migration Verification

- [ ] BaseClient unit tests passing
- [ ] BaseClient build succeeds
- [ ] BaseClient lint passes
- [ ] E2E tests passing
- [ ] No runtime errors in development

---

## 14. Future Packages (Roadmap)

| Package | Description | Priority |
|---------|-------------|----------|
| `@baseclient/utils` | Type guards and validators | Phase 1 (this task) |
| `@baseclient/hooks` | Shared React hooks | Phase 2 |
| `@baseclient/api-client` | HTTP client utilities | Phase 2 |
| `@baseclient/test-utils` | Testing utilities | Phase 3 |
| `@baseclient/i18n` | Internationalization helpers | Phase 3 |

---

## 15. Open Questions

1. **Scope Name**: Should we use `@baseclient/` or a different org scope?
2. **Registry**: Public npm or private registry?
3. **Monorepo Tool**: Should we use Turborepo, Nx, or plain npm workspaces?
4. **Versioning**: Independent versioning or synchronized versions across packages?
5. **Additional Utilities**: What other utilities should be included in v1.0.0?

---

## Appendix A: NPM Account Setup

1. Create npm account at https://www.npmjs.com/signup
2. Create organization for scoped packages
3. Generate access token for CI/CD
4. Store token as GitHub secret `NPM_TOKEN`

---

## Appendix B: Related Documents

- [React Code Standards](../../react-code-standards.md)
- [Playwright Best Practices](../../../E2ETests/docs/playwright-best-practices.md)
- Existing utility files:
  - `BaseClient/src/utils/is.ts`
  - `BaseClient/src/shared/utils/validators.ts`
