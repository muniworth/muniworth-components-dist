# General Concepts

## Design Tokens

All tokens are defined in `panda.config.ts` and available via Panda CSS's type-safe API.

### Colors

**Brand:**
| Token | Value | Usage |
|-------|-------|-------|
| `brand.blue` | #00B2CC | Primary brand color |
| `brand.red` | #ED3F30 | Secondary brand color |
| `brand.dark` | #333232 | Dark brand color |

**Neutral:**
| Token | Value |
|-------|-------|
| `neutral.dark` | #333232 |
| `neutral.medium` | #5C6464 |
| `neutral.base` | #8E9191 |
| `neutral.blue` | #A3B0B3 |
| `neutral.light` | #EAEAEA |

**Data Palette (for charts):**
| Token | Value |
|-------|-------|
| `data.navy` | #003A5D |
| `data.red` | #ED3F30 |
| `data.blue` | #00B2CC |
| `data.orange` | #EF8936 |
| `data.purple-dark` | #764FA0 |
| `data.yellow` | #E7E51A |
| `data.purple` | #B65DA4 |
| `data.green` | #8AC640 |

**State:**
| Token | Value | Usage |
|-------|-------|-------|
| `state.info` | #00B2CC | Informational |
| `state.success` | #8AC640 | Success |
| `state.warning` | #EF8936 | Warning |
| `state.danger` | #ED3F30 | Error/danger |

**Backgrounds:**
| Token | Value |
|-------|-------|
| `bg.base` | #FFFFFF |
| `bg.subtle` | #F7F7F7 |
| `bg.elevated` | #FFFFFF |

**Borders:**
| Token | Value |
|-------|-------|
| `border.subtle` | #EAEAEA |
| `border.strong` | #8E9191 |

**Text:**
| Token | Value |
|-------|-------|
| `text.main` | #333232 |
| `text.subtle` | #5C6464 |
| `text.on-dark` | #FFFFFF |
| `text.link` | #00B2CC |
| `text.link-hover` | #003A5D |

### Semantic Tokens (Light/Dark Mode)

Semantic tokens automatically switch values based on color mode.

**Text:**
- `text.primary` - Main text
- `text.secondary` - Subtle text
- `text.linkColor` - Link color
- `text.linkHover` - Link hover color

**Background:**
- `background.base` - Page background
- `background.subtle` - Secondary background
- `background.elevated` - Cards, modals

**Accent:**
- `accent.primary` - Primary accent (brand.blue)
- `accent.secondary` - Secondary accent (brand.red)
- `accent.dark` - Dark accent

**Border:**
- `border.default` - Default borders
- `border.emphasis` - Emphasized borders

**Component-specific tokens** are prefixed by component name:
- `button.primary.bg`, `button.primary.text`, etc.
- `alert.info.bg`, `alert.success.border`, etc.
- `badge.info.bg`, `badge.neutral.text`, etc.
- `tabs.active.border`, `tabs.inactive.text`, etc.
- `toast.bg`, `toast.text`, `toast.border`
- `popover.bg`, `popover.border`
- `tooltip.bg`, `tooltip.text`
- `progress.bg`, `progress.fill`
- `spinner.color`
- `accordion.trigger.hover`, `accordion.content.bg`
- `checkbox.indicator`
- `breadcrumb.separator`
- `selection.bg`
- `overlay.modal`

### Spacing

| Token | Value |
|-------|-------|
| `2xs` | 4px |
| `xs` | 8px |
| `sm` | 12px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 48px |

### Typography

**Font Family:**
- `fonts.brand`: "Benton Sans", "Work Sans", "Trebuchet MS", system-ui, sans-serif

**Font Sizes:**
| Token | Value |
|-------|-------|
| `xs` | 12px |
| `sm` | 14px |
| `md` | 16px |
| `lg` | 20px |
| `xl` | 24px |
| `2xl` | 32px |
| `3xl` | 40px |

**Font Weights:**
| Token | Value |
|-------|-------|
| `regular` | 400 |
| `medium` | 500 |
| `bold` | 700 |

**Line Heights:**
| Token | Value |
|-------|-------|
| `tight` | 1.2 |
| `normal` | 1.5 |
| `relaxed` | 1.7 |

### Radii (Border Radius)

| Token | Value |
|-------|-------|
| `sm` | 4px |
| `md` | 8px |
| `lg` | 12px |
| `pill` | 9999px |

**Semantic radii:**
- `component.buttonRadius` → md
- `component.inputRadius` → md
- `component.cardRadius` → lg
- `component.modalRadius` → lg
- `component.badgeRadius` → pill
- `component.alertRadius` → md
- `component.toastRadius` → md
- `component.popoverRadius` → md
- `component.progressRadius` → pill

