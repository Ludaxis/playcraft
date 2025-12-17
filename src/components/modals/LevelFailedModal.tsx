'use client';

import React from 'react';
import { Modal, Button, Panel } from '@/components/ui';
import { useNavigation, useGame } from '@/store';

export function LevelFailedModal() {
  const { closeModal, navigate } = useNavigation();
  const { state } = useGame();
  const { player } = state;

  const handleRetry = () => {
    closeModal();
  };

  const handleQuit = () => {
    closeModal();
    navigate('main-menu');
  };

  return (
    <Modal isOpen onClose={handleQuit} size="sm">
      <div className="text-center">
        {/* Failed Icon */}
        <div className="w-20 h-20 bg-bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
          <XIcon />
        </div>

        <h2 className="text-h2 text-text-primary mb-2">Level Failed</h2>
        <p className="text-sm text-text-secondary mb-4">
          You ran out of moves!
        </p>

        {/* Lives Display */}
        <Panel variant="outlined" className="mb-4">
          <p className="text-sm text-text-secondary mb-2">Lives Remaining</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: player.maxLives }).map((_, i) => (
              <HeartIcon
                key={i}
                filled={i < player.lives}
              />
            ))}
          </div>
        </Panel>

        {/* Extra Moves Offer */}
        <Panel variant="elevated" className="mb-4">
          <p className="text-sm font-medium text-text-primary mb-1">Need More Moves?</p>
          <p className="text-xs text-text-secondary mb-2">
            Continue with 5 extra moves
          </p>
          <Button variant="primary" fullWidth>
            900 Coins
          </Button>
        </Panel>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={handleQuit}>
            Quit
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleRetry}
            disabled={player.lives <= 0}
          >
            Retry
          </Button>
        </div>
      </div>
    </Modal>
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
