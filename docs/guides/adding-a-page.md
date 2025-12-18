# Adding a New Page

This guide shows you how to add a new page to Puzzle Kit.

## Method 1: Using the Generator (Recommended)

The fastest way to add a page:

```bash
npm run generate page my-new-page
```

This automatically:
1. Creates the page component file
2. Adds to `PAGE_REGISTRY`
3. Registers in `AppShell.tsx`

**Done!** Navigate to it with `navigate('my-new-page')`.

---

## Method 2: Manual Creation

### Step 1: Create the Component

Create a new file at `src/components/menus/MyNewPage.tsx`:

```tsx
'use client';

import React from 'react';
import { useNavigation } from '@/store';
import { usePlayer } from '@/hooks';
import { BottomNavigation } from '@/components/shared';

export function MyNewPage() {
  const { goBack, canGoBack } = useNavigation();
  const { coins } = usePlayer();

  return (
    <div className="flex flex-col h-full bg-bg-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
        {canGoBack && (
          <button onClick={goBack} className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center">
            <span>&larr;</span>
          </button>
        )}
        <h1 className="text-h3 font-bold flex-1 text-center">My New Page</h1>
        <div className="w-8" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="bg-bg-card rounded-xl border-2 border-border p-4">
          <h2 className="text-h4 mb-2">Welcome!</h2>
          <p className="text-body text-text-secondary">
            You have {coins} coins.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="my-new-page" />
    </div>
  );
}
```

### Step 2: Add to Registry

Open `src/config/registry.ts` and add to `PAGE_REGISTRY`:

```typescript
export const PAGE_REGISTRY = {
  // ... existing pages

  'my-new-page': {
    id: 'my-new-page',
    name: 'My New Page',
    icon: '/icons/Star.svg',
    category: 'main',
  },
} as const;
```

### Step 3: Register in AppShell

Open `src/components/layout/AppShell.tsx`:

**Add the import:**
```typescript
const MyNewPage = dynamic(
  () => import('@/components/menus/MyNewPage').then(m => ({ default: m.MyNewPage })),
  { loading: () => <PageSkeleton /> }
);
```

**Add to pageComponents map:**
```typescript
const pageComponents: Record<PageId, React.ComponentType> = {
  // ... existing pages
  'my-new-page': MyNewPage,
};
```

---

## Navigating to Your Page

### From Any Component

```tsx
import { useNavigation } from '@/store';

function NavigationButton() {
  const { navigate } = useNavigation();

  return (
    <button onClick={() => navigate('my-new-page')}>
      Go to My Page
    </button>
  );
}
```

### With Parameters

```tsx
navigate('my-new-page', { userId: '123', tab: 'settings' });

// Access in your page:
const { state } = useNavigation();
const { userId, tab } = state.pageParams;
```

---

## Page Categories

When adding to the registry, use the appropriate category:

| Category | Description | Location |
|----------|-------------|----------|
| `main` | Standard pages | `src/components/menus/` |
| `liveops` | Event pages | `src/components/liveops/` |
| `admin` | Admin pages | `src/components/admin/` |

---

## Using the Simplified Hooks

```tsx
import { usePlayer, useModal, useEvent } from '@/hooks';

function MyNewPage() {
  // Player data and actions
  const {
    coins,
    lives,
    addCoins,
    spendCoins,
    canAfford
  } = usePlayer();

  // Modal control
  const { open, close } = useModal();

  // Event data (if relevant)
  const { progress, percentComplete } = useEvent('royal-pass');

  // ... use in your component
}
```

---

## Page Templates

For different page types, copy from templates:

| Template | Use Case |
|----------|----------|
| `templates/pages/BasicPage.template.tsx` | Simple content |
| `templates/pages/ListPage.template.tsx` | Scrollable lists |
| `templates/pages/LiveOpsPage.template.tsx` | Time-limited events |

---

## Checklist

- [ ] Component file created in correct directory
- [ ] Added to `PAGE_REGISTRY` in `registry.ts`
- [ ] Dynamic import added to `AppShell.tsx`
- [ ] Added to `pageComponents` map
- [ ] Page ID matches across all files
- [ ] `BottomNavigation` included (if applicable)
- [ ] Navigation works correctly
