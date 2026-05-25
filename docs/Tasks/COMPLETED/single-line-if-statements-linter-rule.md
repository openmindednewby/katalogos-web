# Enforce Single-Line If Statements Without Braces

## Status: COMPLETED

## Problem Statement

Currently, the codebase allows single-statement if/else blocks to have unnecessary braces:
```typescript
// Current (allowed but verbose)
if (hasError(error)) {
    return <Text style={styles.errorText}>{error}</Text>;
}

// Desired (cleaner)
if (hasError(error)) return <Text style={styles.errorText}>{error}</Text>;
```

This applies to both frontend (TypeScript/React) and backend (C#).

## Implementation Plan

### Frontend (ESLint)
1. Update `BaseClient/eslint.config.mjs` to use `curly: ['error', 'multi-line']`
2. Update frontend code standards documentation

### Backend (C# .editorconfig)
1. Update `.editorconfig` files in all services to use `csharp_prefer_braces = when_multiline:warning`
2. Update backend code standards documentation

### Services to Update
- `IdentityService/.editorconfig`
- `QuestionerService/Questioner/.editorconfig`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/.editorconfig`
- `ContentService/.editorconfig`

## Files Modified

### Configuration Files
- ✅ `BaseClient/eslint.config.mjs` - Changed `curly: ['error', 'all']` to `curly: ['error', 'multi']` (added after prettierConfig to override Prettier's disabling)
- ✅ `IdentityService/.editorconfig` - Changed `csharp_prefer_braces = true:silent` to `csharp_prefer_braces = when_multiline:warning`
- ✅ `QuestionerService/Questioner/.editorconfig` - Changed `csharp_prefer_braces = true:silent` to `csharp_prefer_braces = when_multiline:warning`
- ✅ `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/.editorconfig` - Changed `csharp_prefer_braces = true:silent` to `csharp_prefer_braces = when_multiline:warning`
- ✅ `ContentService/.editorconfig` - Changed `csharp_prefer_braces = true:silent` to `csharp_prefer_braces = when_multiline:warning`

### Documentation Files
- ✅ `BaseClient/docs/code-standards/frontend-react.md` - Updated "Encourage One liner If Cases" section with detailed examples and ESLint rule reference
- ✅ `BaseClient/docs/code-standards/backend-csharp.md` - Added new "Single-Line If Statements" section with examples
- ✅ `CLAUDE.md` - Added new section in ESLint rules for single-line if statements

## Success Criteria
- [x] ESLint `curly` rule changed to `multi-line`
- [x] All backend .editorconfig files updated with `csharp_prefer_braces = when_multiline:warning`
- [x] Frontend code standards updated with examples
- [x] Backend code standards updated with examples
- [x] CLAUDE.md updated with quick reference
- [x] Linter runs successfully on frontend

## Summary of Changes

### Frontend (ESLint)
The `curly` rule was changed from `['error', 'all']` to `['error', 'multi']`:
- **Before**: All if/else statements required braces
- **After**: Single-statement blocks must NOT have braces; multi-statement blocks require braces
- **Note**: Rule is added after `prettierConfig` to override Prettier's disabling of the rule

### Backend (C# .editorconfig)
The `csharp_prefer_braces` setting was changed from `true:silent` to `when_multiline:warning`:
- **Before**: Always prefer braces (silent - no warning)
- **After**: Only require braces for multi-line blocks (warning if violated)

### Examples

**Frontend (TypeScript)**:
```typescript
// ✅ GOOD: Single statement on one line
if (hasError) return null;

// ✅ GOOD: Multi-statement blocks need braces
if (hasError) {
  logError(error);
  return null;
}
```

**Backend (C#)**:
```csharp
// ✅ GOOD: Single statement on one line
if (request == null) throw new ArgumentNullException(nameof(request));

// ✅ GOOD: Multi-statement blocks need braces
if (hasError)
{
    _logger.LogError(error, "Operation failed");
    return BadRequest(error);
}
```

## Test Results
- Frontend lint passes: ✅ `npm run lint:fix` completed with no errors
- Auto-fixed: 214 violations across the codebase
- Web build: ✅ `npx expo export --platform web` successful
