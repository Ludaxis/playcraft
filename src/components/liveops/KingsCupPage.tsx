'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Badge, List, ListItem, ListItemContent, ListItemAction } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

// Mock tournament data
const tournamentTiers = [
  { rank: '1-10', reward: '5000 coins', points: 8000 },
  { rank: '11-50', reward: '2000 coins', points: 5000 },
  { rank: '51-100', reward: '1000 coins', points: 3000 },
  { rank: '101-500', reward: '500 coins', points: 1000 },
];

const topPlayers = [
  { id: '1', username: 'TourneyKing', points: 12500, rank: 1 },
  { id: '2', username: 'CupMaster', points: 11200, rank: 2 },
  { id: '3', username: 'Player', points: 2500, rank: 156, isPlayer: true },
];

export function KingsCupPage() {
  const { state } = useGame();
  const event = state.events.find((e) => e.type === 'kings-cup');
  const timer = useTimer(event?.endTime || null);

  if (!event) return null;

  return (
    <PageLayout
      title="King's Cup"
      headerActions={
        <Badge variant="accent">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Current Standing */}
        <Panel variant="elevated" className="mb-4 text-center">
          <p className="text-sm text-secondary">Your Rank</p>
          <p className="text-3xl font-bold text-primary">#156</p>
          <p className="text-sm text-secondary mt-2">
            {event.progress.toLocaleString()} points
          </p>
          <ProgressBar
            current={event.progress}
            max={event.maxProgress}
            className="mt-3"
          />
          <p className="text-xs text-secondary-light mt-1">
            {(event.maxProgress - event.progress).toLocaleString()} to next tier
          </p>
        </Panel>

        {/* Reward Tiers */}
        <h3 className="text-sm font-semibold text-primary mb-3">Reward Tiers</h3>
        <div className="space-y-2 mb-4">
          {tournamentTiers.map((tier) => (
            <Panel
              key={tier.rank}
              variant="outlined"
              padding="sm"
              className="flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-primary">Rank {tier.rank}</p>
                <p className="text-xs text-secondary">{tier.points.toLocaleString()}+ pts</p>
              </div>
              <Badge variant="accent">{tier.reward}</Badge>
            </Panel>
          ))}
        </div>

        {/* Top Players */}
        <h3 className="text-sm font-semibold text-primary mb-3">Top Players</h3>
        <List>
          {topPlayers.map((player) => (
            <ListItem key={player.id} active={player.isPlayer}>
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${player.rank <= 3 ? 'bg-primary text-white' : 'bg-surface-light text-secondary'}
                `}
              >
                {player.rank}
              </div>
              <ListItemContent title={player.username} />
              <ListItemAction>
                <span className="font-bold text-primary">
                  {player.points.toLocaleString()}
                </span>
              </ListItemAction>
            </ListItem>
          ))}
        </List>
      </div>
    </PageLayout>
  );
}
