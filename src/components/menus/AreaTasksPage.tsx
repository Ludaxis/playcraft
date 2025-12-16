'use client';

import React from 'react';
import { BottomNavigation } from '@/components/shared';

// Mock data for areas
const areasData = [
  { id: 42, name: 'Royal Garden', completed: true },
  { id: 41, name: 'Magic Room', completed: true },
  { id: 40, name: 'Candy Shop', completed: true },
  { id: 39, name: 'Royal Library', completed: true },
  { id: 38, name: 'Trophy Hall', completed: false, progress: '8/12' },
];

export function AreaTasksPage() {
  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="bg-primary-light py-3 px-4">
        <h1 className="text-white text-base font-bold text-center">Areas</h1>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-secondary-light" />

      {/* Areas List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {areasData.map((area) => (
          <div key={area.id} className="relative">
            {/* Area Number Badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-surface rounded-full px-3 py-0.5 border border-surface-light">
                <span className="text-primary-light font-bold text-[10px]">Area {area.id}</span>
              </div>
            </div>

            {/* Area Card */}
            <div className="bg-secondary-light rounded-xl border-2 border-surface-dark overflow-hidden pt-3">
              {/* Area Name Banner */}
              <div className="bg-surface-dark mx-1.5 rounded-t-lg border border-surface border-b-0">
                <div className="py-1.5 px-3 text-center">
                  <h2 className="text-white font-bold text-xs">{area.name}</h2>
                </div>
              </div>

              {/* Area Image */}
              <div className="mx-1.5 bg-surface border border-surface-dark border-t-0 rounded-b-lg">
                <div className="aspect-[16/10] flex items-center justify-center relative">
                  <span className="text-secondary-light font-bold text-xs">[Area Image]</span>

                  {/* Status and View Button */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    {area.completed ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-secondary-light rounded flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13L9 17L19 7" />
                          </svg>
                        </div>
                        <span className="text-primary-light font-bold text-xs">Completed!</span>
                      </div>
                    ) : (
                      <div className="bg-surface-dark rounded px-2 py-0.5">
                        <span className="text-primary-light font-bold text-xs">{area.progress}</span>
                      </div>
                    )}

                    <button className="bg-surface-dark border-2 border-surface rounded-lg px-3 py-1">
                      <span className="text-primary-light font-bold text-xs">View</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-secondary-light" />

      {/* Bottom Navigation */}
      <BottomNavigation activePage="areas" />
    </div>
  );
}
