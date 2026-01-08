import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetUploader } from '../AssetUploader';

// Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

vi.mock('../../../lib/assetService', () => ({
  validateAssetFile: vi.fn((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'glb', 'mp3'].includes(ext || '')) {
      return { valid: true };
    }
    return { valid: false, error: 'Unsupported file format' };
  }),
}));

describe('AssetUploader', () => {
  const mockOnUpload = vi.fn();
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders drop zone with instructions', () => {
    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
      />
    );

    expect(screen.getByText(/Drop files or click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG, WebP, GIF, SVG, GLB, GLTF, MP3, WAV, OGG/i)).toBeInTheDocument();
  });

  it('shows drag over state when dragging files', () => {
    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
      />
    );

    const dropZone = screen.getByText(/Drop files or click to upload/i).closest('div');
    expect(dropZone).toBeInTheDocument();

    fireEvent.dragOver(dropZone!);
    expect(screen.getByText(/Drop files here/i)).toBeInTheDocument();
  });

  it('adds valid files to upload queue', async () => {
    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
  });

  it('shows error for invalid file types', async () => {
    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
      />
    );

    const file = new File(['test'], 'test.psd', { type: 'image/vnd.adobe.photoshop' });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file format/i)).toBeInTheDocument();
    });
  });

  it('uploads files when upload button is clicked', async () => {
    mockOnUpload.mockResolvedValue(undefined);

    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: /Upload 1 file/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          name: 'test.png',
          assetType: '2d',
        })
      );
    });
  });

  it('allows removing files from queue', async () => {
    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    });
  });

  it('disables upload when disabled prop is true', () => {
    render(
      <AssetUploader
        projectId="project-1"
        userId="user-1"
        onUpload={mockOnUpload}
        disabled={true}
      />
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });
});
