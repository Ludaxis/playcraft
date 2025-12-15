'use client';

import React from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

// Sample team data
const teamData = {
  id: 1,
  name: 'MAARDU 45',
  description: 'Активная команда.',
  logo: '🇷🇺',
  logoColor: 'bg-blue-500',
  capacity: 43,
  maxCapacity: 50,
  teamScore: 212576,
  activity: 'High',
  requiredLevel: 300,
  teamType: 'Open',
  requiredCrown: 0,
  members: [
    { id: 1, rank: 1, name: 'ttmm', role: 'Grand Knight', trophies: 812, level: 12601, avatar: '👑' },
    { id: 2, rank: 2, name: 'Igor', role: 'Grand Knight', trophies: 483, level: 12601, avatar: '🎭' },
    { id: 3, rank: 3, name: 'andrei', role: 'Grand Knight', trophies: 185, level: 12601, avatar: '🏰' },
    { id: 4, rank: 4, name: 'Maks', role: 'Grand Knight', trophies: 130, level: 12601, avatar: '⚔️' },
    { id: 5, rank: 5, name: 'Mojtaba mo', role: 'Knight', trophies: 116, level: 12601, avatar: '🛡️' },
    { id: 6, rank: 6, name: 'Olga', role: 'Knight', trophies: 48, level: 12601, avatar: '🌟' },
  ],
};

interface TeamInfoModalProps {
  onAnimatedClose?: () => void;
}

export function TeamInfoModal({ onAnimatedClose }: TeamInfoModalProps) {
  const { closeModal, openModal } = useNavigation();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleViewMemberProfile = (memberId: number) => {
    openModal('member-profile', { memberId });
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-yellow-900';
      case 2: return 'bg-gray-300 text-gray-700';
      case 3: return 'bg-orange-400 text-orange-900';
      default: return 'bg-slate-400 text-slate-700';
    }
  };

  return (
    <div className="relative w-[340px] max-h-[90vh] overflow-hidden flex flex-col">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400 z-10"
      >
        <span className="text-white font-bold text-lg">X</span>
      </button>

        {/* Header */}
        <div className="bg-slate-700 rounded-t-2xl py-3 px-4">
          <h1 className="text-white text-xl font-bold text-center">Team Info</h1>
        </div>

        {/* Team Header Card */}
        <div className="bg-slate-500 p-3">
          <div className="flex items-center gap-3">
            {/* Team Logo */}
            <div className={`w-16 h-16 ${teamData.logoColor} rounded-lg border-4 border-yellow-500 flex items-center justify-center`}>
              <span className="text-3xl">{teamData.logo}</span>
            </div>

            {/* Team Info */}
            <div className="flex-1">
              <h2 className="text-white text-lg font-bold">{teamData.name}</h2>
              <p className="text-slate-300 text-xs">{teamData.description} ⭐⭐⭐</p>
            </div>

            {/* Capacity */}
            <div className="text-right">
              <span className="text-slate-300 text-xs">Capacity</span>
              <p className="text-white font-bold">{teamData.capacity}/{teamData.maxCapacity}</p>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="bg-slate-200 p-3 border-y-2 border-slate-300">
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Team Score:</span>
              <span className="text-slate-700 font-bold">{teamData.teamScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Activity:</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {teamData.activity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Required Level:</span>
              <span className="text-slate-700 font-bold">{teamData.requiredLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Team Type:</span>
              <span className="text-slate-700 font-bold">{teamData.teamType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Required Crown:</span>
              <span className="text-slate-700 font-bold">{teamData.requiredCrown}</span>
            </div>
          </div>

          {/* Join Button */}
          <button className="w-full bg-green-500 border-2 border-green-400 rounded-xl py-2 mt-2">
            <span className="text-white font-bold text-lg">Join</span>
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto bg-slate-600">
          {teamData.members.map((member) => (
            <button
              key={member.id}
              onClick={() => handleViewMemberProfile(member.id)}
              className="w-full bg-slate-200 border-b-2 border-slate-300 p-2 flex items-center gap-2 hover:bg-slate-300 transition-colors"
            >
              {/* Rank */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getRankColor(member.rank)}`}>
                <span className="text-xs font-bold">{member.rank}</span>
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 bg-slate-400 rounded-lg border-2 border-slate-300 flex items-center justify-center">
                <span className="text-xl">{member.avatar}</span>
              </div>

              {/* Name & Role */}
              <div className="flex-1 text-left">
                <p className="text-slate-700 font-bold text-sm">{member.name}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  {member.role}
                </p>
              </div>

              {/* Trophies */}
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🏆</span>
                </div>
                <span className="text-slate-600 font-bold text-sm w-10">{member.trophies}</span>
              </div>

              {/* Level */}
              <div className="text-right">
                <span className="text-slate-400 text-[10px]">Level</span>
                <p className="text-slate-600 font-bold text-sm">{member.level}</p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
