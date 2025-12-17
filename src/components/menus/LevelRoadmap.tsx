'use client';

import React, { useRef, useEffect } from 'react';
import { useGame, useNavigation } from '@/store';

export function LevelRoadmap() {
  const { state } = useGame();
  const { openModal } = useNavigation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentLevelRef = useRef<HTMLDivElement>(null);

  const { player } = state;
  const currentLevel = player.currentLevel;

  // Show levels 1-30 (level 1 at bottom near play button, level 30 at top)
  const maxLevel = 30;
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  // Scroll to current level on mount
  useEffect(() => {
    if (currentLevelRef.current && scrollRef.current) {
      currentLevelRef.current.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, [currentLevel]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Scrollable level track */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col-reverse items-center py-4 min-h-full">
          {levels.map((level) => {
            const isCurrentLevel = level === currentLevel;
            const isCompleted = level < currentLevel;
            const isLocked = level > currentLevel;
            const isFirst = level === 1;

            return (
              <div key={level} className="flex flex-col items-center">
                {/* Level circle */}
                <div
                  ref={isCurrentLevel ? currentLevelRef : null}
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    border-3 transition-all
                    ${isCurrentLevel
                      ? 'bg-bg-page border-border-strong scale-110'
                      : isCompleted
                        ? 'bg-bg-page border-border-strong'
                        : 'bg-bg-page border-border opacity-60'
                    }
                  `}
                >
                  <span className={`text-h3 ${isLocked ? 'text-text-muted' : 'text-text-primary'}`}>
                    {level}
                  </span>
                </div>

                {/* Connection line below the circle (except for level 1) */}
                {!isFirst && (
                  <div
                    className={`w-0.5 h-12 ${isCompleted ? 'bg-border-strong' : 'bg-border'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom section with play button */}
      <div className="flex flex-col items-center pb-4">
        <button
          onClick={() => openModal('level-start')}
          className="bg-bg-muted border-2 border-border-strong rounded-xl px-10 py-3"
        >
          <span className="text-text-primary text-h3">PLAY</span>
        </button>
      </div>
    </div>
  );
}
