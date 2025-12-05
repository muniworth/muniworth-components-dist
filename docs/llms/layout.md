# Layout Components

## Grid

CSS Grid wrapper with simplified props.

```tsx
import { Grid } from '@waterworth/react'

<Grid columns={{ base: 1, md: 3 }} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number \| string \| ResponsiveValue` | - | Grid columns (number or `repeat(...)` string) |
| `gap` | `SpacingToken \| ResponsiveValue` | - | Gap between all children |
| `columnGap` | `SpacingToken \| ResponsiveValue` | - | Horizontal gap |
| `rowGap` | `SpacingToken \| ResponsiveValue` | - | Vertical gap |
| `minChildWidth` | `string \| number` | - | Min width for auto-fit columns |
| `children` | `ReactNode` | required | Grid children |

Spacing tokens: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

## GridItem

Child of Grid for controlling span and position.

```tsx
import { Grid, GridItem } from '@waterworth/react'

<Grid columns={12} gap="md">
  <GridItem colSpan={8}>Main content</GridItem>
  <GridItem colSpan={4}>Sidebar</GridItem>
</Grid>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colSpan` | `number \| string` | - | Column span |
| `rowSpan` | `number \| string` | - | Row span |
| `colStart` | `number \| string` | - | Column start position |
| `colEnd` | `number \| string` | - | Column end position |
| `rowStart` | `number \| string` | - | Row start position |
| `rowEnd` | `number \| string` | - | Row end position |
| `children` | `ReactNode` | required | Item content |

## Separator

Visually separates content sections.

```tsx
import { Separator } from '@waterworth/react'

<Separator orientation="horizontal" />
<Separator orientation="vertical" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Separator direction |
| `decorative` | `boolean` | `true` | If true, removes from accessibility tree |

## SidePanel

Modal dialog that slides from the side.

```tsx
import { SidePanel, Button } from '@waterworth/react'

<SidePanel
  title="Edit Profile"
  description="Update your information"
  trigger={<Button>Open Settings</Button>}
  side="right"
  size="md"
>
  <form>...</form>
</SidePanel>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | - | Panel title |
| `description` | `ReactNode` | - | Panel description |
| `trigger` | `ReactElement` | - | Element that triggers open |
| `side` | `'left' \| 'right'` | `'right'` | Which side to slide from |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Panel width |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Uncontrolled default |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |
| `children` | `ReactNode` | required | Panel content |

## Breadcrumbs

Navigation indicating hierarchy.

```tsx
import { Breadcrumbs, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@waterworth/react'

<Breadcrumbs>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem isCurrentPage>
    Details
  </BreadcrumbItem>
</Breadcrumbs>
```

**Breadcrumbs Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `separator` | `ReactNode` | `'/'` | Custom separator element |
| `children` | `ReactNode` | required | BreadcrumbItem children |

**BreadcrumbItem Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isCurrentPage` | `boolean` | `false` | Marks as current/active page |
| `children` | `ReactNode` | required | Item content |

**BreadcrumbLink Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Use Slot for custom link (e.g., Next.js Link) |
| `href` | `string` | - | Link destination |
| `children` | `ReactNode` | required | Link text |

**BreadcrumbSeparator Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | `'/'` | Separator content |

## Pagination

Controls for navigating paginated content.

```tsx
import { Pagination } from '@waterworth/react'

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => console.log(page)}
  showFirstLast
/>
```

**Pagination Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | required | Current page (1-indexed) |
| `totalPages` | `number` | required | Total number of pages |
| `onPageChange` | `(page: number) => void` | required | Page change callback |
| `siblingCount` | `number` | `1` | Pages shown on each side of current |
| `boundaryCount` | `number` | `1` | Pages shown at start and end |
| `showFirstLast` | `boolean` | `false` | Show first/last buttons |

**PaginationButton Props:**
For building custom pagination UIs.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | `boolean` | `false` | Current page indicator |
| `disabled` | `boolean` | `false` | Disabled state |
| `children` | `ReactNode` | required | Button content |

**PaginationEllipsis:**
Renders "..." for truncated page ranges. Accepts standard span attributes.

## Tabs

Tabbed content organization.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@waterworth/react'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings...</TabsContent>
  <TabsContent value="password">Password settings...</TabsContent>
</Tabs>
```

**Tabs Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `string` | - | Uncontrolled default tab |
| `value` | `string` | - | Controlled active tab |
| `onValueChange` | `(value: string) => void` | - | Tab change callback |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab layout |
| `children` | `ReactNode` | required | TabsList and TabsContent |

**TabsList Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | - | Accessibility label |
| `children` | `ReactNode` | required | TabsTrigger children |

**TabsTrigger Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Tab identifier |
| `disabled` | `boolean` | `false` | Disabled state |
| `children` | `ReactNode` | required | Trigger content |

**TabsContent Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Tab identifier |
| `children` | `ReactNode` | required | Tab panel content |

## Accordion

Vertically stacked expandable content.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@waterworth/react'

// Single mode (one open at a time)
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content for section 1</AccordionContent>
  </AccordionItem>
</Accordion>

// Multiple mode (many open at once)
<Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
  ...
</Accordion>
```

**Accordion Props (Single mode):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'single'` | `'single'` | Single item open |
| `collapsible` | `boolean` | `false` | Allow closing all items |
| `defaultValue` | `string` | - | Default open item |
| `value` | `string` | - | Controlled open item |
| `onValueChange` | `(value: string) => void` | - | Change callback |
| `disabled` | `boolean` | `false` | Disable all items |
| `children` | `ReactNode` | required | AccordionItem children |

**Accordion Props (Multiple mode):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'multiple'` | required | Multiple items open |
| `defaultValue` | `string[]` | - | Default open items |
| `value` | `string[]` | - | Controlled open items |
| `onValueChange` | `(value: string[]) => void` | - | Change callback |
| `disabled` | `boolean` | `false` | Disable all items |
| `children` | `ReactNode` | required | AccordionItem children |

**AccordionItem Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Unique item identifier |
| `disabled` | `boolean` | `false` | Disable this item |
| `children` | `ReactNode` | required | Trigger and Content |

**AccordionTrigger Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Trigger content |

**AccordionContent Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Panel content |
