'use client';

import React, { useState } from 'react';
import { useNavigation, useGame } from '@/store';

interface LevelStartModalProps {
  onAnimatedClose?: () => void;
}

export function LevelStartModal({ onAnimatedClose }: LevelStartModalProps) {
  const { closeModal, navigate } = useNavigation();
  const { state } = useGame();
  const { player, boosters } = state;

  const preGameBoosters = boosters.filter((b) => b.type === 'pre-game');
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([]);

  const toggleBooster = (id: string) => {
    setSelectedBoosters((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handlePlay = () => {
    handleClose();
    setTimeout(() => navigate('gameplay'), 200);
  };

  return (
    <div className="w-[320px] bg-secondary rounded-2xl border-2 border-secondary-light overflow-hidden">
        {/* Header */}
        <div className="bg-primary-light py-2.5 px-3 flex items-center justify-center relative">
          <h2 className="text-white text-base font-bold">Level {player.currentLevel}</h2>
          <button
            onClick={handleClose}
            className="absolute right-2 w-7 h-7 bg-error rounded-full flex items-center justify-center border border-error-light hover:bg-error-light transition-colors"
          >
            <span className="text-white text-sm font-bold">X</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-secondary-light" />

        {/* Content */}
        <div className="p-3">
          {/* Difficulty Badge */}
          <div className="flex justify-center mb-2">
            <div className="bg-secondary-light rounded-full px-3 py-0.5">
              <span className="text-surface-light text-xs font-bold">Super Hard</span>
            </div>
          </div>

          {/* Goals Panel */}
          <div className="bg-secondary-light rounded-lg border border-surface-dark p-2 mb-3">
            <p className="text-surface text-[10px] text-center mb-1.5">Goals</p>
            <div className="flex justify-center gap-3">
              <GoalItem icon="BLU" count={30} />
              <GoalItem icon="RED" count={25} />
              <GoalItem icon="GRN" count={20} />
            </div>
          </div>

          {/* Moves */}
          <div className="flex justify-center mb-3">
            <div className="bg-secondary-light rounded-lg border border-surface-dark px-5 py-1.5 text-center">
              <p className="text-surface text-[10px]">Moves</p>
              <p className="text-white text-lg font-bold">25</p>
            </div>
          </div>

          {/* Boosters Section */}
          <p className="text-surface text-[10px] text-center mb-1.5">Select Boosters</p>
          <div className="flex justify-center gap-2 mb-3">
            {preGameBoosters.map((booster) => (
              <BoosterSelect
                key={booster.id}
                name={booster.name}
                count={booster.count}
                selected={selectedBoosters.includes(booster.id)}
                onToggle={() => toggleBooster(booster.id)}
                disabled={booster.count === 0}
              />
            ))}
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="w-full bg-surface-dark hover:bg-surface border-2 border-surface rounded-lg py-3 text-primary-light font-bold text-sm transition-colors"
          >
            Play
          </button>
        </div>
      </div>
  );
}

// Goal Item Component
function GoalItem({ icon, count }: { icon: string; count: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-9 h-9 bg-surface-dark rounded flex items-center justify-center mb-0.5">
        <span className="text-secondary text-[10px] font-bold">{icon}</span>
      </div>
      <span className="text-white text-xs font-bold">{count}</span>
    </div>
  );
}

// Booster Select Component
interface BoosterSelectProps {
  name: string;
  count: number;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

function BoosterSelect({ name, count, selected, onToggle, disabled }: BoosterSelectProps) {
  const abbreviation = name.slice(0, 3).toUpperCase();

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative flex flex-col items-center p-1.5 rounded-lg border transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-secondary'
          : selected
          ? 'bg-surface-dark border-surface'
          : 'bg-secondary-light border-surface-dark hover:bg-surface-dark'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`absolute -top-1 -right-1 w-4 h-4 rounded border flex items-center justify-center ${
          selected ? 'bg-surface border-surface-light' : 'bg-secondary border-secondary-light'
        }`}
      >
        {selected && <span className="text-secondary text-[8px] font-bold">V</span>}
      </div>

      {/* Icon */}
      <div className="w-8 h-8 bg-surface-dark rounded flex items-center justify-center mb-0.5">
        <span className="text-secondary text-[8px] font-bold">{abbreviation}</span>
      </div>

      {/* Count */}
      <span className="text-white text-[10px] font-bold">{count}</span>
    </button>
  );
}
