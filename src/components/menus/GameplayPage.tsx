'use client';

import React, { useState } from 'react';
import { useGame, useNavigation, gameActions } from '@/store';
import { Button, Panel, ProgressBar, IconButton } from '@/components/ui';

export function GameplayPage() {
  const { state, dispatch } = useGame();
  const { navigate, openModal } = useNavigation();
  const { player, boosters } = state;

  const [moves, setMoves] = useState(25);
  const [score, setScore] = useState(0);
  const [objectives] = useState([
    { id: 'obj1', name: 'Red Gems', target: 30, current: 12 },
    { id: 'obj2', name: 'Blue Gems', target: 20, current: 8 },
  ]);

  const inGameBoosters = boosters.filter((b) => b.type === 'in-game');

  const handleWin = () => {
    dispatch(gameActions.completeLevel());
    dispatch(gameActions.updateCoins(50));
    openModal('level-complete');
  };

  const handleLose = () => {
    dispatch(gameActions.updateLives(-1));
    openModal('level-failed');
  };

  const handleUseBooster = (boosterId: string) => {
    const booster = boosters.find((b) => b.id === boosterId);
    if (booster && booster.count > 0) {
      dispatch(gameActions.useBooster(boosterId));
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-lighter">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-surface-light">
        <IconButton label="Pause" onClick={() => navigate('main-menu')} variant="ghost">
          <PauseIcon />
        </IconButton>

        <div className="flex items-center gap-4">
          {/* Moves */}
          <div className="text-center">
            <p className="text-xs text-secondary">Moves</p>
            <p className="text-lg font-bold text-primary">{moves}</p>
          </div>

          {/* Level */}
          <div className="text-center">
            <p className="text-xs text-secondary">Level</p>
            <p className="text-lg font-bold text-primary">{player.currentLevel}</p>
          </div>

          {/* Score */}
          <div className="text-center">
            <p className="text-xs text-secondary">Score</p>
            <p className="text-lg font-bold text-primary">{score}</p>
          </div>
        </div>

        <IconButton label="Settings" onClick={() => {}} variant="ghost">
          <GearIcon />
        </IconButton>
      </div>

      {/* Objectives */}
      <div className="flex gap-4 px-4 py-2 bg-surface-lightest border-b border-surface-light">
        {objectives.map((obj) => (
          <div key={obj.id} className="flex items-center gap-2">
            <div className="w-6 h-6 bg-surface rounded" />
            <span className="text-sm font-medium text-primary">
              {obj.current}/{obj.target}
            </span>
          </div>
        ))}
      </div>

      {/* Game Board Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Panel variant="elevated" className="w-full max-w-sm aspect-square flex items-center justify-center">
          <div className="text-center">
            <p className="text-secondary-light mb-4">[Match-3 Game Board]</p>
            <p className="text-xs text-surface-dark">
              Tap tiles to match 3 or more
            </p>

            {/* Simulation Buttons */}
            <div className="mt-8 flex gap-2 justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setMoves((m) => Math.max(0, m - 1));
                  setScore((s) => s + 100);
                }}
              >
                Make Move
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      {/* Bottom Boosters */}
      <div className="px-4 py-3 bg-white border-t border-surface-light">
        <div className="flex justify-center gap-4 mb-3">
          {inGameBoosters.map((booster) => (
            <button
              key={booster.id}
              onClick={() => handleUseBooster(booster.id)}
              disabled={booster.count === 0}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-colors
                ${booster.count > 0 ? 'bg-surface-lighter hover:bg-surface-light' : 'bg-surface-lightest opacity-50'}
              `}
            >
              <div className="w-10 h-10 bg-surface-light rounded-lg mb-1" />
              <span className="text-xs font-medium text-primary">{booster.count}</span>
            </button>
          ))}
        </div>

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button variant="primary" fullWidth onClick={handleWin}>
            Test Win
          </Button>
          <Button variant="secondary" fullWidth onClick={handleLose}>
            Test Lose
          </Button>
        </div>
      </div>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" />
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
