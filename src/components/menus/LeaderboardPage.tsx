'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/store';
import { BottomNavigation } from '@/components/shared';

// Mock data for Weekly Contest
const weeklyContestData = {
  isFinished: true,
  timeRemaining: '6d 18h',
  topThree: [
    { id: 1, rank: 1, name: 'angel', team: 'Panama 507', score: 56 },
    { id: 2, rank: 2, name: 'bolbol', team: 'saddle', score: 53 },
    { id: 3, rank: 3, name: 'junior', team: 'Modric ibo', score: 27 },
  ],
  players: [
    { id: 6, rank: 6, name: 'tina', team: 'minden', score: 5, isPlayer: false },
    { id: 7, rank: 7, name: 'Reza', team: '', score: 2, isPlayer: true },
    { id: 8, rank: 8, name: 'Mikhail', team: 'Liga', score: 0, isPlayer: false },
  ],
};

// Mock data for Friends
const friendsData = [
  { id: 1, rank: 1, name: 'bolbol', team: 'saddle', level: 5204 },
  { id: 2, rank: 2, name: 'Reza', team: '', level: 2453, isPlayer: true },
  { id: 3, rank: 3, name: 'Echo', team: '', level: 1888 },
];

// Mock data for Players
const playersData = [
  { id: 1, rank: 1, name: 'CEMiLE', team: 'QUERENCIA', crowns: 10304, level: 12601 },
  { id: 2, rank: 2, name: 'EMiN', team: 'AZERBAYCAN', crowns: 9510, level: 12601 },
  { id: 3, rank: 3, name: 'Player3', team: 'Poopers', crowns: 8337, level: 12601 },
  { id: 4, rank: 4, name: 'Player4', team: 'aaooaa', crowns: 7472, level: 12601 },
  { id: 5, rank: 5, name: 'Z1r33', team: 'SUPERNOVA', crowns: 7407, level: 12601 },
];

// Mock data for Teams
const teamsData = [
  { id: 1, rank: 1, name: 'SUPERNOVA', capacity: '50/50', score: 741532 },
  { id: 2, rank: 2, name: 'MATCHMAXX 4K', capacity: '50/50', score: 740708 },
  { id: 3, rank: 3, name: 'XOXO', capacity: '50/50', score: 713668 },
  { id: 4, rank: 4, name: 'SPECIAL ONE', capacity: '49/50', score: 713119 },
  { id: 5, rank: 5, name: 'fantasista', capacity: '50/50', score: 712877 },
];

const mainTabs = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'friends', label: 'Friends' },
  { id: 'players', label: 'Players' },
  { id: 'teams', label: 'Teams' },
] as const;

