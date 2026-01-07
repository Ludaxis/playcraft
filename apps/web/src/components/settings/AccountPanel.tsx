/**
 * Account Panel (Dumb Component)
 * Renders the profile form based on props.
 */
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '../../types';
import { Avatar } from '../Avatar';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface AccountPanelProps {
  user: User;
  profile: UserProfile | null | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<UserProfile>) => void;
  onDelete: () => Promise<void>;
}

export function AccountPanel({ user, profile, isLoading, isSaving, onSave, onDelete }: AccountPanelProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    company: '',
    website: '',
    github_username: '',
    linkedin_profile: '',
    twitter_handle: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        company: profile.company || '',
        website: profile.website || '',
        github_username: profile.github_username || '',
        linkedin_profile: profile.linkedin_profile || '',
        twitter_handle: profile.twitter_handle || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-light" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-content">Profile</h2>
          <p className="mt-1 text-content-muted">This information will be displayed publicly.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        <SettingRow title="Your avatar" description="Your avatar is managed by your login provider.">
          <Avatar src={profile?.avatar_url} name={formData.full_name || user.email} size="lg" />
        </SettingRow>

        <SettingRow title="Full Name" description="Your full name.">
          <Input name="full_name" value={formData.full_name} onChange={handleInputChange} />
        </SettingRow>
        
        <SettingRow title="Email" description="Your email address is not shared publicly.">
          <Input value={user.email || ''} disabled />
        </SettingRow>

        <SettingRow title="Bio" description="A short description about yourself.">
          <Textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} />
        </SettingRow>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <SettingRow title="Company" description="The company you work for.">
            <Input name="company" value={formData.company} onChange={handleInputChange} />
          </SettingRow>
          <SettingRow title="Website" description="Your personal website or portfolio.">
            <Input name="website" type="url" value={formData.website} onChange={handleInputChange} />
          </SettingRow>
        </div>

        <div className="border-t border-border-muted pt-8">
            <h3 className="text-xl font-bold text-content">Social Profiles</h3>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <SettingRow title="GitHub" description="Your GitHub username.">
                <Input name="github_username" value={formData.github_username} onChange={handleInputChange} />
            </SettingRow>
            <SettingRow title="LinkedIn" description="URL of your LinkedIn profile.">
                <Input name="linkedin_profile" value={formData.linkedin_profile} onChange={handleInputChange} />
            </SettingRow>
            <SettingRow title="Twitter / X" description="Your Twitter or X handle.">
                <Input name="twitter_handle" value={formData.twitter_handle} onChange={handleInputChange} />
            </SettingRow>
        </div>

        <div className="border-t border-border-muted pt-8">
          <h3 className="font-medium text-content">Delete account</h3>
          <p className="mt-1 text-sm text-content-muted">Permanently delete your account.</p>
          <Button variant="destructive" className="mt-3" onClick={onDelete}>
            Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode; }) {
  return (
    <div>
      <Label className="text-base font-medium text-content">{title}</Label>
      <p className="mt-1 text-sm text-content-muted">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
