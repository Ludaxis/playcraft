'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation, useAdmin } from '@/store';
import { BottomNavigation } from '@/components/shared';
import { LevelRoadmap } from './LevelRoadmap';
import { useTimer } from '@/hooks';
import type { PageId } from '@/types';

// Event configuration with icons and colors
// All backgrounds are dark for good contrast with white text
const eventConfig: Record<string, { icon: string; bgColor: string; page: PageId }> = {
  'royal-pass': { icon: 'RP', bgColor: 'bg-gold', page: 'royal-pass' },
  'mission-control': { icon: 'MC', bgColor: 'bg-brand-hover', page: 'mission-control' },
  'lightning-rush': { icon: 'LR', bgColor: 'bg-gold', page: 'lightning-rush' },
  'lava-quest': { icon: 'LQ', bgColor: 'bg-bg-inverse', page: 'lava-quest' },
  'sky-race': { icon: 'SR', bgColor: 'bg-brand-hover', page: 'sky-race' },
  'kings-cup': { icon: 'KC', bgColor: 'bg-gold', page: 'kings-cup' },
  'team-chest': { icon: 'TC', bgColor: 'bg-brand-hover', page: 'team-chest' },
  'book-of-treasure': { icon: 'BT', bgColor: 'bg-gold', page: 'book-of-treasure' },
  'album': { icon: 'AL', bgColor: 'bg-brand-hover', page: 'album' },
  'collection': { icon: 'CO', bgColor: 'bg-brand-hover', page: 'collection' },
};

export function MainMenu() {
  const { state } = useGame();
  const { navigate, openModal } = useNavigation();
  const { config } = useAdmin();
  const { player, areas } = state;

  const currentArea = areas.find((a) => a.id === player.currentArea);
  const completedTasks = currentArea?.tasks.filter((t) => t.completed).length || 0;
  const totalTasks = currentArea?.tasks.length || 0;

  // Get events from placement config
  const leftEvents = config.eventPlacement?.left || [];
  const rightEvents = config.eventPlacement?.right || [];

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
            className="flex items-center gap-1 bg-brand-hover rounded-full px-2 py-1"
          >
            <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
              <span className="text-text-primary text-mini font-bold">$</span>
            </div>
            <span className="text-text-inverse text-value">{player.coins.toLocaleString()}</span>
            <div className="w-4 h-4 bg-status-success rounded-full flex items-center justify-center">
              <Image src="/icons/Add.svg" alt="Add" width={10} height={10} className="invert" />
            </div>
          </button>

          {/* Lives */}
          <button
            onClick={() => openModal('free-lives')}
            className="flex items-center gap-1 bg-brand-hover rounded-full px-2 py-1"
          >
            <Image src="/icons/Heart-Filled.svg" alt="Lives" width={18} height={18} className="text-status-error" style={{ filter: 'invert(27%) sepia(94%) saturate(5618%) hue-rotate(355deg) brightness(91%) contrast(128%)' }} />
            <span className="text-text-inverse text-value">{player.lives}</span>
          </button>

          {/* Stars */}
          <button
            onClick={() => openModal('star-info')}
            className="flex items-center gap-1 bg-brand-hover rounded-full px-2 py-1"
          >
            <Image src="/icons/Star-Filled.svg" alt="Stars" width={18} height={18} style={{ filter: 'invert(76%) sepia(53%) saturate(1285%) hue-rotate(358deg) brightness(103%) contrast(104%)' }} />
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
                className="bg-brand-hover border-2 border-brand-primary rounded-xl px-6 py-3 shadow-lg"
              >
                <div className="text-text-inverse text-h3">Level {player.currentLevel}</div>
                <div className="text-text-muted text-caption text-center">Super Hard</div>
              </button>

              {/* Area Button */}
              <button
                onClick={() => navigate('area-tasks')}
                className="bg-bg-card border-2 border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3"
              >
                <div>
                  <div className="text-text-primary text-value">Area {player.currentArea}</div>
                  <div className="text-text-secondary text-caption">{completedTasks}/{totalTasks}</div>
                </div>
                <div className="w-8 h-8 bg-brand-hover rounded-lg flex items-center justify-center">
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

function EventButton({ icon, timer, onClick, bgColor = 'bg-brand-muted' }: EventButtonProps) {
  const timerData = useTimer(timer);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center"
    >
      <div className={`w-14 h-14 ${bgColor} rounded-full border-2 border-border-strong shadow-lg flex items-center justify-center`}>
        <span className="text-text-inverse text-value-sm">{icon}</span>
      </div>
      <div className="bg-brand-hover rounded-full px-2 py-0.5 -mt-2 z-10">
        <span className="text-text-inverse text-mini">
          {timerData.days > 0 ? `${timerData.days}d ${timerData.hours}h` : `${timerData.hours}h ${timerData.minutes}m`}
        </span>
      </div>
    </button>
  );
}
