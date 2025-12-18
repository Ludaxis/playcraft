'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNavigation, useGame } from '@/store';

interface LevelStartModalProps {
  onAnimatedClose?: () => void;
}

export function LevelStartModal({ onAnimatedClose }: LevelStartModalProps) {
  const { closeModal, navigate } = useNavigation();
  const { state } = useGame();
  const { player, boosters } = state;
  const t = useTranslations('game');
  const tCommon = useTranslations('common');

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
    <div className="w-full max-w-[320px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
        {/* Header */}
        <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
          <h2 className="text-text-inverse text-h4">{t('level', { level: player.currentLevel })}</h2>
          <button
            onClick={handleClose}
            className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80 transition-colors"
          >
            <span className="text-text-primary text-value">X</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-border" />

        {/* Content */}
        <div className="p-3 bg-bg-card">
          {/* Difficulty Badge */}
          <div className="flex justify-center mb-2">
            <div className="bg-bg-muted rounded-full px-3 py-0.5 border border-border">
              <span className="text-text-secondary text-value-sm">{t('superHard')}</span>
            </div>
          </div>

          {/* Goals Panel */}
          <div className="bg-bg-muted rounded-lg border border-border p-2 mb-3">
            <p className="text-text-muted text-mini text-center mb-1.5">{t('goals')}</p>
            <div className="flex justify-center gap-3">
              <GoalItem icon="BLU" count={30} />
              <GoalItem icon="RED" count={25} />
              <GoalItem icon="GRN" count={20} />
            </div>
          </div>

          {/* Moves */}
          <div className="flex justify-center mb-3">
            <div className="bg-bg-muted rounded-lg border border-border px-5 py-1.5 text-center">
              <p className="text-text-secondary text-mini">{t('moves', { count: 25 })}</p>
              <p className="text-text-primary text-h3">25</p>
            </div>
          </div>

          {/* Boosters Section */}
          <p className="text-text-muted text-mini text-center mb-1.5">{t('selectBoosters')}</p>
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
            className="w-full bg-border-strong hover:bg-bg-muted border border-border rounded-lg py-3 text-text-primary font-bold text-caption transition-colors"
          >
            {tCommon('play')}
          </button>
        </div>
      </div>
  );
}

// Goal Item Component
function GoalItem({ icon, count }: { icon: string; count: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-9 h-9 bg-bg-page rounded border border-border flex items-center justify-center mb-0.5">
        <span className="text-text-secondary text-mini font-bold">{icon}</span>
      </div>
      <span className="text-text-primary text-value-sm">{count}</span>
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
          ? 'opacity-50 cursor-not-allowed border-border'
          : selected
          ? 'bg-bg-muted border-border'
          : 'bg-bg-page border-border hover:bg-bg-muted'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`absolute -top-1 -right-1 w-4 h-4 rounded border flex items-center justify-center ${
          selected ? 'bg-bg-muted border-border' : 'bg-bg-card border-border'
        }`}
      >
        {selected && <span className="text-text-primary text-mini font-bold">V</span>}
      </div>

      {/* Icon */}
      <div className="w-8 h-8 bg-bg-page rounded border border-border flex items-center justify-center mb-0.5">
        <span className="text-text-secondary text-mini font-bold">{abbreviation}</span>
      </div>

      {/* Count */}
      <span className="text-text-primary text-mini font-bold">{count}</span>
    </button>
  );
}
