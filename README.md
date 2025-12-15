<div align="center">

# 👑 Royal Match Prototype

**A high-fidelity, interactive prototype of Royal Match's UI/UX**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.14-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

A modular, production-ready prototype replicating Royal Match's complete UI/UX experience. Built with modern web technologies, featuring smooth GSAP animations, swipe navigation, and a comprehensive component library. Perfect for game design reference, UI/UX studies, or as a foundation for similar projects.

### Why This Project?

- 🎮 **Complete Game UI** — All major screens and flows implemented
- 🎨 **Pixel-Perfect Design** — Faithful recreation of Royal Match aesthetics
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

### UI/UX Features

- **🔄 Swipe Navigation** — Swipe left/right between main tabs
- **✨ Page Transitions** — Smooth slide and fade animations
- **🎭 Modal System** — Animated modals with stack support
- **📱 Touch Optimized** — Native-feeling touch interactions
- **🎯 Tab Animations** — Sliding indicator on tab switches

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/royal-match-prototype.git
cd royal-match-prototype

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
│   └── NavigationContext.tsx # Navigation & modals
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
┌─────────────────────────────────────────────────────────┐
│                      AppShell                           │
│  ┌───────────────────┐  ┌───────────────────────────┐  │
│  │   GameProvider    │  │   NavigationProvider      │  │
│  │  ┌─────────────┐  │  │  ┌─────────────────────┐  │  │
│  │  │ Player      │  │  │  │ Current Page        │  │  │
│  │  │ Resources   │  │  │  │ Modal Stack         │  │  │
│  │  │ Progress    │  │  │  │ Navigation History  │  │  │
│  │  │ Events      │  │  │  │ Page Params         │  │  │
│  │  └─────────────┘  │  │  └─────────────────────┘  │  │
│  └───────────────────┘  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
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

The prototype uses a cohesive slate-based palette:

| Color | Tailwind | Usage |
|-------|----------|-------|
| ![#1e293b](https://via.placeholder.com/15/1e293b/1e293b.png) | `slate-800` | Headers, primary text |
| ![#334155](https://via.placeholder.com/15/334155/334155.png) | `slate-700` | Navigation, containers |
| ![#475569](https://via.placeholder.com/15/475569/475569.png) | `slate-600` | Secondary elements |
| ![#64748b](https://via.placeholder.com/15/64748b/64748b.png) | `slate-500` | Borders, dividers |
| ![#94a3b8](https://via.placeholder.com/15/94a3b8/94a3b8.png) | `slate-400` | Muted text, icons |
| ![#cbd5e1](https://via.placeholder.com/15/cbd5e1/cbd5e1.png) | `slate-300` | Backgrounds |
| ![#e2e8f0](https://via.placeholder.com/15/e2e8f0/e2e8f0.png) | `slate-200` | Light backgrounds |

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

This project is for **educational and demonstration purposes only**. Royal Match is a trademark of Dream Games. This prototype is not affiliated with or endorsed by Dream Games.

---

<div align="center">

**Built with ❤️ for the game development community**

[⬆ Back to Top](#-royal-match-prototype)

</div>
