# Adding Features Guide

This guide explains how to add new features to Puzzle Kit, including LiveOps events, currencies, and pages.

## Adding a New LiveOps Event

LiveOps events are time-limited features that appear on the main menu and have their own pages.

### Step 1: Define the Event Type

Add your event type to `src/features/liveops/types.ts`:

```typescript
export type EventType =
  | 'royal-pass'
  | 'lightning-rush'
  | 'team-chest'
  | 'sky-race'
  | 'kings-cup'
  | 'lava-quest'
  | 'book-of-treasure'
  | 'your-new-event';  // Add here
```

### Step 2: Add Event Configuration

Add your event config to `src/features/liveops/config.ts`:

```typescript
export const eventConfig: Record<EventType, EventConfig> = {
  // ... existing events

  'your-new-event': {
    id: 'your-new-event',
    name: 'Your Event Name',
    icon: 'YE',  // Short text for icon
    description: 'Event description here',
    duration: 72,  // Hours
    rewards: ['coins', 'boosters', 'special-item'],
  },
};
```

### Step 3: Create the Event Page

Create a new page component in `src/components/pages/YourEventPage.tsx`:

```tsx
'use client';

import React from 'react';
import { PageHeader, ProgressCard, MilestoneItem } from '@/components/composed';
import { Card } from '@/components/base';
import { useNavigation } from '@/store/NavigationContext';

export function YourEventPage() {
  const { goBack } = useNavigation();

  return (
    <div className="min-h-screen bg-bg-page">
      <PageHeader
        title="Your Event"
        onClose={goBack}
      />

      <div className="p-4 space-y-4">
        <ProgressCard
          title="Event Progress"
          description="Complete challenges to earn rewards"
          current={25}
          max={100}
        />

        <Card>
          <h3 className="font-bold text-text-primary mb-3">Rewards</h3>
          <div className="space-y-2">
            <MilestoneItem
              index={1}
              title="25 Points"
              subtitle="100 Coins"
              completed={true}
              claimed={true}
            />
            <MilestoneItem
              index={2}
              title="50 Points"
              subtitle="1 Booster"
              completed={false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
```

### Step 4: Register the Page

Add your page to `src/components/layout/AppShell.tsx`:

```typescript
import { YourEventPage } from '@/components/pages/YourEventPage';

// In the navigation switch:
case 'your-new-event':
  return <YourEventPage />;
```

### Step 5: Add to Main Menu

The event will automatically appear on the main menu if it's active. Update the events list in MainMenu if needed.

---

## Adding a New Currency

### Step 1: Define Currency Type

Add to `src/features/currencies/types.ts`:

```typescript
export type CurrencyType =
  | 'coins'
  | 'lives'
  | 'stars'
  | 'gems'  // Add here
  | 'your-currency';
```

### Step 2: Add Currency Configuration

Add to `src/features/currencies/config.ts`:

```typescript
export const currencyConfig: Record<CurrencyType, CurrencyConfig> = {
  // ... existing currencies

  'your-currency': {
    id: 'your-currency',
    name: 'Diamonds',
    icon: 'D',
    color: 'text-cyan-400',
    maxDisplay: 9999,
  },
};
```

### Step 3: Add to Game State (Optional)

If tracking state, update `src/store/GameContext.tsx`:

```typescript
interface GameState {
  // ... existing
  diamonds: number;
}

// Initial state
const initialState: GameState = {
  // ... existing
  diamonds: 0,
};
```

### Step 4: Use ResourceCounter

```tsx
<ResourceCounter
  type="your-currency"
  value={diamonds}
  showAdd
  onPress={() => openShop()}
/>
```

---

## Adding a New Page

### Step 1: Create the Page Component

Create `src/components/pages/YourPage.tsx`:

```tsx
'use client';

import React from 'react';
import { PageHeader } from '@/components/composed';
import { Card, Button } from '@/components/base';
import { useNavigation } from '@/store/NavigationContext';

export function YourPage() {
  const { goBack } = useNavigation();

  return (
    <div className="min-h-screen bg-bg-page">
      <PageHeader
        title="Your Page"
        onClose={goBack}
      />

      <div className="p-4 space-y-4">
        <Card>
          <h3 className="font-bold text-text-primary">Content</h3>
          <p className="text-text-secondary">Your page content here</p>
        </Card>

        <Button fullWidth>
          Action Button
        </Button>
      </div>
    </div>
  );
}
```

### Step 2: Export from Index

Add to `src/components/pages/index.ts`:

```typescript
export { YourPage } from './YourPage';
```

### Step 3: Register Navigation

Add to `src/store/NavigationContext.tsx`:

```typescript
type PageType =
  | 'main-menu'
  // ... existing
  | 'your-page';  // Add here
```

Add to `src/components/layout/AppShell.tsx`:

```typescript
import { YourPage } from '@/components/pages';

// In renderCurrentPage:
case 'your-page':
  return <YourPage />;
```

### Step 4: Navigate to Your Page

```tsx
const { navigate } = useNavigation();

<Button onClick={() => navigate('your-page')}>
  Go to Your Page
</Button>
```

---

## Adding a Modal

### Step 1: Create Modal Content

Create `src/components/modals/YourModal.tsx`:

```tsx
'use client';

import React from 'react';
import { Modal, Button } from '@/components/base';

interface YourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function YourModal({ isOpen, onClose }: YourModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header title="Your Modal" onClose={onClose} />
      <Modal.Body>
        <p className="text-text-secondary">Modal content here</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### Step 2: Use the Modal

```tsx
import { useState } from 'react';
import { YourModal } from '@/components/modals/YourModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <YourModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

---

## File Structure Reference

When adding features, follow this structure:

```
src/
├── components/
│   ├── base/           # Atomic components (Button, Card, etc.)
│   ├── composed/       # Combination components (PageHeader, etc.)
│   ├── pages/          # Full page components
│   └── modals/         # Modal content components
├── features/
│   ├── liveops/        # Event types and configs
│   ├── currencies/     # Currency types and configs
│   ├── shop/           # Shop items and logic
│   └── team/           # Team features
├── store/              # React contexts
└── hooks/              # Custom hooks
```

## Best Practices

1. **Use existing components** - Check `/components/base` and `/components/composed` before creating new UI.

2. **Follow the token system** - Use semantic color tokens (`bg-bg-card`, `text-text-primary`) not hardcoded colors.

3. **Keep pages simple** - Pages should compose existing components, not define new inline UI.

4. **Type everything** - Define types in the appropriate feature module.

5. **Add Storybook stories** - Document new components with stories in `/src/stories`.

6. **Test on mobile** - Puzzle Kit is mobile-first. Test your features on small screens.
