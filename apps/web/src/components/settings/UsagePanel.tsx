/**
 * Usage Panel
 * Shows activity stats and usage metrics with remaining messages prominently displayed
 */

import { Zap, MessageSquare, Folder, Flame } from 'lucide-react';
import type { UsageStats } from '../../types';

interface UsagePanelProps {
  usageStats: UsageStats | null;
}

export function UsagePanel({ usageStats }: UsagePanelProps) {
  const creditsRemaining = usageStats?.creditsRemaining ?? 0;
  const totalCredits = usageStats?.totalCredits ?? 50;
  const usagePercentage = totalCredits > 0 ? ((totalCredits - creditsRemaining) / totalCredits) * 100 : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-content">Usage</h2>
      <p className="mt-1 text-content-muted">Monitor your AI usage and activity.</p>

      {/* Remaining Messages - Prominent Display */}
      <div className="mt-8 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-secondary/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-content-muted">Remaining Messages</p>
              <p className="text-3xl font-bold text-content">
                {creditsRemaining}
                <span className="ml-1 text-lg font-normal text-content-subtle">/ {totalCredits}</span>
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-content transition-colors hover:bg-accent-light">
            <Zap className="h-4 w-4" />
            Upgrade
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-light to-secondary transition-all duration-300"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-content-subtle">
            {usagePercentage.toFixed(0)}% of your monthly messages used
          </p>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="mt-6 rounded-xl border border-border-muted bg-surface-overlay/30 p-6">
        <h3 className="font-medium text-content">Activity this year</h3>
        <div className="mt-4 grid grid-cols-[repeat(52,1fr)] gap-1">
          {Array.from({ length: 364 }).map((_, i) => {
            // Create some visual variation based on index
            const intensity = Math.random();
            let bgColor = 'bg-surface-elevated';
            if (i > 300) {
              if (intensity > 0.8) bgColor = 'bg-accent-light';
              else if (intensity > 0.6) bgColor = 'bg-accent/70';
              else if (intensity > 0.4) bgColor = 'bg-accent/50';
            }
            return <div key={i} className={`aspect-square rounded-sm ${bgColor}`} />;
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={Folder}
          label="Projects"
          value={usageStats?.projectsCount || 0}
        />
        <StatCard
          icon={MessageSquare}
          label="Messages used"
          value={usageStats?.creditsUsed || 0}
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${usageStats?.currentStreak || 0}d`}
        />
        <StatCard
          icon={Zap}
          label="Daily average"
          value={usageStats?.dailyAverage?.toFixed(1) || '0'}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: typeof Zap;
  label: string;
  value: string | number;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border-muted bg-surface-overlay/30 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-content-subtle" />
        <p className="text-xs text-content-muted">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-content">{value}</p>
    </div>
  );
}
