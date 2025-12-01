# Charts & Visualizations

## Standard Charts



Built on Chart.js.



### BarChart



**Usage:**

```tsx

import { BarChart } from '@waterworth/react'



<BarChart

  title="Sales"

  labels={['Jan', 'Feb', 'Mar']}

  datasets={[

    { label: '2024', data: [10, 20, 30] }

  ]}

  height={300}

  horizontal={false}

/>

```



**Props:**

- `title`: string.

- `labels`: string[].

- `datasets`: `{ label, data: number[], backgroundColor?, borderColor?, borderWidth? }[]`.

- `horizontal`: boolean.

- `showValues`: boolean.

- `showLegend`: boolean (default: true).

- `legendPosition`: 'top' | 'bottom' | 'left' | 'right'.

- `height`: number | string (default: 300).

- `className`: string.



### LineChart



**Usage:**

```tsx

import { LineChart } from '@waterworth/react'



<LineChart

  labels={['Jan', 'Feb']}

  datasets={[

    { label: 'Trend', data: [10, 15], tension: 0.4 }

  ]}

/>

```



**Props:**

- `title`: string.

- `labels`: string[].

- `datasets`: `{ label, data, fill?, tension?, borderColor? }[]`.

- `showLegend`: boolean.

- `legendPosition`: 'top' | 'bottom' | 'left' | 'right'.

- `height`: number | string.

- `className`: string.



### Pie & Doughnut Charts



**Usage:**

```tsx

import { PieChart, DoughnutChart } from '@waterworth/react'



<PieChart

  labels={['A', 'B']}

  data={[30, 70]}

  colors={['#00B2CC', '#ED3F30']}

/>



<DoughnutChart

  labels={['A', 'B']}

  data={[30, 70]}

  cutout="70%"

/>

```



**Props:**

- `title`: string.

- `labels`: string[].

- `data`: number[].

- `colors`: string[].

- `cutout` (Doughnut only): string | number.

- `showLegend`: boolean.

- `legendPosition`: 'top' | 'bottom' | 'left' | 'right'.

- `height`: number | string.

- `className`: string.



## Complex Visualizations



### EventCalendar



Full-featured calendar (FullCalendar wrapper).



**Usage:**

```tsx

import { EventCalendar } from '@waterworth/react'



<EventCalendar

  initialView="dayGridMonth"

  events={[

    { id: '1', title: 'Meeting', start: '2024-12-01', color: '#00B2CC' }

  ]}

  onEventClick={(e) => console.log(e)}

/>

```



**Props:**

- `events`: `{ id, title, start, end, color? }[]`.

- `initialView`: 'dayGridMonth' | 'dayGridWeek' | 'dayGridDay'.

- `editable`: boolean.

- `onEventClick`: (event) => void.

- `onDateClick`: (date) => void.

- `onEventDrop`: (event, newStart, newEnd) => void.

- `initialDate`: Date | string.

- `weekStartsOn`: 0-6.

- `showWeekNumbers`: boolean.

- `height`: string | number.



### GanttChart



Project timeline (SVAR Gantt wrapper).



**Usage:**

```tsx

import { GanttChart } from '@waterworth/react'



const tasks = [

  { id: 1, text: 'Task 1', start: new Date('2024-12-01'), duration: 5, priority: 'high' }

]



<GanttChart tasks={tasks} editable />

```



**Props:**

- `tasks`: `{ id, text, start, end?, duration?, priority? }[]`.

- `links`: Dependency links.

- `scales`: Timeline scale config.

- `columns`: Grid column definitions.

- `editable`: boolean.

- `readonly`: boolean.

- `showTooltip`: boolean.

- `showEditor`: boolean.

- `start`, `end`: Date constraint.

- `height`: number.

- Callbacks: `onTaskClick`, `onTaskChange`, `onLinkAdd`, `onLinkDelete`.


