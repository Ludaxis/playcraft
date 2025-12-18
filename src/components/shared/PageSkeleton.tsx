'use client';

import React from 'react';

/**
 * Simple wireframe skeleton for page loading states.
 * Matches the project's grayscale wireframe design system.
 */
export function PageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-bg-page animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-muted border-b border-border">
        <div className="w-8 h-8 bg-border rounded-lg" />
        <div className="w-32 h-6 bg-border rounded" />
        <div className="w-8 h-8 bg-border rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {/* Card skeletons */}
        <div className="bg-bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-border rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="w-24 h-4 bg-border rounded" />
              <div className="w-16 h-3 bg-border rounded" />
            </div>
          </div>
          <div className="w-full h-2 bg-border rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bg-card rounded-xl border border-border p-3">
              <div className="w-8 h-8 bg-border rounded-lg mx-auto mb-2" />
              <div className="w-full h-3 bg-border rounded mb-1" />
              <div className="w-2/3 h-3 bg-border rounded mx-auto" />
            </div>
          ))}
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-border rounded-lg" />
                <div className="flex-1 h-4 bg-border rounded" />
                <div className="w-16 h-6 bg-border rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav skeleton */}
      <div className="flex justify-around py-3 bg-bg-muted border-t border-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-8 h-8 bg-border rounded-lg mb-1" />
            <div className="w-8 h-2 bg-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
