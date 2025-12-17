'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, ProgressBar, Badge, Button } from '@/components/ui';
import { useGame } from '@/store';
import { useTimer } from '@/hooks';

export function BookOfTreasurePage() {
  const { state } = useGame();
  const event = state.events.find((e) => e.type === 'book-of-treasure');
  const timer = useTimer(event?.endTime || null);

  if (!event) return null;

  // Mock chapters/objectives
  const chapters = [
    { id: 1, name: 'Chapter 1', objectives: 5, completed: 5, reward: '200 coins' },
    { id: 2, name: 'Chapter 2', objectives: 5, completed: 4, reward: '300 coins' },
    { id: 3, name: 'Chapter 3', objectives: 5, completed: 2, reward: '500 coins' },
    { id: 4, name: 'Chapter 4', objectives: 5, completed: 0, reward: '750 coins' },
    { id: 5, name: 'Final Chapter', objectives: 10, completed: 0, reward: 'Grand Prize' },
  ];

  const totalObjectives = chapters.reduce((sum, c) => sum + c.objectives, 0);
  const completedObjectives = chapters.reduce((sum, c) => sum + c.completed, 0);

  return (
    <PageLayout
      title="Book of Treasure"
      headerActions={
        <Badge variant="accent">{timer.formatted}</Badge>
      }
    >
      <div className="p-4">
        {/* Overall Progress */}
        <Panel variant="elevated" className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">Overall Progress</span>
            <span className="font-bold text-text-primary">
              {completedObjectives}/{totalObjectives}
            </span>
          </div>
          <ProgressBar current={completedObjectives} max={totalObjectives} />
        </Panel>

        {/* Chapters */}
        <h3 className="text-sm font-semibold text-text-primary mb-3">Chapters</h3>
        <div className="space-y-3">
          {chapters.map((chapter) => {
            const isComplete = chapter.completed === chapter.objectives;
            const isLocked = chapters.indexOf(chapter) > 0 &&
              chapters[chapters.indexOf(chapter) - 1].completed < chapters[chapters.indexOf(chapter) - 1].objectives;

            return (
              <Panel
                key={chapter.id}
                variant={isComplete ? 'elevated' : 'outlined'}
                className={isLocked ? 'opacity-50' : ''}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{chapter.name}</p>
                    <p className="text-xs text-text-secondary">Reward: {chapter.reward}</p>
                  </div>
                  {isComplete ? (
                    <Badge variant="primary">Complete</Badge>
                  ) : isLocked ? (
                    <Badge variant="default">Locked</Badge>
                  ) : (
                    <span className="text-xs text-text-secondary">
                      {chapter.completed}/{chapter.objectives}
                    </span>
                  )}
                </div>
                <ProgressBar
                  current={chapter.completed}
                  max={chapter.objectives}
                  size="sm"
                />
                {isComplete && (
                  <Button size="sm" variant="primary" fullWidth className="mt-2">
                    Claim Reward
                  </Button>
                )}
              </Panel>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
