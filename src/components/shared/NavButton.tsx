'use client';

import React from 'react';
import Image from 'next/image';

interface NavButtonProps {
  icon: string;
  label?: string;
  active?: boolean;
  onClick: () => void;
}

export function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center px-3 py-1 rounded-lg ${active ? 'bg-bg-muted' : ''}`}
    >
      <div className={`w-10 h-10 ${active ? 'bg-bg-inverse' : 'bg-bg-muted'} rounded-lg flex items-center justify-center border border-border`}>
        <Image src={icon} alt="" width={24} height={24} className={active ? 'invert' : 'opacity-60'} />
      </div>
      {label && <span className={`text-mini mt-0.5 ${active ? 'text-text-primary font-medium' : 'text-text-muted'}`}>{label}</span>}
    </button>
  );
}
