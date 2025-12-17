<div align="center">

# Puzzle Kit

**A high-fidelity, interactive prototype for puzzle game UI/UX**

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)
[![Storybook](https://img.shields.io/badge/Storybook-8.6-FF4785?style=for-the-badge&logo=storybook)](https://storybook.js.org/)

[Features](#features) | [Quick Start](#quick-start) | [Architecture](#architecture) | [Components](#component-library) | [Documentation](#documentation)

</div>

---

## Overview

Puzzle Kit is a modular, production-ready prototype for puzzle game UI/UX. Built with modern web technologies, featuring smooth GSAP animations, swipe navigation, and a comprehensive component library. Perfect for game design reference, UI/UX studies, or as a foundation for similar projects.

### Why This Project?

- **Complete Game UI** - All major screens and flows implemented
- **Pixel-Perfect Design** - Professional puzzle game aesthetics
- **Smooth Animations** - GSAP-powered transitions and interactions
- **Mobile-First** - Touch gestures, swipe navigation, responsive design
- **Modular Architecture** - Easy to extend, modify, or use as reference
- **Storybook Integration** - Component documentation and visual testing
- **Design System** - Token-based theming with 7 preset themes

---

## Features

### Core Screens

| Screen | Description |
|--------|-------------|
| **Main Menu** | Level roadmap or castle view, resources, LiveOps event grid |
| **Shop** | Premium cards, coin packs, special offers with multiple panel variants |
| **Settings** | Audio, notifications, account management, admin access |
| **Team** | Members, chat, leaderboard, team management |
| **Leaderboard** | Global, friends, and team rankings with animated tabs |
| **Inbox** | Messages, rewards, notifications system |
| **Daily Rewards** | 7-day calendar with streak bonuses |
| **Profile** | Player stats, achievements, social links |
| **Friends** | Friend list management with online status |
| **Boosters** | Booster inventory and selection |
| **Collection** | Card sets, albums, completion rewards |
| **Gameplay** | Match-3 game board with moves and scoring |

### LiveOps Events

| Event | Type |
|-------|------|
| **Royal Pass** | Season pass with free/premium tracks |
| **Sky Race** | Competitive milestone race |
| **King's Cup** | Tournament leaderboard |
| **Team Chest** | Collaborative team rewards |
| **Book of Treasure** | Chapter-based objectives |
| **Lightning Rush** | Time-limited challenges |
| **Lava Quest** | Progressive milestones |
| **Mission Control** | Multi-objective missions |
| **Album** | Card collection system |
| **Collection** | Card set completion |

### Admin Panel

| Feature | Description |
|---------|-------------|
| **Tab Manager** | Add, remove, and reorder bottom navigation tabs (max 5) |
| **Event Manager** | Toggle LiveOps events and configure left/right placement |
| **Theme Editor** | 7 preset themes + custom color customization |
| **Main Menu Toggle** | Switch between castle view and level roadmap modes |
| **Auto-Save** | All settings persist to localStorage |
| **Reset** | One-click restore to defaults |

### UI/UX Features

- **Swipe Navigation** - Swipe left/right between main tabs
- **Page Transitions** - Smooth slide and fade animations
- **Modal System** - Animated modals with stack support
- **Touch Optimized** - Native-feeling touch interactions
- **Tab Animations** - Sliding indicator on tab switches
- **Dynamic Tabs** - Configure navigation tabs via Admin Panel
- **Countdown Timers** - Live event timers with auto-update

---

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/mohammadreza87/webpuzzlekit.git
cd webpuzzlekit

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run storybook` | Launch Storybook component explorer |
| `npm run build-storybook` | Build static Storybook |

---

## Architecture

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.2 | React framework with App Router |
| **React** | 19 | UI library with latest features |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **GSAP** | 3.12 | Professional-grade animations |
| **Storybook** | 8.6 | Component documentation & testing |

### Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── globals.css             # Global styles, CSS variables & Tailwind
│   ├── layout.tsx              # Root layout with fonts
│   └── page.tsx                # Entry point
│
├── components/
│   ├── base/                   # Atomic UI components (9)
│   │   ├── Avatar.tsx          # User avatar with initials fallback
│   │   ├── Badge.tsx           # Labels and notification dots
│   │   ├── Button.tsx          # Solid/outline button variants
│   │   ├── Card.tsx            # Container component
│   │   ├── IconBox.tsx         # Icon containers with sizing
│   │   ├── Modal.tsx           # Base modal with keyboard support
│   │   ├── ProgressBar.tsx     # Animated progress indicators
│   │   ├── Timer.tsx           # Countdown with multiple variants
│   │   └── Toggle.tsx          # On/off switch
│   │
│   ├── composed/               # Higher-level components (8)
│   │   ├── EventCard.tsx       # LiveOps event button with timer
│   │   ├── InfoBox.tsx         # Informational box with icon
│   │   ├── ListRow.tsx         # Generic list row for leaderboards
│   │   ├── MilestoneItem.tsx   # Achievement/milestone item
│   │   ├── PageHeader.tsx      # Standardized page header
│   │   ├── ProgressCard.tsx    # Card with progress bar
│   │   ├── RankBadge.tsx       # Position badge (gold/silver/bronze)
│   │   └── ResourceCounter.tsx # Coins/lives/stars display
│   │
│   ├── ui/                     # Legacy UI components (14)
│   │   ├── AnimatedModal.tsx   # GSAP-animated modal wrapper
│   │   ├── AnimatedTabs.tsx    # Tabs with sliding indicator
│   │   ├── Badge.tsx           # Badge variants
│   │   ├── Button.tsx          # Button with 4 variants
│   │   ├── IconButton.tsx      # Icon-only button
│   │   ├── List.tsx            # List with item components
│   │   ├── Modal.tsx           # Basic modal
│   │   ├── Panel.tsx           # Card/container component
│   │   ├── ProgressBar.tsx     # Progress indicators
│   │   ├── ResourceDisplay.tsx # Resource with icon
│   │   ├── ShopPanel.tsx       # Shop item cards (3 variants)
│   │   ├── Tabs.tsx            # Tab navigation
│   │   └── Toggle.tsx          # Toggle switch
│   │
│   ├── layout/                 # Layout components (3)
│   │   ├── AppShell.tsx        # Main app wrapper with providers
│   │   ├── Header.tsx          # App header with resources
│   │   └── PageLayout.tsx      # Page wrapper with back button
│   │
│   ├── shared/                 # Shared components (2)
│   │   ├── BottomNavigation.tsx # Dynamic bottom nav bar
│   │   └── NavButton.tsx       # Navigation tab button
│   │
│   ├── menus/                  # Main menu screens (13)
│   │   ├── MainMenu.tsx        # Home screen with events
│   │   ├── LevelRoadmap.tsx    # Level progression view
│   │   ├── ShopPage.tsx        # In-app purchases
│   │   ├── SettingsPage.tsx    # App settings
│   │   ├── TeamPage.tsx        # Team management
│   │   ├── LeaderboardPage.tsx # Rankings
│   │   ├── InboxPage.tsx       # Messages
│   │   ├── DailyRewardsPage.tsx # Daily calendar
│   │   ├── ProfilePage.tsx     # Player profile
│   │   ├── FriendsPage.tsx     # Friends list
│   │   ├── BoostersPage.tsx    # Booster inventory
│   │   ├── AreaTasksPage.tsx   # Area objectives
│   │   └── GameplayPage.tsx    # Match-3 game board
│   │
│   ├── liveops/                # LiveOps event pages (10)
│   │   ├── RoyalPassPage.tsx   # Season pass
│   │   ├── SkyRacePage.tsx     # Race event
│   │   ├── KingsCupPage.tsx    # Tournament
│   │   ├── TeamChestPage.tsx   # Team rewards
│   │   ├── BookOfTreasurePage.tsx # Chapter objectives
│   │   ├── LightningRushPage.tsx # Timed challenges
│   │   ├── LavaQuestPage.tsx   # Progressive milestones
│   │   ├── MissionControlPage.tsx # Multi-objective
│   │   ├── AlbumPage.tsx       # Card album
│   │   └── CollectionPage.tsx  # Card collection
│   │
│   ├── modals/                 # Modal dialogs (22)
│   │   ├── ModalManager.tsx    # Modal orchestration with animations
│   │   ├── LevelStartModal.tsx # Pre-level modal
│   │   ├── LevelCompleteModal.tsx # Win modal
│   │   ├── LevelFailedModal.tsx # Lose modal
│   │   ├── OutOfLivesModal.tsx # No lives modal
│   │   ├── FreeLivesModal.tsx  # Free lives options
│   │   ├── RewardClaimModal.tsx # Reward collection
│   │   ├── BoosterSelectModal.tsx # Booster selection
│   │   ├── ProfileModal.tsx    # Profile overview
│   │   ├── ProfilePictureModal.tsx # Avatar selection
│   │   ├── EditAvatarModal.tsx # Avatar editing
│   │   ├── StarInfoModal.tsx   # Star information
│   │   ├── SignInModal.tsx     # Sign in options
│   │   ├── ParentalControlModal.tsx # Parental settings
│   │   ├── PrivacyPolicyModal.tsx # Privacy policy
│   │   ├── ChangeUsernameModal.tsx # Username change
│   │   ├── CardStarsModal.tsx  # Card star levels
│   │   ├── CollectionInfoModal.tsx # Collection info
│   │   ├── GrandPrizeModal.tsx # Grand prize display
│   │   ├── CollectionSetDetailModal.tsx # Set details
│   │   ├── CardDetailModal.tsx # Card details
│   │   ├── TeamInfoModal.tsx   # Team information
│   │   ├── MemberProfileModal.tsx # Team member profile
│   │   └── WeeklyContestInfoModal.tsx # Contest info
│   │
│   └── admin/                  # Admin panel components (4)
│       ├── AdminPage.tsx       # Admin dashboard
│       ├── TabManager.tsx      # Navigation tab configuration
│       ├── EventManager.tsx    # LiveOps event toggles
│       └── ThemeEditor.tsx     # Color customization
│
├── hooks/                      # Custom React hooks (3)
│   ├── useSwipeNavigation.ts   # Touch swipe detection
│   ├── useGsapAnimation.ts     # GSAP animation helpers
│   └── useTimer.ts             # Countdown timer
│
├── store/                      # State management (3 contexts)
│   ├── GameContext.tsx         # Game state & player data
│   ├── NavigationContext.tsx   # Navigation & modal stack
│   └── AdminContext.tsx        # Admin config & localStorage
│
├── types/                      # TypeScript definitions
│   ├── game.ts                 # Game entities & player state
│   └── navigation.ts           # Page IDs & modal types
│
├── config/                     # Configuration
│   ├── initialData.ts          # Mock game data
│   ├── adminDefaults.ts        # Default admin settings
│   └── themePresets.ts         # 7 theme presets
│
├── tokens/                     # Design tokens
│   ├── colors.ts               # Color token definitions
│   ├── spacing.ts              # Spacing scale
│   └── typography.ts           # Typography scale
│
├── features/                   # Feature modules
│   ├── currencies/             # Currency types & config
│   └── liveops/                # LiveOps types & config
│
├── stories/                    # Storybook stories
│   ├── base/                   # Base component stories
│   └── composed/               # Composed component stories
│
└── .storybook/                 # Storybook configuration
    ├── main.ts                 # Storybook config
    └── preview.ts              # Preview decorators
```

### State Management

```
┌──────────────────────────────────────────────────────────────────────┐
│                            AppShell                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐  │
│  │ AdminProvider  │  │  GameProvider  │  │  NavigationProvider    │  │
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────────────┐ │  │
│  │ │ Tab Config │ │  │ │ Player     │ │  │ │ Current Page       │ │  │
│  │ │ Events     │ │  │ │ Resources  │ │  │ │ Modal Stack        │ │  │
│  │ │ Theme      │ │  │ │ Progress   │ │  │ │ Navigation History │ │  │
│  │ │ Presets    │ │  │ │ Areas      │ │  │ │ Page Parameters    │ │  │
│  │ │ localStorage│ │  │ │ Events     │ │  │ │ canGoBack          │ │  │
│  │ └────────────┘ │  │ └────────────┘ │  │ └────────────────────┘ │  │
│  └────────────────┘  └────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Base Components

Atomic, reusable building blocks with minimal dependencies.

| Component | Description |
|-----------|-------------|
| `Avatar` | User avatar with initials fallback and online indicator |
| `Badge` | Labels and notification dots with variants |
| `Button` | Solid/outline variants with 3 sizes |
| `Card` | Container with padding options and click support |
| `IconBox` | Icon containers with 5 sizes and 3 shapes |
| `Modal` | Base modal with Header, Body, Footer sub-components |
| `ProgressBar` | Animated progress with 3 sizes and optional label |
| `Timer` | Countdown with default, compact, and badge variants |
| `Toggle` | Accessible on/off switch |

### Composed Components

Higher-level components built from base components.

| Component | Description |
|-----------|-------------|
| `EventCard` | LiveOps event button with countdown timer |
| `InfoBox` | Informational box with icon and text |
| `ListRow` | Generic row for leaderboards/members |
| `MilestoneItem` | Achievement item with claim button |
| `PageHeader` | Standardized header with back/close buttons |
| `ProgressCard` | Card with embedded progress bar |
| `RankBadge` | Position badge (gold #1, silver #2, bronze #3) |
| `ResourceCounter` | Coins/lives/stars display with add button |

### Usage

```tsx
// Base components
import { Button, Card, Badge, Avatar, Timer, ProgressBar, Toggle, Modal, IconBox } from '@/components/base';

// Composed components
import { PageHeader, EventCard, ResourceCounter, RankBadge, ProgressCard, MilestoneItem, ListRow, InfoBox } from '@/components/composed';
```

---

## Documentation

### Navigation System

```typescript
import { useNavigation } from '@/store';

// Navigate to a page
const { navigate } = useNavigation();
navigate('shop');
navigate('team', { tab: 'members' });

// Open/close modals
const { openModal, closeModal, modalStack } = useNavigation();
openModal('profile');
openModal('level-start', { level: 47 });
closeModal();

// Navigation history
const { goBack, canGoBack } = useNavigation();
if (canGoBack) goBack();
```

### Admin Panel

Access via **Settings > Admin Panel** to configure:

```typescript
import { useAdmin } from '@/store';

// Tab configuration
const { enabledTabs, toggleTab, reorderTabs } = useAdmin();
toggleTab('shop', true);

// Event management
const { config, toggleEvent } = useAdmin();
toggleEvent('royal-pass', false);

// Theme customization
const { setThemePreset, currentPreset } = useAdmin();
setThemePreset('purple');

// Main menu mode
const { toggleAreaButton } = useAdmin();
toggleAreaButton(true); // Castle view
toggleAreaButton(false); // Level roadmap

// Reset to defaults
const { resetToDefaults } = useAdmin();
resetToDefaults();
```

### Animation System

The app uses GSAP for all animations:

- **Page Transitions** - Slide animations between main tabs
- **Modal Animations** - Slide down/up with backdrop fade
- **Swipe Gestures** - Content follows finger with spring physics
- **Tab Indicators** - Smooth sliding between tabs

```typescript
import { useSwipeNavigation } from '@/hooks';

const { containerRef, contentRef } = useSwipeNavigation(
  currentPage,
  navigate,
  { threshold: 80 }
);
```

### Adding New Pages

1. **Create the component:**
```typescript
// src/components/menus/NewPage.tsx
export function NewPage() {
  const { navigate } = useNavigation();
  return <div>...</div>;
}
```

2. **Register the page ID:**
```typescript
// src/types/navigation.ts
export type PageId = 'main-menu' | 'shop' | 'new-page' | ...;
```

3. **Add to AppShell:**
```typescript
// src/components/layout/AppShell.tsx
const pageComponents: Record<PageId, React.ComponentType> = {
  'new-page': NewPage,
  ...
};
```

### Adding New Modals

1. **Create the modal:**
```typescript
// src/components/modals/NewModal.tsx
interface NewModalProps {
  onAnimatedClose?: () => void;
}

export function NewModal({ onAnimatedClose }: NewModalProps) {
  const { closeModal } = useNavigation();
  const handleClose = () => {
    onAnimatedClose ? onAnimatedClose() : closeModal();
  };
  return <div className="w-[320px] bg-secondary rounded-2xl">...</div>;
}
```

2. **Register in ModalManager:**
```typescript
// src/components/modals/ModalManager.tsx
const modalComponents = {
  'new-modal': NewModal,
  ...
};
```

3. **Add modal type:**
```typescript
// src/types/navigation.ts
export type ModalId = 'level-start' | 'new-modal' | ...;
```

---

## Design System

### Theme Presets

| Preset | Brand Color | Description |
|--------|-------------|-------------|
| `grayscale` | Gray (#374151) | Default wireframe style |
| `purple` | Purple (#6366F1) | Royal purple accent |
| `blue` | Blue (#3B82F6) | Ocean blue accent |
| `green` | Green (#059669) | Forest green accent |
| `orange` | Orange (#EA580C) | Sunset orange accent |
| `pink` | Pink (#EC4899) | Rose pink accent |
| `teal` | Teal (#14B8A6) | Teal accent |

### Color Tokens

```tsx
// Backgrounds
<div className="bg-bg-page" />    // Page background
<div className="bg-bg-card" />    // Card backgrounds
<div className="bg-bg-muted" />   // Muted backgrounds
<div className="bg-bg-inverse" /> // Dark backgrounds

// Text
<p className="text-text-primary" />   // Main text
<p className="text-text-secondary" /> // Secondary text
<p className="text-text-muted" />     // Muted text
<p className="text-text-inverse" />   // Text on dark

// Brand
<button className="bg-brand-primary hover:bg-brand-hover" />
<div className="bg-brand-muted" />

// Status
<span className="text-status-success" /> // Green
<span className="text-status-warning" /> // Amber
<span className="text-status-error" />   // Red

// Special
<div className="bg-gold" />          // Premium/rewards
<div className="border-border" />    // Borders
```

### Typography

| Class | Size | Usage |
|-------|------|-------|
| `text-h1` | 28px | Large headlines |
| `text-h2` | 22px | Page titles |
| `text-h3` | 18px | Section headers |
| `text-h4` | 16px | Card titles |
| `text-body` | 14px | Body text |
| `text-body-sm` | 13px | Smaller body |
| `text-label` | 12px | Labels |
| `text-caption` | 11px | Captions |
| `text-value` | 13px | Values (bold) |
| `text-button` | 14px | Button text (bold) |

---

## Storybook

The project includes comprehensive Storybook documentation for all base and composed components.

```bash
# Start Storybook
npm run storybook

# Build static Storybook
npm run build-storybook
```

### Features

- **Component Explorer** - Browse all components with live examples
- **Props Documentation** - Interactive prop controls
- **Accessibility Testing** - Built-in a11y addon
- **Visual Testing** - Chromatic integration ready
- **Documentation** - MDX documentation support

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Add proper types for props and state
- Use Tailwind CSS with semantic tokens
- Add Storybook stories for new components
- Keep components focused and reusable

---

## License

This project is for **educational and demonstration purposes only**. Puzzle Kit is an open-source UI/UX toolkit for puzzle games.

---

<div align="center">

**Built with care for the game development community**

[Back to Top](#puzzle-kit)

</div>
