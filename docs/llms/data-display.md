# Data Display

## Table

Data table with sorting and selection, built on TanStack Table.

```tsx
import { Table } from '@waterworth/react'
import { createColumnHelper } from '@tanstack/react-table'

type User = { id: string; name: string; email: string; status: string }

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <Badge status="success">{info.getValue()}</Badge>
  })
]

const data: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', status: 'Active' },
  { id: '2', name: 'Bob', email: 'bob@example.com', status: 'Pending' }
]

// Basic table
<Table columns={columns} data={data} />

// With row selection
<Table
  columns={columns}
  data={data}
  enableRowSelection
  onRowSelectionChange={(selected) => console.log(selected)}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, unknown>[]` | required | TanStack Table column definitions |
| `data` | `TData[]` | required | Array of data objects |
| `enableRowSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `onRowSelectionChange` | `(selectedRows: TData[]) => void` | - | Selection change callback |

**Column Definition (TanStack Table):**

Import `createColumnHelper` from `@tanstack/react-table` for type-safe column definitions:

```tsx
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'

const columnHelper = createColumnHelper<YourDataType>()

// Accessor column (extracts data from row)
columnHelper.accessor('fieldName', {
  header: 'Display Name',
  cell: (info) => info.getValue(), // Custom cell render
})

// Display column (no data, for actions/buttons)
columnHelper.display({
  id: 'actions',
  header: 'Actions',
  cell: (props) => <Button onClick={() => edit(props.row.original)}>Edit</Button>
})
```

**Sorting:**
Columns are sortable by default. Click column headers to sort.

## Card

Container for grouping related content.

```tsx
import { Card, CardActions, Button } from '@waterworth/react'

// Basic card
<Card>
  <h3>Project Title</h3>
  <p>Project description...</p>
</Card>

// Elevated card with actions
<Card isElevated>
  <h3>Project A</h3>
  <p>Description of project A...</p>
  <CardActions>
    <Button variant="ghost">View</Button>
    <Button variant="primary">Edit</Button>
  </CardActions>
</Card>
```

**Card Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isElevated` | `boolean` | `false` | Adds shadow and hover effect |
| `children` | `ReactNode` | required | Card content |

**CardActions:**
Container for card action buttons. Renders children in a flex row with gap.

```tsx
<CardActions>
  {/* Action buttons go here */}
</CardActions>
```

## Badge

Status indicator label.

```tsx
import { Badge } from '@waterworth/react'

<Badge status="success">Active</Badge>
<Badge status="warning">Pending</Badge>
<Badge status="danger">Failed</Badge>
<Badge status="info">New</Badge>
<Badge status="neutral">Draft</Badge>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | required | Badge color variant |
| `children` | `ReactNode` | required | Badge content |

**Status usage:**
| Status | Use Case | Color |
|--------|----------|-------|
| `info` | Informational, new items | Brand blue |
| `success` | Active, completed, approved | Green |
| `warning` | Pending, needs attention | Orange |
| `danger` | Error, failed, rejected | Red |
| `neutral` | Default, draft, inactive | Gray |
