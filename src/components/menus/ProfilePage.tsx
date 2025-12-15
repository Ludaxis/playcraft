'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation } from '@/store';
import type { ModalId } from '@/types';

export function ProfilePage() {
  const { state } = useGame();
  const { navigate, openModal } = useNavigation();
  const { player, areas, team } = state;

  const completedAreas = areas.filter((a) => a.completed).length;

  return (
    <div className="flex flex-col h-full bg-slate-600">
      {/* Header */}
      <div className="flex items-center justify-center px-3 py-3 bg-slate-700 relative">
        <h1 className="text-white text-xl font-bold">Profile</h1>
        <button
          onClick={() => navigate('main-menu')}
          className="absolute right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
        >
          <span className="text-white text-xl font-bold">X</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-1 bg-slate-500" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-slate-500 rounded-xl border-2 border-slate-400 p-4">
          <div className="flex items-center gap-4">
            {/* Avatar - Clickable */}
            <button
              onClick={() => openModal('profile-picture')}
              className="relative"
            >
              <div className="w-24 h-24 bg-slate-400 rounded-xl border-2 border-slate-300 flex items-center justify-center overflow-hidden">
                <Image
                  src="/icons/Profile.svg"
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="opacity-60"
                />
              </div>
              {/* Edit indicator */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-300 rounded-lg border-2 border-slate-200 flex items-center justify-center">
                <Image src="/icons/Edit.svg" alt="Edit" width={14} height={14} />
              </div>
            </button>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold mb-1">{player.username}</h2>

              {/* Team */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-slate-400 rounded flex items-center justify-center">
                  <Image src="/icons/2User.svg" alt="Team" width={12} height={12} className="opacity-70" />
                </div>
                <span className="text-slate-300 text-sm">
                  {team ? team.name : 'No Team'}
                </span>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-400 rounded flex items-center justify-center">
                  <Image src="/icons/Clock.svg" alt="Date" width={12} height={12} className="opacity-70" />
                </div>
                <span className="text-slate-300 text-sm">05/2022</span>
              </div>
            </div>

            {/* Level Badge */}
            <div className="bg-slate-400 rounded-lg px-3 py-2 border-2 border-slate-300">
              <div className="text-slate-600 text-xs font-bold text-center">Level</div>
              <div className="text-slate-700 text-xl font-bold text-center">{player.currentLevel}</div>
            </div>
          </div>
        </div>

        {/* General Stats Section */}
        <div className="relative">
          {/* Ribbon Title */}
          <div className="flex justify-center mb-2">
            <div className="bg-slate-400 rounded-lg px-6 py-1 border-2 border-slate-300 relative">
              {/* Ribbon ends */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-r-[8px] border-t-transparent border-b-transparent border-r-slate-500" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[8px] border-t-transparent border-b-transparent border-l-slate-500" />
              <span className="text-slate-700 font-bold">General Stats</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-slate-200 rounded-xl border-2 border-slate-300 p-4">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatItem
                icon="/icons/Check-Circle.svg"
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
                icon="/icons/Star-Filled.svg"
                label="Areas Completed"
                value={completedAreas}
              />
              <StatItem
                icon="/icons/Category.svg"
                label="Collections Completed"
                value={0}
              />
              <StatItem
                icon="/icons/Badge.svg"
                label="Sets Completed"
                value={21}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (faded) */}
      <div className="bg-slate-700 border-t-2 border-slate-600 opacity-50">
        <div className="flex justify-around py-2">
          <NavPlaceholder icon="TRP" />
          <NavPlaceholder icon="CUP" />
          <NavPlaceholder icon="HOME" label="Home" />
          <NavPlaceholder icon="TEAM" />
          <NavPlaceholder icon="CARD" />
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
      <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center mb-1">
        <Image src={icon} alt={label} width={24} height={24} className="opacity-70" />
      </div>
      {/* Label */}
      <p className="text-slate-600 text-[9px] font-medium text-center whitespace-nowrap mb-1">
        {label}
      </p>
      {/* Value */}
      <div className="bg-slate-300 rounded px-3 py-0.5 w-full">
        <p className="text-slate-600 text-sm font-bold text-center">{value}</p>
      </div>
    </div>
  );
}

function NavPlaceholder({ icon, label }: { icon: string; label?: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1">
      <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
        <span className="text-slate-400 text-xs font-bold">{icon}</span>
      </div>
      {label && <span className="text-slate-400 text-[10px] mt-0.5">{label}</span>}
    </div>
  );
}
