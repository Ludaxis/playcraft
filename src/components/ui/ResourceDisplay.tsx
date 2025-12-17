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
      <span className="flex items-center justify-center w-6 h-6 bg-bg-muted rounded text-caption">
        {icon}
      </span>
      <span className="text-value text-text-primary">{value}</span>
      {showAdd && (
        <span className="flex items-center justify-center w-5 h-5 bg-bg-inverse text-text-inverse rounded-full text-value-sm">
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
          bg-bg-muted rounded-full border border-border
          hover:bg-border transition-colors
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
        bg-bg-muted rounded-full border border-border
        ${className}
      `}
    >
      {content}
    </div>
  );
}
