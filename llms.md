# Waterworth Design System - LLM Documentation

This documentation helps LLMs understand and generate code using the Waterworth Design System.

## Overview

Waterworth is a type-safe, token-driven design system built with:
- **React** for components
- **Panda CSS** for styling (zero-runtime, type-safe CSS-in-JS)
- **TypeScript** for strict type safety
- **Radix UI** for accessible primitives

## Documentation Index

- [General Concepts](./docs/llms/general.md) - Tokens, theming, icons
- [Layout Components](./docs/llms/layout.md) - Grid, Tabs, Accordion, Pagination, etc.
- [Form Components](./docs/llms/forms.md) - Button, Input, Select, Checkbox, etc.
- [Feedback & Overlays](./docs/llms/feedback.md) - Alert, Dialog, Toast, Tooltip, etc.
- [Data Display](./docs/llms/data-display.md) - Table, Card, Badge
- [Charts & Visualizations](./docs/llms/charts.md) - Bar, Line, Pie, Calendar, Gantt

## Quick Start

### Installation

```bash
npm install git+https://github.com/muniworth/muniworth-components-dist.git
```

### Setup

```tsx
import { ThemeProvider } from '@waterworth/react'
import '@waterworth/react/styles.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}
```

### Basic Usage

```tsx
import { Button, Input, Card, Grid } from '@waterworth/react'

function MyComponent() {
  return (
    <Grid columns={2} gap="md">
      <Card>
        <Input label="Email" placeholder="user@example.com" />
        <Button variant="primary">Submit</Button>
      </Card>
    </Grid>
  )
}
```

## All Exports

### Components

| Component | Category | Description |
|-----------|----------|-------------|
| `Button` | Forms | Interactive button with variants |
| `Input` | Forms | Single-line text input |
| `Textarea` | Forms | Multi-line text input |
| `Select` | Forms | Dropdown selection |
| `Checkbox` | Forms | Binary choice |
| `RadioGroup` | Forms | Single selection from list |
| `Switch` | Forms | Toggle switch |
| `Alert` | Feedback | Static inline message |
| `Spinner` | Feedback | Loading indicator |
| `Progress` | Feedback | Progress bar |
| `Toast`, `ToastProvider` | Feedback | Temporary notifications |
| `Dialog` | Overlays | Modal window |
| `DropdownMenu` | Overlays | Menu of actions |
| `Popover` | Overlays | Pop-up content |
| `Tooltip` | Overlays | Hover information |
| `SidePanel` | Overlays | Slide-in panel |
| `Card`, `CardActions` | Data Display | Content container |
| `Badge` | Data Display | Status indicator |
| `Table` | Data Display | Data table with sorting |
| `Grid`, `GridItem` | Layout | CSS Grid wrapper |
| `Separator` | Layout | Visual divider |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Layout | Tabbed content |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | Layout | Expandable content |
| `Breadcrumbs`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator` | Layout | Navigation hierarchy |
| `Pagination`, `PaginationButton`, `PaginationEllipsis` | Layout | Page navigation |
| `Icon` | Shared | Font Awesome icon wrapper |
| `BarChart` | Charts | Vertical/horizontal bars |
| `LineChart` | Charts | Line/area chart |
| `PieChart` | Charts | Pie chart |
| `DoughnutChart` | Charts | Doughnut chart |
| `EventCalendar` | Charts | FullCalendar wrapper |
| `GanttChart` | Charts | SVAR Gantt wrapper |

### Theme

| Export | Type | Description |
|--------|------|-------------|
| `ThemeProvider` | Component | Theme context provider |
| `ThemeToggle` | Component | Color mode toggle button |
| `useColorMode` | Hook | Access/control color mode |
| `ThemeContext` | Context | Theme context for advanced use |

### Chart Utilities

| Export | Type | Description |
|--------|------|-------------|
| `chartColors` | Object | Data visualization colors |
| `chartColorPalette` | Array | Ordered color array |
| `getChartColor` | Function | Get color by index |
| `useChartColors` | Hook | Get colors with custom override |
| `useChartColorPalette` | Hook | Get full palette |

### Types

All components export their props types. Common patterns:
- `ComponentProps` - Main props interface
- `ComponentVariants` - Recipe variants (for styled components)

```tsx
import type { ButtonProps, ButtonVariants } from '@waterworth/react'
import type { SelectOption, RadioOption } from '@waterworth/react'
import type { CalendarEvent, GanttTask, GanttLink } from '@waterworth/react'
```

## Design Tokens Quick Reference

### Spacing
`2xs` (4px), `xs` (8px), `sm` (12px), `md` (16px), `lg` (24px), `xl` (32px), `2xl` (48px)

### Font Sizes
`xs` (12px), `sm` (14px), `md` (16px), `lg` (20px), `xl` (24px), `2xl` (32px), `3xl` (40px)

### Border Radius
`sm` (4px), `md` (8px), `lg` (12px), `pill` (9999px)

### Breakpoints
`sm` (480px), `md` (768px), `lg` (1024px), `xl` (1280px)

### Brand Colors
- `brand.blue` (#00B2CC) - Primary
- `brand.red` (#ED3F30) - Secondary
- `brand.dark` (#333232) - Dark

### State Colors
- `state.info` (#00B2CC)
- `state.success` (#8AC640)
- `state.warning` (#EF8936)
- `state.danger` (#ED3F30)

## Common Patterns

### Controlled vs Uncontrolled

Most interactive components support both patterns:

```tsx
// Uncontrolled (internal state)
<Select defaultValue="option1" options={options} />

// Controlled (external state)
const [value, setValue] = useState('option1')
<Select value={value} onValueChange={setValue} options={options} />
```

### Form Validation

All form components support error display:

```tsx
<Input
  label="Email"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Responsive Props

Layout components accept responsive values:

```tsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 'sm', md: 'md' }}>
  ...
</Grid>
```

### Triggers for Overlays

Dialog, Popover, DropdownMenu, and SidePanel accept triggers:

```tsx
// With trigger prop
<Dialog trigger={<Button>Open</Button>}>
  Content
</Dialog>

// Controlled (no trigger)
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  Content
</Dialog>
```
