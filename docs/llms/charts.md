# Charts & Visualizations

All chart components are built on Chart.js and styled with design system tokens.

## Color Utilities

### chartColors

Object containing all data visualization colors from the design system.

```tsx
import { chartColors } from '@waterworth/react'

// Available colors
chartColors.navy      // #003A5D
chartColors.red       // #ED3F30
chartColors.blue      // #00B2CC
chartColors.orange    // #EF8936
chartColors.purpleDark // #764FA0
chartColors.yellow    // #E7E51A
chartColors.purple    // #B65DA4
chartColors.green     // #8AC640
```

### chartColorPalette

Ordered array of colors for automatic dataset coloring.

```tsx
import { chartColorPalette } from '@waterworth/react'

// Array: [blue, navy, orange, green, purple, red, purpleDark, yellow]
chartColorPalette.forEach((color, i) => {
  console.log(`Color ${i}: ${color}`)
})
```

### getChartColor

Get a color by index (wraps around if index exceeds palette length).

```tsx
import { getChartColor } from '@waterworth/react'

getChartColor(0) // blue
getChartColor(1) // navy
getChartColor(8) // blue (wraps)
```

### useChartColors

Hook to get chart colors with optional custom overrides.

```tsx
import { useChartColors } from '@waterworth/react'

// Get 5 colors from palette
const colors = useChartColors(5)

// Use custom colors
const customColors = useChartColors(3, ['#ff0000', '#00ff00', '#0000ff'])
```

### useChartColorPalette

Hook to get the full color palette.

```tsx
import { useChartColorPalette } from '@waterworth/react'

const palette = useChartColorPalette()
```

## Common Chart Props

All charts share these base props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Chart title |
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `legendPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Legend position |
| `height` | `number` | `300` | Chart height in pixels |
| `className` | `string` | - | Additional CSS class |

## BarChart

Vertical or horizontal bar chart.

```tsx
import { BarChart } from '@waterworth/react'

// Vertical bars
<BarChart
  title="Sales by Quarter"
  labels={['Q1', 'Q2', 'Q3', 'Q4']}
  datasets={[
    { label: '2023', data: [10, 20, 30, 40] },
    { label: '2024', data: [15, 25, 35, 45] }
  ]}
  height={300}
/>

// Horizontal bars
<BarChart
  labels={['Product A', 'Product B', 'Product C']}
  datasets={[{ label: 'Revenue', data: [100, 200, 150] }]}
  horizontal
  showValues
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | required | X-axis labels |
| `datasets` | `BarDataset[]` | required | Bar datasets |
| `horizontal` | `boolean` | `false` | Horizontal bars |
| `showValues` | `boolean` | `false` | Show values on bars |

**BarDataset type:**
```ts
{
  label: string              // Dataset label (legend)
  data: number[]             // Data values
  backgroundColor?: string | string[]  // Bar colors
  borderColor?: string | string[]      // Bar border colors
  borderWidth?: number       // Border width in pixels
}
```

## LineChart

Line chart with optional fill.

```tsx
import { LineChart } from '@waterworth/react'

<LineChart
  title="Monthly Trends"
  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']}
  datasets={[
    { label: 'Revenue', data: [10, 15, 12, 18, 22], tension: 0.4 },
    { label: 'Expenses', data: [8, 10, 9, 12, 15], tension: 0.4 }
  ]}
/>

// Filled area chart
<LineChart
  labels={['Jan', 'Feb', 'Mar']}
  datasets={[
    {
      label: 'Users',
      data: [100, 150, 200],
      fill: true,
      backgroundColor: 'rgba(0, 178, 204, 0.1)'
    }
  ]}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | required | X-axis labels |
| `datasets` | `LineDataset[]` | required | Line datasets |
| `tension` | `number` | `0.4` | Default line tension (0=straight, 1=curved) |

**LineDataset type:**
```ts
{
  label: string              // Dataset label (legend)
  data: number[]             // Data values
  borderColor?: string       // Line color
  fill?: boolean             // Fill area under line
  backgroundColor?: string   // Fill color (when fill=true)
  tension?: number           // Line curvature (0-1)
}
```

## PieChart

Pie chart for proportional data.

```tsx
import { PieChart } from '@waterworth/react'

<PieChart
  title="Market Share"
  labels={['Product A', 'Product B', 'Product C']}
  data={[30, 50, 20]}
/>

// Custom colors
<PieChart
  labels={['Success', 'Failure']}
  data={[85, 15]}
  colors={['#8AC640', '#ED3F30']}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | required | Segment labels |
| `data` | `number[]` | required | Segment values |
| `colors` | `string[]` | auto | Custom segment colors |

## DoughnutChart

Doughnut chart (pie with center cutout).

```tsx
import { DoughnutChart } from '@waterworth/react'

<DoughnutChart
  title="Budget Allocation"
  labels={['Marketing', 'Development', 'Operations']}
  data={[30, 45, 25]}
/>

// Custom cutout size
<DoughnutChart
  labels={['Complete', 'Remaining']}
  data={[75, 25]}
  cutout="70%"
  colors={['#00B2CC', '#EAEAEA']}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | required | Segment labels |
| `data` | `number[]` | required | Segment values |
| `colors` | `string[]` | auto | Custom segment colors |
| `cutout` | `number \| string` | `'50%'` | Center cutout size |

## EventCalendar

Full-featured calendar component (FullCalendar wrapper).

```tsx
import { EventCalendar } from '@waterworth/react'

