'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/store';
import { BottomNavigation } from '@/components/shared';

// Sample teams data
const teamsData = [
  { id: 1, name: 'MAARDU 45', capacity: 43, maxCapacity: 50 },
  { id: 2, name: 'Juuli', capacity: 45, maxCapacity: 50 },
  { id: 3, name: 'Tallinn', capacity: 39, maxCapacity: 50 },
  { id: 4, name: 'Soone', capacity: 46, maxCapacity: 50 },
  { id: 5, name: 'BerjozkA', capacity: 43, maxCapacity: 50 },
  { id: 6, name: 'SeamensClub', capacity: 35, maxCapacity: 50 },
  { id: 7, name: 'karvane varvas', capacity: 46, maxCapacity: 50 },
  { id: 8, name: 'tubli', capacity: 32, maxCapacity: 50 },
];

const teamTypes = ['Open', 'Closed', 'Request'];

const tabs = [
  { id: 'join', label: 'Join' },
  { id: 'search', label: 'Search' },
  { id: 'create', label: 'Create' },
] as const;

export function TeamPage() {
  const { openModal } = useNavigation();
  const [activeTab, setActiveTab] = useState<'join' | 'search' | 'create'>('join');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef<string>('join');
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Create team form state
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamTypeIndex, setTeamTypeIndex] = useState(0);
  const [requiredLevel, setRequiredLevel] = useState(0);
  const [requiredCrown, setRequiredCrown] = useState(0);

  // Animate content when tab changes
  useEffect(() => {
    if (!contentRef.current || prevTabRef.current === activeTab) return;

    const prevIndex = tabs.findIndex((t) => t.id === prevTabRef.current);
    const newIndex = tabs.findIndex((t) => t.id === activeTab);
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

  const handleViewTeam = (teamId: number) => {
    openModal('team-info', { teamId });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'join' | 'search' | 'create');
  };

  const setTabRef = (tabId: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(tabId, el);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="bg-bg-muted py-3 px-4 border-b border-border">
        <h1 className="text-text-primary text-h4 text-center">Teams</h1>
      </div>

      {/* Tab Bar */}
      <div className="bg-bg-page px-2 py-1.5 border-b border-border">
        <div className="relative flex bg-bg-inverse rounded border border-border overflow-hidden">
          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-0 bottom-0 bg-border-strong rounded"
            style={{ width: `${100 / tabs.length}%` }}
          />

          {/* Tab buttons */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => setTabRef(tab.id, el)}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-1.5 text-center text-value-sm transition-colors relative z-10 ${
                activeTab === tab.id ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto bg-bg-inverse">
        {/* Join Tab */}
        {activeTab === 'join' && (
          <div className="p-2 space-y-1.5">
            {teamsData.map((team) => (
              <TeamCard key={team.id} team={team} onView={() => handleViewTeam(team.id)} />
            ))}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="p-3">
            {/* Search Input */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex items-center bg-bg-muted rounded px-2 py-1.5 border border-border">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter team name..."
                  className="flex-1 bg-transparent text-text-primary text-caption placeholder-text-muted outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-text-muted ml-1">
                    <span className="text-body-sm">×</span>
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="bg-border-strong border border-border rounded px-3 py-1.5"
              >
                <span className="text-text-primary text-value-sm">Search</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border mb-3" />

            {!showSearchResults ? (
              <div className="text-center">
                <p className="text-text-primary text-caption mb-2">
                  Check suggested teams for you
                </p>
                <button
                  onClick={() => setShowSearchResults(true)}
                  className="bg-border-strong border border-border rounded px-6 py-1.5"
                >
                  <span className="text-text-primary text-value-sm">Show</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {teamsData.map((team) => (
                  <TeamCard key={team.id} team={team} onView={() => handleViewTeam(team.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="p-3 space-y-3">
            {/* Team Logo */}
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-value-sm w-20">Team Logo</span>
              <div className="w-10 h-10 bg-border-strong rounded border border-border flex items-center justify-center">
                <span className="text-text-secondary text-mini">LOGO</span>
              </div>
              <button className="bg-border-strong border border-border rounded px-3 py-1">
                <span className="text-text-primary text-value-sm">Choose</span>
              </button>
            </div>

            {/* Team Name */}
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-value-sm w-20">Team Name</span>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name..."
                className="flex-1 bg-bg-page rounded px-2 py-1.5 text-caption text-text-primary placeholder-text-muted outline-none"
              />
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <span className="text-text-primary text-mini font-bold w-20 pt-1">Description</span>
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Enter team description..."
                className="flex-1 bg-bg-page rounded px-2 py-1.5 text-caption text-text-primary placeholder-text-muted outline-none resize-none h-16"
              />
            </div>

            {/* Team Type */}
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-value-sm w-20">Team Type</span>
              <div className="flex-1 flex items-center gap-1">
                <button
                  onClick={() => setTeamTypeIndex((prev) => (prev > 0 ? prev - 1 : teamTypes.length - 1))}
                  className="w-7 h-7 bg-border-strong rounded-full flex items-center justify-center border border-border"
                >
                  <span className="text-text-primary text-body-sm">‹</span>
                </button>
                <div className="flex-1 bg-bg-muted rounded py-1.5 border border-border">
                  <span className="text-text-primary text-value-sm text-center block">{teamTypes[teamTypeIndex]}</span>
                </div>
                <button
                  onClick={() => setTeamTypeIndex((prev) => (prev < teamTypes.length - 1 ? prev + 1 : 0))}
                  className="w-7 h-7 bg-border-strong rounded-full flex items-center justify-center border border-border"
                >
                  <span className="text-text-primary text-body-sm">›</span>
                </button>
              </div>
            </div>

            {/* Required Level */}
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-value-sm w-20">Req. Level</span>
              <div className="flex-1 flex items-center gap-1">
                <button
                  onClick={() => setRequiredLevel((prev) => Math.max(0, prev - 100))}
                  className="w-7 h-7 bg-border-strong rounded-full flex items-center justify-center border border-border"
                >
                  <span className="text-text-primary text-body-sm">‹</span>
                </button>
                <div className="flex-1 bg-bg-muted rounded py-1.5 border border-border">
                  <span className="text-text-primary text-value-sm text-center block">{requiredLevel}</span>
                </div>
                <button
                  onClick={() => setRequiredLevel((prev) => prev + 100)}
                  className="w-7 h-7 bg-border-strong rounded-full flex items-center justify-center border border-border"
                >
                  <span className="text-text-primary text-body-sm">›</span>
                </button>
              </div>
            </div>

            {/* Required Crown */}
            <div className="flex items-center gap-3">
              <span className="text-text-primary text-value-sm w-20">Req. Crown</span>
              <div className="flex-1 flex items-center gap-1">
                <button
                  onClick={() => setRequiredCrown((prev) => Math.max(0, prev - 100))}
                  className="w-7 h-7 bg-border-strong rounded-full flex items-center justify-center border border-border"
                >
                  <span className="text-text-primary text-body-sm">‹</span>
                </button>
                <div className="flex-1 bg-bg-muted rounded py-1.5 border border-border">
                  <span className="text-text-primary text-value-sm text-center block">{requiredCrown}</span>
                </div>
                <button
                  onClick={() => setRequiredCrown((prev) => prev + 100)}
                  className="w-7 h-7 bg-border-strong rounded-full flex items-center justify-center border border-border"
                >
                  <span className="text-text-primary text-body-sm">›</span>
                </button>
              </div>
            </div>

            {/* Create Button */}
            <div className="pt-2">
              <button className="w-full bg-border-strong border-2 border-border rounded-lg py-2 flex items-center justify-center gap-2">
                <span className="text-text-primary text-value">Create</span>
                <span className="text-text-secondary text-value">100</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="team" />
    </div>
  );
}

// Team Card Component
interface TeamCardProps {
  team: {
    id: number;
    name: string;
    capacity: number;
    maxCapacity: number;
  };
  onView: () => void;
}

function TeamCard({ team, onView }: TeamCardProps) {
  return (
    <div className="bg-bg-page rounded-lg border border-border p-2 flex items-center gap-2">
      {/* Team Logo */}
      <div className="w-10 h-10 bg-border-strong rounded border-2 border-border flex items-center justify-center">
        <span className="text-text-secondary text-mini">LOGO</span>
      </div>

      {/* Team Name */}
      <div className="flex-1">
        <h3 className="text-text-primary text-value-sm">{team.name}</h3>
      </div>

      {/* Capacity */}
      <div className="text-right mr-1">
        <span className="text-text-muted text-mini">Capacity</span>
        <p className="text-text-secondary text-value-sm">{team.capacity}/{team.maxCapacity}</p>
      </div>

      {/* View Button */}
      <button
        onClick={onView}
        className="bg-border-strong border border-border rounded px-3 py-1"
      >
        <span className="text-text-primary text-value-sm">View</span>
      </button>
    </div>
  );
}