export function LeaderboardPage() {
  const { openModal } = useNavigation();
  const [activeTab, setActiveTab] = useState<'weekly' | 'friends' | 'players' | 'teams'>('weekly');
  const [friendsSubTab, setFriendsSubTab] = useState<'list' | 'add'>('list');
  const [regionFilter, setRegionFilter] = useState<'world' | 'local'>('world');
  const contentRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef<string>('weekly');
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Animate content when tab changes
  useEffect(() => {
    if (!contentRef.current || prevTabRef.current === activeTab) return;

    const prevIndex = mainTabs.findIndex((t) => t.id === prevTabRef.current);
    const newIndex = mainTabs.findIndex((t) => t.id === activeTab);
    const direction = newIndex > prevIndex ? 1 : -1;

    prevTabRef.current = activeTab;

    gsap.fromTo(
      contentRef.current,
      { x: direction * 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  }, [activeTab]);

  // Animate indicator
  useEffect(() => {
    if (!indicatorRef.current) return;

    const activeButton = tabRefs.current.get(activeTab);
    if (!activeButton) return;

    gsap.to(indicatorRef.current, {
      x: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'weekly' | 'friends' | 'players' | 'teams');
  };

  const setTabRef = (tabId: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(tabId, el);
    }
  };

  const getRankBadge = (rank: number) => {
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
        rank <= 3 ? 'bg-border-strong border border-border' : ''
      }`}>
        <span className="text-value-sm text-text-primary">{rank}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="bg-brand-hover py-4 px-4">
        <h1 className="text-text-inverse text-h3 text-center">Leaderboard</h1>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-brand-muted" />

      {/* Main Tab Bar */}
      <div className="bg-brand-muted px-2 py-1.5">
        <div className="relative flex bg-bg-inverse rounded border border-brand-muted overflow-hidden">
          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-0 bottom-0 bg-border-strong rounded"
            style={{ width: `${100 / mainTabs.length}%` }}
          />

          {/* Tab buttons */}
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => setTabRef(tab.id, el)}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 text-center text-value-sm transition-colors relative z-10 ${
                activeTab === tab.id ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Weekly Tab */}
        {activeTab === 'weekly' && (
          <div className="bg-brand-muted p-2">
            {/* Weekly Contest Banner */}
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="bg-border-strong rounded-lg px-6 py-2 border border-border">
                <span className="text-text-primary text-h4">Weekly Contest</span>
              </div>
              <div className="bg-brand-hover rounded-full px-3 py-1">
                <span className="text-text-inverse text-caption">
                  {weeklyContestData.isFinished ? 'Finished' : weeklyContestData.timeRemaining}
                </span>
              </div>
            </div>

            {/* Info button */}
            <button
              onClick={() => openModal('weekly-contest-info')}
              className="absolute left-4 top-36 w-6 h-6 bg-border-strong rounded-full flex items-center justify-center border border-border"
            >
              <span className="text-text-primary text-value-sm">i</span>
            </button>

            {/* Podium */}
            <div className="flex justify-center items-end gap-2 mb-4 px-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-[100px]">
                <div className="w-12 h-12 bg-border-strong rounded-xl border-2 border-border flex items-center justify-center mb-2">
                  <span className="text-text-secondary text-value">2nd</span>
                </div>
                <div className="bg-border-strong rounded-xl p-2 w-full border-2 border-border">
                  <p className="text-text-primary text-value text-center truncate">{weeklyContestData.topThree[1].name}</p>
                  <p className="text-text-secondary text-caption text-center truncate">{weeklyContestData.topThree[1].team}</p>
                  <p className="text-text-primary text-value-sm text-center mt-1">{weeklyContestData.topThree[1].score}</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center w-[110px] -mt-4">
                <div className="w-14 h-14 bg-gold/20 rounded-xl border-2 border-gold flex items-center justify-center mb-2">
                  <span className="text-gold text-h4">1st</span>
                </div>
                <div className="bg-gold/10 rounded-xl p-2 w-full border-2 border-gold">
                  <p className="text-text-primary text-value text-center truncate">{weeklyContestData.topThree[0].name}</p>
                  <p className="text-text-secondary text-caption text-center truncate">{weeklyContestData.topThree[0].team}</p>
                  <p className="text-gold text-value text-center mt-1">{weeklyContestData.topThree[0].score}</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center w-[100px]">
                <div className="w-12 h-12 bg-bg-page rounded-xl border-2 border-border flex items-center justify-center mb-2">
                  <span className="text-text-secondary text-value">3rd</span>
                </div>
                <div className="bg-bg-page rounded-xl p-2 w-full border-2 border-border">
                  <p className="text-text-primary text-value text-center truncate">{weeklyContestData.topThree[2].name}</p>
                  <p className="text-text-secondary text-caption text-center truncate">{weeklyContestData.topThree[2].team}</p>
                  <p className="text-text-primary text-value-sm text-center mt-1">{weeklyContestData.topThree[2].score}</p>
                </div>
              </div>
            </div>

            {/* Player List */}
            <div className="space-y-2">
              {weeklyContestData.players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => !player.isPlayer && openModal('member-profile', { memberId: player.id })}
                  className={`w-full rounded-xl p-3 flex items-center gap-3 ${
                    player.isPlayer ? 'bg-brand-hover border-2 border-bg-inverse' : 'bg-bg-page border-2 border-border hover:bg-bg-muted transition-colors'
                  }`}
                >
                  <span className={`w-6 text-value ${player.isPlayer ? 'text-text-inverse' : 'text-text-secondary'}`}>
                    {player.rank}
                  </span>
                  <div className="w-10 h-10 bg-border-strong rounded-lg flex items-center justify-center border border-border">
                    <span className="text-text-secondary text-caption">AVA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-value ${player.isPlayer ? 'text-text-inverse' : 'text-text-primary'}`}>{player.name}</p>
                    {player.team && (
                      <p className={`text-caption ${player.isPlayer ? 'text-text-muted' : 'text-text-secondary'}`}>{player.team}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-caption ${player.isPlayer ? 'text-text-muted' : 'text-text-secondary'}`}>Score</span>
                    <p className={`text-value ${player.isPlayer ? 'text-text-inverse' : 'text-text-primary'}`}>{player.score}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <div className="mt-4">
              <button className="w-full bg-border-strong border-2 border-border rounded-xl py-3">
                <span className="text-text-primary text-h4">Continue</span>
              </button>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="bg-brand-muted p-2">
            {/* Sub Tabs */}
            <div className="flex gap-1.5 mb-3">
              {(['list', 'add'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFriendsSubTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-value-sm ${
                    friendsSubTab === tab
                      ? 'bg-brand-hover text-text-inverse border border-bg-inverse'
                      : 'bg-border-strong text-text-primary border border-border'
                  }`}
                >
                  {tab === 'list' ? 'Friends List' : 'Add Friends'}
                </button>
              ))}
            </div>

            {/* Friends List */}
            <div className="space-y-1">
              {friendsData.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => !friend.isPlayer && openModal('member-profile', { memberId: friend.id })}
                  className={`w-full rounded-lg p-1.5 flex items-center gap-2 ${
                    friend.isPlayer ? 'bg-brand-hover border border-bg-inverse' : 'bg-bg-page border border-border hover:bg-bg-muted transition-colors'
                  }`}
                >
                  {getRankBadge(friend.rank)}
                  <div className="w-8 h-8 bg-border-strong rounded flex items-center justify-center border border-border">
                    <span className="text-text-secondary text-mini">AVA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-value-sm ${friend.isPlayer ? 'text-text-inverse' : 'text-text-primary'}`}>{friend.name}</p>
                    {friend.team && (
                      <p className={`text-mini ${friend.isPlayer ? 'text-text-muted' : 'text-text-muted'}`}>{friend.team}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-mini ${friend.isPlayer ? 'text-text-muted' : 'text-text-muted'}`}>Level</span>
                    <p className={`text-value-sm ${friend.isPlayer ? 'text-text-inverse' : 'text-text-primary'}`}>{friend.level}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Connect Button */}
            <div className="mt-4">
              <button className="w-full bg-border-strong border-2 border-border rounded-lg py-2 flex items-center justify-center gap-2">
                <span className="text-text-primary text-value">f</span>
                <span className="text-text-primary text-value">Connect</span>
              </button>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="bg-brand-muted p-2">
            {/* Region Filter */}
            <div className="flex gap-1.5 mb-3">
              {(['world', 'local'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`flex-1 py-1.5 rounded-lg text-value-sm ${
                    regionFilter === region
                      ? 'bg-brand-hover text-text-inverse border border-bg-inverse'
                      : 'bg-border-strong text-text-primary border border-border'
                  }`}
                >
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </button>
              ))}
            </div>

            {/* Players List */}
            <div className="space-y-1">
              {playersData.map((player) => (
                <button
                  key={player.id}
                  onClick={() => openModal('member-profile', { memberId: player.id })}
                  className="w-full bg-bg-page rounded-lg p-1.5 flex items-center gap-2 border border-border hover:bg-bg-muted transition-colors"
                >
                  {getRankBadge(player.rank)}
                  <div className="w-8 h-8 bg-border-strong rounded flex items-center justify-center border border-border">
                    <span className="text-text-secondary text-mini">AVA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-value-sm text-text-primary">{player.name}</p>
                    <p className="text-mini text-text-muted">{player.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-mini text-text-muted">Level</span>
                    <p className="text-value-sm text-text-primary">{player.level}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="bg-brand-muted p-2">
            {/* Region Filter */}
            <div className="flex gap-1.5 mb-3">
              {(['world', 'local'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`flex-1 py-1.5 rounded-lg text-value-sm ${
                    regionFilter === region
                      ? 'bg-brand-hover text-text-inverse border border-bg-inverse'
                      : 'bg-border-strong text-text-primary border border-border'
                  }`}
                >
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </button>
              ))}
            </div>

            {/* Teams List */}
            <div className="space-y-1">
              {teamsData.map((team) => (
                <button
                  key={team.id}
                  onClick={() => openModal('team-info', { teamId: team.id })}
                  className="w-full bg-bg-page rounded-lg p-1.5 flex items-center gap-2 border border-border hover:bg-bg-muted transition-colors"
                >
                  {getRankBadge(team.rank)}
                  <div className="w-8 h-8 bg-border-strong rounded flex items-center justify-center border-2 border-border">
                    <span className="text-text-secondary text-mini font-bold">LOGO</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-value-sm text-text-primary">{team.name}</p>
                  </div>
                  <div className="text-right mr-1">
                    <span className="text-mini text-text-muted">Capacity</span>
                    <p className="text-value-sm text-text-secondary">{team.capacity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-mini text-text-muted">Score</span>
                    <p className="text-value-sm text-text-primary">{team.score.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="leaderboard" />
    </div>
  );
}
