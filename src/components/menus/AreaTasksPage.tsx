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
    <div className="flex flex-col h-full bg-slate-600">
      {/* Header */}
      <div className="bg-slate-700 py-3 px-4">
        <h1 className="text-white text-base font-bold text-center">Areas</h1>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-slate-500" />

      {/* Areas List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {areasData.map((area) => (
          <div key={area.id} className="relative">
            {/* Area Number Badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-slate-300 rounded-full px-3 py-0.5 border border-slate-200">
                <span className="text-slate-700 font-bold text-[10px]">Area {area.id}</span>
              </div>
            </div>

            {/* Area Card */}
            <div className="bg-slate-500 rounded-xl border-2 border-slate-400 overflow-hidden pt-3">
              {/* Area Name Banner */}
              <div className="bg-slate-400 mx-1.5 rounded-t-lg border border-slate-300 border-b-0">
                <div className="py-1.5 px-3 text-center">
                  <h2 className="text-white font-bold text-xs">{area.name}</h2>
                </div>
              </div>

              {/* Area Image */}
              <div className="mx-1.5 bg-slate-300 border border-slate-400 border-t-0 rounded-b-lg">
                <div className="aspect-[16/10] flex items-center justify-center relative">
                  <span className="text-slate-500 font-bold text-xs">[Area Image]</span>

                  {/* Status and View Button */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    {area.completed ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-slate-500 rounded flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13L9 17L19 7" />
                          </svg>
                        </div>
                        <span className="text-slate-700 font-bold text-xs">Completed!</span>
                      </div>
                    ) : (
                      <div className="bg-slate-400 rounded px-2 py-0.5">
                        <span className="text-slate-700 font-bold text-xs">{area.progress}</span>
                      </div>
                    )}

                    <button className="bg-slate-400 border-2 border-slate-300 rounded-lg px-3 py-1">
                      <span className="text-slate-700 font-bold text-xs">View</span>
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
      <div className="h-0.5 bg-slate-500" />

      {/* Bottom Navigation */}
      <BottomNavigation activePage="areas" />
    </div>
  );
}
