'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { useTimer } from '@/hooks';

// Royal Pass reward types
interface Reward {
  type: string;
  amount: string;
  icon: string;
}

interface PassStage {
  stage: number;
  freeReward: Reward;
  premiumReward: Reward;
  claimed: boolean;
  unlocked: boolean;
}

// Mock data for Royal Pass
const passData = {
  currentKeys: 4,
  maxKeys: 15,
  isActivated: false,
  price: '$14.98',
  endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
  stages: [
    { stage: 1, freeReward: { type: 'booster', amount: 'x1', icon: 'TNT' }, premiumReward: { type: 'chest', amount: '', icon: 'CHT' }, claimed: true, unlocked: true },
    { stage: 2, freeReward: { type: 'booster', amount: 'x1', icon: 'RKT' }, premiumReward: { type: 'lives', amount: '15m', icon: 'INF' }, claimed: true, unlocked: true },
    { stage: 3, freeReward: { type: 'booster', amount: 'x1', icon: 'BLL' }, premiumReward: { type: 'gift', amount: 'x1', icon: 'GFT' }, claimed: false, unlocked: true },
    { stage: 4, freeReward: { type: 'coins', amount: '100', icon: 'CNS' }, premiumReward: { type: 'booster', amount: 'x2', icon: 'TNT' }, claimed: false, unlocked: true },
    { stage: 5, freeReward: { type: 'card', amount: 'x1', icon: 'CRD' }, premiumReward: { type: 'chest', amount: 'x1', icon: 'CHT' }, claimed: false, unlocked: false },
    { stage: 6, freeReward: { type: 'booster', amount: 'x1', icon: 'ARW' }, premiumReward: { type: 'lives', amount: '30m', icon: 'INF' }, claimed: false, unlocked: false },
    { stage: 7, freeReward: { type: 'coins', amount: '150', icon: 'CNS' }, premiumReward: { type: 'booster', amount: 'x3', icon: 'TNT' }, claimed: false, unlocked: false },
    { stage: 8, freeReward: { type: 'booster', amount: 'x1', icon: 'HAM' }, premiumReward: { type: 'gift', amount: 'x1', icon: 'GFT' }, claimed: false, unlocked: false },
  ] as PassStage[],
};

