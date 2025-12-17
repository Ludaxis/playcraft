'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Badge, List, ListItem, ListItemContent, ListItemAction } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

// Mock race participants
const participants = [
  { id: '1', username: 'SpeedRunner', progress: 15, position: 1 },
  { id: '2', username: 'Player', progress: 8, position: 2, isPlayer: true },
  { id: '3', username: 'FastMatch', progress: 7, position: 3 },
  { id: '4', username: 'QuickPuzzle', progress: 5, position: 4 },
  { id: '5', username: 'RacerKing', progress: 3, position: 5 },
];

export function SkyRacePage() {
  const { state } = useGame();
  const event = state.events.find((e) => e.type === 'sky-race');
  const timer = useTimer(event?.endTime || null);

  if (!event) return null;

  return (
    <PageLayout
      title="Sky Race"
      headerActions={
        <Badge variant="accent">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Race Info */}
        <Panel variant="elevated" className="mb-4">
          <p className="text-caption text-text-secondary text-center mb-2">
            Complete 15 levels as fast as you can!
          </p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-caption text-text-secondary">Your Progress</span>
            <span className="font-bold text-text-primary">
              {event.progress}/{event.maxProgress}
            </span>
          </div>
          <ProgressBar current={event.progress} max={event.maxProgress} />
        </Panel>

        {/* Rewards Preview */}
        <Panel variant="outlined" className="mb-4">
          <h3 className="text-caption font-semibold text-text-primary mb-2">Rewards</h3>
          <div className="flex justify-between text-mini text-text-secondary">
            <span>1st: 1000 coins</span>
            <span>2nd: 500 coins</span>
            <span>3rd: 250 coins</span>
          </div>
        </Panel>

        {/* Leaderboard */}
        <h3 className="text-caption font-semibold text-text-primary mb-3">Race Standing</h3>
        <List>
          {participants.map((p) => (
            <ListItem key={p.id} active={p.isPlayer}>
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-caption
                  ${p.position <= 3 ? 'bg-bg-inverse text-text-inverse' : 'bg-bg-page text-text-text-secondary'}
                `}
              >
                {p.position}
              </div>
              <ListItemContent
                title={p.username}
                subtitle={`${p.progress}/15 levels`}
              />
              <ListItemAction>
                <ProgressBar
                  current={p.progress}
                  max={15}
                  size="sm"
                  className="w-20"
                />
              </ListItemAction>
            </ListItem>
          ))}
        </List>
      </div>
    </PageLayout>
  );
}
