'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';
import { BottomNavigation } from '@/components/shared';

// Collection sets data
const collectionSets = [
  { id: 1, name: 'Olympics', abbr: 'OLY', collected: 3, total: 9, reward: 'x1' },
  { id: 2, name: 'Clothes', abbr: 'CLT', collected: 3, total: 9, reward: 'x1' },
  { id: 3, name: 'Alchemy', abbr: 'ALC', collected: 2, total: 9, reward: 'x1' },
  { id: 4, name: 'Astronomy', abbr: 'AST', collected: 1, total: 9, reward: '1000' },
  { id: 5, name: 'Enlighten', abbr: 'ENL', collected: 1, total: 9, reward: 'x2' },
  { id: 6, name: 'Riding', abbr: 'RID', collected: 0, total: 9, reward: 'x2' },
  { id: 7, name: 'Kitchen', abbr: 'KIT', collected: 2, total: 9, reward: 'x1' },
  { id: 8, name: 'Music', abbr: 'MUS', collected: 0, total: 9, reward: 'x2' },
  { id: 9, name: 'Garden', abbr: 'GRD', collected: 1, total: 9, reward: 'x1' },
];

export function CollectionPage() {
  const { openModal } = useNavigation();
  const [showRewardTooltip, setShowRewardTooltip] = useState(false);
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCollected = collectionSets.reduce((sum, s) => sum + s.collected, 0);
  const totalCards = collectionSets.reduce((sum, s) => sum + s.total, 0);

  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-bg-inverse items-center justify-center">
        <span className="text-text-inverse">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Top Bar with Info and Reward buttons */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-brand-hover">
        <button
          onClick={() => openModal('collection-info')}
          className="w-8 h-8 bg-brand-muted rounded-full flex items-center justify-center border border-border-strong"
        >
          <span className="text-text-inverse text-value-sm">i</span>
        </button>
        <button
          onClick={() => openModal('card-stars')}
          className="w-9 h-9 bg-border-strong rounded-full flex items-center justify-center border border-border"
        >
          <Image src="/icons/Star-Filled.svg" alt="Card Stars" width={20} height={20} className="opacity-80" />
        </button>
      </div>

      {/* Title Banner */}
      <div className="mx-2 -mt-1 bg-border-strong rounded-lg border border-border py-1.5 px-3 text-center">
        <h1 className="text-text-primary text-value">Origins Collection</h1>
      </div>

      {/* Grand Prize Section */}
      <div className="mx-2 mt-1.5 bg-bg-muted rounded-lg border border-border-strong p-2">
        <button
          onClick={() => openModal('grand-prize')}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-border-strong rounded-full flex items-center justify-center">
                <span className="text-text-primary text-value">$</span>
              </div>
              <span className="text-text-primary text-mini font-bold mt-0.5">10000</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-border-strong rounded-lg flex items-center justify-center">
                <span className="text-text-primary text-value">TRP</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-border-strong rounded-full flex items-center justify-center">
                <span className="text-text-primary text-mini font-bold">TNT</span>
              </div>
              <span className="text-text-primary text-mini font-bold mt-0.5">x10</span>
            </div>
          </div>

          <div className="flex justify-center mb-1.5">
            <div className="bg-border-strong rounded px-3 py-0.5">
              <span className="text-text-primary text-value-sm">Grand Prize</span>
            </div>
          </div>
        </button>

        {/* Progress Bar */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <button
            onClick={() => {
              setShowInfoMessage(!showInfoMessage);
              if (showRewardTooltip) setShowRewardTooltip(false);
            }}
            className="w-6 h-6 bg-brand-muted rounded flex items-center justify-center"
          >
            <Image src="/icons/Category.svg" alt="Cards" width={14} height={14} className="invert opacity-80" />
          </button>
          <div className="flex-1 relative">
            <div className="h-4 bg-brand-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-border-strong rounded-full transition-all"
                style={{ width: `${(totalCollected / totalCards) * 100}%` }}
              />
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-text-inverse text-mini font-bold">
              {totalCollected}/{totalCards}
            </span>
          </div>
          <button
            onClick={() => {
              setShowRewardTooltip(!showRewardTooltip);
              if (showInfoMessage) setShowInfoMessage(false);
            }}
            className="w-7 h-7 bg-border-strong rounded flex items-center justify-center border border-border"
          >
            <span className="text-text-primary text-mini font-bold">CHT</span>
          </button>
        </div>

        {/* Timer */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-border-strong rounded-full px-2 py-0.5">
            <span className="text-text-primary text-mini font-bold">16d 19h</span>
          </div>
        </div>
      </div>

      {/* Reward Tooltip */}
      {showRewardTooltip && (
        <div className="mx-2 mt-1.5 bg-bg-page rounded-lg border border-border p-2">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <div className="w-6 h-6 bg-border-strong rounded flex items-center justify-center">
              <span className="text-text-primary text-mini font-bold">TRP</span>
            </div>
            <span className="text-text-muted text-xs">+</span>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-border-strong rounded-full flex items-center justify-center">
                <span className="text-text-primary text-mini font-bold">$</span>
              </div>
              <span className="text-text-primary text-mini font-bold">10k</span>
            </div>
            <span className="text-text-muted text-xs">+</span>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-border-strong rounded-full flex items-center justify-center">
                <span className="text-text-primary text-mini font-bold">BST</span>
              </div>
              <span className="text-text-primary text-mini font-bold">x10</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Text */}
      {showInfoMessage && (
        <div className="mx-2 mt-1.5 bg-bg-page rounded-lg border border-border p-2">
          <p className="text-text-primary text-xs text-center font-medium">
            Collect all cards to complete Origins Collection!
          </p>
        </div>
      )}

      {/* Collection Sets Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {collectionSets.map((set) => (
            <CollectionSetCard
              key={set.id}
              set={set}
              onPress={() => openModal('collection-set-detail')}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="collection" />
    </div>
  );
}

// Collection Set Card Component
interface CollectionSetCardProps {
  set: {
    id: number;
    name: string;
    abbr: string;
    collected: number;
    total: number;
    reward: string;
  };
  onPress: () => void;
}

function CollectionSetCard({ set, onPress }: CollectionSetCardProps) {
  const progress = (set.collected / set.total) * 100;

  return (
    <button
      onClick={onPress}
      className="bg-brand-muted rounded-lg border border-border-strong overflow-hidden w-full text-left"
    >
      <div className="p-1.5 flex justify-center">
        <div className="w-10 h-10 bg-border-strong rounded-full border border-border flex items-center justify-center">
          <span className="text-text-primary text-mini font-bold">{set.abbr}</span>
        </div>
      </div>

      <div className="bg-border-strong mx-1 rounded px-1 py-0.5 mb-1">
        <p className="text-text-primary text-mini font-bold text-center truncate">{set.name}</p>
      </div>

      <div className="px-1.5 pb-0.5">
        <div className="h-1.5 bg-bg-inverse rounded-full overflow-hidden">
          <div
            className="h-full bg-bg-muted rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-1.5 pb-1.5">
        <span className="text-text-muted text-mini font-bold">{set.collected}/{set.total}</span>
        <span className="text-text-muted text-mini font-bold">{set.reward}</span>
      </div>
    </button>
  );
}
