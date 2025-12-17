'use client';

import React from 'react';
import gsap from 'gsap';
import { GameProvider, NavigationProvider, AdminProvider, useNavigation, useAdmin } from '@/store';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// All page imports
import { MainMenu } from '@/components/menus/MainMenu';
import { ShopPage } from '@/components/menus/ShopPage';
import { SettingsPage } from '@/components/menus/SettingsPage';
import { TeamPage } from '@/components/menus/TeamPage';
import { InboxPage } from '@/components/menus/InboxPage';
import { LeaderboardPage } from '@/components/menus/LeaderboardPage';
import { DailyRewardsPage } from '@/components/menus/DailyRewardsPage';
import { ProfilePage } from '@/components/menus/ProfilePage';
import { FriendsPage } from '@/components/menus/FriendsPage';
import { BoostersPage } from '@/components/menus/BoostersPage';
import { AreaTasksPage } from '@/components/menus/AreaTasksPage';

// LiveOps pages
import { RoyalPassPage } from '@/components/liveops/RoyalPassPage';
import { SkyRacePage } from '@/components/liveops/SkyRacePage';
import { KingsCupPage } from '@/components/liveops/KingsCupPage';
import { TeamChestPage } from '@/components/liveops/TeamChestPage';
import { BookOfTreasurePage } from '@/components/liveops/BookOfTreasurePage';
import { LightningRushPage } from '@/components/liveops/LightningRushPage';
import { LavaQuestPage } from '@/components/liveops/LavaQuestPage';
import { MissionControlPage } from '@/components/liveops/MissionControlPage';
import { AlbumPage } from '@/components/liveops/AlbumPage';
import { CollectionPage } from '@/components/liveops/CollectionPage';
import { WinningStreakPage } from '@/components/liveops/WinningStreakPage';

// Gameplay
import { GameplayPage } from '@/components/menus/GameplayPage';

// Admin
import { AdminPage } from '@/components/admin';

// Modal manager
import { ModalManager } from '@/components/modals/ModalManager';

// Export button
import { ExportButton } from '@/components/shared';

import type { PageId } from '@/types';

const pageComponents: Record<PageId, React.ComponentType> = {
  'main-menu': MainMenu,
  shop: ShopPage,
  settings: SettingsPage,
  admin: AdminPage,
  team: TeamPage,
  inbox: InboxPage,
  leaderboard: LeaderboardPage,
  'daily-rewards': DailyRewardsPage,
  profile: ProfilePage,
  friends: FriendsPage,
  boosters: BoostersPage,
  'area-tasks': AreaTasksPage,
  'royal-pass': RoyalPassPage,
  'sky-race': SkyRacePage,
  'kings-cup': KingsCupPage,
  'team-chest': TeamChestPage,
  'book-of-treasure': BookOfTreasurePage,
  'lightning-rush': LightningRushPage,
  'lava-quest': LavaQuestPage,
  'mission-control': MissionControlPage,
  'winning-streak': WinningStreakPage,
  album: AlbumPage,
  collection: CollectionPage,
  gameplay: GameplayPage,
};

function PageRenderer() {
  const { state, navigate } = useNavigation();
  const { enabledTabs } = useAdmin();
  const PageComponent = pageComponents[state.currentPage];
  const contentRef = React.useRef<HTMLElement>(null);
  const prevPageRef = React.useRef<PageId>(state.currentPage);

  // Get dynamic NAV_TABS from admin config
  const NAV_TABS = enabledTabs.map(tab => tab.page);

  // Enable swipe navigation between main tabs
  const { containerRef, contentRef: swipeContentRef } = useSwipeNavigation(state.currentPage, navigate);

  // Animate page transitions when page changes
  React.useEffect(() => {
    if (prevPageRef.current === state.currentPage) return;
    if (!contentRef.current) return;

    const prevIndex = NAV_TABS.indexOf(prevPageRef.current);
    const currentIndex = NAV_TABS.indexOf(state.currentPage);

    // Both pages are main nav tabs - slide animation
    if (prevIndex !== -1 && currentIndex !== -1) {
      const direction = currentIndex > prevIndex ? 1 : -1; // 1 = from right, -1 = from left
      gsap.fromTo(
        contentRef.current,
        { x: direction * 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
    // Opening a full-screen panel (from nav tab to non-nav page) - fade in with slight scale
    else if (prevIndex !== -1 && currentIndex === -1) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
      );
    }
    // Closing a full-screen panel (from non-nav page back to nav tab) - fade in
    else if (prevIndex === -1 && currentIndex !== -1) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
    // Between two non-nav pages - simple fade
    else {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
    }

    prevPageRef.current = state.currentPage;
  }, [state.currentPage, NAV_TABS]);

  return (
    <div ref={containerRef} id="app-content" className="flex flex-col h-full bg-bg-page">
      <main ref={(el) => {
        contentRef.current = el;
        if (swipeContentRef) swipeContentRef.current = el;
      }} className="flex-1 overflow-hidden">
        <PageComponent />
      </main>
      <ModalManager />
      <ExportButton />
    </div>
  );
}

export function AppShell() {
  return (
    <AdminProvider>
      <GameProvider>
        <NavigationProvider>
          <PageRenderer />
        </NavigationProvider>
      </GameProvider>
    </AdminProvider>
  );
}
