# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Puzzle Kit is a high-fidelity, interactive prototype for puzzle game UI/UX. It serves as a reference implementation for mobile puzzle game interfaces with smooth animations, swipe navigation, and a comprehensive component library.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run storybook    # Launch Storybook on port 6006
npm run build-storybook  # Build static Storybook
```

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** with semantic design tokens
- **GSAP** for animations
- **Storybook 10** for component documentation

## Architecture

### Path Aliases

Use `@/*` for imports from `src/` directory (configured in tsconfig.json).

### State Management (React Context)

Three context providers wrap the app in `AppShell.tsx`:

1. **AdminContext** - Tab configuration, event toggles, theme settings (persisted to localStorage)
2. **GameContext** - Player data, resources, progress, areas
3. **NavigationContext** - Current page, modal stack, navigation history

Import hooks from `@/store`:
```typescript
import { useNavigation, useGame, useAdmin } from '@/store';
```

### Navigation System

Pages are identified by `PageId` type in `src/types/navigation.ts`. Navigation uses a single-page architecture with page components swapped based on state.

```typescript
const { navigate, goBack, canGoBack } = useNavigation();
navigate('shop');                           // Navigate to page
navigate('team', { tab: 'members' });       // Navigate with params
```

Modals use a stack system:
```typescript
const { openModal, closeModal, modalStack } = useNavigation();
openModal('level-start', { level: 47 });    // Open modal with params
```

### Component Organization

- `src/components/base/` - Atomic UI components (Avatar, Badge, Button, Card, Modal, etc.)
- `src/components/composed/` - Higher-level components built from base (EventCard, PageHeader, etc.)
- `src/components/ui/` - Legacy UI components (being migrated to base/composed)
- `src/components/menus/` - Main screen pages
- `src/components/liveops/` - LiveOps event pages
- `src/components/modals/` - Modal dialogs
- `src/components/admin/` - Admin panel components
- `src/components/layout/` - Layout wrappers (AppShell, Header, PageLayout)

### Adding New Pages

1. Create component in `src/components/menus/NewPage.tsx`
2. Add page ID to `PageId` type in `src/types/navigation.ts`
3. Register in `pageComponents` map in `src/components/layout/AppShell.tsx`

### Adding New Modals

1. Create component in `src/components/modals/NewModal.tsx` with `onAnimatedClose?: () => void` prop
2. Add modal ID to `ModalId` type in `src/types/navigation.ts`
3. Register in `modalComponents` map in `src/components/modals/ModalManager.tsx`

### Design Tokens

Tailwind uses semantic color tokens defined in `src/app/globals.css`:

- Backgrounds: `bg-bg-page`, `bg-bg-card`, `bg-bg-muted`, `bg-bg-inverse`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Brand: `bg-brand-primary`, `bg-brand-hover`, `bg-brand-muted`
- Status: `text-status-success`, `text-status-warning`, `text-status-error`

Typography classes: `text-h1` through `text-h4`, `text-body`, `text-body-sm`, `text-label`, `text-caption`

### Animation Patterns

GSAP is used for all animations. Key patterns:

- Page transitions: Slide animations between tabs
- Modal animations: Slide down/up with backdrop fade via `AnimatedModal`
- Swipe gestures: Use `useSwipeNavigation` hook for touch navigation

### Configuration

- `src/config/initialData.ts` - Mock game data
- `src/config/adminDefaults.ts` - Default admin settings
- `src/config/themePresets.ts` - 7 theme presets (grayscale, purple, blue, green, orange, pink, teal)
