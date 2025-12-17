'use client';

import React from 'react';
import { useNavigation, useGame } from '@/store';

interface LevelFailedModalProps {
  onAnimatedClose?: () => void;
}

export function LevelFailedModal({ onAnimatedClose }: LevelFailedModalProps) {
  const { closeModal, navigate } = useNavigation();
  const { state } = useGame();
  const { player } = state;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleRetry = () => {
    handleClose();
  };

  const handleQuit = () => {
    handleClose();
    setTimeout(() => navigate('main-menu'), 200);
  };

  return (
    <div className="w-[320px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">Level Failed</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80 transition-colors"
        >
          <span className="text-text-primary text-value">X</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        {/* Failed Icon */}
        <div className="w-16 h-16 bg-bg-muted rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-border">
          <XIcon />
        </div>

        <p className="text-caption text-text-secondary mb-3">
          You ran out of moves!
        </p>

        {/* Lives Display */}
        <div className="bg-bg-muted rounded-lg border border-border p-3 mb-3">
          <p className="text-caption text-text-secondary mb-2">Lives Remaining</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: player.maxLives }).map((_, i) => (
              <HeartIcon
                key={i}
                filled={i < player.lives}
              />
            ))}
          </div>
        </div>

        {/* Extra Moves Offer */}
        <div className="bg-bg-card rounded-lg border-2 border-border p-3 mb-4">
          <p className="text-caption font-medium text-text-primary mb-1">Need More Moves?</p>
          <p className="text-mini text-text-secondary mb-2">
            Continue with 5 extra moves
          </p>
          <button className="w-full bg-bg-inverse hover:opacity-90 border border-border rounded-lg py-2 text-text-inverse font-bold text-caption transition-colors">
            900 Coins
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleQuit}
            className="flex-1 bg-bg-card hover:bg-bg-muted border border-border rounded-lg py-2.5 text-text-primary font-bold text-caption transition-colors"
          >
            Quit
          </button>
          <button
            onClick={handleRetry}
            disabled={player.lives <= 0}
            className="flex-1 bg-bg-inverse hover:opacity-90 border border-border rounded-lg py-2.5 text-text-inverse font-bold text-caption transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="w-10 h-10 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${filled ? 'text-text-primary' : 'text-bg-muted'}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
    </svg>
  );
}
