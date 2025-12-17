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
    <div className="w-[320px] bg-bg-inverse rounded-2xl border-2 border-brand-muted overflow-hidden">
        {/* Header */}
        <div className="bg-brand-hover py-2.5 px-3 flex items-center justify-center relative">
          <h2 className="text-text-inverse text-h4">Level {player.currentLevel}</h2>
          <button
            onClick={handleClose}
            className="absolute right-2 w-7 h-7 bg-status-error rounded-full flex items-center justify-center border border-error-light hover:bg-error-light transition-colors"
          >
            <span className="text-text-inverse text-value">X</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-brand-muted" />

        {/* Content */}
        <div className="p-3">
          {/* Difficulty Badge */}
          <div className="flex justify-center mb-2">
            <div className="bg-brand-muted rounded-full px-3 py-0.5">
              <span className="text-text-muted text-value-sm">Super Hard</span>
            </div>
          </div>

          {/* Goals Panel */}
          <div className="bg-brand-muted rounded-lg border border-border-strong p-2 mb-3">
            <p className="text-text-muted text-mini text-center mb-1.5">Goals</p>
            <div className="flex justify-center gap-3">
              <GoalItem icon="BLU" count={30} />
              <GoalItem icon="RED" count={25} />
              <GoalItem icon="GRN" count={20} />
            </div>
          </div>

          {/* Moves */}
          <div className="flex justify-center mb-3">
            <div className="bg-brand-muted rounded-lg border border-border-strong px-5 py-1.5 text-center">
              <p className="text-text-muted text-mini">Moves</p>
              <p className="text-text-inverse text-h3">25</p>
            </div>
          </div>

          {/* Boosters Section */}
          <p className="text-text-muted text-mini text-center mb-1.5">Select Boosters</p>
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
            className="w-full bg-border-strong hover:bg-bg-muted border-2 border-border rounded-lg py-3 text-text-primary font-bold text-sm transition-colors"
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
      <div className="w-9 h-9 bg-border-strong rounded flex items-center justify-center mb-0.5">
        <span className="text-text-secondary text-mini font-bold">{icon}</span>
      </div>
      <span className="text-text-inverse text-value-sm">{count}</span>
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
          ? 'opacity-50 cursor-not-allowed border-bg-inverse'
          : selected
          ? 'bg-border-strong border-border'
          : 'bg-brand-muted border-border-strong hover:bg-border-strong'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`absolute -top-1 -right-1 w-4 h-4 rounded border flex items-center justify-center ${
          selected ? 'bg-bg-muted border-bg-page' : 'bg-bg-inverse border-brand-muted'
        }`}
      >
        {selected && <span className="text-text-secondary text-mini font-bold">V</span>}
      </div>

      {/* Icon */}
      <div className="w-8 h-8 bg-border-strong rounded flex items-center justify-center mb-0.5">
        <span className="text-text-secondary text-mini font-bold">{abbreviation}</span>
      </div>

      {/* Count */}
      <span className="text-text-inverse text-mini font-bold">{count}</span>
    </button>
  );
}
