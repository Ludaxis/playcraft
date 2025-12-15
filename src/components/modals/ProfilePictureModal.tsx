'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGame, useNavigation } from '@/store';

// Avatar options
const avatarOptions = [
  { id: 'fb', type: 'facebook', abbr: 'f', label: 'Connect' },
  { id: 1, type: 'avatar', abbr: 'A1' },
  { id: 2, type: 'avatar', abbr: 'A2' },
  { id: 3, type: 'avatar', abbr: 'A3' },
  { id: 4, type: 'avatar', abbr: 'A4' },
  { id: 5, type: 'avatar', abbr: 'A5' },
  { id: 6, type: 'avatar', abbr: 'A6' },
  { id: 7, type: 'avatar', abbr: 'A7' },
  { id: 8, type: 'avatar', abbr: 'A8' },
];

type TabType = 'avatar' | 'frame' | 'name' | 'badge';

interface ProfilePictureModalProps {
  onAnimatedClose?: () => void;
}

export function ProfilePictureModal({ onAnimatedClose }: ProfilePictureModalProps) {
  const { closeModal, openModal } = useNavigation();
  const { state } = useGame();
  const { player } = state;

  const [activeTab, setActiveTab] = useState<TabType>('avatar');
  const [selectedAvatar, setSelectedAvatar] = useState(3);

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleEditUsername = () => {
    // Open Change Username modal on top of this one
    openModal('change-username');
  };

  const handleSave = () => {
    handleClose();
  };

  return (
    <div className="relative w-[320px] bg-slate-500 rounded-2xl border-4 border-slate-400 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-600 py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-white text-xl font-bold">Edit Profile</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Profile Preview Section */}
        <div className="bg-slate-400 mx-3 mt-3 rounded-xl p-3 border-2 border-slate-300">
          <div className="flex items-center gap-3">
            {/* Current Avatar */}
            <div className="w-16 h-16 bg-slate-500 rounded-xl border-2 border-slate-400 flex items-center justify-center">
              <span className="text-slate-300 text-lg font-bold">A{selectedAvatar}</span>
            </div>

            {/* Username with Edit */}
            <div className="flex-1 bg-slate-300 rounded-lg px-3 py-2 flex items-center justify-between border-2 border-slate-200">
              <span className="text-slate-700 font-bold">{player.username}</span>
              <button
                onClick={handleEditUsername}
                className="w-7 h-7 bg-slate-400 rounded flex items-center justify-center border border-slate-300"
              >
                <Image src="/icons/Edit.svg" alt="Edit" width={14} height={14} className="opacity-70" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-3 mt-3 bg-slate-400 rounded-xl border-2 border-slate-300 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex">
            {(['avatar', 'frame', 'name', 'badge'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-bold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-500 text-white'
                    : 'bg-slate-400 text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-0.5 bg-slate-500" />

          {/* Tab Content - Avatar Grid */}
          <div className="p-3 bg-slate-300 max-h-[240px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => avatar.type === 'avatar' && setSelectedAvatar(avatar.id as number)}
                  className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    avatar.type === 'facebook'
                      ? 'bg-slate-500 border-slate-400'
                      : selectedAvatar === avatar.id
                      ? 'bg-slate-400 border-slate-300 ring-2 ring-slate-200'
                      : 'bg-slate-400 border-slate-350'
                  }`}
                >
                  {avatar.type === 'facebook' ? (
                    <>
                      <Image
                        src="/icons/Facebook.svg"
                        alt="Facebook"
                        width={28}
                        height={28}
                        className="opacity-80 mb-1"
                      />
                      <span className="text-slate-300 text-[10px] font-bold">{avatar.label}</span>
                    </>
                  ) : (
                    <span className="text-slate-600 text-lg font-bold">{avatar.abbr}</span>
                  )}

                  {/* Selected Checkmark */}
                  {avatar.type === 'avatar' && selectedAvatar === avatar.id && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center border-2 border-slate-200">
                      <Image
                        src="/icons/Check-Circle.svg"
                        alt="Selected"
                        width={16}
                        height={16}
                        className="opacity-80"
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Save Button */}
      <div className="p-3">
        <button
          onClick={handleSave}
          className="w-full bg-slate-400 hover:bg-slate-350 rounded-xl py-3 border-2 border-slate-300"
        >
          <span className="text-slate-700 text-lg font-bold">Save</span>
        </button>
      </div>
    </div>
  );
}
