'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, Tabs, Badge, Button } from '@/components/ui';
import { useGame } from '@/store';

const tabs = [
  { id: 'pre-game', label: 'Pre-Game' },
  { id: 'in-game', label: 'In-Game' },
];

export function BoostersPage() {
  const { state } = useGame();
  const { boosters } = state;
  const [activeTab, setActiveTab] = useState('pre-game');

  const filteredBoosters = boosters.filter((b) => b.type === activeTab);

  return (
    <PageLayout title="Boosters">
      <div className="p-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />

        <div className="grid grid-cols-2 gap-3">
          {filteredBoosters.map((booster) => (
            <Panel key={booster.id} variant="elevated" className="relative">
              {/* Count Badge */}
              <Badge
                variant={booster.count > 0 ? 'accent' : 'default'}
                className="absolute -top-2 -right-2"
              >
                {booster.count}
              </Badge>

              {/* Booster Icon */}
              <div className="aspect-square bg-bg-card rounded-lg mb-3 flex items-center justify-center">
                <span className="text-text-muted text-xs">[{booster.name}]</span>
              </div>

              {/* Booster Info */}
              <h3 className="text-sm font-medium text-text-primary mb-1">
                {booster.name}
              </h3>
              <p className="text-xs text-text-secondary mb-3">{booster.description}</p>

              {/* Get More Button */}
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                disabled={booster.count === 0}
              >
                {booster.count > 0 ? 'Get More' : 'Out of Stock'}
              </Button>
            </Panel>
          ))}
        </div>

        {/* Info Panel */}
        <Panel variant="outlined" className="mt-4">
          <p className="text-xs text-text-secondary text-center">
            {activeTab === 'pre-game'
              ? 'Pre-game boosters are activated before starting a level'
              : 'In-game boosters can be used during gameplay'}
          </p>
        </Panel>
      </div>
    </PageLayout>
  );
}
