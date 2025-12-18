'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Card as Panel, Button, Badge } from '@/components/base';
import { FeatureDisabled } from '@/components/shared';
import { useGame, gameActions } from '@/store';
import { isFeatureEnabled } from '@/config/features';

export function DailyRewardsPage() {
  const { state, dispatch } = useGame();
  const { dailyRewards } = state;

  // Feature flag check (must be after hooks)
  if (!isFeatureEnabled('DAILY_REWARDS')) {
    return <FeatureDisabled featureName="Daily Rewards" />;
  }

  const handleClaim = (day: number) => {
    dispatch(gameActions.claimDailyReward(day));
  };

  const currentDay = dailyRewards.find((d) => d.current);

  return (
    <PageLayout title="Daily Rewards">
      <div className="p-4">
        <Panel variant="elevated" className="mb-4 text-center">
          <p className="text-caption text-text-secondary mb-1">Current Streak</p>
          <p className="text-h1 font-bold text-text-primary">
            Day {currentDay?.day || 1}
          </p>
        </Panel>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {dailyRewards.map((reward) => (
            <DailyRewardCard
              key={reward.day}
              day={reward.day}
              reward={reward.reward}
              claimed={reward.claimed}
              current={reward.current}
              onClaim={() => handleClaim(reward.day)}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

interface DailyRewardCardProps {
  day: number;
  reward: { type: string; amount: number; name?: string };
  claimed: boolean;
  current: boolean;
  onClaim: () => void;
}

function DailyRewardCard({ day, reward, claimed, current, onClaim }: DailyRewardCardProps) {
  return (
    <Panel
      variant={current ? 'outlined' : 'default'}
      className={`
        text-center relative
        ${current ? 'border-border-strong' : ''}
        ${claimed ? 'opacity-60' : ''}
      `}
    >
      <p className="text-mini text-text-secondary mb-1">Day {day}</p>
      <div className="w-8 h-8 bg-bg-page rounded mx-auto mb-1" />
      <p className="text-mini font-medium text-text-primary">{reward.amount}</p>
      <p className="text-mini text-text-secondary truncate">{reward.name || reward.type}</p>

      {claimed && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-card/80 rounded-lg">
          <Badge variant="default">Done</Badge>
        </div>
      )}

      {current && !claimed && (
        <Button size="sm" variant="primary" className="mt-2 text-mini px-2" onClick={onClaim}>
          Claim
        </Button>
      )}
    </Panel>
  );
}
