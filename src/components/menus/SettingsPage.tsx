'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGame, useNavigation, gameActions } from '@/store';
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher';

export function SettingsPage() {
  const { state, dispatch } = useGame();
  const { navigate, openModal } = useNavigation();
  const { settings } = state;
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

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
        <h1 className="text-text-primary text-h2">{t('title')}</h1>

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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
            <SettingsToggle
              label={t('music')}
              checked={settings.music}
              onChange={() => handleToggle('music')}
              onLabel={tCommon('on')}
              offLabel={tCommon('off')}
            />
            <SettingsToggle
              label={t('sound')}
              checked={settings.sound}
              onChange={() => handleToggle('sound')}
              onLabel={tCommon('on')}
              offLabel={tCommon('off')}
            />
            <SettingsToggle
              label={t('vibration')}
              checked={settings.haptics}
              onChange={() => handleToggle('haptics')}
              onLabel={tCommon('on')}
              offLabel={tCommon('off')}
            />
          </div>

          {/* Row 2: Hint, Notifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <SettingsToggle
              label={t('hint')}
              checked={true}
              onChange={() => {}}
              onLabel={tCommon('on')}
              offLabel={tCommon('off')}
            />
            <SettingsToggle
              label={t('notifications')}
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
              onLabel={tCommon('on')}
              offLabel={tCommon('off')}
            />
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-bg-page rounded-xl border-2 border-border p-4">
          <LocaleSwitcher
            showNativeNames={true}
            mode="dropdown"
            size="lg"
            label={t('language')}
          />
        </div>

        {/* Action Buttons */}
        <SettingsButton
          icon="/icons/Login.svg"
          label={t('saveYourProgress')}
          variant="secondary"
          onClick={() => openModal('sign-in')}
        />

        <SettingsButton
          icon="/icons/Message Question.svg"
          label={t('support')}
          variant="secondary"
          onClick={() => {}}
        />

        <SettingsButton
          icon="/icons/Lock.svg"
          label={t('parentalControl')}
          variant="secondary"
          onClick={() => openModal('parental-control')}
        />

        <SettingsButton
          icon="/icons/Document-Text.svg"
          label={t('termsPrivacy')}
          variant="secondary"
          onClick={() => openModal('privacy-policy')}
        />

        {/* Admin Panel */}
        <SettingsButton
          icon="/icons/Category.svg"
          label={t('adminPanel')}
          variant="secondary"
          onClick={() => navigate('admin')}
        />

        {/* Version */}
        <div className="text-center text-caption text-text-muted mt-4">
          {t('version')}
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
  onLabel?: string;
  offLabel?: string;
}

function SettingsToggle({ label, checked, onChange, onLabel = 'ON', offLabel = 'OFF' }: SettingsToggleProps) {
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
            {checked ? onLabel : offLabel}
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
