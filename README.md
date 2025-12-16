<div align="center">

# 🧩 Puzzle Kit

**A high-fidelity, interactive prototype for puzzle game UI/UX**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.14-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

A modular, production-ready prototype for puzzle game UI/UX. Built with modern web technologies, featuring smooth GSAP animations, swipe navigation, and a comprehensive component library. Perfect for game design reference, UI/UX studies, or as a foundation for similar projects.

### Why This Project?

- 🎮 **Complete Game UI** — All major screens and flows implemented
- 🎨 **Pixel-Perfect Design** — Professional puzzle game aesthetics
- ⚡ **Smooth Animations** — GSAP-powered transitions and interactions
- 📱 **Mobile-First** — Touch gestures, swipe navigation, responsive design
- 🧩 **Modular Architecture** — Easy to extend, modify, or use as reference

---

## ✨ Features

### Core Screens

| Screen | Description |
|--------|-------------|
| 🏠 **Main Menu** | Castle view, resources, level indicator, LiveOps grid |
| 🛒 **Shop** | Premium cards, coin packs, special offers |
| ⚙️ **Settings** | Audio, notifications, account management |
| 👥 **Team** | Members, chat, leaderboard, team management |
| 🏆 **Leaderboard** | Global, friends, and team rankings with tabs |
| 📬 **Inbox** | Messages, rewards, notifications |
| 🎁 **Daily Rewards** | 7-day calendar with streak bonuses |
| 👤 **Profile** | Player stats, achievements, social links |
| 🃏 **Collection** | Card sets, albums, completion rewards |

### LiveOps Events

| Event | Type |
|-------|------|
| 👑 **Royal Pass** | Season pass with free/premium tracks |
| 🏃 **Sky Race** | Competitive milestone race |
| 🏅 **King's Cup** | Tournament leaderboard |
| 📦 **Team Chest** | Collaborative team rewards |
| 📚 **Book of Treasure** | Chapter-based objectives |
| ⚡ **Lightning Rush** | Time-limited challenges |
| 🌋 **Lava Quest** | Progressive milestones |
| 📖 **Album** | Card collection system |

### Admin Panel

| Feature | Description |
|---------|-------------|
| 🎛️ **Tab Manager** | Add, remove, and reorder bottom navigation tabs (max 5) |
| 🎮 **Event Manager** | Toggle LiveOps events on/off |
| 🎨 **Theme Editor** | Customize all colors with live preview |
| 💾 **Auto-Save** | All settings persist to localStorage |

### UI/UX Features

- **🔄 Swipe Navigation** — Swipe left/right between main tabs
- **✨ Page Transitions** — Smooth slide and fade animations
- **🎭 Modal System** — Animated modals with stack support
- **📱 Touch Optimized** — Native-feeling touch interactions
- **🎯 Tab Animations** — Sliding indicator on tab switches
- **⚙️ Dynamic Tabs** — Configure navigation tabs via Admin Panel

---

## 🚀 Quick Start

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

---

## 🏗 Architecture

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0 | React framework with App Router |
| **React** | 19.2 | UI library with latest features |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **GSAP** | 3.14 | Professional-grade animations |

### Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── globals.css           # Global styles & Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Entry point
│
├── components/
│   ├── ui/                   # Reusable UI components (14)
│   │   ├── Button.tsx        # Primary, secondary, ghost variants
│   │   ├── Modal.tsx         # Base modal with animations
│   │   ├── Panel.tsx         # Card/container component
│   │   ├── ProgressBar.tsx   # Animated progress indicators
│   │   ├── Tabs.tsx          # Tab navigation with indicators
│   │   ├── ShopPanel.tsx     # Shop item cards
│   │   └── ...
│   │
│   ├── layout/               # Layout components
│   │   ├── AppShell.tsx      # Main app wrapper with navigation
│   │   └── ...
│   │
│   ├── menus/                # Main menu screens (12)
│   │   ├── MainMenu.tsx      # Home screen
│   │   ├── ShopPage.tsx      # In-app purchases
│   │   ├── TeamPage.tsx      # Team management
│   │   └── ...
│   │
│   ├── liveops/              # LiveOps event pages (9)
│   │   ├── RoyalPassPage.tsx # Season pass
│   │   ├── SkyRacePage.tsx   # Race event
│   │   └── ...
│   │
│   ├── modals/               # Modal dialogs (20+)
│   │   ├── ModalManager.tsx  # Modal orchestration
│   │   ├── LevelStartModal.tsx
│   │   ├── ProfileModal.tsx
│   │   └── ...
│   │
│   ├── admin/                # Admin panel components
│   │   ├── AdminPage.tsx     # Admin dashboard
│   │   ├── TabManager.tsx    # Navigation tab configuration
│   │   ├── EventManager.tsx  # LiveOps event toggles
│   │   └── ThemeEditor.tsx   # Color customization
│   │
│   └── shared/               # Shared components
│       ├── BottomNavigation.tsx
│       └── NavButton.tsx
│
├── hooks/                    # Custom React hooks
│   ├── useSwipeNavigation.ts # Touch swipe detection
│   ├── useGsapAnimation.ts   # GSAP animation helpers
│   └── useTimer.ts           # Countdown timer
│
├── store/                    # State management (React Context)
│   ├── GameContext.tsx       # Game state & actions
│   ├── NavigationContext.tsx # Navigation & modals
│   └── AdminContext.tsx      # Admin config & localStorage
│
├── types/                    # TypeScript definitions
│   ├── game.ts               # Game entities & state
│   └── navigation.ts         # Routes & modal types
│
├── config/                   # Configuration
│   └── initialData.ts        # Mock game data
│
└── public/
    └── icons/                # 133 SVG icons