const events = [
  {
    id: '1',
    title: 'Team Meeting',
    start: '2024-12-01T10:00:00',
    end: '2024-12-01T11:00:00',
    color: '#00B2CC'
  },
  {
    id: '2',
    title: 'Project Deadline',
    start: '2024-12-15',
    allDay: true,
    color: '#ED3F30'
  }
]

<EventCalendar
  events={events}
  initialView="dayGridMonth"
  onEventClick={(event) => console.log('Clicked:', event)}
  onDateClick={(date) => console.log('Date:', date)}
/>

// Editable calendar
<EventCalendar
  events={events}
  editable
  onEventDrop={(event, newStart, newEnd) => {
    console.log('Moved:', event.id, newStart, newEnd)
  }}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `CalendarEvent[]` | required | Events to display |
| `initialView` | `'dayGridMonth' \| 'dayGridWeek' \| 'dayGridDay'` | `'dayGridMonth'` | Initial view |
| `initialDate` | `Date \| string` | today | Starting date |
| `editable` | `boolean` | `false` | Enable drag/drop |
| `weekStartsOn` | `0-6` | `0` | Week start day (0=Sunday) |
| `showWeekNumbers` | `boolean` | `false` | Show week numbers |
| `height` | `string \| number` | `'auto'` | Calendar height |
| `onEventClick` | `(event: CalendarEvent) => void` | - | Event click callback |
| `onDateClick` | `(date: Date) => void` | - | Date click callback |
| `onEventDrop` | `(event, newStart, newEnd) => void` | - | Drag/drop callback |

**CalendarEvent type:**
```ts
{
  id: string                 // Unique event ID
  title: string              // Event title
  start: Date | string       // Start date/time
  end?: Date | string        // End date/time
  allDay?: boolean           // All-day event
  color?: string             // Background color
  textColor?: string         // Text color
  extendedProps?: Record<string, unknown>  // Custom properties
}
```

## GanttChart

Project timeline (SVAR Gantt wrapper).

```tsx
import { GanttChart } from '@waterworth/react'

const tasks = [
  {
    id: 1,
    text: 'Planning',
    start: new Date('2024-12-01'),
    duration: 5,
    progress: 100,
    type: 'project'
  },
  {
    id: 2,
    text: 'Design',
    start: new Date('2024-12-06'),
    duration: 10,
    progress: 50,
    parent: 1
  },
  {
    id: 3,
    text: 'Development',
    start: new Date('2024-12-16'),
    duration: 20,
    progress: 0,
    parent: 1,
    priority: 'high'
  }
]

const links = [
  { id: 1, source: 2, target: 3, type: 'e2s' }  // End-to-Start
]

<GanttChart tasks={tasks} links={links} />

// Editable
<GanttChart
  tasks={tasks}
  editable
  onTaskChange={(task) => console.log('Changed:', task)}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `GanttTask[]` | required | Tasks to display |
| `links` | `GanttLink[]` | `[]` | Task dependencies |
| `scales` | `GanttScale[]` | auto | Timeline scale config |
| `columns` | `GanttColumn[] \| false` | default | Grid columns |
| `start` | `Date` | - | Timeline start constraint |
| `end` | `Date` | - | Timeline end constraint |
| `height` | `number` | `400` | Chart height |
| `editable` | `boolean` | `false` | Enable editing |
| `readonly` | `boolean` | `false` | Read-only mode |
| `showTooltip` | `boolean` | `true` | Show tooltips |
| `showEditor` | `boolean` | editable | Show editor panel |
| `onTaskClick` | `(task: GanttTask) => void` | - | Task click callback |
| `onTaskChange` | `(task: GanttTask) => void` | - | Task change callback |
| `onLinkAdd` | `(link: GanttLink) => void` | - | Link add callback |
| `onLinkDelete` | `(link: GanttLink) => void` | - | Link delete callback |

**GanttTask type:**
```ts
{
  id: number | string        // Unique task ID
  text: string               // Task name
  start: Date                // Start date
  end?: Date                 // End date
  duration?: number          // Duration in time units
  type?: 'task' | 'project' | 'milestone'
  progress?: number          // Progress percentage (0-100)
  parent?: number | string   // Parent task ID
  open?: boolean             // Expanded state
  priority?: 'high' | 'medium' | 'low'  // Priority (affects color)
}
```

**GanttLink type:**
```ts
{
  id: number | string        // Unique link ID
  source: number | string    // Source task ID
  target: number | string    // Target task ID
  type: 'e2e' | 'e2s' | 's2s' | 's2e'  // Dependency type
}
```

Link types:
- `e2s` - End-to-Start (most common)
- `e2e` - End-to-End
- `s2s` - Start-to-Start
- `s2e` - Start-to-End

**GanttScale type:**
```ts
{
  unit: 'year' | 'month' | 'week' | 'day' | 'hour'
  step: number               // Scale step
  format: string             // Date format string
}
```

**GanttColumn type:**
```ts
{
  id: string                 // Column ID
  header: string             // Column header
  width?: number             // Column width
  align?: 'left' | 'center' | 'right'
  template?: (task: GanttTask) => string  // Custom renderer
}
```
