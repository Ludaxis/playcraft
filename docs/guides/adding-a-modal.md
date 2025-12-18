# Adding a New Modal

This guide shows you how to add a new modal to Puzzle Kit.

## Method 1: Using the Generator (Recommended)

The fastest way to add a modal:

```bash
npm run generate modal my-modal
```

This automatically:
1. Creates the modal component file
2. Adds to `MODAL_REGISTRY`
3. Registers in `ModalManager.tsx`

**Done!** Open it with `openModal('my-modal')`.

---

## Method 2: Manual Creation

### Step 1: Create the Component

Create a new file at `src/components/modals/MyModal.tsx`:

```tsx
'use client';

import React from 'react';
import { useModal, useModalParams } from '@/hooks';

// Define your modal's parameters (optional)
interface MyModalParams {
  title?: string;
  message?: string;
}

// Props interface - onAnimatedClose is required for animation support
interface Props {
  onAnimatedClose?: () => void;
}

export function MyModal({ onAnimatedClose }: Props) {
  const { close } = useModal();
  const params = useModalParams<MyModalParams>();

  // Use onAnimatedClose if provided, otherwise use close
  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      close();
    }
  };

  return (
    <div className="w-[300px] bg-bg-card rounded-xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">
          {params.title ?? 'My Modal'}
        </h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center"
        >
          <span className="text-text-primary">&times;</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-body text-text-secondary text-center mb-4">
          {params.message ?? 'Modal content goes here.'}
        </p>

        <button
          onClick={handleClose}
          className="w-full py-2.5 bg-bg-inverse text-text-inverse rounded-lg font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

### Step 2: Add to Registry

Open `src/config/registry.ts` and add to `MODAL_REGISTRY`:

```typescript
export const MODAL_REGISTRY = {
  // ... existing modals

  'my-modal': { id: 'my-modal', name: 'My Modal' },
} as const;
```

### Step 3: Register in ModalManager

Open `src/components/modals/ModalManager.tsx`:

**Add the import:**
```typescript
const MyModal = dynamic(
  () => import('./MyModal').then(m => ({ default: m.MyModal })),
  { loading: () => <ModalSkeleton /> }
);
```

**Add to modalComponents map:**
```typescript
const modalComponents: Partial<Record<ModalId, React.ComponentType<{ onAnimatedClose?: () => void }>>> = {
  // ... existing modals
  'my-modal': MyModal,
};
```

---

## Opening a Modal

### Basic Usage

```tsx
import { useModal } from '@/hooks';

function MyButton() {
  const { open } = useModal();

  return (
    <button onClick={() => open('my-modal')}>
      Open Modal
    </button>
  );
}
```

### With Parameters

```tsx
open('my-modal', {
  title: 'Custom Title',
  message: 'Custom message here!',
});

// Access in modal:
const params = useModalParams<MyModalParams>();
console.log(params.title); // 'Custom Title'
```

### From Navigation Context

```tsx
import { useNavigation } from '@/store';

function MyComponent() {
  const { openModal } = useNavigation();

  return (
    <button onClick={() => openModal('my-modal', { title: 'Hello!' })}>
      Open
    </button>
  );
}
```

---

## Modal Types

Common modal patterns with templates:

| Template | Use Case |
|----------|----------|
| `ConfirmModal` | Yes/No confirmations |
| `RewardModal` | Showing rewards |
| `InfoModal` | Information display |

Copy from `templates/modals/` for these patterns.

---

## Important: Animation Support

Always include the `onAnimatedClose` prop pattern:

```tsx
interface Props {
  onAnimatedClose?: () => void;  // REQUIRED for animations
}

export function MyModal({ onAnimatedClose }: Props) {
  const { close } = useModal();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();  // Triggers slide-up animation
    } else {
      close();            // Fallback direct close
    }
  };

  // ...
}
```

The `ModalManager` passes this callback to enable GSAP animations.

---

## Modal Stack

Modals use a stack system - you can open modals on top of other modals:

```tsx
// Open first modal
open('level-complete');

// Open another on top
open('reward-claim');

// Close top modal (returns to level-complete)
close();

// Close all modals
closeAll();
```

### Check Modal State

```tsx
const { isOpen, current, hasOpenModal } = useModal();

if (isOpen('my-modal')) {
  // Modal is currently open
}

console.log(current); // Current top modal ID
```

---

## Typed Parameters

For type safety, define parameter interfaces:

```typescript
// In src/types/navigation.ts
export interface ModalParamsMap {
  // ... existing
  'my-modal': {
    title?: string;
    message?: string;
    onConfirm?: () => void;
  };
}

// Usage
const params = useModalParams<ModalParamsMap['my-modal']>();
```

---

## Styling Guidelines

Standard modal dimensions:
- Width: `w-[300px]` or `w-[320px]`
- Max height: `max-h-[80vh]`
- Border: `border-2 border-border`
- Corners: `rounded-xl` or `rounded-2xl`

Header pattern:
```tsx
<div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
  <h2 className="text-text-inverse text-h4">Title</h2>
  <button className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full">
    &times;
  </button>
</div>
```

---

## Checklist

- [ ] Component file created in `src/components/modals/`
- [ ] Added to `MODAL_REGISTRY` in `registry.ts`
- [ ] Dynamic import added to `ModalManager.tsx`
- [ ] Added to `modalComponents` map
- [ ] `onAnimatedClose` prop pattern implemented
- [ ] Modal ID matches across all files
- [ ] Close button works correctly
- [ ] Parameters typed (if using params)
