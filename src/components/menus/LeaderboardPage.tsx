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
        rank <= 3 ? 'bg-slate-400 border border-slate-300' : ''
      }`}>
        <span className="text-xs font-bold text-slate-700">{rank}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-600">
      {/* Header */}
      <div className="bg-slate-700 py-3 px-4">
        <h1 className="text-white text-base font-bold text-center">Leaderboard</h1>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-slate-500" />

      {/* Main Tab Bar */}
      <div className="bg-slate-500 px-2 py-1.5">
        <div className="relative flex bg-slate-600 rounded border border-slate-500 overflow-hidden">
          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-0 bottom-0 bg-slate-400 rounded"
            style={{ width: `${100 / mainTabs.length}%` }}
          />

          {/* Tab buttons */}
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => setTabRef(tab.id, el)}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-1.5 text-center text-xs font-bold transition-colors relative z-10 ${
                activeTab === tab.id ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {tab.label}
              {tab.id === 'weekly' && activeTab === 'weekly' && (
                <div className="absolute -bottom-1 left-1 bg-slate-700 rounded-full px-1.5 py-0.5 text-[8px] text-white z-20">
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
          <div className="bg-slate-500 p-2">
            {/* Weekly Contest Banner */}
            <div className="flex justify-center mb-3">
              <div className="bg-slate-400 rounded px-6 py-1.5 border border-slate-300">
                <span className="text-slate-700 font-bold text-sm">Weekly Contest</span>
              </div>
            </div>

            {/* Info button */}
            <button
              onClick={() => openModal('weekly-contest-info')}
              className="absolute left-4 top-36 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center border border-slate-300"
            >
              <span className="text-slate-700 font-bold text-xs">i</span>
            </button>

            {/* Podium */}
            <div className="flex justify-center items-end gap-1.5 mb-3 px-1">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-[90px]">
                <div className="w-10 h-10 bg-slate-400 rounded-lg border border-slate-300 flex items-center justify-center mb-1">
                  <span className="text-slate-600 text-[10px] font-bold">2nd</span>
                </div>
                <div className="bg-slate-400 rounded-lg p-1.5 w-full border border-slate-300">
                  <p className="text-slate-700 font-bold text-xs text-center truncate">{weeklyContestData.topThree[1].name}</p>
                  <p className="text-slate-600 text-[8px] text-center truncate">{weeklyContestData.topThree[1].team}</p>
                  <p className="text-slate-700 font-bold text-[10px] text-center mt-1">Score: {weeklyContestData.topThree[1].score}</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center w-[95px] -mt-3">
                <div className="w-11 h-11 bg-slate-300 rounded-lg border border-slate-200 flex items-center justify-center mb-1">
                  <span className="text-slate-600 text-xs font-bold">1st</span>
                </div>
                <div className="bg-slate-300 rounded-lg p-1.5 w-full border border-slate-200">
                  <p className="text-slate-700 font-bold text-xs text-center truncate">{weeklyContestData.topThree[0].name}</p>
                  <p className="text-slate-600 text-[8px] text-center truncate">{weeklyContestData.topThree[0].team}</p>
                  <p className="text-slate-700 font-bold text-[10px] text-center mt-1">Score: {weeklyContestData.topThree[0].score}</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center w-[90px]">
                <div className="w-10 h-10 bg-slate-500 rounded-lg border border-slate-400 flex items-center justify-center mb-1">
                  <span className="text-slate-300 text-[10px] font-bold">3rd</span>
                </div>
                <div className="bg-slate-500 rounded-lg p-1.5 w-full border border-slate-400">
                  <p className="text-white font-bold text-xs text-center truncate">{weeklyContestData.topThree[2].name}</p>
                  <p className="text-slate-300 text-[8px] text-center truncate">{weeklyContestData.topThree[2].team}</p>
                  <p className="text-white font-bold text-[10px] text-center mt-1">Score: {weeklyContestData.topThree[2].score}</p>
                </div>
              </div>
            </div>

            {/* Player List */}
            <div className="space-y-1">
              {weeklyContestData.players.map((player) => (
                <div
                  key={player.id}
                  className={`rounded-lg p-1.5 flex items-center gap-2 ${
                    player.isPlayer ? 'bg-slate-700 border border-slate-600' : 'bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span className={`w-5 text-xs font-bold ${player.isPlayer ? 'text-white' : 'text-slate-600'}`}>
                    {player.rank}
                  </span>
                  <div className="w-8 h-8 bg-slate-400 rounded flex items-center justify-center border border-slate-300">
                    <span className="text-slate-600 text-[8px] font-bold">AVA</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${player.isPlayer ? 'text-white' : 'text-slate-700'}`}>{player.name}</p>
                    {player.team && (
                      <p className={`text-[10px] ${player.isPlayer ? 'text-slate-400' : 'text-slate-500'}`}>{player.team}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] ${player.isPlayer ? 'text-slate-400' : 'text-slate-500'}`}>Score</span>
                    <p className={`text-xs font-bold ${player.isPlayer ? 'text-white' : 'text-slate-700'}`}>{player.score}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="mt-3">
              <button className="w-full bg-slate-400 border-2 border-slate-300 rounded-lg py-2">
                <span className="text-slate-700 font-bold text-sm">Continue</span>
              </button>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="bg-slate-500 p-2">
            {/* Sub Tabs */}
            <div className="flex gap-1.5 mb-3">
              {(['list', 'add'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFriendsSubTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    friendsSubTab === tab
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-400 text-slate-600 border border-slate-300'
                  }`}
                >
                  {tab === 'list' ? 'Friends List' : 'Add Friends'}
                </button>
              ))}
            </div>

            {/* Friends List */}
            <div className="space-y-1">
              {friendsData.map((friend) => (
                <div
                  key={friend.id}
                  className={`rounded-lg p-1.5 flex items-center gap-2 ${
                    friend.isPlayer ? 'bg-slate-700 border border-slate-600' : 'bg-slate-200 border border-slate-300'
                  }`}
                >
                  {getRankBadge(friend.rank)}
                  <div className="w-8 h-8 bg-slate-400 rounded flex items-center justify-center border border-slate-300">
                    <span className="text-slate-600 text-[8px] font-bold">AVA</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${friend.isPlayer ? 'text-white' : 'text-slate-700'}`}>{friend.name}</p>
                    {friend.team && (
                      <p className={`text-[10px] ${friend.isPlayer ? 'text-slate-400' : 'text-slate-500'}`}>{friend.team}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] ${friend.isPlayer ? 'text-slate-400' : 'text-slate-500'}`}>Level</span>
                    <p className={`text-xs font-bold ${friend.isPlayer ? 'text-white' : 'text-slate-700'}`}>{friend.level}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Connect Button */}
            <div className="mt-4">
              <button className="w-full bg-slate-400 border-2 border-slate-300 rounded-lg py-2 flex items-center justify-center gap-2">
                <span className="text-slate-700 font-bold text-sm">f</span>
                <span className="text-slate-700 font-bold text-sm">Connect</span>
              </button>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="bg-slate-500 p-2">
            {/* Region Filter */}
            <div className="flex gap-1.5 mb-3">
              {(['world', 'local'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    regionFilter === region
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-400 text-slate-600 border border-slate-300'
                  }`}
                >
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </button>
              ))}
            </div>

            {/* Players List */}
            <div className="space-y-1">
              {playersData.map((player) => (
                <div
                  key={player.id}
                  className="bg-slate-200 rounded-lg p-1.5 flex items-center gap-2 border border-slate-300"
                >
                  {getRankBadge(player.rank)}
                  <div className="w-8 h-8 bg-slate-400 rounded flex items-center justify-center border border-slate-300">
                    <span className="text-slate-600 text-[8px] font-bold">AVA</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">{player.name}</p>
                    <p className="text-[10px] text-slate-500">{player.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">Level</span>
                    <p className="text-xs font-bold text-slate-700">{player.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="bg-slate-500 p-2">
            {/* Region Filter */}
            <div className="flex gap-1.5 mb-3">
              {(['world', 'local'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                    regionFilter === region
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-400 text-slate-600 border border-slate-300'
                  }`}
                >
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </button>
              ))}
            </div>

            {/* Teams List */}
            <div className="space-y-1">
              {teamsData.map((team) => (
                <div
                  key={team.id}
                  className="bg-slate-200 rounded-lg p-1.5 flex items-center gap-2 border border-slate-300"
                >
                  {getRankBadge(team.rank)}
                  <div className="w-8 h-8 bg-slate-400 rounded flex items-center justify-center border-2 border-slate-300">
                    <span className="text-slate-600 text-[8px] font-bold">LOGO</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">{team.name}</p>
                  </div>
                  <div className="text-right mr-1">
                    <span className="text-[10px] text-slate-500">Capacity</span>
                    <p className="text-xs font-bold text-slate-600">{team.capacity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">Score</span>
                    <p className="text-xs font-bold text-slate-700">{team.score.toLocaleString()}</p>
                  </div>
                </div>
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
