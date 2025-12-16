'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Button, Badge } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

export function RoyalPassPage() {
  const { state } = useGame();
  const event = state.events.find((e) => e.type === 'royal-pass');
  const timer = useTimer(event?.endTime || null);

  if (!event) return null;

  // Mock pass rewards
  const passRewards = [
    { level: 1, free: '50 coins', premium: '100 coins', unlocked: true },
    { level: 2, free: '1 Booster', premium: '3 Boosters', unlocked: true },
    { level: 3, free: '100 coins', premium: '200 coins', unlocked: true },
    { level: 4, free: '2 Lives', premium: '5 Lives', unlocked: false },
    { level: 5, free: '150 coins', premium: '300 coins', unlocked: false },
  ];

  const currentLevel = Math.floor((event.progress / event.maxProgress) * passRewards.length);

  return (
    <PageLayout
      title="Royal Pass"
      headerActions={
        <Badge variant="accent">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Pass Header */}
        <Panel variant="elevated" className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-secondary">Season Progress</p>
              <p className="text-lg font-bold text-primary">
                {event.progress} / {event.maxProgress}
              </p>
            </div>
            <Badge variant="primary">Free</Badge>
          </div>
          <ProgressBar current={event.progress} max={event.maxProgress} />
          <Button variant="primary" fullWidth className="mt-4">
            Upgrade to Premium
          </Button>
        </Panel>

        {/* Pass Track */}
        <div className="space-y-3">
          {passRewards.map((reward, index) => (
            <Panel
              key={reward.level}
              variant={reward.unlocked ? 'elevated' : 'default'}
              className="flex items-center gap-3"
            >
              {/* Level Indicator */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${reward.unlocked ? 'bg-primary text-white' : 'bg-surface-light text-secondary'}
                `}
              >
                {reward.level}
              </div>

              {/* Free Reward */}
              <div className="flex-1 p-2 bg-surface-lighter rounded-lg">
                <p className="text-xs text-secondary">Free</p>
                <p className="text-sm font-medium text-primary">{reward.free}</p>
              </div>

              {/* Premium Reward */}
              <div className="flex-1 p-2 bg-surface-light rounded-lg border border-surface">
                <p className="text-xs text-secondary">Premium</p>
                <p className="text-sm font-medium text-primary">{reward.premium}</p>
              </div>

              {/* Claim Button */}
              {reward.unlocked ? (
                <Button size="sm" variant="primary">
                  Claim
                </Button>
              ) : (
                <div className="w-16 text-center text-xs text-secondary-light">
                  Locked
                </div>
              )}
            </Panel>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
