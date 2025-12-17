# Component API Reference

This document provides a complete API reference for all Puzzle Kit components.

## Base Components

Base components are the foundational building blocks. They are atomic, reusable, and have minimal dependencies.

### Button

A simplified button with 2 variants.

```tsx
import { Button } from '@/components/base';

<Button variant="solid" size="md" onClick={handleClick}>
  Submit
</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'solid' \| 'outline'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `disabled` | `boolean` | `false` | Disable interactions |
| `onClick` | `() => void` | - | Click handler |

---

### Card

A consistent container component with subtle styling.

```tsx
import { Card } from '@/components/base';

<Card padding="md" onPress={handlePress}>
  Card content here
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `onPress` | `() => void` | - | Makes card clickable |
| `className` | `string` | - | Additional CSS classes |

---

### Badge

Display labels and notification counts.

```tsx
import { Badge, NotificationDot } from '@/components/base';

<Badge variant="notification">5</Badge>
<NotificationDot count={3} />
```

#### Badge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'notification'` | `'default'` | Visual style |
| `children` | `ReactNode` | - | Badge content |

#### NotificationDot Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | - | Number to display (caps at 99+) |

---

### IconBox

Container for icons with consistent sizing.

```tsx
import { IconBox } from '@/components/base';

<IconBox size="md" shape="circle" variant="default">
  $
</IconBox>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Box size |
| `shape` | `'square' \| 'rounded' \| 'circle'` | `'rounded'` | Box shape |
| `variant` | `'default' \| 'muted' \| 'inverse'` | `'default'` | Visual style |

---

### Avatar

User avatar with initials fallback.

```tsx
import { Avatar } from '@/components/base';

<Avatar name="John Doe" src="/avatar.png" size="md" online />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Name for initials fallback |
| `src` | `string` | - | Image URL |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| `online` | `boolean` | - | Show online indicator |

---

### Timer

Countdown timer with multiple display variants.

```tsx
import { Timer } from '@/components/base';

<Timer endTime={eventEndTime} variant="badge" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `endTime` | `Date` | - | Target end time |
| `variant` | `'default' \| 'compact' \| 'badge'` | `'default'` | Display style |

---

### ProgressBar

Shows progress towards a goal.

```tsx
import { ProgressBar } from '@/components/base';

<ProgressBar current={7} max={10} showLabel />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `current` | `number` | - | Current progress value |
| `max` | `number` | - | Maximum value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height |
| `showLabel` | `boolean` | `false` | Show "X/Y" label |

---

### Toggle

On/off switch for settings.

```tsx
import { Toggle } from '@/components/base';

<Toggle checked={isEnabled} onChange={setIsEnabled} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | Toggle state |
| `onChange` | `(checked: boolean) => void` | - | Change handler |
| `disabled` | `boolean` | `false` | Disable interactions |

---

### Modal

Base modal with keyboard support and backdrop.

```tsx
import { Modal } from '@/components/base';

<Modal isOpen={isOpen} onClose={handleClose} size="md">
  <Modal.Header title="Title" onClose={handleClose} />
  <Modal.Body>Content here</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Close</Button>
  </Modal.Footer>
</Modal>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Control visibility |
| `onClose` | `() => void` | - | Close handler |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Modal width |

---

## Composed Components

Composed components combine base components for specific use cases.

### PageHeader

Standardized header for all pages.

```tsx
import { PageHeader } from '@/components/composed';

<PageHeader
  title="Settings"
  onBack={handleBack}
  onClose={handleClose}
  rightElement={<FilterButton />}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Page title |
| `onBack` | `() => void` | - | Back button handler (shows if provided) |
| `onClose` | `() => void` | - | Close button handler (shows if provided) |
| `leftElement` | `ReactNode` | - | Custom left content |
| `rightElement` | `ReactNode` | - | Custom right content |

---

### EventCard

LiveOps event button with timer.

```tsx
import { EventCard } from '@/components/composed';

<EventCard
  icon="RP"
  endTime={eventEndTime}
  onPress={() => navigate('royal-pass')}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | - | Icon text to display |
| `iconElement` | `ReactNode` | - | Custom icon element |
| `endTime` | `Date \| null` | - | Event end time |
| `onPress` | `() => void` | - | Click handler |

---

### ResourceCounter

Display for coins, lives, or stars.

```tsx
import { ResourceCounter } from '@/components/composed';

<ResourceCounter
  type="coins"
  value={1250}
  showAdd
  onPress={handleAddCoins}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'coins' \| 'lives' \| 'stars'` | - | Resource type |
| `value` | `number` | - | Current amount |
| `showAdd` | `boolean` | `false` | Show add button |
| `onPress` | `() => void` | - | Add button handler |

---

### RankBadge

Position badge for leaderboards (gold/silver/bronze for top 3).

```tsx
import { RankBadge } from '@/components/composed';

<RankBadge position={1} size="md" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `number` | - | Rank number |
| `size` | `'sm' \| 'md'` | `'md'` | Badge size |

---

### ProgressCard

Card with embedded progress bar.

```tsx
import { ProgressCard } from '@/components/composed';

<ProgressCard
  title="Team Chest"
  description="Contribute to unlock rewards"
  current={450}
  max={1000}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `description` | `string` | - | Optional description |
| `current` | `number` | - | Current progress |
| `max` | `number` | - | Maximum value |

---

### MilestoneItem

Achievement/milestone with completion status.

```tsx
import { MilestoneItem } from '@/components/composed';

<MilestoneItem
  index={1}
  title="500 Stars"
  subtitle="Team Reward"
  completed={true}
  claimed={false}
  onClaim={handleClaim}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | - | Milestone number |
| `title` | `string` | - | Milestone title |
| `subtitle` | `string` | - | Secondary text |
| `completed` | `boolean` | - | Is milestone achieved |
| `claimed` | `boolean` | `false` | Has reward been claimed |
| `onClaim` | `() => void` | - | Claim button handler |

---

### ListRow

Generic list row for leaderboards and team members.

```tsx
import { ListRow } from '@/components/composed';

<ListRow
  rank={1}
  name="Player1"
  subtitle="Level 45"
  value="1,234"
  highlighted
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rank` | `number` | - | Position number |
| `name` | `string` | - | Player name |
| `subtitle` | `string` | - | Secondary text |
| `value` | `string \| number` | - | Right-side value |
| `avatar` | `string` | - | Avatar image URL |
| `online` | `boolean` | - | Online status indicator |
| `highlighted` | `boolean` | `false` | Highlight this row |
| `onPress` | `() => void` | - | Click handler |
| `rightElement` | `ReactNode` | - | Custom right content |

---

### InfoBox

Informational box with icon and text.

```tsx
import { InfoBox } from '@/components/composed';

<InfoBox
  title="Bonus Bank"
  description="Collect bonus coins during your journey!"
  iconText="$"
  variant="highlight"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Optional title |
| `description` | `string` | - | Main text content |
| `icon` | `ReactNode` | - | Custom icon element |
| `iconText` | `string` | - | Text for icon box |
| `variant` | `'default' \| 'highlight'` | `'default'` | Visual style |

---

## Importing Components

All components can be imported from their respective index files:

```tsx
// Base components
import { Button, Card, Badge, IconBox, Avatar, Timer, ProgressBar, Toggle, Modal } from '@/components/base';

// Composed components
import { PageHeader, EventCard, ResourceCounter, RankBadge, ProgressCard, MilestoneItem, ListRow, InfoBox } from '@/components/composed';
```
