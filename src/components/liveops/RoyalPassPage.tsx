'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useNavigation, useAdmin } from '@/store';
import { useTimer } from '@/hooks';

// Royal Pass reward types
type RewardType = 'coins' | 'booster' | 'lives' | 'chest' | 'card' | 'gift';

interface Reward {
  type: RewardType;
  amount: number | string;
  icon: string;
}

interface PassStage {
  stage: number;
  keysRequired: number;
  freeReward: Reward;
  premiumReward: Reward;
  claimed: boolean;
  unlocked: boolean;
}

// Mock data for Royal Pass
const passData = {
  name: 'Royal Pass',
  endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 15d 20h
  currentKeys: 4,
  maxKeys: 15,
  currentStage: 12,
  isActivated: false,
  price: '$14.98',
  stages: [
    { stage: 1, keysRequired: 0, freeReward: { type: 'booster', amount: 'x1', icon: 'TNT' }, premiumReward: { type: 'chest', amount: '', icon: 'GFT' }, claimed: true, unlocked: true },
    { stage: 2, keysRequired: 1, freeReward: { type: 'booster', amount: 'x1', icon: 'ORB' }, premiumReward: { type: 'lives', amount: '15m', icon: 'INF' }, claimed: true, unlocked: true },
    { stage: 3, keysRequired: 2, freeReward: { type: 'booster', amount: 'x1', icon: 'BLL' }, premiumReward: { type: 'gift', amount: 'x1', icon: 'GFT' }, claimed: false, unlocked: true },
    { stage: 4, keysRequired: 3, freeReward: { type: 'coins', amount: 100, icon: 'CNS' }, premiumReward: { type: 'booster', amount: 'x2', icon: 'JST' }, claimed: false, unlocked: true },
    { stage: 5, keysRequired: 4, freeReward: { type: 'card', amount: 'x1', icon: 'CRD' }, premiumReward: { type: 'chest', amount: 'x1', icon: 'CHT' }, claimed: false, unlocked: true },
    { stage: 6, keysRequired: 5, freeReward: { type: 'booster', amount: 'x1', icon: 'ARW' }, premiumReward: { type: 'lives', amount: '30m', icon: 'INF' }, claimed: false, unlocked: false },
    { stage: 7, keysRequired: 6, freeReward: { type: 'coins', amount: 150, icon: 'CNS' }, premiumReward: { type: 'booster', amount: 'x3', icon: 'TNT' }, claimed: false, unlocked: false },
    { stage: 8, keysRequired: 7, freeReward: { type: 'booster', amount: 'x1', icon: 'HAM' }, premiumReward: { type: 'gift', amount: 'x1', icon: 'GFT' }, claimed: false, unlocked: false },
    { stage: 9, keysRequired: 8, freeReward: { type: 'card', amount: 'x1', icon: 'CRD' }, premiumReward: { type: 'chest', amount: 'x1', icon: 'CHT' }, claimed: false, unlocked: false },
    { stage: 10, keysRequired: 9, freeReward: { type: 'coins', amount: 200, icon: 'CNS' }, premiumReward: { type: 'lives', amount: '1h', icon: 'INF' }, claimed: false, unlocked: false },
    { stage: 11, keysRequired: 10, freeReward: { type: 'booster', amount: 'x1', icon: 'GLV' }, premiumReward: { type: 'booster', amount: 'x3', icon: 'ARW' }, claimed: false, unlocked: false },
    { stage: 12, keysRequired: 11, freeReward: { type: 'chest', amount: 'x1', icon: 'CHT' }, premiumReward: { type: 'gift', amount: 'x2', icon: 'GFT' }, claimed: false, unlocked: false },
    { stage: 13, keysRequired: 12, freeReward: { type: 'coins', amount: 300, icon: 'CNS' }, premiumReward: { type: 'chest', amount: 'x1', icon: 'PRE' }, claimed: false, unlocked: false },
    { stage: 14, keysRequired: 13, freeReward: { type: 'booster', amount: 'x2', icon: 'TNT' }, premiumReward: { type: 'lives', amount: '2h', icon: 'INF' }, claimed: false, unlocked: false },
    { stage: 15, keysRequired: 14, freeReward: { type: 'chest', amount: 'x1', icon: 'PRE' }, premiumReward: { type: 'chest', amount: 'x1', icon: 'LEG' }, claimed: false, unlocked: false },
  ] as PassStage[],
};