### Shadows

| Token | Value |
|-------|-------|
| `soft` | 0 2px 6px rgba(0, 0, 0, 0.08) |
| `strong` | 0 6px 24px rgba(0, 0, 0, 0.12) |

**Semantic shadows:**
- `component.cardShadow` → soft
- `component.modalShadow` → strong
- `component.dropdownShadow` → strong
- `component.popoverShadow` → strong
- `component.toastShadow` → strong
- `focus.primary` - Primary focus ring
- `focus.danger` - Danger focus ring
- `focus.button` - Button focus ring
- `focus.dialog` - Dialog focus ring
- `focus.light` - Light focus ring

### Durations (Animation)

| Token | Value |
|-------|-------|
| `fast` | 80ms |
| `normal` | 120ms |
| `slow` | 200ms |
| `spinner` | 700ms |

### Z-Index

| Token | Value |
|-------|-------|
| `base` | 0 |
| `dropdown` | 1000 |
| `sticky` | 1100 |
| `modal` | 1200 |
| `tooltip` | 1300 |
| `toast` | 1400 |

### Sizes

| Token | Value |
|-------|-------|
| `page.max-width` | 1120px |
| `page.gutter-x` | 24px |
| `page.gutter-y` | 24px |
| `button.min-height` | 40px |
| `input.min-height` | 40px |
| `textarea.min-height` | 120px |
| `spinner.sm` | 16px |
| `spinner.md` | 24px |
| `spinner.lg` | 32px |

### Breakpoints

| Token | Value |
|-------|-------|
| `sm` | 480px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

Use in responsive props: `{ base: 1, md: 2, lg: 3 }`

### Keyframes (Animations)

Available keyframe animations:
- `spin` - 360° rotation (for spinners)
- `progress-indeterminate` - Progress bar animation
- `slideIn` / `slideOut` - Toast animations
- `swipeOut` - Toast swipe dismiss
- `slideDown` / `slideUp` - Accordion content
- `fadeIn` / `fadeOut` - Modal/popover fade
- `slideInFromRight` / `slideOutToRight` - Side panel (right)
- `slideInFromLeft` / `slideOutToLeft` - Side panel (left)
- `overlayShow` / `overlayHide` - Modal overlay

## Theming

### ThemeProvider

Wrap your application with `ThemeProvider` for color mode support.

```tsx
import { ThemeProvider } from '@waterworth/react'

function App() {
  return (
    <ThemeProvider defaultColorMode="system">
      <YourApp />
    </ThemeProvider>
  )
}
```

**Props:**
- `defaultColorMode`: `'light' | 'dark' | 'system'` (default: `'system'`)
- `children`: ReactNode

### useColorMode

Hook for accessing and controlling color mode.

```tsx
import { useColorMode } from '@waterworth/react'

function Component() {
  const { colorMode, resolvedColorMode, setColorMode, toggleColorMode } = useColorMode()
  // colorMode: 'light' | 'dark' | 'system'
  // resolvedColorMode: 'light' | 'dark' (actual applied mode)
}
```

### ThemeToggle

Pre-built toggle button for color mode switching.

```tsx
import { ThemeToggle } from '@waterworth/react'

// Simple: toggles between light/dark
<ThemeToggle mode="simple" />

// Full: cycles light → dark → system
<ThemeToggle mode="full" />
```

**Props:**
- `mode`: `'simple' | 'full'` (default: `'simple'`)
- `className`: string

## Icons

Font Awesome icons via shared `Icon` component.

**Consumer CSS requirement:**
```tsx
import '@waterworth/react/styles.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
```

**Usage:**
```tsx
import { Icon } from '@waterworth/react'

<Icon name="check" size="md" />
```

**Props:**
- `name`: IconName (required)
- `size`: `'xs' | 'sm' | 'md' | 'lg'` (default: `'md'`)
- `className`: string
- `style`: CSSProperties

**Available Icons:**
| Name | Size Map | Usage |
|------|----------|-------|
| `chevron-left` | xs=10px, sm=12px, md=14px, lg=16px | Navigation |
| `chevron-right` | | Navigation |
| `chevron-down` | | Accordion, Select |
| `chevron-up` | | Expansion |
| `angles-left` | | Pagination first |
| `angles-right` | | Pagination last |
| `arrow-up` | | Sort ascending |
| `arrow-down` | | Sort descending |
| `xmark` | | Close buttons |
| `check` | | Checkbox, success |
| `plus` | | Add action |
| `minus` | | Remove action |
| `circle-info` | | Info alert |
| `circle-check` | | Success alert |
| `triangle-exclamation` | | Warning alert |
| `circle-exclamation` | | Danger alert |
| `sun` | | Light mode |
| `moon` | | Dark mode |
