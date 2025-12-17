'use client';

import React from 'react';
import { useNavigation, useGame } from '@/store';

interface LevelCompleteModalProps {
  onAnimatedClose?: () => void;
}

export function LevelCompleteModal({ onAnimatedClose }: LevelCompleteModalProps) {
  const { closeModal, navigate } = useNavigation();
  const { state } = useGame();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleContinue = () => {
    handleClose();
    setTimeout(() => navigate('main-menu'), 200);
  };

  return (
    <div className="w-[320px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">Level Complete!</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80 transition-colors"
        >
          <span className="text-text-primary text-value">X</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-bg-muted rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-border">
          <StarIcon />
        </div>

        <p className="text-caption text-text-secondary mb-3">
          You earned 1 star
        </p>

        {/* Stars Display */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`w-10 h-10 rounded-full flex items-center justify-center border border-border ${
                star <= 3 ? 'bg-bg-muted' : 'bg-bg-page'
              }`}
            >
              <StarIcon className={star <= 3 ? 'text-text-primary' : 'text-text-muted'} />
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div className="bg-bg-muted rounded-lg border border-border p-3 mb-4">
          <p className="text-caption text-text-secondary mb-2">Rewards</p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-bg-card rounded mx-auto mb-1 border border-border flex items-center justify-center">
                <span className="text-text-secondary text-mini">$</span>
              </div>
              <span className="text-value text-text-primary">+50</span>
              <p className="text-mini text-text-secondary">Coins</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-bg-card rounded mx-auto mb-1 border border-border flex items-center justify-center">
                <span className="text-text-secondary text-mini">★</span>
              </div>
              <span className="text-value text-text-primary">+1</span>
              <p className="text-mini text-text-secondary">Star</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleContinue}
            className="w-full bg-bg-inverse hover:opacity-90 border border-border rounded-lg py-3 text-text-inverse font-bold text-caption transition-colors"
          >
            Continue
          </button>
          <button
            onClick={handleContinue}
            className="w-full bg-bg-card hover:bg-bg-muted border border-border rounded-lg py-2.5 text-text-primary font-bold text-caption transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className = 'text-text-primary' }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
    </svg>
  );
}
