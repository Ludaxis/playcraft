'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { useTimer } from '@/hooks';

// Mission types
interface Mission {
  id: number;
  title: string;
  current: number;
  target: number;
  capsuleReward: number;
  completed: boolean;
}

interface Stage {
  id: number;
  name: string;
  missions: Mission[];
  capsuleColor: string;
  capsuleColorClass: string;
}

// Mock data for Mission Control
const missionControlData = {
  name: 'Mission Control',
  endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 2d 20h
  stages: [
    {
      id: 1,
      name: 'Stage 1',
      capsuleColor: 'Blue',
      capsuleColorClass: 'bg-bg-inverse',
      missions: [
        { id: 1, title: 'Complete 8 Steps!', current: 0, target: 8, capsuleReward: 3, completed: false },
        { id: 2, title: 'Collect 10 Cards!', current: 0, target: 10, capsuleReward: 3, completed: false },
        { id: 3, title: 'Find 4 Formulas!', current: 0, target: 4, capsuleReward: 2, completed: false },
        { id: 4, title: 'Win 1 Super Hard Level!', current: 0, target: 1, capsuleReward: 2, completed: false },
      ],
    },
    {
      id: 2,
      name: 'Stage 2',
      capsuleColor: 'Green',
      capsuleColorClass: 'bg-border-strong',
      missions: [
        { id: 1, title: 'Complete 15 Steps!', current: 0, target: 15, capsuleReward: 3, completed: false },
        { id: 2, title: 'Collect 20 Cards!', current: 0, target: 20, capsuleReward: 3, completed: false },
        { id: 3, title: 'Find 6 Formulas!', current: 0, target: 6, capsuleReward: 2, completed: false },
        { id: 4, title: 'Win 2 Super Hard Levels!', current: 0, target: 2, capsuleReward: 2, completed: false },
      ],
    },
    {
      id: 3,
      name: 'Stage 3',
      capsuleColor: 'Yellow',
      capsuleColorClass: 'bg-bg-muted',
      missions: [
        { id: 1, title: 'Collect 60 Cards!', current: 0, target: 60, capsuleReward: 3, completed: false },
        { id: 2, title: 'Find 10 Formulas!', current: 0, target: 10, capsuleReward: 3, completed: false },
        { id: 3, title: 'Win 7 Super Hard Levels!', current: 0, target: 7, capsuleReward: 2, completed: false },
      ],
    },
    {
      id: 4,
      name: 'Stage 4',
      capsuleColor: 'Red',
      capsuleColorClass: 'bg-bg-page',
      missions: [
        { id: 1, title: 'Collect 60 Cards!', current: 0, target: 60, capsuleReward: 3, completed: false },
        { id: 2, title: 'Find 10 Formulas!', current: 0, target: 10, capsuleReward: 3, completed: false },
        { id: 3, title: 'Win 7 Super Hard Levels!', current: 0, target: 7, capsuleReward: 2, completed: false },
      ],
    },
  ] as Stage[],
  grandPrizeRewards: [
    { icon: 'CRD', label: '3 Cards' },
    { icon: 'CNS', label: '200' },
    { icon: 'BST', label: 'Booster' },
  ],
};

