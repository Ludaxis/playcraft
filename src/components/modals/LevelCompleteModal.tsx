'use client';

import React from 'react';
import { Modal, Button, Panel } from '@/components/ui';
import { useNavigation, useGame } from '@/store';

export function LevelCompleteModal() {
  const { closeModal, navigate } = useNavigation();
  const { state } = useGame();
  const { player } = state;

  const handleContinue = () => {
    closeModal();
    navigate('main-menu');
  };

  return (
    <Modal isOpen onClose={handleContinue} size="sm">
      <div className="text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <StarIcon />
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">Level Complete!</h2>
        <p className="text-sm text-slate-600 mb-4">
          You earned 1 star
        </p>

        {/* Stars Display */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                star <= 3 ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <StarIcon className={star <= 3 ? 'text-white' : 'text-slate-400'} />
            </div>
          ))}
        </div>

        {/* Rewards */}
        <Panel variant="outlined" className="mb-4">
          <p className="text-sm text-slate-600 mb-2">Rewards</p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-slate-200 rounded mx-auto mb-1" />
              <span className="text-sm font-bold text-slate-800">+50</span>
              <p className="text-xs text-slate-600">Coins</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-slate-200 rounded mx-auto mb-1" />
              <span className="text-sm font-bold text-slate-800">+1</span>
              <p className="text-xs text-slate-600">Star</p>
            </div>
          </div>
        </Panel>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="primary" fullWidth onClick={handleContinue}>
            Continue
          </Button>
          <Button variant="secondary" fullWidth onClick={handleContinue}>
            Share
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function StarIcon({ className = 'text-white' }: { className?: string }) {
  return (
    <svg className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
    </svg>
  );
}
