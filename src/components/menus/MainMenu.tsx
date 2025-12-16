'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation, useAdmin } from '@/store';
import { ProgressBar } from '@/components/ui';
import { BottomNavigation } from '@/components/shared';
import { useTimer } from '@/hooks';

export function MainMenu() {
  const { state } = useGame();
  const { navigate, openModal } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const { player, areas, events } = state;

  const currentArea = areas.find((a) => a.id === player.currentArea);
  const completedTasks = currentArea?.tasks.filter((t) => t.completed).length || 0;
  const totalTasks = currentArea?.tasks.length || 0;

  // Get active events (filtered by admin config)
  const lavaQuest = isEventEnabled('lava-quest') ? events.find((e) => e.type === 'lava-quest') : null;

  return (
    <div className="relative flex flex-col h-full bg-surface-light overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-2 py-2 bg-primary">
        {/* Profile */}
        <button
          onClick={() => openModal('profile')}
          className="w-12 h-12 bg-secondary rounded-lg border-2 border-secondary-light flex items-center justify-center"
        >
          <span className="text-white text-xs">PRO</span>
        </button>

        {/* Resources */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <button
            onClick={() => navigate('shop')}
            className="flex items-center gap-1 bg-primary-light rounded-full px-2 py-1"
          >
            <div className="w-5 h-5 bg-surface-dark rounded-full flex items-center justify-center border border-surface">
              <span className="text-secondary text-[10px] font-bold">$</span>
            </div>
            <span className="text-white text-sm font-bold">{player.coins.toLocaleString()}</span>
            <div className="w-4 h-4 bg-secondary-light rounded-full flex items-center justify-center">
              <Image src="/icons/Add.svg" alt="Add" width={12} height={12} className="invert opacity-80" />
            </div>
          </button>

          {/* Lives */}
          <button
            onClick={() => openModal('free-lives')}
            className="flex items-center gap-1 bg-primary-light rounded-full px-2 py-1"
          >
            <div className="w-5 h-5 bg-secondary-light rounded-full flex items-center justify-center">
              <Image src="/icons/Heart-Filled.svg" alt="Lives" width={14} height={14} className="invert opacity-80" />
            </div>
            <span className="text-white text-sm font-bold">{player.lives}</span>
          </button>

          {/* Stars */}
          <button
            onClick={() => openModal('star-info')}
            className="flex items-center gap-1 bg-primary-light rounded-full px-2 py-1"
          >
            <div className="w-5 h-5 bg-secondary-light rounded-full flex items-center justify-center">
              <Image src="/icons/Star-Filled.svg" alt="Stars" width={14} height={14} className="invert opacity-80" />
            </div>
            <span className="text-white text-sm font-bold">{player.stars}</span>
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('settings')}
          className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
        >
          <Image src="/icons/Setting.svg" alt="Settings" width={20} height={20} className="invert opacity-80" />
        </button>
      </div>

      {/* Main Castle Area with LiveOps Buttons */}
      <div className="flex-1 relative">
        {/* Castle View - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-surface rounded-full flex items-center justify-center border-4 border-surface-dark">
            <div className="text-center">
              <div className="text-secondary-light text-sm">[Castle Area]</div>
              <div className="text-secondary text-xs mt-1">{currentArea?.name}</div>
            </div>
          </div>
        </div>

        {/* Left Side Events */}
        <div className="absolute left-1 top-8 flex flex-col gap-2">
          {lavaQuest && (
            <EventButton
              icon="LVQ"
              timer={lavaQuest.endTime}
              onClick={() => navigate('lava-quest')}
            />
          )}
        </div>

        {/* Bottom Buttons - Level & Area */}
        <div className="absolute bottom-4 left-0 right-0 px-3 flex justify-between items-end">
          {/* Level Button */}
          <button
            onClick={() => openModal('level-start')}
            className="bg-secondary-light border-2 border-surface-dark rounded-lg px-5 py-2 shadow-lg"
          >
            <div className="text-white text-base font-bold">Level {player.currentLevel}</div>
            <div className="text-surface text-[10px] text-center">Super Hard</div>
          </button>

          {/* Area Button */}
          <button
            onClick={() => navigate('area-tasks')}
            className="bg-surface-dark border-2 border-surface rounded-lg px-4 py-2 shadow-lg flex items-center gap-2"
          >
            <div>
              <div className="text-primary-light text-sm font-bold">Area {player.currentArea}</div>
              <div className="text-secondary text-[10px]">{completedTasks}/{totalTasks}</div>
            </div>
            <div className="w-7 h-7 bg-secondary-light rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">CH</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation activePage="home" />
    </div>
  );
}

// Event Button Component
interface EventButtonProps {
  icon: string;
  timer: Date | null;
  onClick: () => void;
}

function EventButton({ icon, timer, onClick }: EventButtonProps) {
  const timerData = useTimer(timer);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center"
    >
      <div className="w-14 h-14 bg-secondary-light rounded-full border-2 border-surface-dark shadow-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">{icon}</span>
      </div>
      <div className="bg-primary-light rounded-full px-2 py-0.5 -mt-2 z-10">
        <span className="text-white text-[10px] font-medium">
          {timerData.hours}h {timerData.minutes}m
        </span>
      </div>
    </button>
  );
}
