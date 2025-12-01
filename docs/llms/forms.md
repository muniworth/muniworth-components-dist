# Form Components

All form components in Waterworth share a consistent API for labels, errors, and helper text.

## Common Props

All form fields support these props:
- `label`: string (or ReactNode for Checkbox/Switch)
- `error`: string (displays error message and styles)
- `helperText`: string (displays hint when no error)
- `disabled`: boolean
- `id`: string (optional, auto-generated if omitted)

## Button

Standard interactive button.

**Usage:**
```tsx
import { Button } from '@waterworth/react'

<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `type`: 'button' | 'submit' | 'reset' (default: 'button')

## Input

Single-line text field.

**Usage:**
```tsx
import { Input } from '@waterworth/react'

<Input
  label="Email"
  placeholder="user@example.com"
  error={errors.email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**Props:**
- Standard HTML input attributes.
- `label`, `error`, `helperText`.

## Textarea

Multi-line text field.

**Usage:**
```tsx
import { Textarea } from '@waterworth/react'

<Textarea
  label="Description"
  rows={4}
  helperText="Max 500 characters"
/>
```

**Props:**
- Standard HTML textarea attributes.
- `label`, `error`, `helperText`.

## Select

Dropdown selection.

**Usage:**
```tsx
import { Select } from '@waterworth/react'

const options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico', disabled: true }
]

<Select
  label="Country"
  options={options}
  value={country}
  onValueChange={setCountry}
/>
```

**Props:**
- `options`: `{ value: string, label: string, disabled?: boolean }[]`
- `value`, `onValueChange`: Controlled state.
- `placeholder`: string.
- `label`, `error`, `helperText`, `disabled`, `id`.

## Checkbox

Binary choice.

**Usage:**
```tsx
import { Checkbox } from '@waterworth/react'

<Checkbox
  label="I agree to terms"
  checked={agreed}
  onCheckedChange={setAgreed}
/>
```

**Props:**
- `checked`, `defaultChecked`, `onCheckedChange`.
- `label`: ReactNode.
- `error`, `helperText`, `disabled`, `id`.

## RadioGroup

Single selection from a list.

**Usage:**
```tsx
import { RadioGroup } from '@waterworth/react'

const options = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' }
]

<RadioGroup
  label="Notification Preference"
  options={options}
  value={pref}
  onValueChange={setPref}
/>
```

**Props:**
- `options`: `{ value, label, disabled }[]`.
- `value`, `defaultValue`, `onValueChange`.
- `label`, `error`, `helperText`, `disabled`, `id`.

## Switch

Toggle switch.

**Usage:**
```tsx
import { Switch } from '@waterworth/react'

<Switch
  label="Enable Dark Mode"
  checked={isDark}
  onCheckedChange={setIsDark}
/>
```

**Props:**
- `checked`, `defaultChecked`, `onCheckedChange`.
- `label`: ReactNode.
- `error`, `helperText`, `disabled`, `id`.
