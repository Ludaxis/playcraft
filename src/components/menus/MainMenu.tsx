'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation, useAdmin } from '@/store';
import { BottomNavigation } from '@/components/shared';
import { LevelRoadmap } from './LevelRoadmap';
import { useTimer } from '@/hooks';
import type { PageId } from '@/types';

// Event configuration with icons (wireframe - all grayscale)
const eventConfig: Record<string, { icon: string; bgColor: string; page: PageId }> = {
  'royal-pass': { icon: 'RP', bgColor: 'bg-bg-inverse', page: 'royal-pass' },
  'mission-control': { icon: 'MC', bgColor: 'bg-bg-inverse', page: 'mission-control' },
  'lightning-rush': { icon: 'LR', bgColor: 'bg-bg-inverse', page: 'lightning-rush' },
  'lava-quest': { icon: 'LQ', bgColor: 'bg-bg-inverse', page: 'lava-quest' },
  'sky-race': { icon: 'SR', bgColor: 'bg-bg-inverse', page: 'sky-race' },
  'kings-cup': { icon: 'KC', bgColor: 'bg-bg-inverse', page: 'kings-cup' },
  'team-chest': { icon: 'TC', bgColor: 'bg-bg-inverse', page: 'team-chest' },
  'book-of-treasure': { icon: 'BT', bgColor: 'bg-bg-inverse', page: 'book-of-treasure' },
  'album': { icon: 'AL', bgColor: 'bg-bg-inverse', page: 'album' },
  'collection': { icon: 'CO', bgColor: 'bg-bg-inverse', page: 'collection' },
};

// Mock winning streak data
const winningStreakData = {
  current: 117,
  target: 200,
  endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 1d 16h
};

