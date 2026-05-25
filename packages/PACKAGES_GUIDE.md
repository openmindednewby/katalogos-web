# Packages Development Guide

This guide covers how to build, debug, and release the local packages in the BaseClient monorepo.

## Package Overview

| Package | Name | Description |
|---------|------|-------------|
| `core` | `@baseclient/core` | Core utilities and types shared across modules |
| `identity-module` | `@baseclient/identity-module` | Identity management module (users, tenants) |
| `questioner-module` | `@baseclient/questioner-module` | Questionnaire functionality module |
| `onlinemenu-module` | `@baseclient/onlinemenu-module` | Online menu functionality module |
| `identity-client` | `@onlinemenu/identity-client` | Identity service HTTP client |

## Directory Structure

```
packages/
├── core/                  # @baseclient/core
├── identity-module/       # @baseclient/identity-module
├── questioner-module/     # @baseclient/questioner-module
├── onlinemenu-module/     # @baseclient/onlinemenu-module
└── identity-client/       # @onlinemenu/identity-client
```

---

## Building Packages

### Build All Packages

From the root `BaseClient` directory, build packages in dependency order:

```bash
# 1. Build core first (no dependencies)
cd packages/core && npm run build && cd ../..

# 2. Build modules (depend on core)
cd packages/identity-module && npm run build && cd ../..
cd packages/questioner-module && npm run build && cd ../..
cd packages/onlinemenu-module && npm run build && cd ../..

# 3. Build identity-client
cd packages/identity-client && npm install && npm run build && cd ../..
```

### Build Single Package

```bash
cd packages/<package-name>
npm run build
```

### Clean Build

Remove `dist` folder and rebuild:

```bash
cd packages/<package-name>
npm run clean    # Removes dist folder
npm run build    # Fresh build
```

---

## Development Workflow

### 1. Making Changes

1. Navigate to the package directory
2. Edit source files in `src/`
3. Rebuild the package
4. Changes are automatically picked up by the main app

```bash
# Example: Edit core utilities
cd packages/core
# Make changes to src/index.ts
npm run build
# Return to root and the app will use updated code
cd ../..
npm start
```

### 2. TypeScript Type Checking

Run type checking without building:

```bash
cd packages/<package-name>
npm run typecheck   # For packages that support it
```

### 3. Linting

```bash
cd packages/<package-name>
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues (if supported)
```

---

## Debugging Packages

### Method 1: Source Maps

Most packages build with source maps. Set breakpoints in the original `.ts` files and they will work in VS Code.

### Method 2: Console Logging

Add temporary console logs in package source:

```typescript
// In packages/core/src/utils/myUtil.ts
export function myUtil(data: SomeData) {
  console.log('[core] myUtil data:', data);
  // ...
}
```

Rebuild and logs appear in the app console.

### Method 3: Direct Source Usage (Development Only)

For faster iteration, temporarily point `main` to source:

```json
// packages/core/package.json (temporary change)
{
  "main": "src/index.ts",  // Instead of "dist/index.js"
  "types": "src/index.ts"
}
```

> **Warning**: Remember to revert before committing!

### Method 4: Using VS Code Debugger

1. Add breakpoints in package source files
2. Start the app with debugging: `npm start`
3. Attach VS Code debugger to the Expo/Metro process

---

## Testing Packages

### Unit Tests

If a package has tests configured:

```bash
cd packages/<package-name>
npm test
```

### Manual Testing

Test package changes in the main app:

```bash
# 1. Build the package
cd packages/core && npm run build && cd ../..

# 2. Start the app
npm start

# 3. Test the changes in the app
```

---

## Releasing New Package Versions

### Versioning Strategy

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

### Release Process

#### Step 1: Update Version

```bash
cd packages/<package-name>

# Patch release (bug fix)
npm version patch

# Minor release (new feature)
npm version minor

# Major release (breaking change)
npm version major
```

#### Step 2: Update Changelog (if exists)

Document changes in `CHANGELOG.md`:

```markdown
## [1.1.0] - 2026-01-21

### Added
- New Button variant: "outline"

### Fixed
- Fixed padding issue in Card component
```

#### Step 3: Build and Test

```bash
npm run clean
npm run build
npm test  # If tests exist
```

#### Step 4: Commit Version Change

```bash
git add packages/<package-name>/package.json
git commit -m "chore(<package-name>): bump version to 1.1.0"
```

#### Step 5: Tag Release (Optional)

```bash
git tag @baseclient/core@1.1.0
git push origin @baseclient/core@1.1.0
```

### Publishing to npm Registry (If Public)

> **Note**: Currently all packages are `private: true` and linked locally via `file:` protocol.

If you need to publish to npm:

1. Remove `"private": true` from `package.json`
2. Ensure you're logged in: `npm login`
3. Publish: `npm publish --access public`

---

## Package Configuration

### Typical package.json Structure

```json
{
  "name": "@scope/package-name",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "clean": "rimraf dist",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-native": "*"
  },
  "devDependencies": {
    "typescript": "~5.9.2"
  },
  "private": true
}
```

### tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## Troubleshooting

### "Cannot find module" after changes

1. Ensure package is built: `npm run build`
2. Clear Metro cache: `npm start -- --clear`
3. Delete `node_modules/.cache` if issues persist

### TypeScript errors in main app

1. Rebuild the package to regenerate `.d.ts` files
2. Restart VS Code TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Changes not reflecting

1. Verify build completed successfully
2. Check `dist/` folder has updated timestamps
3. Restart Metro bundler if hot reload doesn't pick up changes

### Circular dependency errors

Review imports between packages. The dependency order is:

```
core → modules (identity, questioner, onlinemenu)
     → standalone packages (identity-client)
```

---

## Best Practices

1. **Keep packages focused** - Each package should have a single responsibility
2. **Minimize dependencies** - Use `peerDependencies` for shared libraries like React
3. **Export from index** - Always re-export public APIs from `src/index.ts`
4. **Document exports** - Add JSDoc comments to exported functions/components
5. **Test before release** - Always test changes in the main app before versioning
6. **Clean builds** - Run `npm run clean && npm run build` before releases

---

## Quick Reference

| Task | Command |
|------|---------|
| Build package | `cd packages/<name> && npm run build` |
| Clean build | `npm run clean && npm run build` |
| Type check | `npm run typecheck` |
| Bump patch version | `npm version patch` |
| Bump minor version | `npm version minor` |
| Bump major version | `npm version major` |
| Clear Metro cache | `npm start -- --clear` |

---

**Last Updated:** January 2026
