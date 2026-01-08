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

    it('renders suggestion chips centered', () => {
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
    });

    it('hides attach button when showAttach is false', () => {
      render(<ChatInput {...defaultProps} showAttach={false} />);
      expect(screen.queryByTitle('Attach files')).not.toBeInTheDocument();
    });
  });

  describe('Chat Mode Toggle', () => {
    it('renders Chat and Build mode buttons', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByTitle('Chat without making edits to your project')).toBeInTheDocument();
      expect(screen.getByTitle('Build mode - AI will generate and edit code')).toBeInTheDocument();
    });

    it('defaults to build mode', () => {
      render(<ChatInput {...defaultProps} />);
      const buildButton = screen.getByTitle('Build mode - AI will generate and edit code');
      expect(buildButton).toHaveClass('bg-accent');
    });

    it('can default to chat mode', () => {
      render(<ChatInput {...defaultProps} defaultMode="chat" />);
      const chatButton = screen.getByTitle('Chat without making edits to your project');
      expect(chatButton).toHaveClass('bg-accent');
    });

    it('switches to chat mode when clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const chatButton = screen.getByTitle('Chat without making edits to your project');
      await user.click(chatButton);

      expect(chatButton).toHaveClass('bg-accent');
    });

    it('switches to build mode when clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} defaultMode="chat" />);

      const buildButton = screen.getByTitle('Build mode - AI will generate and edit code');
      await user.click(buildButton);

      expect(buildButton).toHaveClass('bg-accent');
    });

    it('shows chat mode hint text when in chat mode', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      const chatButton = screen.getByTitle('Chat without making edits to your project');
      await user.click(chatButton);

      expect(screen.getByText('Chat mode: Ask questions without editing files')).toBeInTheDocument();
    });

    it('shows build mode hint text when in build mode', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByText('Build mode: AI will generate and edit code')).toBeInTheDocument();
    });

    it('changes placeholder based on mode', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);

      // Default build mode
      expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();

      // Switch to chat mode
      const chatButton = screen.getByTitle('Chat without making edits to your project');
      await user.click(chatButton);

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

      // Switch to chat mode
      const chatButton = screen.getByTitle('Chat without making edits to your project');
      await user.click(chatButton);

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

    it('disables mode toggle buttons when disabled', () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      const chatButton = screen.getByTitle('Chat without making edits to your project');
      const buildButton = screen.getByTitle('Build mode - AI will generate and edit code');
      expect(chatButton).toBeDisabled();
      expect(buildButton).toBeDisabled();
    });
  });

  describe('Footer', () => {
    it('shows keyboard shortcuts hint', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByText('Enter to send · Shift+Enter for new line')).toBeInTheDocument();
    });
  });
});
