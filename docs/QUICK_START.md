# Quick Start Guide

Get your puzzle game running in 5 minutes.

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd puzzle-kit
npm install
```

## 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your game.

## 3. Customize Your Game

### Edit Game Configuration

Open `src/config/game.config.ts` and customize:

```typescript
// Change starting values
export const playerDefaults = {
  startingCoins: 5000,    // Give players more coins!
  startingLives: 10,      // More lives to start
  maxLives: 10,
  startingLevel: 1,
};

// Modify boosters
export const boosterDefaults = [
  { id: 'super-power', name: 'Super Power', type: 'in-game', count: 5, description: 'Your custom booster' },
  // ... add more
];
```

### Toggle Features

Open `src/config/features.ts`:

```typescript
export const FEATURES = {
  // Core Systems
  LIVES_SYSTEM: true,       // Enable lives
  COINS_SYSTEM: true,       // Enable coins
  BOOSTERS: true,           // Enable boosters
  AREAS: true,              // Enable area meta-game

  // Social Features
  TEAMS: true,              // Enable teams
  FRIENDS: false,           // Disable friends
  LEADERBOARDS: true,       // Enable leaderboards
  PROFILES: true,           // Enable profiles

  // Monetization
  SHOP: true,               // Enable shop
  DAILY_REWARDS: true,      // Enable daily rewards

  // LiveOps Events
  EVENT_ROYAL_PASS: true,   // Enable Royal Pass
  EVENT_SKY_RACE: true,     // Enable Sky Race
  EVENT_LIGHTNING_RUSH: false, // Disable Lightning Rush
};
```

**What happens when a feature is disabled:**
- The page shows a friendly "Feature Disabled" message
- Events won't appear in the main menu
- Navigation still works (no crashes)

## 4. Add Your First Feature

### Generate a New Page

```bash
npm run generate page my-awesome-page
```

This creates:
- `src/components/menus/MyAwesomePage.tsx`
- Adds to registry automatically
- Registers in AppShell automatically

### Generate a New Modal

```bash
npm run generate modal purchase-confirm
```

### Generate a New Event

```bash
npm run generate event treasure-hunt
```

## 5. Navigate to Your New Page

In any component:

```tsx
import { useNavigation } from '@/store';

function MyButton() {
  const { navigate } = useNavigation();

  return (
    <button onClick={() => navigate('my-awesome-page')}>
      Go to My Page
    </button>
  );
}
```

## 6. Use Simplified Hooks

```tsx
import { usePlayer, useModal, useEvent } from '@/hooks';

function GameComponent() {
  // Player state
  const { coins, addCoins, spendCoins, canAfford } = usePlayer();

  // Modal control
  const { open, close } = useModal();

  // Event progress
  const { progress, percentComplete, addProgress } = useEvent('royal-pass');

  return (
    <div>
      <p>Coins: {coins}</p>
      <button
        onClick={() => addCoins(100)}
        disabled={!canAfford(100)}
      >
        Buy Item
      </button>
      <button onClick={() => open('reward-claim')}>
        Show Reward
      </button>
    </div>
  );
}
```

## 7. Launch Storybook (Component Library)

```bash
npm run storybook
```

Browse all components at [http://localhost:6006](http://localhost:6006).

## 8. Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
puzzle-kit/
├── src/
│   ├── config/
│   │   ├── game.config.ts    # 🎮 EDIT THIS! Game settings
│   │   ├── features.ts       # Feature flags
│   │   └── registry.ts       # Page/Modal/Event registry
│   │
│   ├── hooks/
│   │   ├── usePlayer.ts      # Player state hook
│   │   ├── useEvent.ts       # Event state hook
│   │   └── useModal.ts       # Modal control hook
│   │
│   ├── components/
│   │   ├── menus/            # Page components
│   │   ├── modals/           # Modal components
│   │   ├── liveops/          # LiveOps event pages
│   │   └── base/             # UI primitives
│   │
│   └── store/                # State management
│
├── templates/                # Copy-paste templates
│   ├── pages/
│   └── modals/
│
├── scripts/
│   └── generate.ts           # CLI generator
│
└── docs/                     # Documentation
```

---

## Next Steps

- Read the [Adding a Page Guide](./guides/adding-a-page.md)
- Read the [Adding a Modal Guide](./guides/adding-a-modal.md)
- Browse [Templates](../templates/README.md)
- Check out [Storybook](http://localhost:6006) for component examples

---

## 9. Run Tests

```bash
npm run test        # Run Playwright smoke tests
npm run test:ui     # Run tests with UI
```

---

## Responsive Design

The app is responsive from mobile (390px) up to iPad Pro 12.9" (1024px).

**For modals and panels:**
```tsx
// ✅ Good - responsive
<div className="w-full max-w-[320px]">

// ❌ Bad - fixed width
<div className="w-[320px]">
```

**For grids:**
```tsx
// ✅ Good - adapts to screen size
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">

// ❌ Bad - always 2 columns
<div className="grid grid-cols-2">
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run test` | Run Playwright tests |
| `npm run test:ui` | Run tests with UI |
| `npm run storybook` | Launch Storybook |
| `npm run generate` | Interactive generator |
| `npm run generate page <name>` | Generate a page |
| `npm run generate modal <name>` | Generate a modal |
| `npm run generate event <name>` | Generate an event |
