'use client';

import React from 'react';
import { useAdmin } from '@/store';
import { defaultTheme, type ThemeConfig } from '@/config/adminDefaults';
import { themePresets, getThemePresetIds } from '@/config/themePresets';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
      />
      <div className="flex-1">
        <p className="text-text-primary text-caption font-bold">{label}</p>
        <p className="text-text-muted text-mini uppercase">{value}</p>
      </div>
    </div>
  );
}

export function ThemeEditor() {
  const { config, updateTheme, setThemePreset, currentPreset } = useAdmin();
  const { theme } = config;
  const presetIds = getThemePresetIds();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setThemePreset(e.target.value);
  };

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    updateTheme({ [key]: value });
  };

  const handleResetTheme = () => {
    updateTheme(defaultTheme);
  };

  const colorGroups = [
    {
      title: 'Primary Colors',
      colors: [
        { key: 'primary' as const, label: 'Primary' },
        { key: 'primaryLight' as const, label: 'Primary Light' },
        { key: 'primaryDark' as const, label: 'Primary Dark' },
      ],
    },
    {
      title: 'Secondary Colors',
      colors: [
        { key: 'secondary' as const, label: 'Secondary' },
        { key: 'secondaryLight' as const, label: 'Secondary Light' },
        { key: 'secondaryDark' as const, label: 'Secondary Dark' },
      ],
    },
    {
      title: 'Accent Colors',
      colors: [
        { key: 'accent' as const, label: 'Accent' },
        { key: 'accentLight' as const, label: 'Accent Light' },
        { key: 'accentDark' as const, label: 'Accent Dark' },
      ],
    },
    {
      title: 'Surface Colors',
      colors: [
        { key: 'surface' as const, label: 'Surface' },
        { key: 'surfaceLight' as const, label: 'Surface Light' },
        { key: 'surfaceDark' as const, label: 'Surface Dark' },
      ],
    },
    {
      title: 'Gold Colors',
      colors: [
        { key: 'gold' as const, label: 'Gold' },
        { key: 'goldLight' as const, label: 'Gold Light' },
        { key: 'goldDark' as const, label: 'Gold Dark' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Theme Preset Selector */}
      <div className="bg-bg-card rounded-xl p-4 border border-border">
        <p className="text-text-primary text-caption font-bold mb-3">Theme Preset</p>
        <select
          value={config.themePresetId}
          onChange={handlePresetChange}
          className="w-full bg-bg-muted border border-border rounded-lg px-3 py-2 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-border-strong"
        >
          {presetIds.map((presetId) => (
            <option key={presetId} value={presetId}>
              {themePresets[presetId].name}
            </option>
          ))}
        </select>

        {/* Preset Preview */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg border border-border"
            style={{ backgroundColor: currentPreset.brandPrimary }}
            title="Brand Primary"
          />
          <div
            className="w-8 h-8 rounded-lg border border-border"
            style={{ backgroundColor: currentPreset.brandHover }}
            title="Brand Hover"
          />
          <div
            className="w-8 h-8 rounded-lg border border-border"
            style={{ backgroundColor: currentPreset.brandMuted }}
            title="Brand Muted"
          />
          <span className="text-text-muted text-mini ml-2">
            {currentPreset.name}
          </span>
        </div>
      </div>

      {/* Advanced Color Customization (collapsed by default) */}
      <details className="group">
        <summary className="cursor-pointer text-text-secondary text-caption font-medium py-2 hover:text-text-primary">
          Advanced Color Customization
        </summary>

        <div className="mt-3 space-y-4">
          {/* Preview */}
          <div className="bg-bg-muted rounded-xl p-3">
            <p className="text-text-muted text-mini mb-2">Current Colors</p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.primary }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.secondary }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.accent }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.surface }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.gold }} />
            </div>
          </div>

          {/* Color Groups */}
          {colorGroups.map((group) => (
            <div key={group.title}>
              <p className="text-text-primary text-caption font-bold mb-2">{group.title}</p>
              <div className="bg-bg-card rounded-xl p-3 space-y-3 border border-border">
                {group.colors.map((color) => (
                  <ColorInput
                    key={color.key}
                    label={color.label}
                    value={theme[color.key]}
                    onChange={(value) => handleColorChange(color.key, value)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Reset Button */}
          <button
            onClick={handleResetTheme}
            className="w-full bg-bg-muted border-2 border-border rounded-xl py-2 hover:bg-bg-card transition-colors"
          >
            <span className="text-text-primary font-bold">Reset Theme to Defaults</span>
          </button>
        </div>
      </details>
    </div>
  );
}
