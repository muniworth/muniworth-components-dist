# Layout Components

## Grid

A wrapper around CSS Grid with simplified props.

**Usage:**
```tsx
import { Grid } from '@waterworth/react'

<Grid columns={{ base: 1, md: 3 }} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

**Props:**
- `columns`: Number or responsive object (e.g., `{ base: 1, md: 2 }`).
- `gap`, `rowGap`, `columnGap`: Spacing tokens (`sm`, `md`, `lg`).
- `minChildWidth`: Min width for auto-fit columns (e.g., `200px`).

## Separator

Visually separates content.

**Usage:**
```tsx
import { Separator } from '@waterworth/react'

<Separator orientation="horizontal" />
```

**Props:**
- `orientation`: 'horizontal' | 'vertical' (default: 'horizontal')
- `decorative`: boolean (default: true) - Removes from accessibility tree if true.

## SidePanel

A modal dialog that slides from the side.

**Usage:**
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
- `title`, `description`: ReactNode.
- `trigger`: ReactElement (triggers the panel).
- `side`: 'left' | 'right' (default: 'right').
- `size`: 'sm' | 'md' | 'lg' | 'full'.
- `open`, `defaultOpen`, `onOpenChange`: Controlled/uncontrolled state.

## Breadcrumbs

Navigation indicating hierarchy.

**Usage:**
```tsx
import { Breadcrumbs, BreadcrumbItem, BreadcrumbLink } from '@waterworth/react'

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

**Props:**
- `Breadcrumbs`: `separator` (ReactNode).
- `BreadcrumbItem`: `isCurrentPage` (boolean).
- `BreadcrumbLink`: `asChild` (boolean, for using with Next.js Link).

## Pagination

Controls for navigating large lists.

**Usage:**
```tsx
import { Pagination } from '@waterworth/react'

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => console.log(page)}
  showFirstLast
/>
```

**Props:**
- `currentPage`: number.
- `totalPages`: number.
- `onPageChange`: (page: number) => void.
- `siblingCount`: number (default: 1).
- `boundaryCount`: number (default: 1).
- `showFirstLast`: boolean.

## Tabs

Tabbed content organization.

**Usage:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@waterworth/react'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
  <TabsContent value="password">...</TabsContent>
</Tabs>
```

**Props:**
- `Tabs`: `defaultValue`, `value`, `onValueChange`, `orientation`.
- `TabsTrigger`: `value`, `disabled`.

## Accordion

Vertically stacked expandable content.

**Usage:**
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@waterworth/react'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes, it adheres to WAI-ARIA design patterns.</AccordionContent>
  </AccordionItem>
</Accordion>
```

**Props:**
- `Accordion`:
  - `type`: 'single' | 'multiple'
  - `collapsible` (single only): boolean
  - `defaultValue`, `value`, `onValueChange`: Controlled/uncontrolled state
  - `disabled`: boolean
- `AccordionItem`: `value`, `disabled`
