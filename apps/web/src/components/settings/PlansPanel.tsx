/**
 * Plans & Credits Panel
 * Shows current plan, credits, and upgrade options
 */

import { CreditCard, X, Check } from 'lucide-react';
import type { UsageStats } from '../../types';

interface PlansPanelProps {
  usageStats: UsageStats | null;
}

export function PlansPanel({ usageStats }: PlansPanelProps) {
  const totalCredits = usageStats?.totalCredits || 5;
  const creditsUsed = usageStats?.creditsUsed || 0;
  const creditsRemaining = usageStats?.creditsRemaining || totalCredits;
  const usagePercent = (creditsUsed / totalCredits) * 100;

  return (
    <div>
      <h2 className="text-2xl font-bold text-content">Plans & credits</h2>

      {/* Current Plan & Credits */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Current Plan */}
        <div className="rounded-xl border border-border-muted bg-surface-overlay/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-secondary">
              <CreditCard className="h-5 w-5 text-content" />
            </div>
            <div>
              <p className="font-medium text-content">You're on Free Plan</p>
              <p className="text-sm text-content-muted">Upgrade anytime</p>
            </div>
          </div>
          <button className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-content hover:bg-surface-overlay">
            Manage
          </button>
        </div>

        {/* Credits Remaining */}
        <div className="rounded-xl border border-border-muted bg-surface-overlay/50 p-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-content">Credits remaining</p>
            <p className="text-sm text-content-muted">
              {creditsRemaining.toFixed(1)} of {totalCredits}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full bg-gradient-to-r from-accent-light to-secondary"
              style={{ width: `${100 - usagePercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-content-muted">
            <span className="flex items-center gap-1">
              <X className="h-3 w-3" /> No credits will rollover
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-accent" /> Daily credits reset
              at midnight UTC
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Pro */}
        <PlanCard
          name="Pro"
          description="Designed for fast-moving teams building together in real time."
          price="$25"
          period="per month"
          subtitle="shared across unlimited users"
          buttonText="Upgrade"
          buttonVariant="primary"
          features={[
            'All features in Free, plus:',
            '100 monthly credits',
            '5 daily credits (up to 150/month)',
          ]}
        />

        {/* Business */}
        <PlanCard
          name="Business"
          description="Advanced controls and power features for growing departments."
          price="$50"
          period="per month"
          subtitle="shared across unlimited users"
          buttonText="Upgrade"
          buttonVariant="secondary"
          features={[
            'All features in Pro, plus:',
            '100 monthly credits',
            'Internal publish',
          ]}
        />

        {/* Enterprise */}
        <PlanCard
          name="Enterprise"
          description="Built for large orgs needing flexibility, scale, and governance."
          price="Custom"
          subtitle="Flexible plans"
          buttonText="Book a demo"
          buttonVariant="secondary"
          features={[
            'All features in Business, plus:',
            'Dedicated support',
            'Custom connections',
          ]}
        />
      </div>
    </div>
  );
}

interface PlanCardProps {
  name: string;
  description: string;
  price: string;
  period?: string;
  subtitle: string;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
  features: string[];
}

function PlanCard({
  name,
  description,
  price,
  period,
  subtitle,
  buttonText,
  buttonVariant,
  features,
}: PlanCardProps) {
  return (
    <div className="rounded-xl border border-border-muted bg-surface-overlay/30 p-6">
      <h3 className="text-xl font-bold text-content">{name}</h3>
      <p className="mt-2 text-sm text-content-muted">{description}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-content">{price}</span>
        {period && <span className="text-content-muted"> {period}</span>}
      </div>
      <p className="text-sm text-content-subtle">{subtitle}</p>
      <button
        className={`mt-4 w-full rounded-lg py-2.5 font-medium text-content ${
          buttonVariant === 'primary'
            ? 'bg-accent hover:bg-accent-light'
            : 'bg-surface-elevated hover:bg-surface-overlay'
        }`}
      >
        {buttonText}
      </button>
      <div className="mt-4 space-y-2 text-sm text-content-muted">
        {features.map((feature, index) => (
          <p
            key={index}
            className={index === 0 ? '' : 'flex items-center gap-2'}
          >
            {index > 0 && <Check className="h-4 w-4 text-accent" />}
            {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
