import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionChips, DEFAULT_SUGGESTIONS } from '../SuggestionChips';

describe('SuggestionChips', () => {
  const defaultProps = {
    suggestions: [
      { label: 'Add feature', prompt: 'Add a cool feature' },
      { label: 'Fix bug', prompt: 'Fix the bug' },
    ],
    onSelect: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders suggestion chips', () => {
      render(<SuggestionChips {...defaultProps} />);
      expect(screen.getByText('Add feature')).toBeInTheDocument();
      expect(screen.getByText('Fix bug')).toBeInTheDocument();
    });

    it('renders nothing when suggestions array is empty', () => {
      const { container } = render(
        <SuggestionChips suggestions={[]} onSelect={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders sparkle icons', () => {
      render(<SuggestionChips {...defaultProps} />);
      const sparkles = document.querySelectorAll('svg.lucide-sparkles');
      expect(sparkles).toHaveLength(2);
    });
  });

  describe('Interactions', () => {
    it('calls onSelect with prompt when clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <SuggestionChips
          suggestions={[{ label: 'Test', prompt: 'Test prompt' }]}
          onSelect={onSelect}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(onSelect).toHaveBeenCalledWith('Test prompt');
    });

    it('does not call onSelect when disabled', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <SuggestionChips
          suggestions={[{ label: 'Test', prompt: 'Test prompt' }]}
          onSelect={onSelect}
          disabled={true}
        />
      );

      const button = screen.getByText('Test').closest('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Default Suggestions', () => {
    it('exports DEFAULT_SUGGESTIONS', () => {
      expect(DEFAULT_SUGGESTIONS).toBeDefined();
      expect(DEFAULT_SUGGESTIONS.length).toBeGreaterThan(0);
    });

    it('DEFAULT_SUGGESTIONS have label and prompt', () => {
      DEFAULT_SUGGESTIONS.forEach((suggestion) => {
        expect(suggestion).toHaveProperty('label');
        expect(suggestion).toHaveProperty('prompt');
      });
    });
  });

  describe('Styling', () => {
    it('applies correct button styling', () => {
      render(<SuggestionChips {...defaultProps} />);
      const button = screen.getByText('Add feature').closest('button');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('text-xs');
    });

    it('applies disabled styling when disabled', () => {
      render(<SuggestionChips {...defaultProps} disabled={true} />);
      const button = screen.getByText('Add feature').closest('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toBeDisabled();
    });
  });
});
