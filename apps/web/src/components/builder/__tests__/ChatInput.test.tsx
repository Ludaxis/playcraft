import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSend: vi.fn(),
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders textarea with placeholder', () => {
      render(<ChatInput {...defaultProps} placeholder="Type here..." />);
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('renders default placeholder when not provided', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();
    });

    it('renders suggestion chips', () => {
      const suggestions = [
        { label: 'Add feature', prompt: 'Add a cool feature' },
        { label: 'Fix bug', prompt: 'Fix the bug' },
      ];
      render(<ChatInput {...defaultProps} suggestions={suggestions} />);
      expect(screen.getByText('Add feature')).toBeInTheDocument();
      expect(screen.getByText('Fix bug')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByTitle('Send message')).toBeInTheDocument();
    });

    it('renders attach button by default', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByTitle('Attach files')).toBeInTheDocument();
      expect(screen.getByText('Attach')).toBeInTheDocument();
    });

    it('hides attach button when showAttach is false', () => {
      render(<ChatInput {...defaultProps} showAttach={false} />);
      expect(screen.queryByTitle('Attach files')).not.toBeInTheDocument();
    });
  });

  describe('Chat Mode Toggle', () => {
    it('renders mode toggle button', () => {
      render(<ChatInput {...defaultProps} />);
      // Default is build mode
      expect(screen.getByText('Build')).toBeInTheDocument();
    });

    it('defaults to build mode', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByText('Build')).toBeInTheDocument();
    });

    it('can default to chat mode', () => {
      render(<ChatInput {...defaultProps} defaultMode="chat" />);
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('toggles between modes when clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      // Starts in build mode
      expect(screen.getByText('Build')).toBeInTheDocument();

      // Click to toggle to chat mode
      await user.click(screen.getByText('Build'));
      expect(screen.getByText('Chat')).toBeInTheDocument();

      // Click to toggle back to build mode
      await user.click(screen.getByText('Chat'));
      expect(screen.getByText('Build')).toBeInTheDocument();
    });

    it('changes placeholder based on mode', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      // Default build mode
      expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();

      // Toggle to chat mode
      await user.click(screen.getByText('Build'));
      expect(screen.getByPlaceholderText('Ask a question about your code...')).toBeInTheDocument();
    });
  });

  describe('Sending Messages', () => {
    it('calls onSend with build mode by default', async () => {
      const onSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} value="test message" onSend={onSend} />);

      const sendButton = screen.getByTitle('Send message');
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith('build');
    });

    it('calls onSend with chat mode when in chat mode', async () => {
      const onSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} value="test message" onSend={onSend} />);

      // Toggle to chat mode
      await user.click(screen.getByText('Build'));

      // Send message
      const sendButton = screen.getByTitle('Send message');
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith('chat');
    });

    it('sends on Enter key with current mode', async () => {
      const onSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} value="test" onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('{Enter}');

      expect(onSend).toHaveBeenCalledWith('build');
    });

    it('does not send on Shift+Enter', async () => {
      const onSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} value="test" onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      expect(onSend).not.toHaveBeenCalled();
    });

    it('disables send button when value is empty', () => {
      render(<ChatInput {...defaultProps} value="" />);
      const sendButton = screen.getByTitle('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('disables send button when disabled prop is true', () => {
      render(<ChatInput {...defaultProps} value="test" disabled={true} />);
      const sendButton = screen.getByTitle('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('does not send when value is only whitespace', async () => {
      const onSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} value="   " onSend={onSend} />);

      const sendButton = screen.getByTitle('Send message');
      await user.click(sendButton);

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('Suggestions', () => {
    it('calls onSuggestionClick when suggestion is clicked', async () => {
      const onSuggestionClick = vi.fn();
      const user = userEvent.setup();
      const suggestions = [{ label: 'Test', prompt: 'Test prompt' }];

      render(
        <ChatInput
          {...defaultProps}
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(onSuggestionClick).toHaveBeenCalledWith('Test prompt');
    });

    it('sets value when suggestion clicked without onSuggestionClick handler', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const suggestions = [{ label: 'Test', prompt: 'Test prompt' }];

      render(
        <ChatInput {...defaultProps} suggestions={suggestions} onChange={onChange} />
      );

      await user.click(screen.getByText('Test'));
      expect(onChange).toHaveBeenCalledWith('Test prompt');
    });

    it('disables suggestions when disabled', () => {
      const suggestions = [{ label: 'Test', prompt: 'Test prompt' }];
      render(<ChatInput {...defaultProps} suggestions={suggestions} disabled={true} />);

      const suggestionButton = screen.getByText('Test').closest('button');
      expect(suggestionButton).toBeDisabled();
    });
  });

  describe('File Attachments', () => {
    it('opens file picker when attach button clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const attachButton = screen.getByTitle('Attach files');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Spy on click
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(attachButton);
      expect(clickSpy).toHaveBeenCalled();
    });

    it('calls onAttachFiles when files are selected', async () => {
      const onAttachFiles = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} onAttachFiles={onAttachFiles} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await user.upload(fileInput, file);

      expect(onAttachFiles).toHaveBeenCalledWith([file]);
    });

    it('shows attached files with name and size', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'document.txt', { type: 'text/plain' });

      await user.upload(fileInput, file);

      expect(screen.getByText('document.txt')).toBeInTheDocument();
    });

    it('removes attached file when X is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await user.upload(fileInput, file);
      expect(screen.getByText('test.txt')).toBeInTheDocument();

      // Find and click the remove button
      const removeButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg.lucide-x')
      );
      await user.click(removeButtons[0]);

      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('disables attach button when disabled', () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      const attachButton = screen.getByTitle('Attach files');
      expect(attachButton).toBeDisabled();
    });
  });

  describe('Input Handling', () => {
    it('calls onChange when typing', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'hello');

      expect(onChange).toHaveBeenCalled();
    });

    it('disables textarea when disabled', () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disables mode toggle button when disabled', () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      const modeButton = screen.getByText('Build').closest('button');
      expect(modeButton).toBeDisabled();
    });
  });

  describe('Footer', () => {
    it('shows keyboard shortcuts hint', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByText('Enter to send · Shift+Enter for new line')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    describe('Landing variant', () => {
      it('renders with unified dark theme styling', () => {
        render(<ChatInput {...defaultProps} variant="landing" />);
        // All variants use same dark glass container
        const container = document.querySelector('.bg-black\\/40');
        expect(container).toBeInTheDocument();
      });

      it('does not show attach button', () => {
        render(<ChatInput {...defaultProps} variant="landing" />);
        expect(screen.queryByTitle('Attach files')).not.toBeInTheDocument();
      });

      it('does not show mode toggle', () => {
        render(<ChatInput {...defaultProps} variant="landing" />);
        expect(screen.queryByText('Build')).not.toBeInTheDocument();
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
      });

      it('does not show suggestions', () => {
        render(<ChatInput {...defaultProps} variant="landing" />);
        expect(screen.queryByText('Add power-ups')).not.toBeInTheDocument();
      });

      it('does not show footer hint', () => {
        render(<ChatInput {...defaultProps} variant="landing" />);
        expect(screen.queryByText('Enter to send · Shift+Enter for new line')).not.toBeInTheDocument();
      });

      it('shows animated placeholder when provided', () => {
        render(
          <ChatInput
            {...defaultProps}
            variant="landing"
            animatedPhrases={['test phrase']}
            staticPrefix="Create a "
          />
        );
        expect(screen.getByText('Create a')).toBeInTheDocument();
      });
    });

    describe('Home variant', () => {
      it('renders with unified dark theme styling', () => {
        render(<ChatInput {...defaultProps} variant="home" />);
        // All variants use same dark glass container
        const container = document.querySelector('.bg-black\\/40');
        expect(container).toBeInTheDocument();
      });

      it('does not show attach button', () => {
        render(<ChatInput {...defaultProps} variant="home" />);
        expect(screen.queryByTitle('Attach files')).not.toBeInTheDocument();
      });

      it('does not show mode toggle', () => {
        render(<ChatInput {...defaultProps} variant="home" />);
        expect(screen.queryByText('Build')).not.toBeInTheDocument();
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
      });

      it('does not show suggestions', () => {
        render(<ChatInput {...defaultProps} variant="home" />);
        expect(screen.queryByText('Add power-ups')).not.toBeInTheDocument();
      });

      it('does not show footer hint', () => {
        render(<ChatInput {...defaultProps} variant="home" />);
        expect(screen.queryByText('Enter to send · Shift+Enter for new line')).not.toBeInTheDocument();
      });
    });

    describe('Builder variant (default)', () => {
      it('shows attach button', () => {
        render(<ChatInput {...defaultProps} variant="builder" />);
        expect(screen.getByTitle('Attach files')).toBeInTheDocument();
      });

      it('shows mode toggle', () => {
        render(<ChatInput {...defaultProps} variant="builder" />);
        expect(screen.getByText('Build')).toBeInTheDocument();
      });

      it('shows suggestions', () => {
        render(<ChatInput {...defaultProps} variant="builder" />);
        expect(screen.getByText('Add power-ups')).toBeInTheDocument();
      });

      it('shows footer hint', () => {
        render(<ChatInput {...defaultProps} variant="builder" />);
        expect(screen.getByText('Enter to send · Shift+Enter for new line')).toBeInTheDocument();
      });
    });
  });
});
