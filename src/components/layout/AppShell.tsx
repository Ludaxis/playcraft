'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { GameProvider, NavigationProvider, AdminProvider, useNavigation, useAdmin } from '@/store';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// Eager imports - frequently accessed pages
import { MainMenu } from '@/components/menus/MainMenu';
import { GameplayPage } from '@/components/menus/GameplayPage';

// Loading skeleton for lazy-loaded pages
import { PageSkeleton } from '@/components/shared';

// Modal manager
import { ModalManager } from '@/components/modals/ModalManager';

// Export button
import { ExportButton } from '@/components/shared';

import type { PageId } from '@/types';

// Lazy-loaded pages - code split for better initial load
const ShopPage = dynamic(() => import('@/components/menus/ShopPage').then(m => ({ default: m.ShopPage })), { loading: () => <PageSkeleton /> });
const SettingsPage = dynamic(() => import('@/components/menus/SettingsPage').then(m => ({ default: m.SettingsPage })), { loading: () => <PageSkeleton /> });
const TeamPage = dynamic(() => import('@/components/menus/TeamPage').then(m => ({ default: m.TeamPage })), { loading: () => <PageSkeleton /> });
const InboxPage = dynamic(() => import('@/components/menus/InboxPage').then(m => ({ default: m.InboxPage })), { loading: () => <PageSkeleton /> });
const LeaderboardPage = dynamic(() => import('@/components/menus/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })), { loading: () => <PageSkeleton /> });
const DailyRewardsPage = dynamic(() => import('@/components/menus/DailyRewardsPage').then(m => ({ default: m.DailyRewardsPage })), { loading: () => <PageSkeleton /> });
const ProfilePage = dynamic(() => import('@/components/menus/ProfilePage').then(m => ({ default: m.ProfilePage })), { loading: () => <PageSkeleton /> });
const FriendsPage = dynamic(() => import('@/components/menus/FriendsPage').then(m => ({ default: m.FriendsPage })), { loading: () => <PageSkeleton /> });
const BoostersPage = dynamic(() => import('@/components/menus/BoostersPage').then(m => ({ default: m.BoostersPage })), { loading: () => <PageSkeleton /> });
const AreaTasksPage = dynamic(() => import('@/components/menus/AreaTasksPage').then(m => ({ default: m.AreaTasksPage })), { loading: () => <PageSkeleton /> });
const AdminPage = dynamic(() => import('@/components/admin').then(m => ({ default: m.AdminPage })), { loading: () => <PageSkeleton /> });

// LiveOps pages (lazy-loaded)
const RoyalPassPage = dynamic(() => import('@/components/liveops/RoyalPassPage').then(m => ({ default: m.RoyalPassPage })), { loading: () => <PageSkeleton /> });
const SkyRacePage = dynamic(() => import('@/components/liveops/SkyRacePage').then(m => ({ default: m.SkyRacePage })), { loading: () => <PageSkeleton /> });
const KingsCupPage = dynamic(() => import('@/components/liveops/KingsCupPage').then(m => ({ default: m.KingsCupPage })), { loading: () => <PageSkeleton /> });
const TeamChestPage = dynamic(() => import('@/components/liveops/TeamChestPage').then(m => ({ default: m.TeamChestPage })), { loading: () => <PageSkeleton /> });
const BookOfTreasurePage = dynamic(() => import('@/components/liveops/BookOfTreasurePage').then(m => ({ default: m.BookOfTreasurePage })), { loading: () => <PageSkeleton /> });
const LightningRushPage = dynamic(() => import('@/components/liveops/LightningRushPage').then(m => ({ default: m.LightningRushPage })), { loading: () => <PageSkeleton /> });
const LavaQuestPage = dynamic(() => import('@/components/liveops/LavaQuestPage').then(m => ({ default: m.LavaQuestPage })), { loading: () => <PageSkeleton /> });
const MissionControlPage = dynamic(() => import('@/components/liveops/MissionControlPage').then(m => ({ default: m.MissionControlPage })), { loading: () => <PageSkeleton /> });
const AlbumPage = dynamic(() => import('@/components/liveops/AlbumPage').then(m => ({ default: m.AlbumPage })), { loading: () => <PageSkeleton /> });
const CollectionPage = dynamic(() => import('@/components/liveops/CollectionPage').then(m => ({ default: m.CollectionPage })), { loading: () => <PageSkeleton /> });
const WinningStreakPage = dynamic(() => import('@/components/liveops/WinningStreakPage').then(m => ({ default: m.WinningStreakPage })), { loading: () => <PageSkeleton /> });

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
