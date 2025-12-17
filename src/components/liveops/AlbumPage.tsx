'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Badge, Tabs, Button } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

const tabs = [
  { id: 'collections', label: 'Collections' },
  { id: 'rewards', label: 'Rewards' },
];

// Mock album collections
const collections = [
  { id: 1, name: 'Summer Beach', cards: 9, collected: 9, complete: true },
  { id: 2, name: 'Royal Garden', cards: 9, collected: 7, complete: false },
  { id: 3, name: 'Castle Hall', cards: 9, collected: 4, complete: false },
  { id: 4, name: 'Mountain Peak', cards: 9, collected: 1, complete: false },
  { id: 5, name: 'Ocean Voyage', cards: 9, collected: 0, complete: false },
];

export function AlbumPage() {
  const { state } = useGame();
  const event = state.events.find((e) => e.type === 'album');
  const timer = useTimer(event?.endTime || null);
  const [activeTab, setActiveTab] = useState('collections');

  if (!event) return null;

  const totalCards = collections.reduce((sum, c) => sum + c.cards, 0);
  const collectedCards = collections.reduce((sum, c) => sum + c.collected, 0);

  return (
    <PageLayout
      title="Summer Album"
      headerActions={
        <Badge variant="accent">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Album Progress */}
        <Panel variant="elevated" className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-caption text-text-secondary">Cards Collected</span>
            <span className="font-bold text-text-primary">
              {collectedCards}/{totalCards}
            </span>
          </div>
          <ProgressBar current={collectedCards} max={totalCards} />
          <p className="text-mini text-text-muted mt-2 text-center">
            Complete collections to earn rewards
          </p>
        </Panel>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />

        {activeTab === 'collections' && (
          <div className="space-y-3">
            {collections.map((collection) => (
              <Panel
                key={collection.id}
                variant={collection.complete ? 'elevated' : 'outlined'}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-caption font-medium text-text-primary">
                      {collection.name}
                    </p>
                    <p className="text-mini text-text-secondary">
                      {collection.collected}/{collection.cards} cards
                    </p>
                  </div>
                  {collection.complete ? (
                    <Badge variant="primary">Complete</Badge>
                  ) : (
                    <Badge variant="default">
                      {Math.round((collection.collected / collection.cards) * 100)}%
                    </Badge>
                  )}
                </div>

                {/* Card Grid Preview */}
                <div className="grid grid-cols-9 gap-1">
                  {Array.from({ length: collection.cards }).map((_, i) => (
                    <div
                      key={i}
                      className={`
                        aspect-square rounded
                        ${i < collection.collected ? 'bg-bg-inverse' : 'bg-bg-page'}
                      `}
                    />
                  ))}
                </div>

                {collection.complete && (
                  <Button size="sm" variant="primary" fullWidth className="mt-2">
                    Claim Reward
                  </Button>
                )}
              </Panel>
            ))}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-3">
            {collections.map((collection, index) => (
              <Panel
                key={collection.id}
                variant="outlined"
                padding="sm"
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-caption font-medium text-text-primary">
                    {collection.name}
                  </p>
                  <p className="text-mini text-text-secondary">
                    {(index + 1) * 500} coins + Booster
                  </p>
                </div>
                {collection.complete ? (
                  <Badge variant="primary">Claimed</Badge>
                ) : (
                  <Badge variant="default">Locked</Badge>
                )}
              </Panel>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
