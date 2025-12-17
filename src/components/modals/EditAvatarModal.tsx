'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

// Sample avatar options
const avatarOptions = [
  { id: 1, abbr: 'K1', selected: true },
  { id: 2, abbr: 'K2', selected: false },
  { id: 3, abbr: 'Q1', selected: false },
  { id: 4, abbr: 'Q2', selected: false },
  { id: 5, abbr: 'P1', selected: false },
  { id: 6, abbr: 'P2', selected: false },
  { id: 7, abbr: 'C1', selected: false },
  { id: 8, abbr: 'C2', selected: false },
  { id: 9, abbr: 'N1', selected: false },
  { id: 10, abbr: 'N2', selected: false },
  { id: 11, abbr: 'B1', selected: false },
  { id: 12, abbr: 'B2', selected: false },
];

interface EditAvatarModalProps {
  onAnimatedClose?: () => void;
}

export function EditAvatarModal({ onAnimatedClose }: EditAvatarModalProps) {
  const { closeModal } = useNavigation();
  const [selectedAvatar, setSelectedAvatar] = useState(1);

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleSave = () => {
    // In real app, would save the selected avatar
    handleClose();
  };

  return (
    <div className="relative w-[320px] bg-brand-muted rounded-2xl border-4 border-border-strong overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-between">
        <h2 className="text-text-inverse text-h3">Choose Avatar</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-status-error rounded-full flex items-center justify-center border-2 border-error-light"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      </div>

        {/* Current Selection Preview */}
        <div className="p-4 flex justify-center">
          <div className="w-24 h-24 bg-border-strong rounded-xl border-4 border-border flex items-center justify-center">
            <span className="text-text-secondary text-h1">
              {avatarOptions.find((a) => a.id === selectedAvatar)?.abbr || 'K1'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-1 bg-bg-inverse mx-4" />

        {/* Avatar Grid */}
        <div className="p-4 max-h-[240px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                  selectedAvatar === avatar.id
                    ? 'bg-bg-muted border-bg-page ring-2 ring-bg-page'
                    : 'bg-border-strong border-border hover:bg-bg-muted'
                }`}
              >
                <span className="text-text-secondary font-bold">{avatar.abbr}</span>
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-status-success rounded-full flex items-center justify-center border-2 border-white">
                    <Image
                      src="/icons/Check-Circle.svg"
                      alt="Selected"
                      width={12}
                      height={12}
                      className="invert"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-1 bg-bg-inverse mx-4" />

      {/* Save Button */}
      <div className="p-4">
        <button
          onClick={handleSave}
          className="w-full bg-border-strong hover:bg-bg-muted rounded-xl py-3 border-2 border-border"
        >
          <span className="text-text-primary font-bold">Save</span>
        </button>
      </div>
    </div>
  );
}
