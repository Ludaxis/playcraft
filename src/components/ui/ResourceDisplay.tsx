'use client';

import React from 'react';

interface ResourceDisplayProps {
  icon: React.ReactNode;
  value: number | string;
  onClick?: () => void;
  showAdd?: boolean;
  className?: string;
}

export function ResourceDisplay({
  icon,
  value,
  onClick,
  showAdd = false,
  className = '',
}: ResourceDisplayProps) {
  const content = (
    <>
      <span className="flex items-center justify-center w-6 h-6 bg-slate-200 rounded text-xs">
        {icon}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
      {showAdd && (
        <span className="flex items-center justify-center w-5 h-5 bg-slate-800 text-white rounded-full text-xs font-bold">
          +
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`
          inline-flex items-center gap-1.5 px-2 py-1
          bg-slate-100 rounded-full
          hover:bg-slate-200 transition-colors
          ${className}
        `}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        bg-slate-100 rounded-full
        ${className}
      `}
    >
      {content}
    </div>
  );
}
