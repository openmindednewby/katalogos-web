# Icons & Branding Components

## SvgIcon

Inline SVG icon renderer. Uses path data from the `iconPaths` registry -- zero font loading, zero network requests.

**Import**: `import SvgIcon from '@/components/Icons/SvgIcon'` or `import { SvgIcon } from '@/components/Icons'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| name | `IconName` | Yes | - | Icon name from the registry |
| size | `number` | No | `24` | Icon width and height in pixels |
| color | `string` | No | `'#000000'` | Icon fill color |
| testID | `string` | No | - | Test ID |
| accessibilityLabel | `string` | No | - | Accessibility label |
| accessibilityHint | `string` | No | - | Accessibility hint |

### Available Icons

| Category | Icons |
|----------|-------|
| Navigation | `menu`, `home`, `logout` |
| Actions | `close`, `edit`, `trash`, `eye`, `link`, `refresh`, `lightning` |
| Notifications | `bell`, `play` |
| Chevrons | `chevronDown`, `chevronUp`, `chevronLeft`, `chevronRight`, `arrowUp`, `arrowDown` |
| Layout | `grid`, `list`, `cards`, `compact`, `diamond`, `squareFill` |
| Content | `document`, `checkmark`, `memo`, `forkKnife`, `building`, `people`, `circle` |
| Analytics | `barChart`, `trendingUp`, `target`, `crosshair` |
| System | `fileText`, `monitor`, `server`, `triangle`, `sliders`, `shield`, `key`, `settings` |
| Utility | `qrCode`, `download`, `copy`, `code` |

```tsx
<SvgIcon
  name="edit"
  size={20}
  color={theme.colors.text}
  accessibilityLabel={FM('common.edit')}
  accessibilityHint={FM('common.editHint')}
/>
```

---

## TenantLogo

Displays the tenant's branding logo from the resolved theme. Falls back to the app title text when no logo URL is available.

**Import**: `import TenantLogo from '@/components/core/TenantLogo'` or `import { TenantLogo } from '@/components/core/TenantLogo'`

This component has no props -- it reads the logo URL from `useTheme().branding.logoUrl`.

```tsx
<TenantLogo />
```

**Accessibility**: Image has `accessibilityLabel={FM('app.title')}`, `accessibilityIgnoresInvertColors`, `accessibilityHint`.

### Helper

`resolveLogoUrl(logoUrl: string | null): string | null` -- exported from the same module for testing. Returns `null` if the URL is empty or undefined.