export function RoyalPassPage() {
  const { navigate, openModal } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const [activeTab, setActiveTab] = useState<'free' | 'premium'>('free');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isActivated, setIsActivated] = useState(passData.isActivated);
  const [selectedClaimedReward, setSelectedClaimedReward] = useState<number | null>(null);
  const timer = useTimer(passData.endTime);

  // Close tooltip when clicking outside
  const handleBackgroundClick = () => {
    if (selectedClaimedReward !== null) {
      setSelectedClaimedReward(null);
    }
  };

  // Check if event is enabled
  if (!isEventEnabled('royal-pass')) {
    return (
      <div className="flex flex-col h-full bg-bg-inverse items-center justify-center">
        <p className="text-text-inverse text-lg">Event not available</p>
        <button onClick={() => navigate('main-menu')} className="mt-4 text-brand-primary underline">
          Go Back
        </button>
      </div>
    );
  }

  const handleActivate = () => {
    setShowActivateModal(true);
  };

  const handlePurchase = () => {
    setIsActivated(true);
    setShowActivateModal(false);
  };

  const getRewardBgColor = (type: RewardType, isPremium: boolean) => {
    if (isPremium && !isActivated) return 'bg-border-strong';
    switch (type) {
      case 'coins': return 'bg-gold/20';
      case 'booster': return 'bg-brand-primary/20';
      case 'lives': return 'bg-status-error/20';
      case 'chest': return 'bg-bg-inverse/20';
      case 'card': return 'bg-bg-inverse/20';
      case 'gift': return 'bg-status-success/20';
      default: return 'bg-bg-page';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-inverse overflow-hidden" onClick={handleBackgroundClick}>
      {/* Header Background */}
      <div className="relative bg-bg-inverse pt-2 pb-4">
        {/* Close Button */}
        <button
          onClick={() => navigate('main-menu')}
          className="absolute top-2 right-2 w-8 h-8 bg-status-error rounded-full flex items-center justify-center border-2 border-error-light z-10"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>

        {/* Info Button */}
        <button
          onClick={() => setShowInfoModal(true)}
          className="absolute top-2 left-2 w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border-2 border-border z-10"
        >
          <span className="text-text-primary text-value">i</span>
        </button>

        {/* Decorative Scene Placeholder */}
        <div className="h-24 flex items-center justify-center mb-2">
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-bg-inverse rounded-lg flex items-center justify-center">
              <span className="text-text-muted text-mini">CHEST</span>
            </div>
            <div className="w-14 h-14 bg-gold rounded-lg flex items-center justify-center border-2 border-gold-light">
              <span className="text-text-inverse text-mini">PRIZE</span>
            </div>
            <div className="w-12 h-12 bg-bg-inverse rounded-lg flex items-center justify-center">
              <span className="text-text-muted text-mini">CHEST</span>
            </div>
          </div>
        </div>

        {/* Title and Timer */}
        <div className="text-center mb-3">
          <h1 className="text-text-inverse text-h1">{passData.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
              <span className="text-text-inverse text-mini font-bold">K</span>
            </div>
            <span className="text-text-muted text-body-sm">{timer.days}d {timer.hours}h</span>
          </div>
        </div>

        {/* Progress Bar and Activate */}
        <div className="mx-3 bg-bg-inverse rounded-xl p-2 flex items-center gap-2 border-2 border-brand-muted">
          {/* Key Icon */}
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <span className="text-text-inverse text-value-sm">K</span>
          </div>

          {/* Progress */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-border-strong rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full"
                  style={{ width: `${(passData.currentKeys / passData.maxKeys) * 100}%` }}
                />
              </div>
              <span className="text-text-inverse text-value-sm">{passData.currentKeys}/{passData.maxKeys}</span>
            </div>
          </div>

          {/* Stage Badge */}
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center border-2 border-accent-light">
            <span className="text-text-inverse text-value">{passData.currentStage}</span>
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={isActivated}
            className={`px-4 py-2 rounded-xl font-bold text-sm ${
              isActivated
                ? 'bg-status-success text-text-inverse'
                : 'bg-status-success text-text-inverse border-2 border-success-light'
            }`}
          >
            {isActivated ? 'Active' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-3 mt-3 gap-2">
        <button
          onClick={() => setActiveTab('free')}
          className={`flex-1 py-2 rounded-t-xl font-bold text-sm border-2 border-b-0 ${
            activeTab === 'free'
              ? 'bg-bg-page text-text-primary border-border'
              : 'bg-bg-inverse text-text-muted border-brand-muted'
          }`}
        >
          Free
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex-1 py-2 rounded-t-xl font-bold text-sm border-2 border-b-0 ${
            activeTab === 'premium'
              ? 'bg-gold/20 text-gold border-gold'
              : 'bg-bg-inverse text-text-muted border-brand-muted'
          }`}
        >
          Royal Pass
        </button>
      </div>

      {/* Reward Track */}
      <div className="flex-1 overflow-y-auto bg-brand-primary mx-3 rounded-b-xl p-3 border-2 border-t-0 border-brand-muted">
        <div className="space-y-0">
          {passData.stages.map((stage, index) => (
            <div key={stage.stage} className="relative">
              {/* Connector Line */}
              {index < passData.stages.length - 1 && (
                <div className="absolute left-1/2 top-[60px] bottom-0 w-1 bg-brand-muted -translate-x-1/2 z-0" />
              )}

              <div className="relative z-10 flex items-center gap-2 py-2">
                {/* Free Reward Card */}
                <div
                  onClick={(e) => {
                    if (stage.claimed) {
                      e.stopPropagation();
                      setSelectedClaimedReward(selectedClaimedReward === stage.stage ? null : stage.stage);
                    }
                  }}
                  className={`flex-1 rounded-xl p-2 border-2 relative ${
                    stage.claimed
                      ? 'bg-bg-page border-status-success cursor-pointer'
                      : stage.unlocked
                        ? 'bg-bg-page border-border'
                        : 'bg-border-strong border-border-strong opacity-60'
                  }`}
                >
                  <div className={`h-14 rounded-lg flex flex-col items-center justify-center ${getRewardBgColor(stage.freeReward.type, false)}`}>
                    <span className="text-text-primary text-value-sm">{stage.freeReward.icon}</span>
                    <span className="text-text-primary text-mini">{stage.freeReward.amount}</span>
                  </div>
                  {stage.claimed && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-status-success rounded-full flex items-center justify-center border-2 border-success-light">
                      <span className="text-text-inverse text-value-sm">V</span>
                    </div>
                  )}
                </div>

                {/* Stage Number Diamond */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rotate-45 flex items-center justify-center border-2 ${
                      stage.unlocked
                        ? 'bg-brand-primary border-accent-light'
                        : 'bg-border-strong border-border'
                    }`}
                  >
                    <span className={`-rotate-45 text-value-sm ${stage.unlocked ? 'text-text-inverse' : 'text-text-muted'}`}>
                      {stage.stage}
                    </span>
                  </div>
                </div>

                {/* Premium Reward Card */}
                <div
                  className={`flex-1 rounded-xl p-2 border-2 relative ${
                    isActivated && stage.claimed
                      ? 'bg-gold/10 border-gold'
                      : isActivated && stage.unlocked
                        ? 'bg-gold/10 border-gold/50'
                        : 'bg-border-strong border-border-strong'
                  }`}
                >
                  <div className={`h-14 rounded-lg flex flex-col items-center justify-center ${getRewardBgColor(stage.premiumReward.type, true)}`}>
                    <span className={`text-value-sm ${isActivated ? 'text-text-primary' : 'text-text-muted'}`}>
                      {stage.premiumReward.icon}
                    </span>
                    <span className={`text-mini ${isActivated ? 'text-text-primary' : 'text-text-muted'}`}>
                      {stage.premiumReward.amount}
                    </span>
                  </div>
                  {/* Lock Icon */}
                  {!isActivated && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-gold rounded flex items-center justify-center">
                      <span className="text-text-inverse text-mini font-bold">L</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tooltip for locked stages */}
              {!stage.unlocked && index === passData.stages.findIndex(s => !s.unlocked) && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-bg-page rounded-full px-3 py-1 border border-border z-20">
                  <span className="text-text-primary text-mini font-medium whitespace-nowrap">
                    Collect more keys to unlock!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bonus Bank */}
        <div className="mt-4 bg-bg-inverse rounded-xl p-3 border-2 border-brand-muted">
          <h3 className="text-text-inverse font-bold text-center mb-2">Bonus Bank</h3>
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isActivated ? 'bg-gold/30 border-2 border-gold' : 'bg-border-strong'}`}>
              <span className={`text-2xl ${isActivated ? 'text-gold' : 'text-text-muted'}`}>$</span>
            </div>
            <p className="flex-1 text-text-muted text-xs">
              {isActivated
                ? 'Collect bonus coins at the end of the stages!'
                : 'Activate the Royal Pass to unlock the Bonus Bank at the end of the stages!'}
            </p>
          </div>
        </div>
      </div>

      {/* Tooltip for claimed rewards - rendered as fixed overlay */}
      {selectedClaimedReward !== null && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-bg-page rounded-xl px-4 py-3 border-2 border-bg-inverse shadow-lg w-48 text-center">
            <span className="text-text-primary text-value">This reward has already been collected!</span>
          </div>
          {/* Arrow pointing up */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-bg-inverse" />
        </div>
      )}

      {/* Activate Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative w-[320px]">
            {/* Close button */}
            <button
              onClick={() => setShowActivateModal(false)}
              className="absolute -top-1 -right-1 w-8 h-8 bg-status-error rounded-full flex items-center justify-center border-2 border-error-light z-10 shadow-lg"
            >
              <span className="text-text-inverse font-bold text-sm">X</span>
            </button>

            {/* Header */}
            <div className="bg-brand-hover rounded-t-2xl py-3 px-3 border-b-4 border-gold">
              <h2 className="text-text-inverse text-h1 text-center">{passData.name}</h2>
            </div>

            {/* Divider line */}
            <div className="h-0.5 bg-brand-muted" />

            {/* Content */}
            <div className="bg-brand-muted p-4">
              <div className="bg-border-strong rounded-xl p-4 mb-4 border-2 border-border">
                <p className="text-text-primary text-center text-sm mb-3">
                  The <span className="text-gold font-bold">Royal Pass</span> will give you a chance to get special rewards!
                </p>

                {/* Rewards Preview */}
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-text-inverse text-mini">CHEST</span>
                  </div>
                  <div className="w-14 h-14 bg-gold rounded-lg flex items-center justify-center border-2 border-gold-light">
                    <span className="text-text-inverse text-mini">COINS</span>
                  </div>
                  <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                    <span className="text-text-inverse text-mini">BOOST</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-text-primary text-xs bg-bg-page px-3 py-1 rounded-full">Special Rewards</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-border-strong rounded-xl p-4 mb-4 border-2 border-border">
                <p className="text-text-primary text-center text-value mb-3">
                  Exclusive bonuses until the event ends!
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-status-error rounded-full flex items-center justify-center">
                      <span className="text-text-inverse text-value-sm">8</span>
                    </div>
                    <span className="text-text-primary text-sm">8 lives instead of 5</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                      <span className="text-text-inverse text-mini">VIP</span>
                    </div>
                    <span className="text-text-primary text-sm">Golden profile frame</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-status-success rounded-lg flex items-center justify-center">
                      <span className="text-text-inverse text-mini">GFT</span>
                    </div>
                    <span className="text-text-primary text-sm">Gift for teammates</span>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex justify-center mt-3">
                  <div className="bg-bg-page rounded-full px-3 py-1 flex items-center gap-1">
                    <span className="text-text-primary text-xs">T</span>
                    <span className="text-text-primary text-value-sm">{timer.days}d {timer.hours}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section with purchase button */}
            <div className="bg-bg-inverse px-4 pb-4 rounded-b-2xl">
              <button
                onClick={handlePurchase}
                className="w-full py-4 bg-status-success rounded-xl border-2 border-success-light"
              >
                <span className="text-text-inverse text-h2">{passData.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative w-[320px]">
            {/* Close button */}
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute -top-1 -right-1 w-8 h-8 bg-status-error rounded-full flex items-center justify-center border-2 border-error-light z-10 shadow-lg"
            >
              <span className="text-text-inverse font-bold text-sm">X</span>
            </button>

            {/* Header */}
            <div className="bg-brand-hover rounded-t-2xl py-3 px-3">
              <h1 className="text-text-inverse text-h2 text-center">Royal Pass!</h1>
            </div>

            {/* Divider line */}
            <div className="h-0.5 bg-brand-muted" />

            {/* Content */}
            <div className="bg-brand-muted p-4">
              {/* Step 1: Beat Levels */}
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto bg-bg-page rounded-xl mb-2 flex items-center justify-center border-2 border-border">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-brand-primary rounded" />
                    ))}
                  </div>
                </div>
                <p className="text-text-primary text-h3">Beat Levels!</p>
              </div>

              {/* Arrow */}
              <div className="text-center text-gold text-2xl mb-4">v</div>

              {/* Step 2: Collect Keys */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gold rounded flex items-center justify-center">
                    <span className="text-text-inverse text-value-sm">K</span>
                  </div>
                  <div className="w-24 h-4 bg-bg-inverse rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-status-success rounded-full" />
                  </div>
                  <span className="text-text-primary text-value">3/5</span>
                  <div className="w-6 h-6 bg-brand-primary rotate-45 flex items-center justify-center">
                    <span className="text-text-inverse text-value-sm -rotate-45">4</span>
                  </div>
                </div>
                <p className="text-text-primary text-h3">Collect Keys!</p>
              </div>

              {/* Arrow */}
              <div className="text-center text-gold text-2xl mb-4">v</div>

              {/* Step 3: Unlock Rewards */}
              <div className="text-center mb-4">
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-status-success rounded-lg flex items-center justify-center">
                    <span className="text-text-inverse text-mini">CHEST</span>
                  </div>
                  <div className="w-12 h-12 bg-status-error rounded-lg flex items-center justify-center">
                    <span className="text-text-inverse text-value-sm">8</span>
                  </div>
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                    <span className="text-text-inverse text-mini">COINS</span>
                  </div>
                </div>
                <p className="text-text-primary text-h3">Unlock Rewards!</p>
              </div>
            </div>

            {/* Bottom section */}
            <div className="bg-bg-inverse px-4 pb-4 rounded-b-2xl">
              {/* Activation Note */}
              <div className="bg-border-strong rounded-xl p-3 mb-4 border-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-text-inverse text-value-sm">RP</span>
                  </div>
                  <p className="text-text-primary text-sm">
                    You can activate the <span className="text-gold font-bold">Royal Pass</span> to get additional exclusive rewards!
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 bg-gold rounded-xl border-2 border-gold-light"
              >
                <span className="text-text-inverse text-h3">Tap to Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