```

### State Management

```
┌───────────────────────────────────────────────────────────────────┐
│                           AppShell                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  AdminProvider  │  │  GameProvider   │  │ NavigationProvider│  │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐  │  │
│  │ │ Tabs Config │ │  │ │ Player      │ │  │ │ Current Page│  │  │
│  │ │ Events      │ │  │ │ Resources   │ │  │ │ Modal Stack │  │  │
│  │ │ Theme       │ │  │ │ Progress    │ │  │ │ Nav History │  │  │
│  │ │ localStorage│ │  │ │ Events      │ │  │ │ Page Params │  │  │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

### Navigation System

```typescript
// Navigate to a page
const { navigate } = useNavigation();
navigate('shop');
navigate('team', { tab: 'members' });

// Open a modal
const { openModal, closeModal } = useNavigation();
openModal('profile');
openModal('level-start', { level: 47 });
closeModal();
```

### Admin Panel

Access via **Settings → Admin Panel** to configure:

```typescript
// Tab configuration
const { enabledTabs, toggleTab, reorderTabs } = useAdmin();
toggleTab('shop', true);  // Enable shop tab

// Event toggles
const { isEventEnabled, toggleEvent } = useAdmin();
if (isEventEnabled('lava-quest')) { /* show event */ }
toggleEvent('royal-pass', false);  // Disable event

// Theme customization
const { updateTheme } = useAdmin();
updateTheme({ primary: '#ff0000', accent: '#00ff00' });
```

All settings are automatically saved to localStorage.

### Animation System

The app uses GSAP for all animations:

- **Page Transitions** — Slide animations between main tabs
- **Modal Animations** — Slide down/up with backdrop fade
- **Swipe Gestures** — Content follows finger with spring physics

```typescript
// Custom animation hook
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
  const handleClose = () => {
    onAnimatedClose ? onAnimatedClose() : closeModal();
  };
  return <div className="relative w-[320px]">...</div>;
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

---

## 🎨 Design System

### Color Palette

The prototype uses a semantic color system (Periwinkle Dream theme):

| Color | Variable | Usage |
|-------|----------|-------|
| ![#6b5bc7](https://via.placeholder.com/15/6b5bc7/6b5bc7.png) | `primary` | Headers, important elements |
| ![#8578d9](https://via.placeholder.com/15/8578d9/8578d9.png) | `secondary` | Navigation, containers |
| ![#9381ff](https://via.placeholder.com/15/9381ff/9381ff.png) | `accent` | Highlights, CTAs |
| ![#d4d4ff](https://via.placeholder.com/15/d4d4ff/d4d4ff.png) | `surface` | Backgrounds |
| ![#ffd966](https://via.placeholder.com/15/ffd966/ffd966.png) | `gold` | Premium, rewards |

All colors are customizable via the Admin Panel's Theme Editor.

### Component Variants

```typescript
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Panel variants
<Panel variant="default">Default card</Panel>
<Panel variant="outlined">Outlined card</Panel>
<Panel variant="elevated">Elevated card</Panel>
```

---

## 🤝 Contributing

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
- Use Tailwind CSS for styling
- Keep components focused and reusable

---

## 📄 License

This project is for **educational and demonstration purposes only**. Puzzle Kit is an open-source UI/UX toolkit for puzzle games.

---

<div align="center">

**Built with ❤️ for the game development community**

[⬆ Back to Top](#-puzzle-kit)

</div>
