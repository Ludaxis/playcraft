'use client';

import React from 'react';
import { Modal, Button, Panel, List, ListItem, ListItemContent, ListItemAction } from '@/components/ui';
import { useNavigation, useGame, gameActions } from '@/store';

export function OutOfLivesModal() {
  const { closeModal, navigate } = useNavigation();
  const { state, dispatch } = useGame();
  const { player } = state;

  const handleBuyLives = () => {
    dispatch(gameActions.updateCoins(-100));
    dispatch(gameActions.updateLives(5));
    closeModal();
  };

  const handleAskFriends = () => {
    closeModal();
    navigate('friends');
  };

  return (
    <Modal isOpen onClose={closeModal} title="Lives" size="sm">
      <div className="text-center">
        {/* Hearts Display */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: player.maxLives }).map((_, i) => (
            <HeartIcon key={i} filled={i < player.lives} />
          ))}
        </div>

        <p className="text-h3 text-text-primary mb-1">
          {player.lives}/{player.maxLives} Lives
        </p>
        <p className="text-caption text-text-secondary mb-4">
          {player.lives < player.maxLives
            ? 'Lives refill over time'
            : 'You have full lives!'}
        </p>

        {/* Timer */}
        {player.lives < player.maxLives && (
          <Panel variant="outlined" className="mb-4">
            <p className="text-caption text-text-secondary">Next life in</p>
            <p className="text-h2 text-text-primary">29:45</p>
          </Panel>
        )}

        {/* Options */}
        <List className="mb-4">
          <ListItem onClick={handleBuyLives}>
            <ListItemContent
              title="Buy 5 Lives"
              subtitle="Instant refill"
            />
            <ListItemAction>
              <Button size="sm" variant="primary">
                100 Coins
              </Button>
            </ListItemAction>
          </ListItem>
          <ListItem onClick={handleAskFriends}>
            <ListItemContent
              title="Ask Friends"
              subtitle="Request lives from friends"
            />
            <ListItemAction>
              <Button size="sm" variant="secondary">
                Free
              </Button>
            </ListItemAction>
          </ListItem>
        </List>

        <Button variant="ghost" fullWidth onClick={closeModal}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-8 h-8 ${filled ? 'text-text-primary' : 'text-bg-muted'}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
    </svg>
  );
}
