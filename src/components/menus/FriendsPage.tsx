'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout';
import { Panel, Tabs, List, ListItem, ListItemContent, ListItemAction, Button, Badge } from '@/components/ui';

const tabs = [
  { id: 'friends', label: 'Friends' },
  { id: 'requests', label: 'Requests' },
  { id: 'add', label: 'Add' },
];

// Mock friends data
const mockFriends = [
  { id: '1', username: 'RoyalKnight', level: 89, online: true, canSendLife: true },
  { id: '2', username: 'QueenBee', level: 156, online: false, canSendLife: false },
  { id: '3', username: 'DukeMaster', level: 72, online: true, canSendLife: true },
];

const mockRequests = [
  { id: '1', username: 'NewPlayer', level: 23 },
  { id: '2', username: 'StarGamer', level: 45 },
];

export function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <PageLayout title="Friends">
      <div className="p-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />

        {activeTab === 'friends' && (
          <>
            <Panel variant="outlined" className="mb-4 text-center p-3">
              <p className="text-caption text-text-secondary">
                {mockFriends.length} Friends
              </p>
            </Panel>
            <List>
              {mockFriends.map((friend) => (
                <ListItem key={friend.id}>
                  <div className="relative">
                    <div className="w-10 h-10 bg-bg-muted rounded-full border border-border" />
                    {friend.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-border-strong rounded-full border-2 border-bg-card" />
                    )}
                  </div>
                  <ListItemContent
                    title={friend.username}
                    subtitle={`Level ${friend.level}`}
                  />
                  <ListItemAction>
                    {friend.canSendLife ? (
                      <Button size="sm" variant="secondary">
                        Send
                      </Button>
                    ) : (
                      <Badge variant="default">Sent</Badge>
                    )}
                  </ListItemAction>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {activeTab === 'requests' && (
          <List>
            {mockRequests.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No pending requests
              </div>
            ) : (
              mockRequests.map((request) => (
                <ListItem key={request.id}>
                  <div className="w-10 h-10 bg-bg-muted rounded-full border border-border" />
                  <ListItemContent
                    title={request.username}
                    subtitle={`Level ${request.level}`}
                  />
                  <ListItemAction>
                    <Button size="sm" variant="primary" className="mr-2">
                      Accept
                    </Button>
                    <Button size="sm" variant="ghost">
                      Decline
                    </Button>
                  </ListItemAction>
                </ListItem>
              ))
            )}
          </List>
        )}

        {activeTab === 'add' && (
          <Panel variant="elevated">
            <h3 className="text-caption font-semibold text-text-primary mb-3">
              Add Friends
            </h3>
            <List>
              <ListItem onClick={() => {}}>
                <ListItemContent
                  title="Connect Facebook"
                  subtitle="Find friends from Facebook"
                />
              </ListItem>
              <ListItem onClick={() => {}}>
                <ListItemContent
                  title="Invite via Link"
                  subtitle="Share invite link"
                />
              </ListItem>
              <ListItem onClick={() => {}}>
                <ListItemContent
                  title="Search by ID"
                  subtitle="Enter friend's player ID"
                />
              </ListItem>
            </List>
          </Panel>
        )}
      </div>
    </PageLayout>
  );
}
