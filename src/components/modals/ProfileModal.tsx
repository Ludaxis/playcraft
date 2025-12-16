'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation } from '@/store';

interface ProfileModalProps {
  onAnimatedClose?: () => void;
}

export function ProfileModal({ onAnimatedClose }: ProfileModalProps) {
  const { state } = useGame();
  const { closeModal, openModal } = useNavigation();
  const { player, areas } = state;

  const completedAreas = areas.filter((a) => a.completed).length;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="relative w-[320px]">
      {/* Close button - Top right */}
      <button
        onClick={handleClose}
        className="absolute -top-1 -right-1 w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light z-10 shadow-lg hover:bg-error-light transition-colors"
      >
        <span className="text-white font-bold text-sm">X</span>
      </button>

      {/* Header */}
      <div className="bg-primary-light rounded-t-2xl py-2.5 px-3">
        <h1 className="text-white text-base font-bold text-center">Profile</h1>
      </div>

      {/* Divider line */}
      <div className="h-0.5 bg-secondary-light" />

        {/* Profile Card */}
        <div className="bg-secondary-light p-4">
          <div className="bg-surface-dark rounded-xl border-2 border-surface p-3">
            <div className="flex items-center gap-3">
              {/* Avatar - Clickable */}
              <button
                onClick={() => openModal('profile-picture')}
                className="relative flex-shrink-0"
              >
                <div className="w-24 h-24 bg-surface rounded-xl border-4 border-surface-light flex items-center justify-center overflow-hidden">
                  <Image
                    src="/icons/Profile.svg"
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="opacity-60"
                  />
                </div>
                {/* Edit indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-success-light flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </button>

              {/* Info */}
              <div className="flex-1">
                {/* Name */}
                <h2 className="text-primary-light text-xl font-bold mb-1">{player.username}</h2>

                {/* Playing since tooltip */}
                <div className="inline-block bg-surface-light rounded-lg px-3 py-1 mb-2">
                  <span className="text-secondary text-xs font-medium">Playing since 05/2022</span>
                </div>

                {/* Join Date with clock */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-surface rounded flex items-center justify-center">
                    <Image src="/icons/Clock.svg" alt="Date" width={14} height={14} className="opacity-70" />
                  </div>
                  <span className="text-secondary text-sm font-bold">05/2022</span>
                </div>
              </div>

              {/* Level Badge - Flag style */}
              <div className="flex-shrink-0">
                <div className="bg-secondary rounded-t-lg px-4 pt-2 pb-1 border-2 border-secondary-light border-b-0">
                  <div className="text-surface text-xs font-bold text-center">Level</div>
                  <div className="text-white text-2xl font-bold text-center">{player.currentLevel}</div>
                </div>
                {/* Flag bottom point */}
                <div className="w-0 h-0 mx-auto border-l-[32px] border-r-[32px] border-t-[16px] border-l-transparent border-r-transparent border-t-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* General Stats Section */}
        <div className="bg-secondary px-4 pb-4 rounded-b-2xl">
          {/* Ribbon Title */}
          <div className="flex justify-center -mt-1 mb-3">
            <div className="relative">
              {/* Ribbon ends */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[16px] border-t-transparent border-b-transparent border-r-surface-dark" />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-l-[16px] border-t-transparent border-b-transparent border-l-surface-dark" />
              {/* Main ribbon */}
              <div className="bg-surface-dark rounded px-6 py-1.5 border-2 border-surface">
                <span className="text-primary-light font-bold">General Stats</span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-surface-light rounded-xl border-2 border-surface p-4">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatItem
                icon="/icons/Medal.svg"
                label="First Try Wins"
                value={1726}
              />
              <StatItem
                icon="/icons/Heart-Filled.svg"
                label="Helps Made"
                value={659}
              />
              <StatItem
                icon="/icons/Mail.svg"
                label="Helps Received"
                value={682}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-3">
              <StatItem
                icon="/icons/Category.svg"
                label="Areas Completed"
                value={completedAreas}
              />
              <StatItem
                icon="/icons/Category.svg"
                label="Collections"
                value={0}
              />
              <StatItem
                icon="/icons/Category.svg"
                label="Sets Completed"
                value={21}
              />
            </div>
          </div>
        </div>
      </div>
  );
}

// Stat Item Component
interface StatItemProps {
  icon: string;
  label: string;
  value: number;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-1">
        <Image src={icon} alt={label} width={28} height={28} className="opacity-70" />
      </div>
      {/* Label */}
      <p className="text-primary-light text-[10px] font-bold text-center whitespace-nowrap mb-1">
        {label}
      </p>
      {/* Value */}
      <div className="bg-surface rounded-lg px-2 py-1 w-full">
        <p className="text-primary-light text-base font-bold text-center">{value}</p>
      </div>
    </div>
  );
}
