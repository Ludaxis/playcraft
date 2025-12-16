'use client';

import React from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface MemberProfileModalProps {
  onAnimatedClose?: () => void;
}

// Sample member data
const memberData = {
  id: 1,
  name: 'ttmm',
  team: 'MAARDU 45',
  teamFlag: '🇷🇺',
  joinDate: '12/2022',
  level: 12601,
  crowns: 812,
  avatar: '👑',
  royalLeagueStats: {
    totalCrown: 40724,
    highestCrown: 1915,
    leaguesWon: 1,
  },
  generalStats: {
    firstTryWins: 21958,
    helpsMade: 476,
    helpsReceived: 115,
    areasCompleted: 144,
    collectionsCompleted: 20,
    setsCompleted: 344,
  },
};

export function MemberProfileModal({ onAnimatedClose }: MemberProfileModalProps) {
  const { closeModal } = useNavigation();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="relative w-[340px] max-h-[90vh] overflow-y-auto">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-10 h-10 bg-error rounded-full flex items-center justify-center border-2 border-error-light z-10"
      >
        <span className="text-white font-bold text-lg">X</span>
      </button>

        {/* Header */}
        <div className="bg-primary-light rounded-t-2xl py-3 px-4">
          <h1 className="text-white text-xl font-bold text-center">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-secondary-light p-3">
          <div className="bg-surface-dark rounded-xl border-2 border-surface p-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-20 h-20 bg-surface rounded-xl border-4 border-surface-light flex items-center justify-center">
                <span className="text-4xl">{memberData.avatar}</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                {/* Name */}
                <h2 className="text-primary-light text-lg font-bold">{memberData.name}</h2>

                {/* Team */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm">{memberData.teamFlag}</span>
                  <span className="text-secondary text-sm font-medium">{memberData.team}</span>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-surface rounded flex items-center justify-center">
                    <span className="text-xs">📅</span>
                  </div>
                  <span className="text-secondary text-sm font-bold">{memberData.joinDate}</span>
                </div>
              </div>

              {/* Level & Crown Badge */}
              <div className="flex flex-col items-center">
                <div className="bg-success rounded-t-lg px-3 pt-1 pb-0.5 border-2 border-success-light border-b-0">
                  <div className="text-success-light text-[10px] font-bold text-center">Level</div>
                  <div className="text-white text-lg font-bold text-center">{memberData.level}</div>
                </div>
                <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[10px] border-l-transparent border-r-transparent border-t-success" />

                <div className="bg-gold-dark rounded-lg px-3 py-1 mt-1 border-2 border-gold">
                  <div className="flex items-center gap-1">
                    <span className="text-gold-darker text-sm">👑</span>
                    <span className="text-gold-darker font-bold">{memberData.crowns}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Friend Button */}
            <button className="w-full bg-success border-2 border-success-light rounded-xl py-2 mt-3">
              <span className="text-white font-bold">Add Friend</span>
            </button>
          </div>
        </div>

        {/* Royal League Stats */}
        <div className="bg-secondary px-3 pb-3">
          {/* Ribbon Title */}
          <div className="flex justify-center -mt-1 mb-3">
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[16px] border-t-transparent border-b-transparent border-r-surface-dark" />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-l-[16px] border-t-transparent border-b-transparent border-l-surface-dark" />
              <div className="bg-surface-dark rounded px-4 py-1.5 border-2 border-surface">
                <span className="text-primary-light font-bold text-sm">Royal League Stats</span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-surface-light rounded-xl border-2 border-surface p-3">
            <div className="grid grid-cols-3 gap-2">
              <StatItem
                icon="👑"
                iconBg="bg-gold"
                label="Total Crown"
                value={memberData.royalLeagueStats.totalCrown}
              />
              <StatItem
                icon="👑"
                iconBg="bg-accent-muted"
                label="Highest Crown"
                value={memberData.royalLeagueStats.highestCrown}
              />
              <StatItem
                icon="🏆"
                iconBg="bg-info-light"
                label="Leagues Won"
                value={memberData.royalLeagueStats.leaguesWon}
              />
            </div>
          </div>
        </div>

        {/* General Stats */}
        <div className="bg-secondary px-3 pb-4 rounded-b-2xl">
          {/* Ribbon Title */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[16px] border-t-transparent border-b-transparent border-r-surface-dark" />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-l-[16px] border-t-transparent border-b-transparent border-l-surface-dark" />
              <div className="bg-surface-dark rounded px-4 py-1.5 border-2 border-surface">
                <span className="text-primary-light font-bold text-sm">General Stats</span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-surface-light rounded-xl border-2 border-surface p-3">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <StatItem
                icon="🎯"
                iconBg="bg-error-light"
                label="First Try Wins"
                value={memberData.generalStats.firstTryWins}
              />
              <StatItem
                icon="❤️"
                iconBg="bg-error"
                label="Helps Made"
                value={memberData.generalStats.helpsMade}
              />
              <StatItem
                icon="📧"
                iconBg="bg-gold"
                label="Helps Received"
                value={memberData.generalStats.helpsReceived}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-2">
              <StatItem
                icon="⭐"
                iconBg="bg-accent-light"
                label="Areas Completed"
                value={memberData.generalStats.areasCompleted}
              />
              <StatItem
                icon="🃏"
                iconBg="bg-gold-dark"
                label="Collections"
                value={memberData.generalStats.collectionsCompleted}
              />
              <StatItem
                icon="🎴"
                iconBg="bg-info"
                label="Sets Completed"
                value={memberData.generalStats.setsCompleted}
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
  iconBg: string;
  label: string;
  value: number;
}

function StatItem({ icon, iconBg, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-1`}>
        <span className="text-lg">{icon}</span>
      </div>
      {/* Label */}
      <p className="text-primary-light text-[9px] font-bold text-center whitespace-nowrap mb-1">
        {label}
      </p>
      {/* Value */}
      <div className="bg-surface rounded-lg px-2 py-0.5 w-full">
        <p className="text-primary-light text-sm font-bold text-center">{value}</p>
      </div>
    </div>
  );
}
