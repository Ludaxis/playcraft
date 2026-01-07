/**
 * Studio Settings Panel
 * Manages studio name, description, and application preferences.
 */
import { useState, useEffect } from 'react';
import { Loader2, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useUserSettings, useUpdateSettings } from '../../hooks/useUserSettings';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function StudioSettingsPanel() {
  const { data: settings, isLoading } = useUserSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings();

  const [formData, setFormData] = useState({
    studio_name: '',
    studio_description: '',
    chat_suggestions: true,
    generation_sound: 'first' as 'first' | 'always' | 'never',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        studio_name: settings.studio_name || '',
        studio_description: settings.studio_description || '',
        chat_suggestions: settings.chat_suggestions ?? true,
        generation_sound: settings.generation_sound || 'first',
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlurSave = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateSettings({ [name]: value });
  };

  const handleSwitchChange = (name: 'chat_suggestions', checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    updateSettings({ [name]: checked });
  };
  
  const handleRadioChange = (value: typeof formData.generation_sound) => {
    setFormData(prev => ({ ...prev, generation_sound: value }));
    updateSettings({ generation_sound: value });
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-light" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-content">Studio settings</h2>
      <p className="mt-1 text-content-muted">
        Manage your studio identity and application preferences.
      </p>

      <div className="mt-8 space-y-8">
        <SettingRow title="Studio Name" description="Your studio name, as visible to others.">
          <Input name="studio_name" value={formData.studio_name} onChange={handleInputChange} onBlur={handleBlurSave} maxLength={100} />
        </SettingRow>

        <SettingRow title="Studio Description" description="A short description about your studio or team.">
          <Textarea name="studio_description" value={formData.studio_description} onChange={handleInputChange} onBlur={handleBlurSave} maxLength={500} rows={3} />
        </SettingRow>

        <div className="border-t border-border-muted pt-8" />

        <ToggleSetting
          title="Chat suggestions"
          description="Show helpful suggestions in the chat interface."
          checked={formData.chat_suggestions}
          onCheckedChange={(checked) => handleSwitchChange('chat_suggestions', checked)}
        />
        
        <div>
          <h3 className="font-medium text-content">Generation complete sound</h3>
          <p className="mt-1 text-sm text-content-muted">
            Plays a notification sound when generation is finished.
          </p>
          <div className="mt-3 space-y-2">
            {[
              { value: 'first', label: 'First generation', icon: Volume1 },
              { value: 'always', label: 'Always', icon: Volume2 },
              { value: 'never', label: 'Never', icon: VolumeX },
            ].map((option) => (
              <Label key={option.value} className="flex cursor-pointer items-center gap-3 font-normal">
                <input
                  type="radio"
                  name="generationSound"
                  value={option.value}
                  checked={formData.generation_sound === option.value}
                  onChange={() => handleRadioChange(option.value as typeof formData.generation_sound)}
                  className="h-4 w-4 border-border bg-surface-overlay text-accent focus:ring-accent"
                />
                <option.icon className="h-4 w-4 text-content-muted" />
                <span>{option.label}</span>
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div>
      <h3 className="font-medium text-content">{title}</h3>
      <p className="mt-1 text-sm text-content-muted">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

interface ToggleSettingProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleSetting({ title, description, checked, onCheckedChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-content">{title}</h3>
        <p className="mt-1 text-sm text-content-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}