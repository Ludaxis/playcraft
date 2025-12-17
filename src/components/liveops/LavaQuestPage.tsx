'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/store';

type LavaQuestState = 'start' | 'finding-players' | 'playing' | 'advanced' | 'completed' | 'win';

export function LavaQuestPage() {
  const { navigate } = useNavigation();
  const [gameState, setGameState] = useState<LavaQuestState>('start');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [playersRemaining, setPlayersRemaining] = useState(100);
  const [timer] = useState('23:59:52');

  const handleStart = () => {
    setGameState('finding-players');
  };

  const handleFindingComplete = () => {
    setGameState('playing');
  };

  const handleAdvance = () => {
    if (currentLevel < 7) {
      setCurrentLevel(currentLevel + 1);
      // Simulate players being eliminated
      const newPlayers = Math.max(12, playersRemaining - Math.floor(Math.random() * 15 + 5));
      setPlayersRemaining(newPlayers);

      if (currentLevel + 1 === 7) {
        setGameState('completed');
      } else {
        setGameState('advanced');
      }
    }
  };

  const handleContinue = () => {
    if (gameState === 'completed') {
      setGameState('win');
    } else {
      setGameState('playing');
    }
  };

  const handleClaim = () => {
    navigate('main-menu');
  };

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="flex flex-col h-full bg-bg-inverse">
        {/* Header */}
        <div className="bg-bg-inverse py-4 px-4 flex items-center justify-between">
          <div className="w-8" />
          <h1 className="text-text-inverse text-h1">Lava Quest</h1>
          <button onClick={() => navigate('main-menu')} className="w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border border-border">
            <span className="text-text-inverse font-bold">X</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Event Image Placeholder */}
          <div className="w-64 h-64 bg-bg-muted rounded-2xl border-4 border-border-strong flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-border-strong rounded-xl mx-auto mb-2 flex items-center justify-center">
                <span className="text-text-primary text-value-sm">PRIZE</span>
              </div>
              <span className="text-text-muted text-value">[Event Image]</span>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-border-strong rounded-full flex items-center justify-center border border-border">
              <span className="text-text-primary text-mini">T</span>
            </div>
            <span className="text-text-inverse font-bold text-value">{timer}</span>
          </div>

          {/* Description */}
          <p className="text-text-inverse text-center mb-2 font-bold">Lava Quest has started!</p>
          <p className="text-text-muted text-center mb-8">Beat 7 levels to complete the challenge!</p>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="bg-border-strong border-4 border-border rounded-xl px-16 py-4"
          >
            <span className="text-text-primary font-bold text-h2">Start</span>
          </button>
        </div>
      </div>
    );
  }

  // Finding Players Screen
  if (gameState === 'finding-players') {
    return (
      <div className="flex flex-col h-full bg-bg-inverse">
        {/* Header */}
        <div className="bg-bg-inverse py-4 px-4">
          <h1 className="text-text-inverse text-h1 text-center">Lava Quest</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Treasure Chest */}
          <div className="w-48 h-32 bg-bg-muted rounded-xl border-4 border-border-strong flex items-center justify-center mb-4">
            <div className="text-center">
              <span className="text-text-muted text-value-sm">Grand Prize</span>
              <p className="text-text-primary font-bold text-value">10,000</p>
            </div>
          </div>

          {/* Coins pile placeholder */}
          <div className="w-64 h-24 bg-bg-muted rounded-full mb-8 border border-border" />

          {/* Finding players */}
          <div className="bg-bg-muted rounded-xl px-8 py-4 mb-8 border border-border">
            <p className="text-text-primary text-center font-bold mb-2">Finding players on your level</p>
            <p className="text-text-primary text-center text-h1">100/100</p>
          </div>

          {/* Player cards pile */}
          <div className="w-48 h-32 bg-bg-muted rounded-xl flex items-center justify-center mb-8 border border-border">
            <span className="text-text-muted font-bold">[Player Cards]</span>
          </div>

          {/* Tap to Continue */}
          <button onClick={handleFindingComplete} className="text-text-muted font-bold text-value">
            Tap to Continue
          </button>
        </div>
      </div>
    );
  }

  // Win Screen
  if (gameState === 'win') {
    return (
      <div className="flex flex-col h-full bg-bg-inverse">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Congratulations */}
          <h1 className="text-text-inverse text-h1 font-bold mb-8">Congratulations!</h1>

          {/* Treasure Chest */}
          <div className="w-48 h-32 bg-bg-muted rounded-xl border-4 border-border-strong flex items-center justify-center mb-4">
            <div className="text-center">
              <span className="text-text-muted text-value-sm">Grand Prize</span>
              <p className="text-text-primary font-bold text-value">10,000</p>
            </div>
          </div>

          {/* Coins pile */}
          <div className="w-64 h-24 bg-bg-muted rounded-full mb-8 border border-border" />

          {/* You Win */}
          <p className="text-text-inverse font-bold mb-2">You win</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-border-strong rounded-full border border-border" />
            <span className="text-text-inverse text-h1 font-bold">1120</span>
          </div>

          {/* Player avatar */}
          <div className="w-16 h-16 bg-bg-muted rounded-xl border-2 border-border-strong mb-4 flex items-center justify-center">
            <span className="text-text-muted text-mini">AVA</span>
          </div>

          {/* Sharing message */}
          <p className="text-text-muted text-center mb-8">
            You are sharing the reward with 8 other winners!
          </p>

          {/* Winner avatars */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 bg-bg-muted rounded-lg border border-border" />
            ))}
          </div>

          {/* Tap to Claim */}
          <button onClick={handleClaim} className="text-text-inverse font-bold text-value">
            Tap to Claim
          </button>
        </div>
      </div>
    );
  }

  // Main Game Screen (playing, advanced, completed)
  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-between">
        <button className="w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border border-border">
          <span className="text-text-primary font-bold text-caption">i</span>
        </button>
        <h1 className="text-text-inverse text-h2">Lava Quest</h1>
        <button onClick={() => navigate('main-menu')} className="w-8 h-8 bg-border-strong rounded-full flex items-center justify-center border border-border">
          <span className="text-text-primary font-bold">X</span>
        </button>
      </div>

      {/* Status Message */}
      <div className="bg-bg-muted py-2 px-4 text-center border-y border-border">
        {gameState === 'completed' ? (
          <p className="text-text-primary font-bold">Congratulations! You completed the challenge!</p>
        ) : gameState === 'advanced' ? (
          <p className="text-text-primary font-bold">Congratulations! You advanced to the next step!</p>
        ) : (
          <p className="text-text-primary font-bold">Beat 7 levels to complete the challenge!</p>
        )}
      </div>

      {/* Stats Panel */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          {/* Levels */}
          <div className="flex-1 bg-border-strong rounded-xl border-2 border-border py-2 px-4">
            <p className="text-text-primary text-mini text-center">Levels</p>
            <p className="text-text-primary text-h2 text-center">{currentLevel}/7</p>
          </div>

          {/* Treasure Icon */}
          <div className="w-16 h-16 bg-bg-muted rounded-xl border-2 border-border-strong flex items-center justify-center">
            <span className="text-text-muted text-value-sm">PRIZE</span>
          </div>

          {/* Players */}
          <div className="flex-1 bg-border-strong rounded-xl border-2 border-border py-2 px-4">
            <p className="text-text-primary text-mini text-center">Players</p>
            <p className="text-text-primary text-h2 text-center">{playersRemaining}/100</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2 bg-bg-muted rounded-full px-4 py-1 border border-border">
            <div className="w-5 h-5 bg-border-strong rounded-full flex items-center justify-center">
              <span className="text-text-primary text-mini">T</span>
            </div>
            <span className="text-text-primary font-bold">{timer}</span>
          </div>
        </div>
      </div>

      {/* Lava Arena */}
      <div className="flex-1 bg-bg-muted relative overflow-hidden">
        {/* Central Island with Prize */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-24 bg-border-strong rounded-full flex items-center justify-center border-4 border-border">
            <div className="text-center">
              <div className="w-12 h-10 bg-bg-muted rounded mx-auto mb-1 flex items-center justify-center border border-border">
                <span className="text-text-muted text-mini">CHEST</span>
              </div>
              <span className="text-text-primary text-value-sm">Grand Prize</span>
            </div>
          </div>
        </div>

        {/* Rock Platforms with Players */}
        <div className="absolute top-8 left-8">
          <div className="w-16 h-12 bg-bg-page rounded-lg flex items-center justify-center border border-border">
            {currentLevel < 3 && <div className="w-8 h-8 bg-border-strong rounded border-2 border-border" />}
          </div>
        </div>
        <div className="absolute top-16 right-12">
          <div className="w-14 h-10 bg-bg-page rounded-lg flex items-center justify-center border border-border">
            {currentLevel < 5 && <div className="w-8 h-8 bg-border-strong rounded border-2 border-border" />}
          </div>
        </div>
        <div className="absolute bottom-32 left-6">
          <div className="w-16 h-12 bg-bg-page rounded-lg flex items-center justify-center border border-border">
            {currentLevel < 4 && <div className="w-8 h-8 bg-border-strong rounded border-2 border-border" />}
          </div>
        </div>
        <div className="absolute bottom-24 right-8">
          <div className="w-14 h-10 bg-bg-page rounded-lg flex items-center justify-center border border-border">
            {currentLevel < 6 && <div className="w-8 h-8 bg-border-strong rounded border-2 border-border" />}
          </div>
        </div>
        <div className="absolute top-1/3 left-4">
          <div className="w-12 h-10 bg-bg-page rounded-lg flex items-center justify-center border border-border">
            {currentLevel < 2 && <div className="w-6 h-6 bg-border-strong rounded border-2 border-border" />}
          </div>
        </div>
        <div className="absolute top-1/3 right-6">
          <div className="w-12 h-10 bg-bg-page rounded-lg flex items-center justify-center border border-border">
            {currentLevel < 7 && <div className="w-6 h-6 bg-border-strong rounded border-2 border-border" />}
          </div>
        </div>

        {/* Lava effect - slate lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 right-0 h-2 bg-border-strong opacity-30" />
          <div className="absolute top-2/3 left-0 right-0 h-2 bg-border-strong opacity-30" />
        </div>
      </div>

      {/* Bottom Action */}
      <div className="bg-bg-inverse py-4 px-4">
        {gameState === 'playing' ? (
          <button
            onClick={handleAdvance}
            className="w-full bg-border-strong border-4 border-border rounded-xl py-3"
          >
            <span className="text-text-primary font-bold text-h3">Play Level</span>
          </button>
        ) : (
          <button onClick={handleContinue} className="w-full py-3">
            <span className="text-text-muted font-bold text-value">Tap to Continue</span>
          </button>
        )}
      </div>
    </div>
  );
}
