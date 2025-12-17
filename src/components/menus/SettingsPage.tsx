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
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="flex items-center justify-center px-3 py-3 bg-bg-muted relative border-b border-border">
        {/* Title */}
        <h1 className="text-text-primary text-h2">Settings</h1>

        {/* Close button */}
        <button
          onClick={() => navigate('main-menu')}
          className="absolute right-3 w-8 h-8 bg-bg-page rounded-full flex items-center justify-center border-2 border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">X</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Toggles Panel */}
        <div className="bg-bg-page rounded-xl border-2 border-border p-4">
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
          variant="secondary"
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

        {/* Admin Panel */}
        <SettingsButton
          icon="/icons/Category.svg"
          label="Admin Panel"
          variant="secondary"
          onClick={() => navigate('admin')}
        />

        {/* Version */}
        <div className="text-center text-caption text-text-muted mt-4">
          Puzzle Kit v1.0.0
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
      <span className="text-text-primary text-value mb-2">{label}</span>
      <button
        onClick={onChange}
        className={`w-full h-9 rounded-full border-2 flex items-center px-1 transition-colors ${
          checked
            ? 'bg-border-strong border-border'
            : 'bg-bg-muted border-border'
        }`}
      >
        <div
          className={`flex items-center justify-between w-full px-1 ${
            checked ? '' : 'flex-row-reverse'
          }`}
        >
          <span
            className={`text-value-sm ${
              checked ? 'text-text-primary' : 'text-text-muted'
            }`}
          >
            {checked ? 'ON' : 'OFF'}
          </span>
          <div
            className={`w-7 h-7 rounded-full ${
              checked ? 'bg-bg-inverse' : 'bg-border-strong'
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
      ? 'bg-border-strong border-border text-text-primary'
      : 'bg-bg-page border-border text-text-primary';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {icon && (
        <Image src={icon} alt="" width={18} height={18} />
      )}
      <span>{label}</span>
    </button>
  );
}
