# Waterworth Design System - LLM Documentation

This documentation is specifically structured to help Large Language Models (LLMs) understand and generate code using the Waterworth Design System.

## Overview

Waterworth is a type-safe, token-driven design system built with:
- **React** for components
- **Panda CSS** for styling (zero-runtime, type-safe CSS-in-JS)
- **TypeScript** for strict type safety
- **Radix UI** for accessible primitives

## Documentation Index

The documentation is split into categorized files for efficient context loading:

- [General Concepts](./docs/llms/general.md)
  - Design Tokens (Colors, Spacing, Typography)
  - Theming & Dark Mode
  - Icon Usage
- [Layout Components](./docs/llms/layout.md)
  - Grid, Separator, SidePanel, Breadcrumbs, Pagination, Tabs, Accordion
- [Form Components](./docs/llms/forms.md)
  - Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch
- [Feedback & Overlays](./docs/llms/feedback.md)
  - Alert, Spinner, Toast, Progress, Dialog, DropdownMenu, Popover, Tooltip
- [Data Display](./docs/llms/data-display.md)
  - Table, Card, Badge
- [Charts & Visualizations](./docs/llms/charts.md)
  - Bar, Line, Pie, Doughnut Charts
  - Event Calendar, Gantt Chart

## Quick Start

### Installation

```bash
npm install git+https://github.com/muniworth/muniworth-components-dist.git
```

### Basic Usage

1. **Wrap your application** with the `ThemeProvider`:

```tsx
import { ThemeProvider } from '@waterworth/react'
import '@waterworth/react/styles.css' // Import styles once

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}
```

2. **Import and use components**:

```tsx
import { Button, Stack } from '@waterworth/react'

function MyComponent() {
  return (
    <Stack gap="md">
      <Button variant="primary">Click Me</Button>
      <Button variant="secondary">Cancel</Button>
    </Stack>
  )
}
```
