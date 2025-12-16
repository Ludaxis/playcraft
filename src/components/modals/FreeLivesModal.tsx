'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useNavigation, useGame, gameActions } from '@/store';

interface LifeGift {
  id: string;
  senderName: string;
  claimed: boolean;
}

const initialGifts: LifeGift[] = [
  { id: '1', senderName: 'a mate', claimed: false },
  { id: '2', senderName: 'a mate', claimed: false },
  { id: '3', senderName: 'a mate', claimed: false },
  { id: '4', senderName: 'a mate', claimed: false },
  { id: '5', senderName: 'a mate', claimed: false },
];

interface FreeLivesModalProps {
  onAnimatedClose?: () => void;
}

export function FreeLivesModal({ onAnimatedClose }: FreeLivesModalProps) {
  const { closeModal } = useNavigation();
  const { dispatch } = useGame();
  const [gifts, setGifts] = useState<LifeGift[]>(initialGifts);

  const unclaimedCount = gifts.filter((g) => !g.claimed).length;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleAdd = (id: string) => {
    setGifts((prev) =>
      prev.map((g) => (g.id === id ? { ...g, claimed: true } : g))
    );
    dispatch(gameActions.updateLives(1));
  };

  return (
    <div className="w-[320px] bg-secondary-light rounded-2xl border-2 border-surface-dark overflow-hidden">
      {/* Header */}
      <div className="bg-secondary py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-white text-base font-bold">Free Lives</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-error rounded-full flex items-center justify-center border border-error-light hover:bg-error-light transition-colors"
        >
          <span className="text-white text-sm font-bold">X</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-surface-dark" />

      {/* Content */}
      <div className="bg-surface-light m-1.5 rounded-lg border border-surface p-2">
        {/* Total free lives counter */}
        <div className="bg-surface-lighter rounded px-3 py-1.5 mb-2 flex items-center justify-between border border-surface">
          <span className="text-secondary text-xs font-medium">Total free lives:</span>
          <div className="bg-surface rounded px-3 py-0.5">
            <span className="text-primary-light font-bold text-sm">{unclaimedCount}</span>
          </div>
        </div>

        {/* Life gifts list */}
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
          {gifts.map((gift) => (
            <LifeGiftRow
              key={gift.id}
              senderName={gift.senderName}
              claimed={gift.claimed}
              onAdd={() => handleAdd(gift.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LifeGiftRowProps {
  senderName: string;
  claimed: boolean;
  onAdd: () => void;
}

function LifeGiftRow({ senderName, claimed, onAdd }: LifeGiftRowProps) {
  return (
    <div className="bg-surface-lighter rounded-lg px-2 py-1.5 flex items-center gap-2 border border-surface">
      {/* Heart icon */}
      <div className="w-8 h-8 flex items-center justify-center">
        <Image
          src="/icons/Heart-Filled.svg"
          alt="Life"
          width={28}
          height={28}
          className={claimed ? 'opacity-30' : ''}
        />
      </div>

      {/* Sender info */}
      <div className="flex-1">
        <p className="text-primary-light text-xs font-bold">{senderName}</p>
        <p className="text-secondary-light text-[10px]">Sent you a life!</p>
      </div>

      {/* Add button */}
      {claimed ? (
        <div className="bg-surface rounded px-3 py-1">
          <span className="text-secondary-light text-xs font-bold">Added</span>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="bg-surface-dark hover:bg-secondary-light border border-surface rounded px-3 py-1 transition-colors"
        >
          <span className="text-white text-xs font-bold">Add</span>
        </button>
      )}
    </div>
  );
}
