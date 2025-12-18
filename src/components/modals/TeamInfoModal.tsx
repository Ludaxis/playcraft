'use client';

import React from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

// Sample team data
const teamData = {
  id: 1,
  name: 'MAARDU 45',
  description: 'Active Team',
  capacity: 43,
  maxCapacity: 50,
  teamScore: 212576,
  activity: 'High',
  requiredLevel: 300,
  teamType: 'Open',
  requiredCrown: 0,
  members: [
    { id: 1, rank: 1, name: 'ttmm', role: 'Grand Knight', trophies: 812, level: 12601 },
    { id: 2, rank: 2, name: 'Igor', role: 'Grand Knight', trophies: 483, level: 12601 },
    { id: 3, rank: 3, name: 'andrei', role: 'Grand Knight', trophies: 185, level: 12601 },
    { id: 4, rank: 4, name: 'Maks', role: 'Grand Knight', trophies: 130, level: 12601 },
    { id: 5, rank: 5, name: 'Mojtaba mo', role: 'Knight', trophies: 116, level: 12601 },
    { id: 6, rank: 6, name: 'Olga', role: 'Knight', trophies: 48, level: 12601 },
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

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-brand-primary text-text-inverse';
      case 2: return 'bg-bg-inverse text-text-inverse';
      case 3: return 'bg-brand-muted text-text-primary';
      default: return 'bg-border-strong text-text-primary';
    }
  };

  return (
    <div className="relative w-full max-w-[340px] max-h-[90vh] overflow-hidden flex flex-col">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border z-10 hover:opacity-80"
      >
        <span className="text-text-inverse text-value">X</span>
      </button>

      {/* Header */}
      <div className="bg-bg-inverse rounded-t-2xl py-3 px-4">
        <h1 className="text-text-inverse text-h2 text-center">Team Info</h1>
      </div>

      {/* Team Header Card */}
      <div className="bg-bg-inverse p-3">
        <div className="flex items-center gap-3">
          {/* Team Logo */}
          <div className="w-16 h-16 bg-border-strong rounded-lg border-2 border-border flex items-center justify-center">
            <Image src="/icons/2User.svg" alt="Team" width={32} height={32} className="opacity-70" />
          </div>

          {/* Team Info */}
          <div className="flex-1">
            <h2 className="text-text-inverse text-h3">{teamData.name}</h2>
            <p className="text-text-muted text-caption">{teamData.description}</p>
          </div>

          {/* Capacity */}
          <div className="text-right">
            <span className="text-text-muted text-caption">Capacity</span>
            <p className="text-text-inverse text-value">{teamData.capacity}/{teamData.maxCapacity}</p>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="bg-bg-card p-3 border-y-2 border-border">
        <div className="grid grid-cols-2 gap-2 text-body-sm mb-2">
          <div className="flex justify-between">
            <span className="text-text-muted">Team Score:</span>
            <span className="text-text-primary text-value">{teamData.teamScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Activity:</span>
            <span className="text-text-primary text-value flex items-center gap-1">
              <span className="w-2 h-2 bg-brand-primary rounded-full" />
              {teamData.activity}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Required Level:</span>
            <span className="text-text-primary text-value">{teamData.requiredLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Team Type:</span>
            <span className="text-text-primary text-value">{teamData.teamType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Required Crown:</span>
            <span className="text-text-primary text-value">{teamData.requiredCrown}</span>
          </div>
        </div>

        {/* Join Button */}
        <button className="w-full bg-brand-primary border-2 border-accent-light rounded-xl py-2 mt-2">
          <span className="text-text-inverse text-button-lg">Join</span>
        </button>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto bg-bg-page">
        {teamData.members.map((member) => (
          <button
            key={member.id}
            onClick={() => handleViewMemberProfile(member.id)}
            className="w-full bg-bg-card border-b border-border p-2 flex items-center gap-2 hover:bg-bg-muted transition-colors"
          >
            {/* Rank */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getRankStyle(member.rank)}`}>
              <span className="text-value-sm">{member.rank}</span>
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 bg-bg-muted rounded-lg border-2 border-border-strong flex items-center justify-center">
              <Image src="/icons/Profile.svg" alt="Avatar" width={24} height={24} className="opacity-60" />
            </div>

            {/* Name & Role */}
            <div className="flex-1 text-left">
              <p className="text-primary font-bold text-caption">{member.name}</p>
              <p className="text-muted-foreground text-mini">{member.role}</p>
            </div>

            {/* Trophies */}
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-bg-inverse rounded-lg flex items-center justify-center">
                <Image src="/icons/Medal.svg" alt="Trophies" width={16} height={16} className="opacity-80" />
              </div>
              <span className="text-primary font-bold text-caption w-10">{member.trophies}</span>
            </div>

            {/* Level */}
            <div className="text-right">
              <span className="text-text-secondary text-mini">Level</span>
              <p className="text-primary font-bold text-caption">{member.level}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
