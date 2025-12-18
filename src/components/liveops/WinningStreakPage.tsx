'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { useTimer } from '@/hooks';

interface StreakReward {
  level: number;
  icon: string;
  amount: string;
  claimed: boolean;
  unlocked: boolean;
}

const streakData = {
  currentStreak: 3,
  totalRequired: 10,
  endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
  grandPrize: { coins: 10000 },
  ladder: [
    { level: 1, icon: 'TNT', amount: 'x1', claimed: true, unlocked: true },
    { level: 2, icon: 'GFT', amount: 'x1', claimed: true, unlocked: true },
    { level: 3, icon: 'RKT', amount: 'x1', claimed: true, unlocked: true },
    { level: 4, icon: 'x2', amount: '15m', claimed: false, unlocked: false },
    { level: 5, icon: 'CHT', amount: 'x1', claimed: false, unlocked: false },
    { level: 6, icon: 'CLR', amount: 'x1', claimed: false, unlocked: false },
  ] as StreakReward[],
};

type ViewState = 'intro' | 'ladder';

export function WinningStreakPage() {
  const { navigate } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const timer = useTimer(streakData.endTime);

  if (!isEventEnabled('winning-streak')) {
    return (
      <div className="flex flex-col h-full bg-bg-inverse items-center justify-center">
        <p className="text-text-inverse text-value">Event not available</p>
        <button onClick={() => navigate('main-menu')} className="mt-4 text-brand-primary underline">
          Go Back
        </button>
      </div>
    );
  }

  const progress = (streakData.currentStreak / streakData.totalRequired) * 100;

  // Intro Screen
  if (viewState === 'intro') {
    return (
      <div className="flex flex-col h-full bg-bg-inverse overflow-hidden">
        <div className="bg-bg-inverse pt-2 pb-3 px-3 flex items-center justify-between">
          <div className="w-8" />
          <h1 className="text-text-inverse text-h1">Winning Streak</h1>
          <button
            onClick={() => navigate('main-menu')}
            className="w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border border-border"
          >
            <span className="text-text-inverse font-bold">X</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-64 h-48 bg-bg-muted rounded-2xl flex flex-col items-center justify-center mb-4 border border-border">
            <div className="bg-bg-card rounded-lg px-3 py-2 mb-2 border border-border">
              <p className="text-text-muted text-mini text-center">Grand Prize!</p>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-border-strong rounded-full flex items-center justify-center border border-border">
                  <span className="text-text-primary text-mini">$</span>
                </div>
                <span className="text-text-primary text-value">{streakData.grandPrize.coins.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-border-strong rounded-xl flex items-center justify-center">
              <span className="text-text-muted text-mini">[KING]</span>
            </div>
          </div>

          <div className="w-full max-w-[280px] mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-3 bg-border-strong rounded-full overflow-hidden">
                <div className="h-full bg-bg-inverse rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <div className="w-10 h-10 bg-bg-inverse rounded-lg flex items-center justify-center border border-border">
                <span className="text-text-inverse text-mini">GFT</span>
              </div>
            </div>
            <p className="text-text-inverse text-value text-center">{streakData.currentStreak}/{streakData.totalRequired}</p>
          </div>

          <div className="flex items-center gap-2 bg-bg-card rounded-full px-4 py-1.5 mb-4 border border-border">
            <div className="w-5 h-5 bg-border-strong rounded-full flex items-center justify-center">
              <span className="text-text-muted text-mini">T</span>
            </div>
            <span className="text-text-primary text-value">{timer.days}d {timer.hours}h</span>
          </div>

          <p className="text-text-inverse text-center text-body mb-2">Win levels to collect rewards!</p>
          <p className="text-text-muted text-center text-caption mb-6">Complete all steps to win the Grand Prize!</p>

          <button
            onClick={() => setViewState('ladder')}
            className="w-full max-w-[280px] py-4 bg-bg-inverse rounded-xl border border-border"
          >
            <span className="text-text-inverse text-h2">Play</span>
          </button>
        </div>
      </div>
    );
  }

  // Ladder View
  return (
    <div className="flex flex-col h-full bg-bg-inverse overflow-hidden">
      <div className="bg-bg-inverse pt-2 pb-3 px-3 flex items-center justify-between">
        <button
          onClick={() => setShowInfoModal(true)}
          className="w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border border-border"
        >
          <span className="text-text-primary text-value-sm">i</span>
        </button>
        <h1 className="text-text-inverse text-h1">Winning Streak</h1>
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border border-border"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      </div>

      <div className="flex-1 mx-2 mb-2 bg-bg-muted rounded-2xl border border-border overflow-hidden flex flex-col">
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 bg-bg-card rounded-full px-4 py-1.5 border border-border">
            <div className="w-5 h-5 bg-border-strong rounded-full flex items-center justify-center">
              <span className="text-text-muted text-mini">T</span>
            </div>
            <span className="text-text-primary text-value">{timer.days}d {timer.hours}h</span>
          </div>
        </div>

        {/* Grand Prize */}
        <div className="px-3 pb-2">
          <div className="bg-bg-muted rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-bg-inverse rounded-xl flex items-center justify-center border border-border">
                  <span className="text-text-inverse text-value">CHT</span>
                </div>
                <div>
                  <p className="text-text-primary text-value">Grand Prize</p>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-border-strong rounded-full flex items-center justify-center border border-border">
                      <span className="text-text-primary text-mini">$</span>
                    </div>
                    <span className="text-text-primary text-value-sm">{streakData.grandPrize.coins.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 bg-border-strong rounded-lg flex items-center justify-center">
                <span className="text-text-muted text-mini">[lock]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-border-strong rounded-full overflow-hidden">
              <div className="h-full bg-bg-inverse rounded-full" style={{ width: `${Math.max(progress, 20)}%` }} />
            </div>
            <span className="text-text-primary text-value-sm">{streakData.currentStreak}/{streakData.totalRequired}</span>
            <div className="w-8 h-8 bg-bg-inverse rounded-lg flex items-center justify-center border border-border">
              <span className="text-text-inverse text-mini">GFT</span>
            </div>
          </div>
        </div>

        {/* Ladder */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {[...streakData.ladder].reverse().map((reward, index) => {
            const reversedIndex = streakData.ladder.length - 1 - index;
            return (
              <div key={reward.level} className="relative flex items-center gap-2 mb-2">
                <div className="w-12 flex flex-col items-center">
                  {index > 0 && <div className={`w-0.5 h-3 ${reward.unlocked ? 'bg-bg-inverse' : 'bg-border-strong'}`} />}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    reward.claimed ? 'bg-bg-inverse' : reward.unlocked ? 'bg-border-strong' : 'bg-border-strong'
                  }`}>
                    <span className={`text-value ${reward.claimed || reward.unlocked ? 'text-text-inverse' : 'text-text-muted'}`}>
                      {reward.level}
                    </span>
                  </div>
                  {index < streakData.ladder.length - 1 && (
                    <div className={`w-0.5 h-3 ${streakData.ladder[reversedIndex - 1]?.unlocked ? 'bg-bg-inverse' : 'bg-border-strong'}`} />
                  )}
                </div>

                <div className={`flex-1 rounded-xl p-2 border flex items-center justify-between ${
                  reward.claimed ? 'bg-bg-card border-bg-inverse' : reward.unlocked ? 'bg-bg-card border-border' : 'bg-bg-muted border-border opacity-50'
                }`}>
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                    reward.claimed ? 'bg-border-strong' : reward.unlocked ? 'bg-border-strong' : 'bg-border-strong'
                  }`}>
                    <span className={`text-value-sm ${reward.claimed ? 'text-text-primary' : reward.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                      {reward.icon}
                    </span>
                    <span className={`text-mini ${reward.claimed ? 'text-text-secondary' : reward.unlocked ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {reward.amount}
                    </span>
                  </div>

                  {reward.claimed ? (
                    <div className="w-6 h-6 bg-bg-inverse rounded-full flex items-center justify-center">
                      <span className="text-text-inverse text-mini">[check]</span>
                    </div>
                  ) : reward.unlocked ? (
                    <button className="px-3 py-1.5 bg-bg-inverse rounded-lg border border-border">
                      <span className="text-text-inverse text-value-sm">Claim</span>
                    </button>
                  ) : (
                    <div className="w-6 h-6 bg-border-strong rounded flex items-center justify-center">
                      <span className="text-text-muted text-mini">[lock]</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {streakData.currentStreak < streakData.totalRequired && (() => {
            const nextLockedReward = streakData.ladder.find(r => !r.unlocked);
            const levelsToGo = nextLockedReward ? nextLockedReward.level - streakData.currentStreak : 1;
            return (
              <div className="mt-2 bg-bg-card rounded-lg px-3 py-2 border border-border">
                <p className="text-text-primary text-caption text-center">
                  Win {levelsToGo} more level(s) to unlock next reward!
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative w-[320px] rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-2 right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center z-10 border border-border"
            >
              <span className="text-text-inverse font-bold text-caption">X</span>
            </button>

            <div className="bg-bg-inverse py-4 px-3">
              <h1 className="text-text-inverse text-h2 text-center">How It Works</h1>
            </div>

            <div className="bg-bg-muted p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-bg-inverse rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <span className="text-text-inverse text-h2">[check]</span>
                </div>
                <div>
                  <p className="text-text-primary text-h4">Win Levels</p>
                  <p className="text-text-secondary text-caption">Each win increases your streak</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-bg-inverse rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <span className="text-text-inverse text-value">GFT</span>
                </div>
                <div>
                  <p className="text-text-primary text-h4">Collect Rewards</p>
                  <p className="text-text-secondary text-caption">Unlock boosters at each level</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-border-strong rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <span className="text-text-primary text-value">CHT</span>
                </div>
                <div>
                  <p className="text-text-primary text-h4">Win Grand Prize</p>
                  <p className="text-text-secondary text-caption">Complete all levels for the big reward</p>
                </div>
              </div>

              <div className="bg-bg-page rounded-xl p-3 mb-4 border border-border">
                <p className="text-text-primary text-caption text-center">
                  <span className="text-text-primary font-bold">Warning:</span> Losing resets your streak!
                </p>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 bg-bg-inverse rounded-xl border border-border"
              >
                <span className="text-text-inverse text-h3">Got It!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
