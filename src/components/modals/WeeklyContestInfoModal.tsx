'use client';

import React from 'react';
import { useNavigation } from '@/store';

interface WeeklyContestInfoModalProps {
  onAnimatedClose?: () => void;
}

export function WeeklyContestInfoModal({ onAnimatedClose }: WeeklyContestInfoModalProps) {
  const { closeModal } = useNavigation();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-8 cursor-pointer"
      onClick={handleClose}
    >
      {/* Title */}
      <h1 className="text-text-inverse text-h1 mb-12">Weekly Contest</h1>

      {/* Step 1 */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-border-strong rounded-xl border-2 border-border flex items-center justify-center mb-2">
          <span className="text-text-secondary text-value-sm">GAME</span>
        </div>
        <p className="text-text-inverse font-bold">Beat Levels!</p>
      </div>

      <div className="text-border-strong text-h2 mb-4">↓</div>

      {/* Step 2 */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-end gap-2 mb-2">
          <div className="w-16 h-16 bg-border-strong rounded-lg flex items-center justify-center">
            <span className="text-text-secondary text-value-sm">2nd</span>
          </div>
          <div className="w-20 h-20 bg-bg-muted rounded-lg flex items-center justify-center">
            <span className="text-text-secondary text-value">1st</span>
          </div>
          <div className="w-16 h-16 bg-brand-muted rounded-lg flex items-center justify-center">
            <span className="text-text-muted text-value-sm">3rd</span>
          </div>
        </div>
        <p className="text-text-inverse font-bold">Take the Lead!</p>
      </div>

      <div className="text-border-strong text-h2 mb-4">↓</div>

      {/* Step 3 */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-20 bg-border-strong rounded-lg border-2 border-border flex items-center justify-center mb-2">
          <span className="text-text-secondary text-value-sm">CHEST</span>
        </div>
        <p className="text-text-inverse font-bold">Win Rewards!</p>
      </div>

      {/* Facebook Connect */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-brand-muted rounded-lg flex items-center justify-center">
          <span className="text-text-inverse font-bold">f</span>
        </div>
        <p className="text-text-muted text-caption">
          Connect with Facebook to compete<br />against your friends!
        </p>
      </div>

      {/* Tap to Continue */}
      <p className="text-text-muted text-h3">Tap to Continue</p>
    </div>
  );
}
