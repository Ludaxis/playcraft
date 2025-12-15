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
      <h1 className="text-white text-2xl font-bold mb-12">Weekly Contest</h1>

      {/* Step 1 */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-slate-400 rounded-xl border-2 border-slate-300 flex items-center justify-center mb-2">
          <span className="text-slate-600 text-xs font-bold">GAME</span>
        </div>
        <p className="text-white font-bold">Beat Levels!</p>
      </div>

      <div className="text-slate-400 text-2xl mb-4">↓</div>

      {/* Step 2 */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-end gap-2 mb-2">
          <div className="w-16 h-16 bg-slate-400 rounded-lg flex items-center justify-center">
            <span className="text-slate-600 text-xs font-bold">2nd</span>
          </div>
          <div className="w-20 h-20 bg-slate-300 rounded-lg flex items-center justify-center">
            <span className="text-slate-600 text-sm font-bold">1st</span>
          </div>
          <div className="w-16 h-16 bg-slate-500 rounded-lg flex items-center justify-center">
            <span className="text-slate-300 text-xs font-bold">3rd</span>
          </div>
        </div>
        <p className="text-white font-bold">Take the Lead!</p>
      </div>

      <div className="text-slate-400 text-2xl mb-4">↓</div>

      {/* Step 3 */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-20 bg-slate-400 rounded-lg border-2 border-slate-300 flex items-center justify-center mb-2">
          <span className="text-slate-600 text-xs font-bold">CHEST</span>
        </div>
        <p className="text-white font-bold">Win Rewards!</p>
      </div>

      {/* Facebook Connect */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">f</span>
        </div>
        <p className="text-slate-300 text-sm">
          Connect with Facebook to compete<br />against your friends!
        </p>
      </div>

      {/* Tap to Continue */}
      <p className="text-slate-300 text-lg font-bold">Tap to Continue</p>
    </div>
  );
}
