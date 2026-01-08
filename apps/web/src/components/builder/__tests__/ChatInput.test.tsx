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

    it('renders send button', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByTitle('Send message')).toBeInTheDocument();
    });

    it('renders attach button by default', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByTitle('Attach files')).toBeInTheDocument();
      expect(screen.getByText('Attach')).toBeInTheDocument();
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

  describe('Auth Required Callback', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('calls onAuthRequired instead of onSend when set', async () => {
      const onSend = vi.fn();
      const onAuthRequired = vi.fn();
      const user = userEvent.setup();

      render(
        <ChatInput
          {...defaultProps}
          value="test message"
          onSend={onSend}
          onAuthRequired={onAuthRequired}
        />
      );

      const sendButton = screen.getByTitle('Send message');
      await user.click(sendButton);

      expect(onAuthRequired).toHaveBeenCalled();
      expect(onSend).not.toHaveBeenCalled();
    });

    it('stores prompt in localStorage before auth callback', async () => {
      const onAuthRequired = vi.fn();
      const user = userEvent.setup();

      render(
        <ChatInput
          {...defaultProps}
          value="my test prompt"
          onAuthRequired={onAuthRequired}
        />
      );

      const sendButton = screen.getByTitle('Send message');
      await user.click(sendButton);

      expect(localStorage.getItem('playcraft_pending_prompt')).toBe('my test prompt');
    });

    it('calls onAuthRequired when attach button is clicked', async () => {
      const onAuthRequired = vi.fn();
      const user = userEvent.setup();

      render(
        <ChatInput {...defaultProps} onAuthRequired={onAuthRequired} />
      );

      const attachButton = screen.getByTitle('Attach files');
      await user.click(attachButton);

      expect(onAuthRequired).toHaveBeenCalled();
    });
  });

  describe('Unified Styling', () => {
    it('renders with dark theme styling', () => {
      render(<ChatInput {...defaultProps} />);
      const container = document.querySelector('.bg-black\\/40');
      expect(container).toBeInTheDocument();
    });

    it('shows all features by default', () => {
      render(<ChatInput {...defaultProps} />);

      // Attach button
      expect(screen.getByTitle('Attach files')).toBeInTheDocument();

      // Mode toggle
      expect(screen.getByText('Build')).toBeInTheDocument();

      // Send button
      expect(screen.getByTitle('Send message')).toBeInTheDocument();
    });

    it('shows animated placeholder when provided', () => {
      render(
        <ChatInput
          {...defaultProps}
          animatedPhrases={['test phrase']}
          staticPrefix="Create a "
        />
      );
      expect(screen.getByText('Create a')).toBeInTheDocument();
    });
  });
});
