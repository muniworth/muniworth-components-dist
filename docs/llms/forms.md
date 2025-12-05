# Form Components

All form components share consistent patterns for labels, errors, and helper text.

## Common Form Props

These props are available on Input, Textarea, Select, Checkbox, RadioGroup, and Switch:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string \| ReactNode` | - | Field label |
| `error` | `string` | - | Error message (displays with error styling) |
| `helperText` | `string` | - | Helper text (shown when no error) |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto-generated | Field ID (uses React's useId if omitted) |

## Button

Interactive button component.

```tsx
import { Button } from '@waterworth/react'

<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>

<Button variant="danger" disabled>Delete</Button>

<Button variant="ghost" type="submit">Cancel</Button>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |

Also accepts all standard `<button>` HTML attributes.

**Variant usage:**
- `primary` - Primary actions (submit, confirm)
- `secondary` - Secondary actions (cancel, back)
- `danger` - Destructive actions (delete, remove)
- `ghost` - Minimal/text-like buttons

## Input

Single-line text input.

```tsx
import { Input } from '@waterworth/react'

<Input
  label="Email"
  placeholder="user@example.com"
  type="email"
  error={errors.email}
  onChange={(e) => setEmail(e.target.value)}
/>

<Input
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Field label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto-generated | Field ID |

Also accepts all standard `<input>` HTML attributes (`type`, `placeholder`, `value`, `onChange`, etc.)

## Textarea

Multi-line text input.

```tsx
import { Textarea } from '@waterworth/react'

<Textarea
  label="Description"
  rows={4}
  placeholder="Enter description..."
  helperText="Max 500 characters"
/>

<Textarea
  label="Notes"
  error="This field is required"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Field label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto-generated | Field ID |
| `rows` | `number` | - | Number of visible rows |

Also accepts all standard `<textarea>` HTML attributes.

## Select

Dropdown selection component.

```tsx
import { Select } from '@waterworth/react'

const options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico', disabled: true }
]

<Select
  label="Country"
  placeholder="Select a country"
  options={options}
  value={country}
  onValueChange={setCountry}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | required | Available options |
| `value` | `string` | - | Controlled value |
| `onValueChange` | `(value: string) => void` | - | Value change callback |
| `placeholder` | `string` | - | Placeholder text |
| `label` | `string` | - | Field label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto-generated | Field ID |

**SelectOption type:**
```ts
{ value: string; label: string; disabled?: boolean }
```

## Checkbox

Binary choice input.

```tsx
import { Checkbox } from '@waterworth/react'

<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onCheckedChange={setAgreed}
/>

<Checkbox
  label={<span>Accept <a href="/privacy">privacy policy</a></span>}
  error="You must accept to continue"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | - | Checkbox label (can include JSX) |
| `checked` | `boolean` | - | Controlled checked state |
| `defaultChecked` | `boolean` | - | Uncontrolled default |
| `onCheckedChange` | `(checked: boolean) => void` | - | Change callback |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto-generated | Field ID |

## RadioGroup

Single selection from a list of options.

```tsx
import { RadioGroup } from '@waterworth/react'

const options = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification', disabled: true }
]

<RadioGroup
  label="Notification Preference"
  options={options}
  value={preference}
  onValueChange={setPreference}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `RadioOption[]` | required | Available options |
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | - | Uncontrolled default |
| `onValueChange` | `(value: string) => void` | - | Value change callback |
| `label` | `string` | - | Group label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disable all options |
| `id` | `string` | auto-generated | Group ID |

**RadioOption type:**
```ts
{ value: string; label: string; disabled?: boolean }
```

## Switch

Toggle switch component.

```tsx
import { Switch } from '@waterworth/react'

<Switch
  label="Enable notifications"
  checked={enabled}
  onCheckedChange={setEnabled}
/>

<Switch
  label="Dark mode"
  helperText="Switch between light and dark themes"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | - | Switch label |
| `checked` | `boolean` | - | Controlled checked state |
| `defaultChecked` | `boolean` | - | Uncontrolled default |
| `onCheckedChange` | `(checked: boolean) => void` | - | Change callback |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto-generated | Field ID |

## Accessibility Notes

All form components:
- Use `aria-invalid` when `error` is present
- Use `aria-describedby` to link error/helper text
- Auto-generate unique IDs using React's `useId()` hook
- Error messages use `role="alert"` for screen reader announcements
