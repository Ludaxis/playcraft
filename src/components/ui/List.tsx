'use client';

import React from 'react';

interface ListProps {
  children: React.ReactNode;
  className?: string;
}

export function List({ children, className = '' }: ListProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {children}
    </div>
  );
}

interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function ListItem({ children, onClick, className = '', active = false }: ListItemProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`
        flex items-center gap-3 p-3 rounded-lg
        ${active ? 'bg-surface-light' : 'bg-surface-lighter'}
        ${onClick ? 'hover:bg-surface-light cursor-pointer transition-colors w-full text-left' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

interface ListItemIconProps {
  children: React.ReactNode;
}

export function ListItemIcon({ children }: ListItemIconProps) {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-surface-light rounded-lg text-secondary">
      {children}
    </div>
  );
}

interface ListItemContentProps {
  title: string;
  subtitle?: string;
}

export function ListItemContent({ title, subtitle }: ListItemContentProps) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-primary truncate">{title}</p>
      {subtitle && <p className="text-xs text-secondary truncate">{subtitle}</p>}
    </div>
  );
}

interface ListItemActionProps {
  children: React.ReactNode;
}

export function ListItemAction({ children }: ListItemActionProps) {
  return <div className="flex items-center gap-2">{children}</div>;
}
