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
  TEAMS: true,           // Enable teams
  FRIENDS: false,        // Disable friends
  DAILY_REWARDS: true,   // Enable daily rewards
  EVENT_ROYAL_PASS: true, // Enable Royal Pass event
};
```

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

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run storybook` | Launch Storybook |
| `npm run generate` | Interactive generator |
| `npm run generate page <name>` | Generate a page |
| `npm run generate modal <name>` | Generate a modal |
| `npm run generate event <name>` | Generate an event |
