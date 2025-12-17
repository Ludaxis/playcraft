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
      className={`flex flex-col items-center px-3 py-1 rounded-lg ${active ? 'bg-bg-inverse' : ''}`}
    >
      <div className={`w-10 h-10 ${active ? 'bg-brand-muted' : 'bg-bg-inverse'} rounded-lg flex items-center justify-center`}>
        <Image src={icon} alt="" width={24} height={24} className={active ? 'opacity-70' : 'invert opacity-80'} />
      </div>
      {active && label && <span className="text-text-inverse text-mini mt-0.5">{label}</span>}
    </button>
  );
}
