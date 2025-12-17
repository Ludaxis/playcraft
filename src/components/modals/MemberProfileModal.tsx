'use client';

// Updated: Removed emojis, using SVG icons
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
  joinDate: '12/2022',
  level: 12601,
  crowns: 812,
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
        className="absolute top-2 right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border z-10 hover:opacity-80"
      >
        <span className="text-text-inverse text-value">X</span>
      </button>

      {/* Header */}
      <div className="bg-bg-inverse rounded-t-2xl py-3 px-4">
        <h1 className="text-text-inverse text-h2 text-center">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-bg-inverse p-3">
        <div className="bg-bg-page rounded-xl border-2 border-border p-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-20 h-20 bg-bg-muted rounded-xl border-4 border-border-strong flex items-center justify-center">
              <Image src="/icons/Profile.svg" alt="Avatar" width={40} height={40} className="opacity-60" />
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* Name */}
              <h2 className="text-text-primary text-h3">{memberData.name}</h2>

              {/* Team */}
              <div className="flex items-center gap-1 mb-1">
                <Image src="/icons/2User.svg" alt="Team" width={14} height={14} className="opacity-60" />
                <span className="text-text-muted text-caption font-medium">{memberData.team}</span>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-border-strong rounded flex items-center justify-center">
                  <Image src="/icons/Clock.svg" alt="Date" width={12} height={12} className="opacity-60" />
                </div>
                <span className="text-text-muted text-value">{memberData.joinDate}</span>
              </div>
            </div>

            {/* Level & Crown Badge */}
            <div className="flex flex-col items-center">
              <div className="bg-bg-inverse rounded-t-lg px-3 pt-1 pb-0.5 border-2 border-border border-b-0">
                <div className="text-text-muted text-mini font-bold text-center">Level</div>
                <div className="text-text-inverse text-h3 text-center">{memberData.level}</div>
              </div>
              <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[10px] border-l-transparent border-r-transparent border-t-bg-inverse" />

              <div className="bg-bg-inverse rounded-lg px-3 py-1 mt-1 border-2 border-border">
                <div className="flex items-center gap-1">
                  <Image src="/icons/Medal.svg" alt="Crowns" width={14} height={14} className="opacity-70" />
                  <span className="text-text-inverse font-bold">{memberData.crowns}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Friend Button */}
          <button className="w-full bg-bg-inverse border-2 border-border rounded-xl py-2 mt-3">
            <span className="text-text-inverse font-bold">Add Friend</span>
          </button>
        </div>
      </div>

      {/* Royal League Stats */}
      <div className="bg-bg-inverse px-3 pb-3">
        {/* Ribbon Title */}
        <div className="flex justify-center -mt-1 mb-3">
          <div className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[16px] border-t-transparent border-b-transparent border-r-bg-muted" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-l-[16px] border-t-transparent border-b-transparent border-l-bg-muted" />
            <div className="bg-bg-muted rounded px-4 py-1.5 border-2 border-border-strong">
              <span className="text-text-primary font-bold text-caption">Royal League Stats</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-bg-card rounded-xl border-2 border-border p-3">
          <div className="grid grid-cols-3 gap-2">
            <StatItem
              icon="/icons/Medal.svg"
              label="Total Crown"
              value={memberData.royalLeagueStats.totalCrown}
            />
            <StatItem
              icon="/icons/Medal.svg"
              label="Highest Crown"
              value={memberData.royalLeagueStats.highestCrown}
            />
            <StatItem
              icon="/icons/Badge.svg"
              label="Leagues Won"
              value={memberData.royalLeagueStats.leaguesWon}
            />
          </div>
        </div>
      </div>

      {/* General Stats */}
      <div className="bg-bg-inverse px-3 pb-4 rounded-b-2xl">
        {/* Ribbon Title */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[16px] border-t-transparent border-b-transparent border-r-bg-muted" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-l-[16px] border-t-transparent border-b-transparent border-l-bg-muted" />
            <div className="bg-bg-muted rounded px-4 py-1.5 border-2 border-border-strong">
              <span className="text-text-primary font-bold text-caption">General Stats</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-bg-card rounded-xl border-2 border-border p-3">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatItem
              icon="/icons/Check-Circle.svg"
              label="First Try Wins"
              value={memberData.generalStats.firstTryWins}
            />
            <StatItem
              icon="/icons/Heart-Filled.svg"
              label="Helps Made"
              value={memberData.generalStats.helpsMade}
            />
            <StatItem
              icon="/icons/Mail.svg"
              label="Helps Received"
              value={memberData.generalStats.helpsReceived}
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-2">
            <StatItem
              icon="/icons/Star-Filled.svg"
              label="Areas Completed"
              value={memberData.generalStats.areasCompleted}
            />
            <StatItem
              icon="/icons/Category.svg"
              label="Collections"
              value={memberData.generalStats.collectionsCompleted}
            />
            <StatItem
              icon="/icons/Archive.svg"
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
  label: string;
  value: number;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className="w-10 h-10 bg-border-strong rounded-xl flex items-center justify-center mb-1">
        <Image src={icon} alt={label} width={20} height={20} className="opacity-70" />
      </div>
      {/* Label */}
      <p className="text-text-muted text-mini font-bold text-center whitespace-nowrap mb-1">
        {label}
      </p>
      {/* Value */}
      <div className="bg-bg-muted rounded-lg px-2 py-0.5 w-full">
        <p className="text-text-primary text-value text-center">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
