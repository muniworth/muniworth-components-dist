# Waterworth React Components

Pre-compiled React component library for Waterworth products.

## Installation

```bash
npm install git+ssh://git@github.com:muniworth/muniworth-components-dist.git
```

## Setup

### 1. Import Styles

In your app's entry point (e.g., `main.tsx` or `App.tsx`):

```tsx
// Import component styles (required)
import '@waterworth/react/styles.css'

// Import Font Awesome icons (required for Icon component)
import '@fortawesome/fontawesome-free/css/all.min.css'
```

### 2. Add Providers

Wrap your app with the required providers:

```tsx
import { ThemeProvider, ToastProvider } from '@waterworth/react'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        {/* Your app content */}
      </ToastProvider>
    </ThemeProvider>
  )
}
```

### 3. TypeScript Configuration

Add `skipLibCheck: true` to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### 4. Vite Configuration (if using Vite)

Add `resolve.dedupe` to your `vite.config.ts` to ensure shared dependencies resolve correctly:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
```

This prevents duplicate React instances which can cause hooks and context to fail.

## Usage

```tsx
import { Button, Input, Card, Badge, Alert } from '@waterworth/react'

function Example() {
  return (
    <Card>
      <Input label="Email" placeholder="Enter email" />
      <Button variant="primary">Submit</Button>
      <Badge variant="success">Active</Badge>
    </Card>
  )
}
```

## Available Components

### Forms
- Button, Input, Textarea, Select, Checkbox, Switch, RadioGroup

### Data Display
- Badge, Card, Icon, Accordion, Table, DataTable

### Feedback
- Alert, Spinner, Progress, Toast

### Overlays
- Dialog, Tooltip, Popover, DropdownMenu, SidePanel

### Navigation
- Tabs, Breadcrumb, Pagination

### Layout
- Grid, GridItem, Separator

### Data Visualization
- BarChart, LineChart, PieChart, DoughnutChart
- EventCalendar, GanttChart

## Theme Support

The library supports light and dark modes:

```tsx
import { useColorMode, ThemeToggle } from '@waterworth/react'

function Header() {
  const { colorMode, setColorMode } = useColorMode()

  return (
    <header>
      <ThemeToggle />
      {/* or manually: */}
      <button onClick={() => setColorMode('dark')}>Dark Mode</button>
    </header>
  )
}
```

## Troubleshooting

### React hooks or context not working

If you see errors like "Invalid hook call" or context values are undefined, this usually means multiple React instances are loaded. Solutions:

1. **Vite users**: Add `resolve.dedupe: ['react', 'react-dom']` to your vite.config.ts (see Setup step 4)
2. **Webpack users**: Add resolve aliases in webpack.config.js:
   ```js
   resolve: {
     alias: {
       react: require.resolve('react'),
       'react-dom': require.resolve('react-dom'),
     }
   }
   ```

### Dependencies not installing

When installing from git, npm should install all dependencies automatically. If you encounter missing dependency errors:

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors in node_modules

Add `skipLibCheck: true` to your tsconfig.json (see Setup step 3).

## Documentation

For full documentation and contribution guidelines, see the [main repository](https://github.com/muniworth/muniworth-components).