export function MissionControlPage() {
  const { navigate } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const [activeStage, setActiveStage] = useState(1);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const timer = useTimer(missionControlData.endTime);

  // Check if event is enabled
  if (!isEventEnabled('mission-control')) {
    return (
      <div className="flex flex-col h-full bg-bg-inverse items-center justify-center">
        <p className="text-text-inverse text-value">Event not available</p>
        <button onClick={() => navigate('main-menu')} className="mt-4 text-brand-primary underline">
          Go Back
        </button>
      </div>
    );
  }

  const currentStage = missionControlData.stages.find(s => s.id === activeStage) || missionControlData.stages[0];

  // Close info modal when clicking background
  const handleBackgroundClick = () => {
    if (showInfoModal) {
      setShowInfoModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-inverse overflow-hidden" onClick={handleBackgroundClick}>
      {/* Header */}
      <div className="relative bg-bg-inverse pt-2 pb-3 px-3">
        {/* Close Button */}
        <button
          onClick={() => navigate('main-menu')}
          className="absolute top-2 right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border z-10 hover:opacity-80"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>

        {/* Info Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInfoModal(true);
          }}
          className="absolute top-2 left-2 w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border-2 border-border z-10"
        >
          <span className="text-text-primary text-value">i</span>
        </button>

        {/* Title */}
        <h1 className="text-text-inverse text-h1 text-center mt-1">Mission Control</h1>
      </div>

      {/* Grand Prize Section */}
      <div className="mx-3 mb-3">
        <div className="bg-bg-inverse rounded-xl p-3 border-2 border-border">
          {/* Grand Prize Label */}
          <div className="text-center mb-2">
            <span className="bg-bg-inverse text-text-inverse text-value-sm px-3 py-1 rounded-full border border-border">Grand Prize</span>
          </div>

          {/* Prize Chest */}
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 bg-bg-inverse rounded-xl flex items-center justify-center border-2 border-border">
              <span className="text-text-inverse text-value-sm">CHEST</span>
            </div>
          </div>

          {/* Energy Capsules */}
          <div className="flex justify-center gap-2 mb-3">
            <div className="w-10 h-10 bg-bg-inverse rounded-lg flex items-center justify-center border-2 border-border">
              <span className="text-text-inverse text-mini font-bold">B</span>
            </div>
            <div className="w-10 h-10 bg-border-strong rounded-lg flex items-center justify-center border-2 border-border">
              <span className="text-text-primary text-mini font-bold">G</span>
            </div>
            <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center border-2 border-border">
              <span className="text-text-primary text-mini font-bold">Y</span>
            </div>
            <div className="w-10 h-10 bg-bg-page rounded-lg flex items-center justify-center border-2 border-border">
              <span className="text-text-primary text-mini font-bold">R</span>
            </div>
          </div>

          {/* Timer */}
          <div className="flex justify-center">
            <div className="bg-border-strong rounded-full px-3 py-1 flex items-center gap-1">
              <span className="text-text-primary text-mini">T</span>
              <span className="text-text-primary text-value-sm">{timer.days}d {timer.hours}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Preview */}
      <div className="mx-3 mb-3">
        <div className="bg-bg-page rounded-xl p-3 border-2 border-border">
          <p className="text-text-primary text-center text-caption mb-2">
            Collect all <span className="font-bold text-text-primary">{currentStage.capsuleColor.toLowerCase()}</span> energy capsules to win rewards!
          </p>
          <div className="flex justify-center gap-3">
            {missionControlData.grandPrizeRewards.map((reward, idx) => (
              <div key={idx} className="w-12 h-12 bg-bg-muted rounded-lg flex flex-col items-center justify-center border border-border-strong">
                <span className="text-text-primary text-mini font-bold">{reward.icon}</span>
                <span className="text-text-primary text-mini">{reward.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="flex-1 overflow-y-auto mx-3 bg-bg-inverse rounded-t-xl p-3 border-2 border-b-0 border-border">
        <div className="space-y-2">
          {currentStage.missions.map((mission) => (
            <div key={mission.id} className="bg-bg-page rounded-xl p-3 border-2 border-border flex items-center gap-3">
              {/* Mission Icon */}
              <div className="w-10 h-10 bg-bg-inverse rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                <span className="text-text-inverse text-mini font-bold">ICN</span>
              </div>

              {/* Mission Info */}
              <div className="flex-1">
                <p className="text-text-primary text-value">{mission.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-3 bg-border-strong rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bg-inverse rounded-full"
                      style={{ width: `${(mission.current / mission.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-text-primary text-value-sm">{mission.current}/{mission.target}</span>
                </div>
              </div>

              {/* Capsule Rewards */}
              <div className="flex gap-1 flex-shrink-0">
                {[...Array(mission.capsuleReward)].map((_, idx) => (
                  <div key={idx} className={`w-6 h-8 ${currentStage.capsuleColorClass} rounded flex items-center justify-center border border-border`}>
                    <span className="text-text-primary text-mini font-bold">C</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="mx-3 bg-bg-inverse rounded-b-xl border-2 border-t-0 border-border">
        <div className="flex">
          {missionControlData.stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`flex-1 py-3 text-value ${
                activeStage === stage.id
                  ? 'bg-bg-inverse text-text-inverse'
                  : 'bg-bg-muted text-text-primary'
              } ${stage.id === 1 ? 'rounded-bl-xl' : ''} ${stage.id === missionControlData.stages.length ? 'rounded-br-xl' : ''}`}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-3 bg-bg-inverse" />

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full max-w-[320px] mx-4">
            {/* Close button */}
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute -top-1 -right-1 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border z-10 hover:opacity-80"
            >
              <span className="text-text-inverse font-bold text-caption">X</span>
            </button>

            {/* Header */}
            <div className="bg-bg-inverse rounded-t-2xl py-3 px-3">
              <h1 className="text-text-inverse text-h2 text-center">Mission Control</h1>
            </div>

            {/* Divider line */}
            <div className="h-0.5 bg-border-strong" />

            {/* Content */}
            <div className="bg-bg-muted p-4">
              {/* Step 1: Complete Missions */}
              <div className="text-center mb-4">
                <div className="w-48 mx-auto bg-bg-page rounded-xl p-2 mb-2 border-2 border-border">
                  <div className="space-y-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-bg-inverse rounded flex items-center justify-center border border-border">
                          <span className="text-text-inverse text-mini">ICN</span>
                        </div>
                        <div className="flex-1 h-2 bg-bg-inverse rounded-full" />
                        <span className="text-text-primary text-value-sm">V</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-text-primary text-h3">Complete Missions!</p>
              </div>

              {/* Arrow */}
              <div className="text-center text-text-primary text-h2 mb-4">v</div>

              {/* Step 2: Collect Energy Capsules */}
              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-16 bg-bg-inverse rounded-lg flex items-center justify-center border-2 border-border">
                    <span className="text-text-inverse text-value-sm">CAP</span>
                  </div>
                </div>
                <p className="text-text-primary text-h3">Collect Energy Capsules!</p>
              </div>

              {/* Arrow */}
              <div className="text-center text-text-primary text-h2 mb-4">v</div>

              {/* Step 3: Win Rewards */}
              <div className="text-center mb-4">
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center border border-border">
                    <span className="text-text-primary text-mini">CHEST</span>
                  </div>
                  <div className="w-14 h-14 bg-bg-inverse rounded-lg flex items-center justify-center border-2 border-border">
                    <span className="text-text-inverse text-mini">PRIZE</span>
                  </div>
                  <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center border border-border">
                    <span className="text-text-primary text-mini">COINS</span>
                  </div>
                </div>
                <p className="text-text-primary text-h3">Win Rewards!</p>
              </div>
            </div>

            {/* Bottom section */}
            <div className="bg-bg-inverse px-4 pb-4 rounded-b-2xl">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 bg-bg-inverse rounded-xl border-2 border-border"
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
