# General Concepts

## Design Tokens

The Waterworth Design System uses a comprehensive set of design tokens defined in Panda CSS.

### Colors

**Brand:**
- `brand.blue` (#00B2CC) - Primary brand color
- `brand.red` (#ED3F30)
- `brand.dark` (#333232)

**Semantic Text:**
- `text.primary` - Main text color (adjusts for dark mode)
- `text.secondary` - Subtle text color
- `text.linkColor`
- `text.on-dark` - Text on dark backgrounds

**Semantic Backgrounds:**
- `background.base` - Main page background
- `background.subtle` - Secondary background (e.g., hover states)
- `background.elevated` - Cards, modals

**State:**
- `state.info` (#00B2CC)
- `state.success` (#8AC640)
- `state.warning` (#EF8936)
- `state.danger` (#ED3F30)

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
- `fonts.brand`: Benton Sans, Work Sans, Trebuchet MS, sans-serif

**Font Sizes:**
- `xs` (12px), `sm` (14px), `md` (16px), `lg` (20px), `xl` (24px), `2xl` (32px), `3xl` (40px)

**Font Weights:**
- `regular` (400), `medium` (500), `bold` (700)

## Theming

Waterworth has built-in support for light, dark, and system color modes.

### ThemeProvider

Wrap your application root with `ThemeProvider`.

```tsx
import { ThemeProvider } from '@waterworth/react'

function App() {
  return (
    <ThemeProvider defaultColorMode="system">
      <Component />
    </ThemeProvider>
  )
}
```

**Props:**
- `defaultColorMode`: 'light' | 'dark' | 'system' (default: 'system')

### useColorMode

Hook to access and toggle color modes.

```tsx
import { useColorMode, Button } from '@waterworth/react'

function ModeToggle() {
  const { colorMode, resolvedColorMode, setColorMode, toggleColorMode } = useColorMode()

  return (
    <div>
      <Button onClick={toggleColorMode}>
        Toggle ({resolvedColorMode})
      </Button>
      <Button onClick={() => setColorMode('system')}>
        Use system preference
      </Button>
    </div>
  )
}
```

**Returns:**
- `colorMode`: Current setting ('light' | 'dark' | 'system')
- `resolvedColorMode`: Actual applied mode ('light' | 'dark')
- `setColorMode(mode)`: Set to a specific mode
- `toggleColorMode()`: Toggle between light and dark

## Icons

The system uses Font Awesome icons via a shared `Icon` wrapper.

**Usage:**
```tsx
import { Icon } from '@waterworth/react'

<Icon name="check" size="md" />
```

**Props:**
- `name`: Icon name (e.g., 'check', 'xmark', 'chevron-down')
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `className`: Optional styling

**Common Icons:**
- Navigation: `chevron-left`, `chevron-right`, `chevron-down`, `chevron-up`
- Actions: `xmark` (close), `check` (success)
- Sort: `arrow-up`, `arrow-down`
