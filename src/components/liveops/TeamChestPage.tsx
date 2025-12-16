'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Badge, List, ListItem, ListItemContent, ListItemAction, Button } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

export function TeamChestPage() {
  const { state } = useGame();
  const { team } = state;
  const event = state.events.find((e) => e.type === 'team-chest');
  const timer = useTimer(event?.endTime || null);

  if (!event || !team) return null;

  // Chest milestones
  const milestones = [
    { stars: 250, reward: '500 coins', reached: team.chestProgress >= 250 },
    { stars: 500, reward: '1000 coins', reached: team.chestProgress >= 500 },
    { stars: 750, reward: '2 Boosters', reached: team.chestProgress >= 750 },
    { stars: 1000, reward: 'Grand Chest', reached: team.chestProgress >= 1000 },
  ];

  return (
    <PageLayout
      title="Team Chest"
      headerActions={
        <Badge variant="accent">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Chest Progress */}
        <Panel variant="elevated" className="mb-4 text-center">
          <div className="w-20 h-20 bg-surface-light rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-surface-dark text-xs">[Chest]</span>
          </div>
          <p className="text-lg font-bold text-primary">
            {team.chestProgress} / {team.chestGoal}
          </p>
          <p className="text-sm text-secondary mb-3">Stars Collected</p>
          <ProgressBar current={team.chestProgress} max={team.chestGoal} size="lg" />
        </Panel>

        {/* Milestones */}
        <h3 className="text-sm font-semibold text-primary mb-3">Milestones</h3>
        <div className="space-y-2 mb-4">
          {milestones.map((milestone, index) => (
            <Panel
              key={milestone.stars}
              variant={milestone.reached ? 'elevated' : 'outlined'}
              padding="sm"
              className="flex items-center gap-3"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${milestone.reached ? 'bg-primary text-white' : 'bg-surface-light text-secondary'}
                `}
              >
                {milestone.reached ? <CheckIcon /> : index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{milestone.stars} Stars</p>
                <p className="text-xs text-secondary">{milestone.reward}</p>
              </div>
              {milestone.reached && (
                <Button size="sm" variant="primary">
                  Claim
                </Button>
              )}
            </Panel>
          ))}
        </div>

        {/* Top Contributors */}
        <h3 className="text-sm font-semibold text-primary mb-3">Top Contributors</h3>
        <List>
          {team.members
            .sort((a, b) => b.contributedStars - a.contributedStars)
            .slice(0, 5)
            .map((member, index) => (
              <ListItem key={member.id}>
                <div className="w-6 text-center text-sm font-bold text-secondary">
                  {index + 1}
                </div>
                <ListItemContent
                  title={member.username}
                  subtitle={`Level ${member.level}`}
                />
                <ListItemAction>
                  <span className="font-bold text-primary">
                    {member.contributedStars}
                  </span>
                </ListItemAction>
              </ListItem>
            ))}
        </List>
      </div>
    </PageLayout>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13L9 17L19 7" />
    </svg>
  );
}
