'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { useTimer } from '@/hooks';

// Player type for leaderboard
interface Player {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  isPlayer: boolean;
}

// Mock data
const lightningRushData = {
  name: 'Lightning Rush',
  duration: 30, // minutes
  endTime: new Date(Date.now() + 20 * 60 * 60 * 1000 + 22 * 1000), // 20:00:22
  currentLeague: 'Silver',
  nextLeague: 'Gold',
  isStarted: false,
  players: [
    { rank: 1, name: 'Reza', avatar: 'R', score: 51, isPlayer: true },
    { rank: 2, name: 'maria', avatar: 'M', score: 40, isPlayer: false },
    { rank: 3, name: 'ksy', avatar: 'K', score: 0, isPlayer: false },
    { rank: 4, name: 'Maiya', avatar: 'M', score: 0, isPlayer: false },
    { rank: 5, name: 'olga', avatar: 'O', score: 0, isPlayer: false },
  ] as Player[],
  rewards: [
    { icon: 'CRD', label: '3 Cards' },
    { icon: 'ORB', label: 'Orb' },
    { icon: 'TNT', label: 'TNT' },
    { icon: 'EGG', label: 'Egg' },
  ],
};

export function LightningRushPage() {
  const { navigate } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<'current' | 'gold'>('current');
  const timer = useTimer(lightningRushData.endTime);

  // Check if event is enabled
  if (!isEventEnabled('lightning-rush')) {
    return (
      <div className="flex flex-col h-full bg-secondary items-center justify-center">
        <p className="text-white text-lg">Event not available</p>
        <button onClick={() => navigate('main-menu')} className="mt-4 text-accent underline">
          Go Back
        </button>
      </div>
    );
  }

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleBackgroundClick = () => {
    if (showInfoModal) {
      setShowInfoModal(false);
    }
  };

  // Render leaderboard (active game screen)
  if (isStarted) {
    return (
      <div className="flex flex-col h-full bg-primary overflow-hidden" onClick={handleBackgroundClick}>
        {/* Header */}
        <div className="relative bg-primary pt-2 pb-3 px-3">
          <button
            onClick={() => navigate('main-menu')}
            className="absolute top-2 right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light z-10"
          >
            <span className="text-white font-bold">X</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShowInfoModal(true); }}
            className="absolute top-2 left-2 w-8 h-8 bg-surface-dark rounded-full flex items-center justify-center border-2 border-surface z-10"
          >
            <span className="text-primary text-sm font-bold">i</span>
          </button>

          <h1 className="text-white text-2xl font-bold text-center mt-1">Lightning Rush</h1>
        </div>

        {/* Scene with rewards */}
        <div className="mx-3 mb-3">
          <div className="bg-secondary rounded-xl p-4 border-2 border-secondary-light">
            {/* Scene Placeholder */}
            <div className="h-32 bg-accent/30 rounded-lg flex items-center justify-center mb-3 border border-accent">
              <span className="text-accent text-sm">[Scene]</span>
            </div>

            {/* Rewards Row */}
            <div className="bg-surface-light rounded-xl p-2 flex justify-center gap-2">
              {lightningRushData.rewards.map((reward, idx) => (
                <div key={idx} className="w-12 h-12 bg-surface rounded-lg flex flex-col items-center justify-center border border-surface-dark">
                  <span className="text-secondary text-[8px] font-bold">{reward.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex-1 mx-3 bg-secondary rounded-xl border-2 border-secondary-light overflow-hidden">
          <div className="space-y-0">
            {lightningRushData.players.map((player, idx) => (
              <div
                key={player.rank}
                className={`flex items-center gap-3 px-3 py-2 ${
                  player.isPlayer
                    ? 'bg-success'
                    : idx % 2 === 0
                      ? 'bg-surface-light'
                      : 'bg-surface'
                }`}
              >
                {/* Rank */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  player.rank === 1 ? 'bg-gold' : player.rank === 2 ? 'bg-surface-dark' : player.rank === 3 ? 'bg-gold-dark' : 'bg-surface-dark'
                }`}>
                  <span className={`text-xs font-bold ${player.rank <= 3 ? 'text-primary' : 'text-white'}`}>{player.rank}</span>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{player.avatar}</span>
                </div>

                {/* Name */}
                <span className={`flex-1 font-bold ${player.isPlayer ? 'text-white' : 'text-primary'}`}>
                  {player.name}
                </span>

                {/* Cards collected indicator */}
                {player.score > 0 && (
                  <div className="bg-accent/30 rounded px-2 py-1">
                    <span className="text-accent text-[8px] font-bold">CARDS</span>
                  </div>
                )}

                {/* Score */}
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-gold rounded flex items-center justify-center">
                    <span className="text-primary text-[10px] font-bold">Z</span>
                  </div>
                  <span className={`font-bold ${player.isPlayer ? 'text-white' : 'text-primary'}`}>{player.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-3 bg-primary" />

        {/* Info Modal */}
        {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
      </div>
    );
  }

  // Render start screen
  return (
    <div className="flex flex-col h-full bg-primary overflow-hidden" onClick={handleBackgroundClick}>
      {/* Header */}
      <div className="relative bg-primary pt-2 pb-3 px-3">
        <button
          onClick={() => navigate('main-menu')}
          className="absolute top-2 right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light z-10"
        >
          <span className="text-white font-bold">X</span>
        </button>

        <h1 className="text-white text-2xl font-bold text-center mt-1">Lightning Rush</h1>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 mx-3 mb-3">
        <div className="bg-secondary rounded-xl p-4 border-2 border-secondary-light h-full flex flex-col">
          {/* Scene with Info Button */}
          <div className="relative mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); setShowInfoModal(true); }}
              className="absolute top-2 left-2 w-8 h-8 bg-surface-dark rounded-full flex items-center justify-center border-2 border-surface z-10"
            >
              <span className="text-primary text-sm font-bold">i</span>
            </button>

            <div className="h-40 bg-accent/30 rounded-xl flex items-center justify-center border-2 border-accent">
              <span className="text-accent">[Scene Placeholder]</span>
            </div>

            {/* Timer */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-surface-light rounded-full px-4 py-1 flex items-center gap-2 border-2 border-surface">
              <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                <span className="text-primary text-[8px] font-bold">T</span>
              </div>
              <span className="text-primary font-bold">{timer.hours}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          {/* League Selection */}
          <div className="flex gap-3 mb-4">
            {/* Current League */}
            <button
              onClick={() => setSelectedLeague('current')}
              className={`flex-1 p-3 rounded-xl border-2 ${
                selectedLeague === 'current'
                  ? 'bg-accent/20 border-gold'
                  : 'bg-surface-dark border-surface'
              }`}
            >
              <div className="w-12 h-12 mx-auto bg-accent rounded-xl flex items-center justify-center mb-1">
                <span className="text-white text-lg font-bold">Z</span>
              </div>
            </button>

            {/* Gold League */}
            <button
              onClick={() => setSelectedLeague('gold')}
              className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center ${
                selectedLeague === 'gold'
                  ? 'bg-gold/20 border-gold'
                  : 'bg-surface-dark border-surface'
              }`}
            >
              <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center mb-1">
                <span className="text-primary text-lg font-bold">Z</span>
              </div>
              <span className="text-primary text-sm font-bold">Gold</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-surface-light text-center text-sm mb-4">
            Compete with players for 30 minutes! Win amazing rewards and advance to Gold Lightning Rush!
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-success rounded-xl border-2 border-success-light flex items-center justify-center gap-2"
          >
            <span className="text-white text-xl font-bold">Start</span>
            <div className="w-8 h-8 bg-error rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">INF</span>
            </div>
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
    </div>
  );
}

// Info Modal Component
function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      <div className="relative w-[320px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-1 -right-1 w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light z-10 shadow-lg"
        >
          <span className="text-white font-bold text-sm">X</span>
        </button>

        {/* Header */}
        <div className="bg-primary-light rounded-t-2xl py-3 px-3">
          <h1 className="text-white text-xl font-bold text-center">Lightning Rush</h1>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-secondary-light" />

        {/* Content */}
        <div className="bg-secondary-light p-4">
          {/* Step 1: Activate Light Balls */}
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto bg-surface-light rounded-xl mb-2 flex items-center justify-center border-2 border-surface">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded ${i === 0 ? 'bg-gold' : 'bg-accent'}`} />
                ))}
              </div>
            </div>
            <p className="text-primary text-lg font-bold">Activate Light Balls!</p>
          </div>

          {/* Arrow */}
          <div className="text-center text-gold text-2xl mb-4">v</div>

          {/* Step 2: Collect Lightning Bolts */}
          <div className="text-center mb-4">
            <div className="w-40 mx-auto bg-surface-light rounded-xl p-2 mb-2 border-2 border-surface">
              <div className="space-y-1">
                {[{ name: 'Robert', score: 200 }, { name: 'Duke', score: 80 }, { name: 'Butler', score: 10 }].map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${i === 0 ? 'bg-gold' : 'bg-surface-dark'}`}>
                      <span className="text-primary text-[8px] font-bold">{i + 1}</span>
                    </span>
                    <span className="text-primary flex-1">{p.name}</span>
                    <span className="text-gold font-bold">Z</span>
                    <span className="text-primary font-bold">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-primary text-sm font-bold">Collect more Lightning Bolts than other players!</p>
          </div>

          {/* Arrow */}
          <div className="text-center text-gold text-2xl mb-4">v</div>

          {/* Step 3: Win Rewards */}
          <div className="text-center mb-4">
            <p className="text-primary text-sm font-bold mb-2">Win amazing rewards and advance to Gold Lightning Rush!</p>
            <div className="flex justify-center items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <span className="text-primary font-bold">&gt;</span>
              <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-primary text-lg font-bold">Z</span>
              </div>
            </div>
          </div>

          {/* Unlimited Lives Note */}
          <div className="bg-surface-dark rounded-xl p-3 border-2 border-surface">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">INF</span>
              </div>
              <p className="text-primary text-sm">
                You will have unlimited lives during 30 minutes long competition!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="bg-secondary px-4 pb-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gold rounded-xl border-2 border-gold-light"
          >
            <span className="text-primary text-lg font-bold">Tap to Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
