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
    <div className="relative w-full max-w-[320px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h2">Edit Profile</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary font-bold">X</span>
        </button>
      </div>

        {/* Profile Preview Section */}
        <div className="bg-bg-muted mx-3 mt-3 rounded-xl p-3 border border-border">
          <div className="flex items-center gap-3">
            {/* Current Avatar */}
            <div className="w-16 h-16 bg-bg-page rounded-xl border border-border flex items-center justify-center">
              <span className="text-text-primary text-h3">A{selectedAvatar}</span>
            </div>

            {/* Username with Edit */}
            <div className="flex-1 bg-bg-page rounded-lg px-3 py-2 flex items-center justify-between border border-border">
              <span className="text-text-primary font-bold">{player.username}</span>
              <button
                onClick={handleEditUsername}
                className="w-7 h-7 bg-bg-muted rounded flex items-center justify-center border border-border"
              >
                <Image src="/icons/Edit.svg" alt="Edit" width={14} height={14} className="opacity-70" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-3 mt-3 bg-bg-muted rounded-xl border border-border overflow-hidden">
          {/* Tab Headers */}
          <div className="flex">
            {(['avatar', 'frame', 'name', 'badge'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-value capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-bg-page text-text-primary'
                    : 'bg-bg-muted text-text-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-0.5 bg-border" />

          {/* Tab Content - Avatar Grid */}
          <div className="p-3 bg-bg-card max-h-[240px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => avatar.type === 'avatar' && setSelectedAvatar(avatar.id as number)}
                  className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                    avatar.type === 'facebook'
                      ? 'bg-bg-muted border-border'
                      : selectedAvatar === avatar.id
                      ? 'bg-bg-muted border-border ring-2 ring-bg-inverse'
                      : 'bg-bg-page border-border'
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
                      <span className="text-text-secondary text-mini font-bold">{avatar.label}</span>
                    </>
                  ) : (
                    <span className="text-text-secondary text-h3">{avatar.abbr}</span>
                  )}

                  {/* Selected Checkmark */}
                  {avatar.type === 'avatar' && selectedAvatar === avatar.id && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-bg-inverse rounded-full flex items-center justify-center border border-border">
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
          className="w-full bg-bg-muted hover:bg-bg-page rounded-xl py-3 border border-border"
        >
          <span className="text-text-primary text-h3">Save</span>
        </button>
      </div>
    </div>
  );
}
