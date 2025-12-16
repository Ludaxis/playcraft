'use client';

import React from 'react';
import { useGame } from '@/store';
import { useNavigation } from '@/store';
import { ResourceDisplay, IconButton } from '@/components/ui';

export function Header() {
  const { state } = useGame();
  const { navigate, openModal } = useNavigation();
  const { player, inbox } = state;

  const unreadMessages = inbox.filter((m) => !m.claimed).length;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-surface-light">
      {/* Left Section - Shop & Level */}
      <div className="flex items-center gap-3">
        <IconButton
          label="Shop"
          onClick={() => navigate('shop')}
          variant="default"
        >
          <CrownIcon />
        </IconButton>
        <div className="text-sm font-medium text-secondary">
          Lv. {player.currentLevel}
        </div>
      </div>

      {/* Center Section - Resources */}
      <div className="flex items-center gap-2">
        <ResourceDisplay
          icon={<CoinIcon />}
          value={player.coins.toLocaleString()}
          onClick={() => navigate('shop')}
          showAdd
        />
        <ResourceDisplay
          icon={<HeartIcon />}
          value={player.lives}
          onClick={() => openModal('out-of-lives')}
          showAdd={player.lives < player.maxLives}
        />
        <ResourceDisplay
          icon={<StarIcon />}
          value={player.stars}
        />
      </div>

      {/* Right Section - Settings & Inbox */}
      <div className="flex items-center gap-2">
        <IconButton
          label="Inbox"
          onClick={() => navigate('inbox')}
          variant="ghost"
          notification={unreadMessages}
        >
          <MailIcon />
        </IconButton>
        <IconButton
          label="Settings"
          onClick={() => navigate('settings')}
          variant="ghost"
        >
          <GearIcon />
        </IconButton>
      </div>
    </header>
  );
}

// Minimal icons as React components
function CrownIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function CoinIcon() {
  return <span className="font-bold text-secondary">$</span>;
}

function HeartIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6L12 13L2 6" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" />
    </svg>
  );
}
