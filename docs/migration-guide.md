# Migration Guide: v1.0.0

This release is a major rebrand of the Waterworth Design System. The primary accent shifts from blue to red, the font changes to Geist, and several APIs have breaking changes.

## Breaking Changes Summary

1. **Font**: Benton Sans → Geist (consumer action required)
2. **Button variants**: `secondary` and `danger` removed; `dark` and `outlined` added
3. **Chart data colors**: 8-color palette replaced with 5-color theme-aware palette
4. **Visual changes**: Colors, radii, and sizing updated across all components

---

## 1. Install the Geist Font

The design system now uses the [Geist](https://vercel.com/font) font family. Consumers must make it available:

**Option A — CSS import (recommended):**

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&display=swap');
```

**Option B — npm package:**

```bash
npm install geist
```

```tsx
import 'geist/css/geist-sans.css'
```

The design system references `Geist` in its font stack. If the font is not loaded, the browser will fall back to system sans-serif fonts.

---

## 2. Button Variant Changes

The `variant` prop on `<Button>` has changed. Two variants were removed and two were added.

### Variant mapping

| Old variant   | New variant | Notes |
|---------------|-------------|-------|
| `primary`     | `primary`   | Now red (`#EF3F32`) instead of blue |
| `secondary`   | `dark`      | Charcoal background (`#323433`), white text |
| `danger`      | *(removed)* | Use `primary` — it is now the red variant |
| `ghost`       | `ghost`     | Now has white background with neutral hover (`#BDBDBD`) |
| *(new)*       | `outlined`  | Transparent with grey border, neutral hover fill |

### Migration steps

**Find and replace `variant="secondary"`** with `variant="dark"`:

```diff
- <Button variant="secondary">Cancel</Button>
+ <Button variant="dark">Cancel</Button>
```

If you used `secondary` for neutral/cancel actions and prefer the new outlined style instead:

```diff
- <Button variant="secondary">Cancel</Button>
+ <Button variant="outlined">Cancel</Button>
```

**Find and replace `variant="danger"`** with `variant="primary"`:

```diff
- <Button variant="danger">Delete</Button>
+ <Button variant="primary">Delete</Button>
```

The `primary` variant is now red, so it serves the same visual purpose as the old `danger` variant.

### TypeScript

The `ButtonVariants` type automatically reflects the new variants. After updating your code, TypeScript will flag any remaining references to `"secondary"` or `"danger"` as type errors.

```ts
// Valid variants in v1.0.0:
type Variant = 'primary' | 'dark' | 'outlined' | 'ghost'
```

### Ghost variant behavior change

The `ghost` variant changed from a transparent/link-like style to a white background button with a neutral grey hover state. If you relied on the old transparent ghost behavior, you may need to adjust your layout accordingly.

---

## 3. Chart Data Color Changes

The chart data palette was replaced with a new 5-color palette that supports light/dark themes.

### chartColors object

Property names changed — consumers referencing specific colors by name will break:

| Old property   | Removed? | New property |
|----------------|----------|--------------|
| `navy`         | Yes      | — |
| `red`          | Yes      | — |
| `blue`         | Renamed  | `blue` (new hex: `#2563eb`) |
| `orange`       | Renamed  | `orange` (new hex: `#f97316`) |
| `purpleDark`   | Yes      | — |
| `yellow`       | Renamed  | `yellow` (new hex: `#eab308`) |
| `purple`       | Renamed  | `purple` (new hex: `#9333ea`) |
| `green`        | Yes      | — |
| *(new)*        | —        | `pink` (`#ec4899`) |

```diff
  import { chartColors } from '@waterworth/react'

- chartColors.navy    // removed
- chartColors.red     // removed
- chartColors.green   // removed
+ chartColors.blue    // #2563eb
+ chartColors.purple  // #9333ea
+ chartColors.yellow  // #eab308
+ chartColors.pink    // #ec4899
+ chartColors.orange  // #f97316
```

### chartColorPalette array

Reduced from 8 to 5 entries. If you relied on specific index positions or the array having 8 elements, update accordingly. The `getChartColor(index)` utility now wraps at index 5 instead of 8.

### New: useChartDataColors hook

A new theme-aware hook is available for charts that need to respond to light/dark mode:

```tsx
import { useChartDataColors } from '@waterworth/react'

function MyChart() {
  const { palette, bgPalette } = useChartDataColors()
  // palette: 5 colors appropriate for current theme
  // bgPalette: 5 light background colors (for area fills, etc.)
}
```

This replaces the old pattern of appending `33` to hex values for area fill transparency.

---

## 4. Visual / Token Changes (Non-Breaking)

These changes cascade automatically through the token system. No code changes required, but be aware of the visual differences:

| Change | Old | New |
|--------|-----|-----|
| Primary accent color | Blue `#00B2CC` | Red `#EF3F32` |
| Button border radius | 8px | 4px |
| Input border radius | 8px | 4px |
| Card border radius | 12px | 10px |
| Input min-height | 40px | 60px |
| Textarea min-height | 120px | 284px |
| Button min-height | 40px | 50px |
| Font size `2xl` | 32px | 36px |
| Table headers | Light | Dark (`#323433` background, white text) |
| Input placeholder color | Subtle grey | `#989898` |
| Input font size | `md` | `lg` |
| Link color | Blue | Red `#EF3F32` |
| Focus ring color | Blue | Red |

---

## Quick Checklist

- [ ] Install/import the Geist font
- [ ] Replace `variant="secondary"` → `variant="dark"` or `variant="outlined"`
- [ ] Replace `variant="danger"` → `variant="primary"`
- [ ] Update any `chartColors.navy`, `.red`, `.green`, or `.purpleDark` references
- [ ] Update code that assumes `chartColorPalette` has 8 entries
- [ ] Review ghost button usage for visual compatibility
- [ ] Run TypeScript — remaining issues will surface as type errors
