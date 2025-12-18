'use client';

import React from 'react';
import { BottomNavigation, FeatureDisabled } from '@/components/shared';
import { isFeatureEnabled } from '@/config/features';

// Mock data for areas
const areasData = [
  { id: 42, name: 'Royal Garden', completed: true },
  { id: 41, name: 'Magic Room', completed: true },
  { id: 40, name: 'Candy Shop', completed: true },
  { id: 39, name: 'Royal Library', completed: true },
  { id: 38, name: 'Trophy Hall', completed: false, progress: '8/12' },
];

export function AreaTasksPage() {
  // Feature flag check
  if (!isFeatureEnabled('AREAS')) {
    return <FeatureDisabled featureName="Areas" />;
  }

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="bg-bg-muted py-3 px-4 border-b border-border">
        <h1 className="text-text-primary text-h4 text-center">Areas</h1>
      </div>

      {/* Areas List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {areasData.map((area) => (
          <div key={area.id} className="relative">
            {/* Area Number Badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-bg-muted rounded-full px-3 py-0.5 border border-bg-page">
                <span className="text-text-primary text-value-sm">Area {area.id}</span>
              </div>
            </div>

            {/* Area Card */}
            <div className="bg-brand-muted rounded-xl border-2 border-border-strong overflow-hidden pt-3">
              {/* Area Name Banner */}
              <div className="bg-border-strong mx-1.5 rounded-t-lg border border-bg-muted border-b-0">
                <div className="py-1.5 px-3 text-center">
                  <h2 className="text-text-primary text-value-sm">{area.name}</h2>
                </div>
              </div>

              {/* Area Image */}
              <div className="mx-1.5 bg-bg-muted border border-border-strong border-t-0 rounded-b-lg">
                <div className="aspect-[16/10] flex items-center justify-center relative">
                  <span className="text-text-muted text-value-sm">[Area Image]</span>

                  {/* Status and View Button */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    {area.completed ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-primary text-value-sm">[check]</span>
                        <span className="text-text-primary text-value-sm">Completed!</span>
                      </div>
                    ) : (
                      <div className="bg-border-strong rounded px-2 py-0.5">
                        <span className="text-text-primary text-value-sm">{area.progress}</span>
                      </div>
                    )}

                    <button className="bg-border-strong border-2 border-bg-muted rounded-lg px-3 py-1">
                      <span className="text-text-primary text-value-sm">View</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="areas" />
    </div>
  );
}