export function RoyalPassPage() {
  const { navigate } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const [isActivated, setIsActivated] = useState(passData.isActivated);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const timer = useTimer(passData.endTime);

  if (!isEventEnabled('royal-pass')) {
    return (
      <div className="flex flex-col h-full bg-bg-inverse items-center justify-center">
        <p className="text-text-inverse text-value">Event not available</p>
        <button onClick={() => navigate('main-menu')} className="mt-4 text-brand-primary underline">
          Go Back
        </button>
      </div>
    );
  }

  const progress = (passData.currentKeys / passData.maxKeys) * 100;

  return (
    <div className="flex flex-col h-full bg-bg-inverse overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse pt-2 pb-3 px-3 flex items-center justify-between">
        <button
          onClick={() => setShowInfoModal(true)}
          className="w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border border-border"
        >
          <span className="text-text-primary text-value-sm">i</span>
        </button>
        <h1 className="text-text-inverse text-h1">Royal Pass</h1>
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border border-border"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 mx-2 mb-2 bg-bg-muted rounded-2xl border border-border overflow-hidden flex flex-col">
        {/* Timer */}
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 bg-bg-card rounded-full px-4 py-1.5 border border-border">
            <div className="w-5 h-5 bg-border-strong rounded-full flex items-center justify-center">
              <span className="text-text-muted text-mini">T</span>
            </div>
            <span className="text-text-primary text-value">{timer.days}d {timer.hours}h</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-bg-inverse rounded-lg flex items-center justify-center border border-border">
              <span className="text-text-inverse text-mini">KEY</span>
            </div>
            <div className="flex-1 h-3 bg-border-strong rounded-full overflow-hidden">
              <div
                className="h-full bg-bg-inverse rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-text-primary text-value-sm">{passData.currentKeys}/{passData.maxKeys}</span>
          </div>
        </div>

        {/* Activate Button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => !isActivated && setShowActivateModal(true)}
            className={`w-full py-3 rounded-xl border ${
              isActivated
                ? 'bg-bg-inverse border-border'
                : 'bg-border-strong border-border'
            }`}
          >
            <span className="text-text-inverse text-value">
              {isActivated ? '[check] Pass Activated' : `Activate Pass - ${passData.price}`}
            </span>
          </button>
        </div>

        {/* Track Header */}
        <div className="flex px-3 pb-2">
          <div className="flex-1 text-center">
            <span className="text-text-primary text-caption">FREE</span>
          </div>
          <div className="w-10" />
          <div className="flex-1 text-center">
            <span className="text-text-primary text-caption">PREMIUM</span>
          </div>
        </div>

        {/* Reward Track */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {passData.stages.map((stage, index) => (
            <div key={stage.stage} className="relative flex items-center gap-2 mb-2">
              {/* Free Reward */}
              <div className={`flex-1 rounded-xl p-2 border ${
                stage.claimed
                  ? 'bg-bg-card border-bg-inverse'
                  : stage.unlocked
                    ? 'bg-bg-card border-border'
                    : 'bg-bg-muted border-border opacity-50'
              }`}>
                <div className="h-12 rounded-lg bg-border-strong flex flex-col items-center justify-center">
                  <span className="text-text-primary text-value-sm">{stage.freeReward.icon}</span>
                  <span className="text-text-muted text-mini">{stage.freeReward.amount}</span>
                </div>
                {stage.claimed && (
                  <div className="absolute top-1 left-1 w-5 h-5 bg-bg-inverse rounded-full flex items-center justify-center">
                    <span className="text-text-inverse text-mini">[check]</span>
                  </div>
                )}
              </div>

              {/* Stage Number */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stage.unlocked
                  ? 'bg-bg-inverse'
                  : 'bg-border-strong'
              }`}>
                <span className={`text-value ${stage.unlocked ? 'text-text-inverse' : 'text-text-muted'}`}>
                  {stage.stage}
                </span>
              </div>

              {/* Premium Reward */}
              <div className={`flex-1 rounded-xl p-2 border relative ${
                isActivated && stage.claimed
                  ? 'bg-bg-card border-bg-inverse'
                  : isActivated && stage.unlocked
                    ? 'bg-bg-card border-border-strong'
                    : 'bg-bg-muted border-border opacity-50'
              }`}>
                <div className={`h-12 rounded-lg flex flex-col items-center justify-center ${
                  isActivated ? 'bg-border-strong' : 'bg-border-strong'
                }`}>
                  <span className={`text-value-sm ${isActivated ? 'text-text-primary' : 'text-text-muted'}`}>
                    {stage.premiumReward.icon}
                  </span>
                  <span className={`text-mini ${isActivated ? 'text-text-secondary' : 'text-text-muted'}`}>
                    {stage.premiumReward.amount}
                  </span>
                </div>
                {!isActivated && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-border-strong rounded flex items-center justify-center">
                    <span className="text-text-muted text-mini">[lock]</span>
                  </div>
                )}
                {isActivated && stage.claimed && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-bg-inverse rounded-full flex items-center justify-center">
                    <span className="text-text-inverse text-mini">[check]</span>
                  </div>
                )}
              </div>

              {/* Connection Line */}
              {index < passData.stages.length - 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-2 bg-border-strong" />
              )}
            </div>
          ))}

          {/* Unlock Message */}
          {passData.stages.some(s => !s.unlocked) && (
            <div className="mt-2 bg-bg-card rounded-lg px-3 py-2 border border-border">
              <p className="text-text-primary text-caption text-center">
                Collect more keys to unlock rewards!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activate Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative w-full max-w-[320px] mx-4 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowActivateModal(false)}
              className="absolute top-2 right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center z-10 border border-border"
            >
              <span className="text-text-inverse font-bold text-caption">X</span>
            </button>

            <div className="bg-bg-inverse py-4 px-3">
              <h2 className="text-text-inverse text-h2 text-center">Activate Royal Pass</h2>
            </div>

            <div className="bg-bg-muted p-4">
              <p className="text-text-primary text-center text-value mb-4">
                Unlock premium rewards and exclusive bonuses!
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 bg-bg-card rounded-xl p-3 border border-border">
                  <div className="w-12 h-12 bg-bg-inverse rounded-xl flex items-center justify-center border border-border">
                    <span className="text-text-inverse text-h3">8</span>
                  </div>
                  <span className="text-text-primary text-body">8 lives instead of 5</span>
                </div>
                <div className="flex items-center gap-3 bg-bg-card rounded-xl p-3 border border-border">
                  <div className="w-12 h-12 bg-bg-inverse rounded-xl flex items-center justify-center border border-border">
                    <span className="text-text-inverse text-value-sm">VIP</span>
                  </div>
                  <span className="text-text-primary text-body">Exclusive profile frame</span>
                </div>
                <div className="flex items-center gap-3 bg-bg-card rounded-xl p-3 border border-border">
                  <div className="w-12 h-12 bg-bg-inverse rounded-xl flex items-center justify-center border border-border">
                    <span className="text-text-inverse text-value-sm">GFT</span>
                  </div>
                  <span className="text-text-primary text-body">Gift for teammates</span>
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <div className="bg-bg-card rounded-full px-4 py-1.5 border border-border">
                  <span className="text-text-primary text-caption">Ends in {timer.days}d {timer.hours}h</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsActivated(true);
                  setShowActivateModal(false);
                }}
                className="w-full py-4 bg-bg-inverse rounded-xl border border-border"
              >
                <span className="text-text-inverse text-h3">{passData.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative w-full max-w-[320px] mx-4 rounded-2xl overflow-hidden">
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
                  <p className="text-text-primary text-h4">Beat Levels</p>
                  <p className="text-text-secondary text-caption">Win levels to collect keys</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-bg-inverse rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <span className="text-text-inverse text-value">KEY</span>
                </div>
                <div>
                  <p className="text-text-primary text-h4">Collect Keys</p>
                  <p className="text-text-secondary text-caption">Keys unlock reward stages</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-border-strong rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <span className="text-text-primary text-value">GFT</span>
                </div>
                <div>
                  <p className="text-text-primary text-h4">Get Rewards</p>
                  <p className="text-text-secondary text-caption">Claim free and premium rewards</p>
                </div>
              </div>

              <div className="bg-bg-inverse rounded-xl p-3 mb-4 border border-border">
                <p className="text-text-inverse text-caption text-center">
                  Activate the pass to unlock premium rewards!
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
