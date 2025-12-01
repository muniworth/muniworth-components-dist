# Feedback & Overlays

## Alert

Static inline message.

**Usage:**
```tsx
import { Alert } from '@waterworth/react'

<Alert variant="info">
  <strong>Update:</strong> System maintenance scheduled.
</Alert>
```

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'danger'.
- `priority`: 'polite' | 'assertive' (default: 'polite').

## Spinner

Loading indicator.

**Usage:**
```tsx
import { Spinner } from '@waterworth/react'

<Spinner size="md" label="Loading data..." />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'.
- `label`: string.

## Toast

Temporary notifications. Requires `ToastProvider` at the root.

**Usage:**
```tsx
import { Toast, ToastProvider, Button } from '@waterworth/react'
import { useState } from 'react'

function App() {
  const [open, setOpen] = useState(false)
  return (
    <ToastProvider>
      <Button onClick={() => setOpen(true)}>Show Toast</Button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        title="Success"
        description="Item saved."
      />
    </ToastProvider>
  )
}
```

**Props:**
- `title`, `description`: string.
- `duration`: number (ms).
- `open`, `defaultOpen`, `onOpenChange`: Controlled/uncontrolled state.
- `children`: ReactNode.

## Progress

Progress bar.

**Usage:**
```tsx
import { Progress } from '@waterworth/react'

<Progress value={60} max={100} />
// or
<Progress indeterminate />
```

**Props:**
- `value`: number.
- `max`: number (default: 100).
- `indeterminate`: boolean.

## Dialog

Modal window.

**Usage:**
```tsx
import { Dialog, Button } from '@waterworth/react'

<Dialog
  title="Confirm"
  description="Are you sure?"
  trigger={<Button>Delete</Button>}
>
  <Button variant="danger">Yes, Delete</Button>
</Dialog>
```

**Props:**
- `title`, `description`: string.
- `trigger`: ReactElement.
- `open`, `defaultOpen`, `onOpenChange`: Controlled/uncontrolled state.

## DropdownMenu

List of actions.

**Usage:**
```tsx
import { DropdownMenu, Button } from '@waterworth/react'

<DropdownMenu
  trigger={<Button>Options</Button>}
  items={[
    { id: '1', label: 'Edit', onSelect: handleEdit },
    { id: '2', label: 'Delete', disabled: true }
  ]}
/>
```

**Props:**
- `trigger`: ReactElement.
- `items`: `{ id, label, onSelect, disabled }[]`.
- `open`, `defaultOpen`, `onOpenChange`: Controlled/uncontrolled state.

## Popover

Pop-up content.

**Usage:**
```tsx
import { Popover, Button } from '@waterworth/react'

<Popover trigger={<Button>Help</Button>} showArrow>
  <p>Helpful content here.</p>
</Popover>
```

**Props:**
- `trigger`: ReactElement.
- `showArrow`: boolean.
- `sideOffset`: number.
- `open`, `defaultOpen`, `onOpenChange`: Controlled/uncontrolled state.
- `alignOffset`: number.

## Tooltip

Hover information.

**Usage:**
```tsx
import { Tooltip, Button } from '@waterworth/react'

<Tooltip content="Add to library">
  <Button>Save</Button>
</Tooltip>
```

**Props:**
- `content`: ReactNode.
- `children`: ReactElement (trigger).
- `side`: 'top' | 'right' | 'bottom' | 'left'.
- `delayDuration`: number.
