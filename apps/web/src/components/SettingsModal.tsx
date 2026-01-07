/**
 * Settings Modal
 * Main settings modal shell with sidebar navigation.
 * This component is "smart" and contains the hooks for the profile section.
 */
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  X,
  Settings,
  CreditCard,
  BarChart3,
  User as UserIcon,
  FlaskConical,
  Github,
} from 'lucide-react';
import { useUserProfile, useUpdateUserProfile } from '../hooks/useUserProfile';
import {
  StudioSettingsPanel,
  PlansPanel,
  UsagePanel,
  AccountPanel,
  LabsPanel,
  GitHubPanel,
} from './settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

type SettingsTab = 'studio' | 'profile' | 'plans' | 'usage' | 'labs' | 'github';

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Hooks for the Profile Panel are now here
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { mutate: updateProfile, isPending: isProfileSaving } = useUpdateUserProfile();

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This is permanent.')) return;
    alert("Account deletion would happen here.");
    onClose();
  };

  if (!isOpen) return null;

  const sidebarItems = [
    {
      section: 'Studio',
      items: [
        { id: 'studio', label: 'Studio', icon: Settings },
        { id: 'plans', label: 'Plans & Credits', icon: CreditCard },
        { id: 'usage', label: 'Usage', icon: BarChart3 },
      ],
    },
    {
      section: 'Account',
      items: [
        { id: 'profile', label: 'Profile', icon: UserIcon },
        { id: 'labs', label: 'Labs', icon: FlaskConical },
      ],
    },
    {
      section: 'Connectors',
      items: [{ id: 'github', label: 'GitHub', icon: Github }],
    },
  ];

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'studio':
        return <StudioSettingsPanel />;
      case 'profile':
        return (
          <AccountPanel
            user={user}
            profile={profile}
            isLoading={isProfileLoading}
            isSaving={isProfileSaving}
            onSave={updateProfile}
            onDelete={handleDeleteAccount}
          />
        );
      case 'plans':
        return <PlansPanel />;
      case 'usage':
        return <UsagePanel />;
      case 'labs':
        return <LabsPanel />;
      case 'github':
        return <GitHubPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content">
          <X className="h-5 w-5" />
        </button>

        <aside className="w-60 shrink-0 border-r border-border-muted bg-surface p-3">
          {sidebarItems.map((section) => (
            <div key={section.section} className="mb-4">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-content-subtle">
                {section.section}
              </p>
              <div className="space-y-1">
                {sidebarItems.find(s => s.section === section.section)?.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-surface-overlay text-content'
                        : 'text-content-muted hover:bg-surface-overlay/50 hover:text-content'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
