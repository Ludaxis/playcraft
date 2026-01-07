import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AccountPanel } from '../AccountPanel';
import type { UserProfile } from '../../../types';
import type { User } from '@supabase/supabase-js';

// --- Mocks ---
const mockUser = { id: 'user-123', email: 'test@example.com' } as User;
const mockProfile: UserProfile = {
  id: 'user-123',
  full_name: 'Test User',
  bio: 'A test bio',
  company: 'TestCo',
  website: 'https://test.com',
  github_username: 'testuser',
  linkedin_profile: 'https://linkedin.com/in/testuser',
  twitter_handle: '@testuser',
};

describe('AccountPanel', () => {
  it('should render the form with profile data', () => {
    render(
      <AccountPanel
        user={mockUser}
        profile={mockProfile}
        isLoading={false}
        isSaving={false}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A test bio')).toBeInTheDocument();
  });

  it('should call onSave with updated data when save is clicked', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(
      <AccountPanel
        user={mockUser}
        profile={mockProfile}
        isLoading={false}
        isSaving={false}
        onSave={handleSave}
        onDelete={vi.fn()}
      />
    );

    const nameInput = screen.getByDisplayValue('Test User');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Test User');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'Updated Test User',
    }));
  });

  it('should show a loading state', () => {
    render(
      <AccountPanel
        user={mockUser}
        profile={null}
        isLoading={true}
        isSaving={false}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(document.querySelector('.lucide-loader2')).toBeInTheDocument();
  });

  it('should disable the save button when saving', () => {
    render(
      <AccountPanel
        user={mockUser}
        profile={mockProfile}
        isLoading={false}
        isSaving={true}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });
});