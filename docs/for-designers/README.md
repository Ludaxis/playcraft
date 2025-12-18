# For Game Designers

This guide is for game designers who want to customize Puzzle Kit without deep coding knowledge.

## What You Can Customize

| What | Where | Difficulty |
|------|-------|------------|
| Starting coins, lives, stars | `game.config.ts` | Easy |
| Boosters (names, counts) | `game.config.ts` | Easy |
| Areas and tasks | `game.config.ts` | Easy |
| Shop items and prices | `game.config.ts` | Easy |
| Daily rewards | `game.config.ts` | Easy |
| Enable/disable features | `features.ts` | Easy |
| Theme colors | Admin Panel | Easy |
| Navigation tabs | Admin Panel | Easy |

---

## Getting Started

### 1. Open the Project

Ask a developer to set up the project, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Access the Admin Panel

In the app, look for the **Admin** button (usually bottom right or in settings).

---

## Editing Game Configuration

### File Location

```
src/config/game.config.ts
```

### Player Starting Values

Find this section and change the numbers:

```typescript
export const playerDefaults = {
  startingCoins: 2500,    // Change to give more/less coins
  startingLives: 5,       // Change starting lives
  maxLives: 5,            // Maximum lives possible
  startingStars: 12,      // Starting stars
  startingLevel: 47,      // Starting level
};
```

### Boosters

Add, remove, or modify boosters:

```typescript
export const boosterDefaults = [
  {
    id: 'arrow',           // Unique ID (no spaces)
    name: 'Arrow',         // Display name
    type: 'pre-game',      // 'pre-game' or 'in-game'
    count: 3,              // Starting quantity
    description: 'Start with an arrow on the board',
  },
  // Add more boosters here...
];
```

### Areas (Meta-game)

Define the decoration areas:

```typescript
export const areaDefaults = [
  {
    id: 1,
    name: 'Throne Room',
    tasks: [
      { id: 't1-1', name: 'Repair Floor', starsRequired: 1, completed: true },
      { id: 't1-2', name: 'Place Throne', starsRequired: 2, completed: false },
    ],
    completed: false,
    unlocked: true,
  },
  // Add more areas...
];
```

### Shop Items

Define shop offerings:

```typescript
export const shopDefaults = [
  {
    id: 's1',
    category: 'coins',      // 'coins', 'booster', or 'special'
    name: 'Handful of Coins',
    price: 0.99,            // USD price
    value: 500,             // Amount given
    bonus: 0,               // Optional bonus amount
    featured: false,        // Show as featured?
  },
];
```

### Daily Rewards

Configure the 7-day reward cycle:

```typescript
export const dailyRewardDefaults = [
  { day: 1, reward: { type: 'coins', amount: 50 }, claimed: false, current: true },
  { day: 2, reward: { type: 'booster', amount: 1, name: 'Hammer' }, claimed: false, current: false },
  { day: 3, reward: { type: 'coins', amount: 100 }, claimed: false, current: false },
  // ... days 4-7
];
```

---

## Feature Flags

### File Location

```
src/config/features.ts
```

### Enabling/Disabling Features

Change `true` to `false` to disable:

```typescript
export const FEATURES = {
  // Social features
  TEAMS: true,              // Set to false to hide teams
  FRIENDS: false,           // Friends is disabled
  LEADERBOARDS: true,       // Leaderboards enabled

  // LiveOps events
  EVENT_ROYAL_PASS: true,   // Royal Pass enabled
  EVENT_LIGHTNING_RUSH: false, // Lightning Rush disabled

  // Monetization
  SHOP: true,               // Shop enabled
  REWARDED_ADS: false,      // No rewarded ads
};
```

---

## Using the Admin Panel

### Accessing Admin

1. Open the app
2. Navigate to Settings or look for Admin button
3. The admin panel opens

### What You Can Do

**Navigation Tabs**
- Drag to reorder tabs
- Toggle tabs on/off
- See preview of changes

**Events**
- Enable/disable LiveOps events
- Arrange event buttons on main menu
- Configure event placement (left/right)

**Theme**
- Choose from preset themes
- Customize primary colors
- Preview changes live

**Export**
- Export current config to share
- Import configs from other designers

---

## Testing Your Changes

### After Editing Config Files

1. Save the file
2. The browser should auto-refresh
3. Check that changes appear correctly

### If Changes Don't Appear

1. Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check for red errors in browser console (F12)
3. Ask a developer if errors persist

---

## Common Tasks

### Add a New Booster

1. Open `src/config/game.config.ts`
2. Find `boosterDefaults` array
3. Add a new object:

```typescript
{
  id: 'my-booster',
  name: 'My Booster',
  type: 'in-game',
  count: 5,
  description: 'Does something cool',
},
```

### Change Starting Resources

1. Open `src/config/game.config.ts`
2. Find `playerDefaults`
3. Change the numbers

### Disable a Feature

1. Open `src/config/features.ts`
2. Find the feature name
3. Change `true` to `false`

### Add a New Area

1. Open `src/config/game.config.ts`
2. Find `areaDefaults` array
3. Add a new area object with tasks

---

## Tips

1. **Save often** - Changes are applied when you save
2. **Use unique IDs** - Every item needs a unique `id`
3. **Keep backups** - Copy the file before major changes
4. **Test in browser** - Always verify changes visually
5. **Ask for help** - Developers can help with complex changes

---

## Glossary

| Term | Meaning |
|------|---------|
| LiveOps | Time-limited events |
| Meta-game | Area decoration system |
| Booster | Power-up items |
| Modal | Pop-up dialog |
| Registry | List of all pages/features |

---

## Need Help?

1. Check the [Quick Start Guide](../QUICK_START.md)
2. Browse [Templates](../../templates/README.md) for examples
3. Ask a developer for assistance
