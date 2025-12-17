'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/store';

interface ChangeUsernameModalProps {
  onAnimatedClose?: () => void;
}

export function ChangeUsernameModal({ onAnimatedClose }: ChangeUsernameModalProps) {
  const { closeModal } = useNavigation();
  const [username, setUsername] = useState('');

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleContinue = () => {
    // In real app, would save the username
    handleClose();
  };

  return (
    <div className="relative w-[300px] bg-brand-muted rounded-2xl border-4 border-border-strong overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h2">Change Username</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-status-error rounded-full flex items-center justify-center border-2 border-error-light"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      </div>

        {/* Content */}
        <div className="p-4">
          {/* Warning Text */}
          <p className="text-text-primary text-center font-bold mb-4">
            You have one chance to change your username!
          </p>

          {/* Input Field */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Type your new username..."
            className="w-full bg-bg-muted rounded-xl px-4 py-3 text-text-primary placeholder-text-muted border-2 border-bg-page focus:outline-none focus:border-bg-card mb-4"
          />

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!username.trim()}
            className={`w-full rounded-xl py-4 border-2 transition-colors ${
              username.trim()
                ? 'bg-border-strong border-border hover:bg-bg-muted'
                : 'bg-bg-inverse border-brand-muted cursor-not-allowed'
            }`}
          >
          <span className={`text-h3 ${username.trim() ? 'text-text-primary' : 'text-text-muted'}`}>
            Continue
          </span>
        </button>
      </div>
    </div>
  );
}
