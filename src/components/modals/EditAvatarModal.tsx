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
    <div className="relative w-[320px] bg-slate-500 rounded-2xl border-4 border-slate-400 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-600 py-3 px-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">Choose Avatar</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Current Selection Preview */}
        <div className="p-4 flex justify-center">
          <div className="w-24 h-24 bg-slate-400 rounded-xl border-4 border-slate-300 flex items-center justify-center">
            <span className="text-slate-600 text-2xl font-bold">
              {avatarOptions.find((a) => a.id === selectedAvatar)?.abbr || 'K1'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-1 bg-slate-600 mx-4" />

        {/* Avatar Grid */}
        <div className="p-4 max-h-[240px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                  selectedAvatar === avatar.id
                    ? 'bg-slate-300 border-slate-200 ring-2 ring-slate-200'
                    : 'bg-slate-400 border-slate-350 hover:bg-slate-350'
                }`}
              >
                <span className="text-slate-600 font-bold">{avatar.abbr}</span>
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
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
        <div className="h-1 bg-slate-600 mx-4" />

      {/* Save Button */}
      <div className="p-4">
        <button
          onClick={handleSave}
          className="w-full bg-slate-400 hover:bg-slate-350 rounded-xl py-3 border-2 border-slate-300"
        >
          <span className="text-slate-700 font-bold">Save</span>
        </button>
      </div>
    </div>
  );
}
