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
    <div className="relative w-[300px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h2">Change Username</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary font-bold">X</span>
        </button>
      </div>

        {/* Content */}
        <div className="p-4 bg-bg-card">
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
            className="w-full bg-bg-page rounded-xl px-4 py-3 text-text-primary placeholder-text-muted border border-border focus:outline-none focus:border-bg-inverse mb-4"
          />

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!username.trim()}
            className={`w-full rounded-xl py-4 border transition-colors ${
              username.trim()
                ? 'bg-bg-muted border-border hover:bg-bg-page'
                : 'bg-bg-page border-border cursor-not-allowed'
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
