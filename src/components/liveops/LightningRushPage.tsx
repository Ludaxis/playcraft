'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Badge, Button } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

export function LightningRushPage() {
  const { state } = useGame();
  const event = state.events.find((e) => e.type === 'lightning-rush');
  const timer = useTimer(event?.endTime || null);

  if (!event) return null;

  return (
    <PageLayout
      title="Lightning Rush"
      headerActions={
        <Badge variant="notification">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Rush Timer */}
        <Panel variant="elevated" className="mb-4 text-center">
          <p className="text-sm text-secondary mb-2">Time Remaining</p>
          <p className="text-4xl font-bold text-primary mb-2">{timer.formatted}</p>
          <p className="text-xs text-secondary-light">Complete levels to earn bonus rewards!</p>
        </Panel>

        {/* Progress */}
        <Panel variant="elevated" className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-secondary">Levels Completed</span>
            <span className="font-bold text-primary">
              {event.progress}/{event.maxProgress}
            </span>
          </div>
          <ProgressBar current={event.progress} max={event.maxProgress} size="lg" />
        </Panel>

        {/* Rewards */}
        <h3 className="text-sm font-semibold text-primary mb-3">Rush Rewards</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: event.maxProgress }).map((_, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-lg flex items-center justify-center
                ${i < event.progress ? 'bg-primary text-white' : 'bg-surface-light text-secondary'}
              `}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Final Reward */}
        <Panel variant="outlined" className="text-center">
          <p className="text-sm text-secondary mb-2">Complete All Levels</p>
          <div className="w-16 h-16 bg-surface-light rounded-lg mx-auto mb-2 flex items-center justify-center">
            <span className="text-surface-dark text-xs">[Prize]</span>
          </div>
          <p className="font-bold text-primary">3 Extra Lives</p>
          {event.progress === event.maxProgress ? (
            <Button variant="primary" className="mt-3">
              Claim Reward
            </Button>
          ) : (
            <p className="text-xs text-secondary-light mt-2">
              {event.maxProgress - event.progress} more to unlock
            </p>
          )}
        </Panel>
      </div>
    </PageLayout>
  );
}
