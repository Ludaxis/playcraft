'use client';

import React from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { useNavigation, useGame, gameActions } from '@/store';

export function BoosterSelectModal() {
  const { closeModal } = useNavigation();
  const { state, dispatch } = useGame();
  const { boosters } = state;

  const inGameBoosters = boosters.filter((b) => b.type === 'in-game');

  const handleSelectBooster = (boosterId: string) => {
    const booster = boosters.find((b) => b.id === boosterId);
    if (booster && booster.count > 0) {
      dispatch(gameActions.useBooster(boosterId));
      closeModal();
    }
  };

  return (
    <Modal isOpen onClose={closeModal} title="Select Booster" size="sm">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {inGameBoosters.map((booster) => (
          <button
            key={booster.id}
            onClick={() => handleSelectBooster(booster.id)}
            disabled={booster.count === 0}
            className={`
              p-3 rounded-lg text-center transition-colors border border-border
              ${booster.count > 0
                ? 'bg-bg-card hover:bg-bg-muted'
                : 'bg-bg-page opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className="relative inline-block mb-2">
              <div className="w-12 h-12 bg-bg-muted rounded-lg border border-border" />
              <Badge
                variant={booster.count > 0 ? 'accent' : 'default'}
                className="absolute -top-1 -right-1"
              >
                {booster.count}
              </Badge>
            </div>
            <p className="text-caption font-medium text-text-primary">{booster.name}</p>
            <p className="text-mini text-text-secondary mt-1">{booster.description}</p>
          </button>
        ))}
      </div>

      <Button variant="ghost" fullWidth onClick={closeModal}>
        Cancel
      </Button>
    </Modal>
  );
}
