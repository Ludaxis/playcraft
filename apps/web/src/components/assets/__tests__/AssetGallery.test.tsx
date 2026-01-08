import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetGallery } from '../AssetGallery';
import type { Asset } from '../../../types/assets';

const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
  id: 'asset-1',
  projectId: 'project-1',
  userId: 'user-1',
  name: 'player.png',
  displayName: 'Player',
  storagePath: '/user-1/project-1/assets/character/player.png',
  publicPath: '/public/assets/character/player.png',
  assetType: '2d',
  category: 'character',
  format: 'png',
  mimeType: 'image/png',
  fileSize: 4096,
  width: 64,
  height: 64,
  isSpriteSheet: false,
  tags: ['player', 'hero'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('AssetGallery', () => {
  it('renders empty state when no assets', () => {
    render(<AssetGallery assets={[]} />);

    expect(screen.getByText(/No assets yet/i)).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(
      <AssetGallery
        assets={[]}
        emptyMessage="Upload some assets to get started"
      />
    );

    expect(screen.getByText(/Upload some assets to get started/i)).toBeInTheDocument();
  });

  it('renders asset grid by default', () => {
    const assets = [
      createMockAsset({ id: '1', displayName: 'Player' }),
      createMockAsset({ id: '2', displayName: 'Enemy' }),
    ];

    render(<AssetGallery assets={assets} />);

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Enemy')).toBeInTheDocument();
  });

  it('filters assets by type', () => {
    const assets = [
      createMockAsset({ id: '1', displayName: 'Player', assetType: '2d' }),
      createMockAsset({ id: '2', displayName: 'Model', assetType: '3d' }),
      createMockAsset({ id: '3', displayName: 'Sound', assetType: 'audio' }),
    ];

    render(<AssetGallery assets={assets} />);

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Sound')).toBeInTheDocument();

    const filter2D = screen.getByRole('button', { name: /2D/i });
    fireEvent.click(filter2D);

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.queryByText('Model')).not.toBeInTheDocument();
    expect(screen.queryByText('Sound')).not.toBeInTheDocument();
  });

  it('searches assets by name', async () => {
    const assets = [
      createMockAsset({ id: '1', displayName: 'Player Character', name: 'player.png', tags: [] }),
      createMockAsset({ id: '2', displayName: 'Enemy Sprite', name: 'enemy.png', tags: ['enemy', 'monster'] }),
    ];

    render(<AssetGallery assets={assets} />);

    const searchInput = screen.getByPlaceholderText(/Search assets/i);
    fireEvent.change(searchInput, { target: { value: 'player' } });

    await waitFor(() => {
      expect(screen.getByText('Player Character')).toBeInTheDocument();
      expect(screen.queryByText('Enemy Sprite')).not.toBeInTheDocument();
    });
  });

  it('calls onSelectAsset when asset is clicked', () => {
    const onSelectAsset = vi.fn();
    const asset = createMockAsset();

    render(
      <AssetGallery
        assets={[asset]}
        onSelectAsset={onSelectAsset}
      />
    );

    fireEvent.click(screen.getByText('Player'));
    expect(onSelectAsset).toHaveBeenCalledWith(asset);
  });

  it('shows selected state for selected asset', () => {
    const asset = createMockAsset();

    render(
      <AssetGallery
        assets={[asset]}
        selectedAssetId={asset.id}
      />
    );

    const assetElement = screen.getByText('Player').closest('div')?.parentElement;
    expect(assetElement?.className).toContain('border-accent');
  });

  it('switches between grid and list view', () => {
    const assets = [createMockAsset()];

    render(<AssetGallery assets={assets} />);

    const listButton = screen.getAllByRole('button').find(
      (btn) => btn.querySelector('svg')
    );
    expect(listButton).toBeDefined();
  });

  it('shows dimensions for 2D assets', () => {
    const asset = createMockAsset({
      width: 128,
      height: 256,
    });

    render(<AssetGallery assets={[asset]} />);

    expect(screen.getByText(/128×256/)).toBeInTheDocument();
  });

  it('shows sprite sheet indicator', () => {
    const asset = createMockAsset({
      isSpriteSheet: true,
      frameCount: 8,
    });

    render(<AssetGallery assets={[asset]} />);

    expect(screen.getByText('8f')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<AssetGallery assets={[]} isLoading={true} />);

    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows no matching assets message when filtered to empty', () => {
    const assets = [createMockAsset({ displayName: 'Test Asset' })];

    render(<AssetGallery assets={assets} />);

    const searchInput = screen.getByPlaceholderText(/Search assets/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/No matching assets found/i)).toBeInTheDocument();
  });
});
