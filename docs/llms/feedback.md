# Feedback & Overlays

## Alert

Static inline message for important information.

```tsx
import { Alert } from '@waterworth/react'

<Alert variant="info">
  <strong>Update:</strong> System maintenance scheduled for tonight.
</Alert>

<Alert variant="success">Your changes have been saved.</Alert>
<Alert variant="warning">Your session will expire in 5 minutes.</Alert>
<Alert variant="danger">Failed to save. Please try again.</Alert>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | required | Alert type/color |
| `priority` | `'polite' \| 'assertive'` | `'polite'` | Screen reader announcement priority |
| `children` | `ReactNode` | required | Alert content |

## Spinner

Loading indicator.

```tsx
import { Spinner } from '@waterworth/react'

<Spinner size="sm" />
<Spinner size="md" label="Loading..." />
<Spinner size="lg" label="Processing your request" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size (16px, 24px, 32px) |
| `label` | `string` | - | Accessible label (visually hidden) |

## Progress

Progress bar for determinate or indeterminate states.

```tsx
import { Progress } from '@waterworth/react'

// Determinate (known progress)
<Progress value={60} max={100} />
<Progress value={3} max={5} />

// Indeterminate (unknown duration)
<Progress indeterminate />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Current progress value |
| `max` | `number` | `100` | Maximum value |
| `indeterminate` | `boolean` | `false` | Show indeterminate animation |

## Toast

Temporary notification messages. Requires `ToastProvider` at app root.

```tsx
import { Toast, ToastProvider, Button } from '@waterworth/react'
import { useState } from 'react'

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Toast</Button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        title="Success"
        description="Your changes have been saved."
        duration={5000}
      />
    </>
  )
}
```

**Toast Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Toast title |
| `description` | `string` | - | Toast description |
| `duration` | `number` | `5000` | Auto-dismiss time in ms |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Uncontrolled default |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |
| `children` | `ReactNode` | - | Custom content |

**ToastProvider Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `duration` | `number` | `5000` | Default duration for all toasts |
| `swipeDirection` | `'right' \| 'left' \| 'up' \| 'down'` | `'right'` | Swipe dismiss direction |
| `children` | `ReactNode` | required | App content |

## Dialog

Modal window for focused interactions.

```tsx
import { Dialog, Button } from '@waterworth/react'

// With trigger
<Dialog
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  trigger={<Button>Open Dialog</Button>}
>
  <p>This action cannot be undone.</p>
  <Button variant="danger">Confirm</Button>
</Dialog>

// Controlled
const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Open</Button>
<Dialog
  title="Edit Profile"
  open={open}
  onOpenChange={setOpen}
>
  <form>...</form>
</Dialog>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Dialog title |
| `description` | `string` | - | Dialog description |
| `trigger` | `ReactElement` | - | Element that triggers open |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Uncontrolled default |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |
| `children` | `ReactNode` | required | Dialog content |

## DropdownMenu

Menu of actions triggered by a button.

```tsx
import { DropdownMenu, Button } from '@waterworth/react'

<DropdownMenu
  trigger={<Button>Options</Button>}
  items={[
    { id: 'edit', label: 'Edit', onSelect: () => handleEdit() },
    { id: 'duplicate', label: 'Duplicate', onSelect: () => handleDuplicate() },
    { id: 'delete', label: 'Delete', onSelect: () => handleDelete(), disabled: !canDelete }
  ]}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactElement` | required | Element that triggers menu |
| `items` | `DropdownMenuItem[]` | required | Menu items |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Uncontrolled default |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |

**DropdownMenuItem type:**
```ts
{
  id: string
  label: string
  onSelect?: () => void
  disabled?: boolean
}
```

## Popover

Pop-up content panel.

```tsx
import { Popover, Button } from '@waterworth/react'

<Popover trigger={<Button>Help</Button>} showArrow>
  <p>Helpful information goes here.</p>
</Popover>

// Controlled
const [open, setOpen] = useState(false)

<Popover
  trigger={<Button>Info</Button>}
  open={open}
  onOpenChange={setOpen}
  sideOffset={8}
>
  <p>Content...</p>
</Popover>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactElement` | - | Element that triggers popover |
| `children` | `ReactNode` | required | Popover content |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Uncontrolled default |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |
| `showArrow` | `boolean` | `false` | Show arrow pointing to trigger |
| `sideOffset` | `number` | `4` | Distance from trigger in px |
| `alignOffset` | `number` | `0` | Alignment offset in px |

## Tooltip

Hover information for elements.

```tsx
import { Tooltip, Button, Icon } from '@waterworth/react'

<Tooltip content="Add to library">
  <Button>
    <Icon name="plus" />
  </Button>
</Tooltip>

<Tooltip content="This action is permanent" side="bottom" delayDuration={500}>
  <Button variant="danger">Delete</Button>
</Tooltip>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | required | Tooltip content |
| `children` | `ReactElement` | required | Trigger element |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Tooltip position |
| `delayDuration` | `number` | `200` | Delay before showing in ms |
