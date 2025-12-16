'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, Button, Badge } from '@/components/ui';
import { useGame, gameActions } from '@/store';

export function DailyRewardsPage() {
  const { state, dispatch } = useGame();
  const { dailyRewards } = state;

  const handleClaim = (day: number) => {
    dispatch(gameActions.claimDailyReward(day));
  };

  const currentDay = dailyRewards.find((d) => d.current);

  return (
    <PageLayout title="Daily Rewards">
      <div className="p-4">
        <Panel variant="elevated" className="mb-4 text-center">
          <p className="text-sm text-secondary mb-1">Current Streak</p>
          <p className="text-3xl font-bold text-primary">
            Day {currentDay?.day || 1}
          </p>
        </Panel>

        <div className="grid grid-cols-4 gap-3">
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
        ${current ? 'border-primary' : ''}
        ${claimed ? 'opacity-60' : ''}
      `}
    >
      <p className="text-xs text-secondary mb-1">Day {day}</p>
      <div className="w-8 h-8 bg-surface-light rounded mx-auto mb-1" />
      <p className="text-xs font-medium text-primary">{reward.amount}</p>
      <p className="text-[10px] text-secondary truncate">{reward.name || reward.type}</p>

      {claimed && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <Badge variant="default">Done</Badge>
        </div>
      )}

      {current && !claimed && (
        <Button size="sm" variant="primary" className="mt-2 text-xs px-2" onClick={onClaim}>
          Claim
        </Button>
      )}
    </Panel>
  );
}
