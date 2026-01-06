/**
 * Labs Panel
 * Experimental features toggles and API keys
 */

import { useState } from 'react';
import { Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import type { UserSettings, UpdateSettingsInput } from '../../types';

interface LabsPanelProps {
  settings: UserSettings;
  onSave: (input: UpdateSettingsInput) => Promise<void>;
  isSaving: boolean;
}

export function LabsPanel({ settings, onSave, isSaving }: LabsPanelProps) {
  const [voyageKey, setVoyageKey] = useState(settings.voyage_api_key || '');
  const [showVoyageKey, setShowVoyageKey] = useState(false);

  const handleToggle = (key: keyof UpdateSettingsInput, value: boolean) => {
    onSave({ [key]: value });
  };

  const handleSaveVoyageKey = () => {
    onSave({ voyage_api_key: voyageKey || null });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-content">Labs</h2>
      <p className="mt-1 text-content-muted">
        These are experimental features that might be modified or removed.
      </p>

      <div className="mt-8 space-y-8">
        {/* API Keys Section */}
        <div>
          <h3 className="text-lg font-semibold text-content mb-4">API Keys</h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-content">Voyage AI API Key</h4>
                  <p className="mt-1 text-sm text-content-muted">
                    Enable semantic code search for smarter AI context. First 200M tokens free.
                  </p>
                  <a
                    href="https://www.voyageai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    Get your API key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showVoyageKey ? 'text' : 'password'}
                    value={voyageKey}
                    onChange={(e) => setVoyageKey(e.target.value)}
                    placeholder="pa-..."
                    className="w-full rounded-lg border border-border bg-surface-overlay px-3 py-2 pr-10 text-sm text-content placeholder-content-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVoyageKey(!showVoyageKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
                  >
                    {showVoyageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSaveVoyageKey}
                  disabled={isSaving || voyageKey === (settings.voyage_api_key || '')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
              {settings.voyage_api_key && (
                <p className="mt-2 text-xs text-green-400">✓ Semantic search enabled</p>
              )}
            </div>
          </div>
        </div>

        {/* Feature Toggles Section */}
        <div>
          <h3 className="text-lg font-semibold text-content mb-4">Experimental Features</h3>
          <div className="space-y-6">
            <LabFeature
              title="GitHub branch switching"
              description="Select the branch to make edits to in your GitHub repository."
              enabled={settings.labs_github_branch_switching}
              onToggle={(enabled) =>
                handleToggle('labs_github_branch_switching', enabled)
              }
            />
          </div>
        </div>
      </div>

      {isSaving && (
        <div className="mt-4 flex items-center gap-2 text-sm text-content-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}

interface LabFeatureProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

function LabFeature({
  title,
  description,
  enabled,
  onToggle,
}: LabFeatureProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-content">{title}</h3>
        <p className="mt-1 text-sm text-content-muted">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? 'bg-accent' : 'bg-surface-overlay'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
