'use client';

import React from 'react';
import { useAdmin } from '@/store';
import { defaultTheme, type ThemeConfig } from '@/config/adminDefaults';

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
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-surface"
      />
      <div className="flex-1">
        <p className="text-primary text-sm font-bold">{label}</p>
        <p className="text-muted-foreground text-xs uppercase">{value}</p>
      </div>
    </div>
  );
}

export function ThemeEditor() {
  const { config, updateTheme, resetToDefaults } = useAdmin();
  const { theme } = config;

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
      {/* Preview */}
      <div className="bg-surface-dark rounded-xl p-3">
        <p className="text-muted-foreground text-xs mb-2">Preview</p>
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
          <p className="text-primary text-sm font-bold mb-2">{group.title}</p>
          <div className="bg-surface-light rounded-xl p-3 space-y-3 border border-surface">
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
        className="w-full bg-surface-dark border-2 border-surface rounded-xl py-2"
      >
        <span className="text-primary font-bold">Reset Theme to Defaults</span>
      </button>
    </div>
  );
}
