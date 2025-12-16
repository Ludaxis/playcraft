'use client';

import React from 'react';
import { Modal, Button, Panel } from '@/components/ui';
import { useNavigation } from '@/store';

export function RewardClaimModal() {
  const { closeModal } = useNavigation();

  return (
    <Modal isOpen onClose={closeModal} size="sm">
      <div className="text-center">
        {/* Reward Icon */}
        <div className="w-24 h-24 bg-surface-light rounded-lg mx-auto mb-4 flex items-center justify-center">
          <GiftIcon />
        </div>

        <h2 className="text-xl font-bold text-primary mb-2">Reward!</h2>
        <p className="text-sm text-secondary mb-4">
          You received a reward
        </p>

        {/* Reward Content */}
        <Panel variant="elevated" className="mb-4">
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-surface-light rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="font-bold text-secondary">$</span>
              </div>
              <p className="text-lg font-bold text-primary">+500</p>
              <p className="text-xs text-secondary">Coins</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-surface-light rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="font-bold text-secondary">B</span>
              </div>
              <p className="text-lg font-bold text-primary">+2</p>
              <p className="text-xs text-secondary">Boosters</p>
            </div>
          </div>
        </Panel>

        <Button variant="primary" size="lg" fullWidth onClick={closeModal}>
          Collect
        </Button>
      </div>
    </Modal>
  );
}

function GiftIcon() {
  return (
    <svg className="w-12 h-12 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8V21" />
      <path d="M3 12H21" />
      <path d="M12 8C12 8 12 4 8 4C6 4 4 5 4 7C4 8 5 8 5 8" />
      <path d="M12 8C12 8 12 4 16 4C18 4 20 5 20 7C20 8 19 8 19 8" />
    </svg>
  );
}
