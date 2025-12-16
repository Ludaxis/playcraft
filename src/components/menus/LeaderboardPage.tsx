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
        rank <= 3 ? 'bg-surface-dark border border-surface' : ''
      }`}>
        <span className="text-xs font-bold text-primary-light">{rank}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="bg-primary-light py-3 px-4">
        <h1 className="text-white text-base font-bold text-center">Leaderboard</h1>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-secondary-light" />

      {/* Main Tab Bar */}
      <div className="bg-secondary-light px-2 py-1.5">
        <div className="relative flex bg-secondary rounded border border-secondary-light overflow-hidden">
          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-0 bottom-0 bg-surface-dark rounded"
            style={{ width: `${100 / mainTabs.length}%` }}
          />

          {/* Tab buttons */}
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => setTabRef(tab.id, el)}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-1.5 text-center text-xs font-bold transition-colors relative z-10 ${
                activeTab === tab.id ? 'text-primary-light' : 'text-surface'
              }`}
            >
              {tab.label}
              {tab.id === 'weekly' && activeTab === 'weekly' && (
                <div className="absolute -bottom-1 left-1 bg-primary-light rounded-full px-1.5 py-0.5 text-[8px] text-white z-20">
                  {weeklyContestData.isFinished ? 'Finished' : weeklyContestData.timeRemaining}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Weekly Tab */}
        {activeTab === 'weekly' && (
          <div className="bg-secondary-light p-2">
            {/* Weekly Contest Banner */}
            <div className="flex justify-center mb-3">
              <div className="bg-surface-dark rounded px-6 py-1.5 border border-surface">
                <span className="text-primary-light font-bold text-sm">Weekly Contest</span>
              </div>
            </div>

            {/* Info button */}
            <button
              onClick={() => openModal('weekly-contest-info')}
              className="absolute left-4 top-36 w-6 h-6 bg-surface-dark rounded-full flex items-center justify-center border border-surface"
            >
              <span className="text-primary-light font-bold text-xs">i</span>
            </button>

            {/* Podium */}
            <div className="flex justify-center items-end gap-1.5 mb-3 px-1">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-[90px]">
                <div className="w-10 h-10 bg-surface-dark rounded-lg border border-surface flex items-center justify-center mb-1">
                  <span className="text-secondary text-[10px] font-bold">2nd</span>
                </div>
                <div className="bg-surface-dark rounded-lg p-1.5 w-full border border-surface">
                  <p className="text-primary-light font-bold text-xs text-center truncate">{weeklyContestData.topThree[1].name}</p>
                  <p className="text-secondary text-[8px] text-center truncate">{weeklyContestData.topThree[1].team}</p>
                  <p className="text-primary-light font-bold text-[10px] text-center mt-1">Score: {weeklyContestData.topThree[1].score}</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center w-[95px] -mt-3">
                <div className="w-11 h-11 bg-surface rounded-lg border border-surface-light flex items-center justify-center mb-1">
                  <span className="text-secondary text-xs font-bold">1st</span>
                </div>
                <div className="bg-surface rounded-lg p-1.5 w-full border border-surface-light">
                  <p className="text-primary-light font-bold text-xs text-center truncate">{weeklyContestData.topThree[0].name}</p>
                  <p className="text-secondary text-[8px] text-center truncate">{weeklyContestData.topThree[0].team}</p>
                  <p className="text-primary-light font-bold text-[10px] text-center mt-1">Score: {weeklyContestData.topThree[0].score}</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center w-[90px]">
                <div className="w-10 h-10 bg-secondary-light rounded-lg border border-surface-dark flex items-center justify-center mb-1">
                  <span className="text-surface text-[10px] font-bold">3rd</span>
                </div>
                <div className="bg-secondary-light rounded-lg p-1.5 w-full border border-surface-dark">
                  <p className="text-white font-bold text-xs text-center truncate">{weeklyContestData.topThree[2].name}</p>
                  <p className="text-surface text-[8px] text-center truncate">{weeklyContestData.topThree[2].team}</p>
                  <p className="text-white font-bold text-[10px] text-center mt-1">Score: {weeklyContestData.topThree[2].score}</p>
                </div>
              </div>
            </div>

            {/* Player List */}
            <div className="space-y-1">
              {weeklyContestData.players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => !player.isPlayer && openModal('member-profile', { memberId: player.id })}
                  className={`w-full rounded-lg p-1.5 flex items-center gap-2 ${
                    player.isPlayer ? 'bg-primary-light border border-secondary' : 'bg-surface-light border border-surface hover:bg-surface transition-colors'
                  }`}
                >
                  <span className={`w-5 text-xs font-bold ${player.isPlayer ? 'text-white' : 'text-secondary'}`}>
                    {player.rank}
                  </span>
                  <div className="w-8 h-8 bg-surface-dark rounded flex items-center justify-center border border-surface">
                    <span className="text-secondary text-[8px] font-bold">AVA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-bold ${player.isPlayer ? 'text-white' : 'text-primary-light'}`}>{player.name}</p>
                    {player.team && (
                      <p className={`text-[10px] ${player.isPlayer ? 'text-surface-dark' : 'text-secondary-light'}`}>{player.team}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] ${player.isPlayer ? 'text-surface-dark' : 'text-secondary-light'}`}>Score</span>
                    <p className={`text-xs font-bold ${player.isPlayer ? 'text-white' : 'text-primary-light'}`}>{player.score}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <div className="mt-3">
              <button className="w-full bg-surface-dark border-2 border-surface rounded-lg py-2">
                <span className="text-primary-light font-bold text-sm">Continue</span>
              </button>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="bg-secondary-light p-2">
            {/* Sub Tabs */}
            <div className="flex gap-1.5 mb-3">
              {(['list', 'add'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFriendsSubTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    friendsSubTab === tab
                      ? 'bg-primary-light text-white border border-secondary'
                      : 'bg-surface-dark text-secondary border border-surface'
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
                    friend.isPlayer ? 'bg-primary-light border border-secondary' : 'bg-surface-light border border-surface hover:bg-surface transition-colors'
                  }`}
                >
                  {getRankBadge(friend.rank)}
                  <div className="w-8 h-8 bg-surface-dark rounded flex items-center justify-center border border-surface">
                    <span className="text-secondary text-[8px] font-bold">AVA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-bold ${friend.isPlayer ? 'text-white' : 'text-primary-light'}`}>{friend.name}</p>
                    {friend.team && (
                      <p className={`text-[10px] ${friend.isPlayer ? 'text-surface-dark' : 'text-secondary-light'}`}>{friend.team}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] ${friend.isPlayer ? 'text-surface-dark' : 'text-secondary-light'}`}>Level</span>
                    <p className={`text-xs font-bold ${friend.isPlayer ? 'text-white' : 'text-primary-light'}`}>{friend.level}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Connect Button */}
            <div className="mt-4">
              <button className="w-full bg-surface-dark border-2 border-surface rounded-lg py-2 flex items-center justify-center gap-2">
                <span className="text-primary-light font-bold text-sm">f</span>
                <span className="text-primary-light font-bold text-sm">Connect</span>
              </button>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="bg-secondary-light p-2">
            {/* Region Filter */}
            <div className="flex gap-1.5 mb-3">
              {(['world', 'local'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    regionFilter === region
                      ? 'bg-primary-light text-white border border-secondary'
                      : 'bg-surface-dark text-secondary border border-surface'
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
                  className="w-full bg-surface-light rounded-lg p-1.5 flex items-center gap-2 border border-surface hover:bg-surface transition-colors"
                >
                  {getRankBadge(player.rank)}
                  <div className="w-8 h-8 bg-surface-dark rounded flex items-center justify-center border border-surface">
                    <span className="text-secondary text-[8px] font-bold">AVA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-primary-light">{player.name}</p>
                    <p className="text-[10px] text-secondary-light">{player.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-secondary-light">Level</span>
                    <p className="text-xs font-bold text-primary-light">{player.level}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="bg-secondary-light p-2">
            {/* Region Filter */}
            <div className="flex gap-1.5 mb-3">
              {(['world', 'local'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    regionFilter === region
                      ? 'bg-primary-light text-white border border-secondary'
                      : 'bg-surface-dark text-secondary border border-surface'
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
                  className="w-full bg-surface-light rounded-lg p-1.5 flex items-center gap-2 border border-surface hover:bg-surface transition-colors"
                >
                  {getRankBadge(team.rank)}
                  <div className="w-8 h-8 bg-surface-dark rounded flex items-center justify-center border-2 border-surface">
                    <span className="text-secondary text-[8px] font-bold">LOGO</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-primary-light">{team.name}</p>
                  </div>
                  <div className="text-right mr-1">
                    <span className="text-[10px] text-secondary-light">Capacity</span>
                    <p className="text-xs font-bold text-secondary">{team.capacity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-secondary-light">Score</span>
                    <p className="text-xs font-bold text-primary-light">{team.score.toLocaleString()}</p>
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
