/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        LIVEOPS EVENT PAGE TEMPLATE                         ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Time-limited events with progress tracking                  ║
 * ║                                                                            ║
 * ║  Features:                                                                 ║
 * ║  - Event timer countdown                                                   ║
 * ║  - Progress bar with milestones                                            ║
 * ║  - Rewards display                                                         ║
 * ║  - Info modal support                                                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { useEvent, useTimer, useModal } from '@/hooks';
import { BottomNavigation } from '@/components/shared';
import { ProgressBar } from '@/components/base';

// ═══════════════════════════════════════════════════════════════════════════
// TODO: Update these values for your event
// ═══════════════════════════════════════════════════════════════════════════

const EVENT_ID = 'your-event-id'; // Must match registry
const PAGE_ID = 'your-event-page';
const EVENT_TITLE = 'Your Event Name';
const EVENT_DESCRIPTION = 'Complete challenges to earn rewards!';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Milestone {
  id: string;
  target: number;
  reward: {
    type: string;
    amount: number;
    name?: string;
  };
  claimed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - TODO: Replace with real data or config
// ═══════════════════════════════════════════════════════════════════════════

const MILESTONES: Milestone[] = [
  { id: 'm1', target: 3, reward: { type: 'coins', amount: 500 }, claimed: false },
  { id: 'm2', target: 5, reward: { type: 'booster', amount: 1, name: 'Hammer' }, claimed: false },
  { id: 'm3', target: 8, reward: { type: 'coins', amount: 1000 }, claimed: false },
  { id: 'm4', target: 10, reward: { type: 'coins', amount: 2500 }, claimed: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function YourEventPage() {
  const { navigate, goBack } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const { open } = useModal();

  // Event data
  const event = useEvent(EVENT_ID, { optional: true });

  // Timer for countdown - use event endTime or null if not available
  const endTime = event.endTime instanceof Date ? event.endTime : event.endTime ? new Date(event.endTime) : null;
  const timer = useTimer(endTime);

  // Local state
  const [showInfo, setShowInfo] = useState(false);

  // ─────────────────────────────────────────────────────────────────────
  // CHECK IF EVENT IS ENABLED
  // ─────────────────────────────────────────────────────────────────────

  if (!isEventEnabled(EVENT_ID)) {
    return (
      <div className="flex flex-col h-full bg-bg-page">
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h2 className="text-h3 text-text-primary mb-2">Event Not Available</h2>
            <p className="text-body text-text-muted mb-4">
              This event is currently not active.
            </p>
            <button
              onClick={() => navigate('main-menu')}
              className="px-4 py-2 bg-bg-inverse text-text-inverse rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  const handleClaimMilestone = (milestone: Milestone) => {
    if (event.progress >= milestone.target && !milestone.claimed) {
      // TODO: Dispatch claim action
      console.log('Claiming milestone:', milestone);
      open('reward-claim');
    }
  };

  const handleAddProgress = () => {
    // TODO: This is for testing - remove in production
    event.addProgress(1);
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-bg-page">
      {/* Header */}
      <header className="relative bg-bg-inverse text-text-inverse">
        {/* Close button */}
        <button
          onClick={goBack}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
        >
          <span>&times;</span>
        </button>

        {/* Info button */}
        <button
          onClick={() => setShowInfo(true)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
        >
          <span>?</span>
        </button>

        {/* Event Title & Timer */}
        <div className="pt-12 pb-4 px-4 text-center">
          <h1 className="text-h2 font-bold mb-1">{EVENT_TITLE}</h1>
          <p className="text-body-sm opacity-80 mb-3">{EVENT_DESCRIPTION}</p>

          {/* Timer */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
            <span className="text-caption">Ends in:</span>
            <span className="text-value font-mono">
              {timer.formatted || event.timeRemainingFormatted}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="px-4 py-4 bg-bg-card border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-body-sm text-text-muted">Progress</span>
          <span className="text-value font-bold text-text-primary">
            {event.progress} / {event.maxProgress}
          </span>
        </div>
        <ProgressBar
          current={event.progress}
          max={event.maxProgress}
          size="md"
        />

        {/* Debug button - TODO: Remove in production */}
        <button
          onClick={handleAddProgress}
          className="mt-2 text-caption text-text-muted underline"
        >
          [Debug] Add Progress
        </button>
      </div>

      {/* Milestones */}
      <main className="flex-1 overflow-y-auto p-4">
        <h2 className="text-h4 text-text-primary mb-3">Milestones</h2>
        <div className="space-y-3">
          {MILESTONES.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              currentProgress={event.progress}
              onClaim={() => handleClaimMilestone(milestone)}
            />
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activePage={PAGE_ID} />

      {/* Info Modal */}
      {showInfo && (
        <InfoModal
          title={EVENT_TITLE}
          description={EVENT_DESCRIPTION}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MilestoneCardProps {
  milestone: Milestone;
  currentProgress: number;
  onClaim: () => void;
}

function MilestoneCard({ milestone, currentProgress, onClaim }: MilestoneCardProps) {
  const isUnlocked = currentProgress >= milestone.target;
  const isClaimed = milestone.claimed;

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl border-2
        ${isClaimed
          ? 'bg-bg-muted border-border opacity-60'
          : isUnlocked
            ? 'bg-bg-card border-brand-primary'
            : 'bg-bg-card border-border'
        }
      `}
    >
      {/* Progress indicator */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-caption font-bold
          ${isUnlocked ? 'bg-bg-inverse text-text-inverse' : 'bg-bg-muted text-text-muted'}
        `}
      >
        {milestone.target}
      </div>

      {/* Reward info */}
      <div className="flex-1">
        <div className="text-body font-medium text-text-primary">
          {milestone.reward.name || milestone.reward.type}
        </div>
        <div className="text-body-sm text-text-muted">
          x{milestone.reward.amount}
        </div>
      </div>

      {/* Claim button */}
      {isClaimed ? (
        <span className="text-caption text-text-muted">Claimed</span>
      ) : isUnlocked ? (
        <button
          onClick={onClaim}
          className="px-3 py-1.5 bg-bg-inverse text-text-inverse rounded-lg text-caption font-bold"
        >
          Claim
        </button>
      ) : (
        <span className="text-caption text-text-muted">
          {currentProgress}/{milestone.target}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INFO MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface InfoModalProps {
  title: string;
  description: string;
  onClose: () => void;
}

function InfoModal({ title, description, onClose }: InfoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[300px] bg-bg-card rounded-xl border-2 border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
          <h2 className="text-text-inverse text-h4">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center"
          >
            <span className="text-text-primary">&times;</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-body text-text-secondary mb-4">{description}</p>
          <h3 className="text-label font-bold text-text-primary mb-2">How to Play:</h3>
          <ul className="text-body-sm text-text-muted space-y-1 list-disc list-inside">
            <li>Complete levels to earn progress</li>
            <li>Reach milestones to unlock rewards</li>
            <li>Claim rewards before time runs out</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-bg-inverse text-text-inverse rounded-lg font-bold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default YourEventPage;
