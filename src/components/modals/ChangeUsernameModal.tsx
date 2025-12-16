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
    <div className="relative w-[300px] bg-secondary-light rounded-2xl border-4 border-surface-dark overflow-hidden">
      {/* Header */}
      <div className="bg-secondary py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-white text-xl font-bold">Change Username</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Content */}
        <div className="p-4">
          {/* Warning Text */}
          <p className="text-white text-center font-bold mb-4">
            You have one chance to change your username!
          </p>

          {/* Input Field */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Type your new username..."
            className="w-full bg-surface rounded-xl px-4 py-3 text-primary-light placeholder-secondary-light border-2 border-surface-light focus:outline-none focus:border-surface-lighter mb-4"
          />

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!username.trim()}
            className={`w-full rounded-xl py-4 border-2 transition-colors ${
              username.trim()
                ? 'bg-surface-dark border-surface hover:bg-surface'
                : 'bg-secondary border-secondary-light cursor-not-allowed'
            }`}
          >
          <span className={`text-lg font-bold ${username.trim() ? 'text-primary-light' : 'text-surface-dark'}`}>
            Continue
          </span>
        </button>
      </div>
    </div>
  );
}
