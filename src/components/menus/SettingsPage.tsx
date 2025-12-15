'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation, gameActions } from '@/store';

export function SettingsPage() {
  const { state, dispatch } = useGame();
  const { navigate, openModal } = useNavigation();
  const { settings } = state;

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      dispatch(gameActions.updateSettings({ [key]: !settings[key] }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-600">
      {/* Header */}
      <div className="flex items-center justify-center px-3 py-3 bg-slate-700 relative">
        {/* Title */}
        <h1 className="text-white text-xl font-bold">Settings</h1>

        {/* Close button */}
        <button
          onClick={() => navigate('main-menu')}
          className="absolute right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
        >
          <span className="text-white text-xl font-bold">X</span>
        </button>
      </div>

      {/* Orange divider */}
      <div className="h-1 bg-slate-500" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Toggles Panel */}
        <div className="bg-slate-500 rounded-xl border-2 border-slate-400 p-4">
          {/* Row 1: Music, Sound, Vibration */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <SettingsToggle
              label="Music"
              checked={settings.music}
              onChange={() => handleToggle('music')}
            />
            <SettingsToggle
              label="Sound"
              checked={settings.sound}
              onChange={() => handleToggle('sound')}
            />
            <SettingsToggle
              label="Vibration"
              checked={settings.haptics}
              onChange={() => handleToggle('haptics')}
            />
          </div>

          {/* Row 2: Hint, Notifications */}
          <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto">
            <SettingsToggle
              label="Hint"
              checked={true}
              onChange={() => {}}
            />
            <SettingsToggle
              label="Notifications"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <SettingsButton
          icon="/icons/Login.svg"
          label="Save your progress"
          variant="primary"
          onClick={() => openModal('sign-in')}
        />

        <SettingsButton
          icon="/icons/Message Question.svg"
          label="Support"
          variant="secondary"
          onClick={() => {}}
        />

        <SettingsButton
          icon="/icons/Lock.svg"
          label="Parental Control"
          variant="secondary"
          onClick={() => openModal('parental-control')}
        />

        <SettingsButton
          icon="/icons/Document-Text.svg"
          label="Terms & Privacy"
          variant="secondary"
          onClick={() => openModal('privacy-policy')}
        />

        {/* Version */}
        <div className="text-center text-xs text-slate-400 mt-4">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}

// Settings Toggle Component
interface SettingsToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function SettingsToggle({ label, checked, onChange }: SettingsToggleProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white text-sm font-bold mb-2">{label}</span>
      <button
        onClick={onChange}
        className={`w-full h-9 rounded-full border-2 flex items-center px-1 transition-colors ${
          checked
            ? 'bg-slate-400 border-slate-300'
            : 'bg-slate-700 border-slate-500'
        }`}
      >
        <div
          className={`flex items-center justify-between w-full px-1 ${
            checked ? '' : 'flex-row-reverse'
          }`}
        >
          <span
            className={`text-xs font-bold ${
              checked ? 'text-slate-700' : 'text-slate-400'
            }`}
          >
            {checked ? 'ON' : 'OFF'}
          </span>
          <div
            className={`w-7 h-7 rounded-full ${
              checked ? 'bg-slate-600' : 'bg-slate-500'
            }`}
          />
        </div>
      </button>
    </div>
  );
}

// Settings Button Component
interface SettingsButtonProps {
  icon?: string;
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

function SettingsButton({ icon, label, variant, onClick }: SettingsButtonProps) {
  const baseClasses = 'w-full py-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold';
  const variantClasses =
    variant === 'primary'
      ? 'bg-slate-400 border-slate-300 text-slate-700'
      : 'bg-slate-500 border-slate-400 text-slate-200';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {icon && (
        <div className="w-6 h-6 bg-slate-300 rounded flex items-center justify-center">
          <Image src={icon} alt="" width={16} height={16} className="opacity-70" />
        </div>
      )}
      <span>{label}</span>
    </button>
  );
}