export function MainMenu() {
  const { state } = useGame();
  const { navigate, openModal } = useNavigation();
  const { config, isEventEnabled } = useAdmin();
  const { player, areas } = state;

  const currentArea = areas.find((a) => a.id === player.currentArea);
  const completedTasks = currentArea?.tasks.filter((t) => t.completed).length || 0;
  const totalTasks = currentArea?.tasks.length || 0;

  // Get events from placement config (exclude winning-streak from side events)
  const leftEvents = (config.eventPlacement?.left || []).filter(id => id !== 'winning-streak');
  const rightEvents = (config.eventPlacement?.right || []).filter(id => id !== 'winning-streak');

  // Check if winning streak is enabled
  const showWinningStreak = isEventEnabled('winning-streak');

  // Mock end time for all events
  const getEventEndTime = () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000);

  return (
    <div className="relative flex flex-col h-full bg-bg-page overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-2 py-2 bg-bg-inverse">
        {/* Profile */}
        <button
          onClick={() => openModal('profile')}
          className="w-12 h-12 bg-bg-inverse rounded-lg border-2 border-brand-muted flex items-center justify-center"
        >
          <span className="text-text-inverse text-caption">PRO</span>
        </button>

        {/* Resources */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <button
            onClick={() => navigate('shop')}
            className="flex items-center gap-1 bg-bg-muted/30 rounded-full px-2 py-1 border border-border"
          >
            <div className="w-5 h-5 bg-bg-muted rounded-full flex items-center justify-center border border-border">
              <span className="text-text-primary text-mini font-bold">$</span>
            </div>
            <span className="text-text-inverse text-value">{player.coins.toLocaleString()}</span>
            <div className="w-4 h-4 bg-bg-muted rounded-full flex items-center justify-center">
              <span className="text-text-primary text-mini font-bold">+</span>
            </div>
          </button>

          {/* Lives */}
          <button
            onClick={() => openModal('free-lives')}
            className="flex items-center gap-1 bg-bg-muted/30 rounded-full px-2 py-1 border border-border"
          >
            <div className="w-5 h-5 bg-bg-muted rounded-full flex items-center justify-center border border-border">
              <span className="text-text-primary text-mini font-bold">♥</span>
            </div>
            <span className="text-text-inverse text-value">{player.lives}</span>
          </button>

          {/* Stars */}
          <button
            onClick={() => openModal('star-info')}
            className="flex items-center gap-1 bg-bg-muted/30 rounded-full px-2 py-1 border border-border"
          >
            <div className="w-5 h-5 bg-bg-muted rounded-full flex items-center justify-center border border-border">
              <span className="text-text-primary text-mini font-bold">★</span>
            </div>
            <span className="text-text-inverse text-value">{player.stars}</span>
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('settings')}
          className="w-10 h-10 bg-bg-inverse rounded-full flex items-center justify-center"
        >
          <Image src="/icons/Setting.svg" alt="Settings" width={20} height={20} className="invert opacity-80" />
        </button>
      </div>

      {/* Winning Streak Progress Bar */}
      {showWinningStreak && (
        <WinningStreakBar
          current={winningStreakData.current}
          target={winningStreakData.target}
          endTime={winningStreakData.endTime}
          onClick={() => navigate('winning-streak')}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
        {config.showAreaButton ? (
          /* Castle View Mode */
          <>
            {/* Castle View - Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-bg-muted rounded-full flex items-center justify-center border-4 border-border-strong">
                <div className="text-center">
                  <div className="text-text-muted text-body-sm">[Castle Area]</div>
                  <div className="text-text-secondary text-caption mt-1">{currentArea?.name}</div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons - Level & Area */}
            <div className="absolute bottom-4 left-0 right-0 px-3 flex items-end justify-between">
              {/* Level Button */}
              <button
                onClick={() => openModal('level-start')}
                className="bg-bg-inverse border-2 border-border rounded-lg px-6 py-3"
              >
                <div className="text-text-inverse text-h3">Level {player.currentLevel}</div>
                <div className="text-text-muted text-caption text-center">Super Hard</div>
              </button>

              {/* Area Button */}
              <button
                onClick={() => navigate('area-tasks')}
                className="bg-bg-card border-2 border-border rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <div>
                  <div className="text-text-primary text-value">Area {player.currentArea}</div>
                  <div className="text-text-secondary text-caption">{completedTasks}/{totalTasks}</div>
                </div>
                <div className="w-8 h-8 bg-bg-inverse rounded-lg flex items-center justify-center">
                  <span className="text-text-inverse text-caption">CH</span>
                </div>
              </button>
            </div>
          </>
        ) : (
          /* Level Roadmap Mode */
          <LevelRoadmap />
        )}

        {/* Left Side Events */}
        <div className="absolute left-1 top-8 flex flex-col gap-2 z-10">
          {leftEvents.map((eventId) => {
            const cfg = eventConfig[eventId];
            if (!cfg) return null;
            return (
              <EventButton
                key={eventId}
                icon={cfg.icon}
                timer={getEventEndTime()}
                onClick={() => navigate(cfg.page)}
                bgColor={cfg.bgColor}
              />
            );
          })}
        </div>

        {/* Right Side Events */}
        <div className="absolute right-1 top-8 flex flex-col gap-2 z-10">
          {rightEvents.map((eventId) => {
            const cfg = eventConfig[eventId];
            if (!cfg) return null;
            return (
              <EventButton
                key={eventId}
                icon={cfg.icon}
                timer={getEventEndTime()}
                onClick={() => navigate(cfg.page)}
                bgColor={cfg.bgColor}
              />
            );
          })}
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
  bgColor?: string;
}

function EventButton({ icon, timer, onClick, bgColor = 'bg-bg-inverse' }: EventButtonProps) {
  const timerData = useTimer(timer);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center"
    >
      <div className={`w-14 h-14 ${bgColor} rounded-full border-2 border-border flex items-center justify-center`}>
        <span className="text-text-inverse text-value-sm font-bold">{icon}</span>
      </div>
      <div className="bg-bg-inverse rounded-full px-2 py-0.5 -mt-2 z-10 border border-border">
        <span className="text-text-inverse text-mini">
          {timerData.days > 0 ? `${timerData.days}d ${timerData.hours}h` : `${timerData.hours}h ${timerData.minutes}m`}
        </span>
      </div>
    </button>
  );
}

// Winning Streak Progress Bar Component
interface WinningStreakBarProps {
  current: number;
  target: number;
  endTime: Date;
  onClick: () => void;
}

function WinningStreakBar({ current, target, endTime, onClick }: WinningStreakBarProps) {
  const timerData = useTimer(endTime);
  const progress = Math.min(100, (current / target) * 100);

  return (
    <button
      onClick={onClick}
      className="mx-2 mt-1 bg-bg-muted rounded-lg border border-border overflow-hidden"
    >
      {/* Progress Bar Section */}
      <div className="flex items-center gap-2 p-2">
        {/* Book/Streak Icon */}
        <div className="w-8 h-8 bg-bg-inverse rounded-lg flex items-center justify-center border border-border flex-shrink-0">
          <span className="text-text-inverse text-mini font-bold">WS</span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 h-5 bg-border rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-bg-inverse rounded-full flex items-center justify-center transition-all"
            style={{ width: `${Math.max(progress, 25)}%` }}
          >
            <span className="text-text-inverse text-mini font-bold">{current}/{target}</span>
          </div>
        </div>

        {/* Reward Gift Icon */}
        <div className="w-10 h-10 bg-bg-inverse rounded-lg flex items-center justify-center border border-border flex-shrink-0 relative">
          <span className="text-text-inverse text-mini font-bold">GFT</span>
          {/* x1 badge */}
          <div className="absolute -bottom-1 -right-1 bg-bg-muted rounded px-1 border border-border">
            <span className="text-text-secondary text-mini">x1</span>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="flex justify-center pb-2">
        <div className="flex items-center gap-1 bg-bg-card rounded-full px-3 py-0.5 border border-border">
          <div className="w-4 h-4 bg-border rounded-full flex items-center justify-center">
            <span className="text-text-muted text-mini">T</span>
          </div>
          <span className="text-text-primary text-value-sm">
            {timerData.days}d {timerData.hours}h
          </span>
        </div>
      </div>
    </button>
  );
}
