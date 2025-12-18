'use client';

import React from 'react';
import { PageLayout } from '@/components/layout';
import { Button, Badge } from '@/components/base';
import { List, ListItem, ListItemIcon, ListItemContent, ListItemAction } from '@/components/composed';
import { FeatureDisabled } from '@/components/shared';
import { useGame, gameActions } from '@/store';
import { isFeatureEnabled } from '@/config/features';

export function InboxPage() {
  const { state, dispatch } = useGame();

  // Feature flag check (must be after hooks)
  if (!isFeatureEnabled('INBOX')) {
    return <FeatureDisabled featureName="Inbox" />;
  }
  const { inbox } = state;

  const handleClaim = (messageId: string) => {
    dispatch(gameActions.claimInboxMessage(messageId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return 'R';
      case 'team':
        return 'T';
      case 'news':
        return 'N';
      default:
        return 'S';
    }
  };

  return (
    <PageLayout title="Inbox">
      <div className="p-4">
        {inbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-bg-page rounded-full mb-4" />
            <p className="text-text-secondary">No messages</p>
          </div>
        ) : (
          <List>
            {inbox.map((message) => (
              <ListItem key={message.id}>
                <ListItemIcon>
                  <span className="text-caption font-bold">{getTypeIcon(message.type)}</span>
                </ListItemIcon>
                <ListItemContent
                  title={message.title}
                  subtitle={message.content}
                />
                <ListItemAction>
                  {message.reward && !message.claimed ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleClaim(message.id)}
                    >
                      Claim
                    </Button>
                  ) : message.claimed ? (
                    <Badge variant="default">Claimed</Badge>
                  ) : (
                    <Badge variant="accent">View</Badge>
                  )}
                </ListItemAction>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </PageLayout>
  );
}
