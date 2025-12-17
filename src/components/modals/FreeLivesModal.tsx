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
    <div className="w-[320px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">Free Lives</h2>
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
      <div className="bg-bg-card m-1.5 rounded-lg border border-border p-2">
        {/* Total free lives counter */}
        <div className="bg-bg-card rounded px-3 py-1.5 mb-2 flex items-center justify-between border border-border">
          <span className="text-text-secondary text-mini font-medium">Total free lives:</span>
          <div className="bg-bg-muted rounded px-3 py-0.5">
            <span className="text-text-primary font-bold text-caption">{unclaimedCount}</span>
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
    <div className="bg-bg-card rounded-lg px-2 py-1.5 flex items-center gap-2 border border-border">
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
        <p className="text-text-primary text-value-sm">{senderName}</p>
        <p className="text-text-muted text-mini">Sent you a life!</p>
      </div>

      {/* Add button */}
      {claimed ? (
        <div className="bg-bg-muted rounded px-3 py-1 border border-border">
          <span className="text-text-muted text-value-sm">Added</span>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="bg-bg-muted hover:bg-bg-page border border-border rounded px-3 py-1 transition-colors"
        >
          <span className="text-text-primary text-value-sm">Add</span>
        </button>
      )}
    </div>
  );
}
