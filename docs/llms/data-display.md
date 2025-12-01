# Data Display

## Table

Data table with sorting and selection, built on TanStack Table.

**Usage:**
```tsx
import { Table } from '@waterworth/react'
import { createColumnHelper } from '@tanstack/react-table'

type User = { id: string; name: string; email: string }
const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' })
]

const data = [{ id: '1', name: 'Alice', email: 'alice@example.com' }]

<Table columns={columns} data={data} />
```

**Props:**
- `columns`: Column definitions (TanStack Table).
- `data`: Array of data objects.
- `enableRowSelection`: boolean.
- `onRowSelectionChange`: (selected: T[]) => void.

## Card

Container for content.

**Usage:**
```tsx
import { Card, CardActions, Button } from '@waterworth/react'

<Card isElevated>
  <h3>Project A</h3>
  <p>Description...</p>
  <CardActions>
    <Button variant="ghost">View</Button>
  </CardActions>
</Card>
```

**Props:**
- `isElevated`: boolean (adds shadow and hover effect).
- `children`: ReactNode.

## Badge

Status indicator.

**Usage:**
```tsx
import { Badge } from '@waterworth/react'

<Badge status="success">Active</Badge>
<Badge status="warning">Pending</Badge>
```

**Props:**
- `status`: 'info' | 'success' | 'warning' | 'danger' | 'neutral'.
