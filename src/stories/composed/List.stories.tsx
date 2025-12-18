import type { Meta, StoryObj } from '@storybook/react';
import { List, ListItem, ListItemIcon, ListItemContent, ListItemAction } from '@/components/composed/List';
import { Button, Badge } from '@/components/base';

/**
 * List components for displaying collections of items with consistent styling.
 *
 * ## Usage
 * ```tsx
 * import { List, ListItem, ListItemIcon, ListItemContent, ListItemAction } from '@/components/composed';
 *
 * <List>
 *   <ListItem onClick={handleClick}>
 *     <ListItemIcon>🎁</ListItemIcon>
 *     <ListItemContent title="Daily Reward" subtitle="Claim now!" />
 *     <ListItemAction>
 *       <Button size="sm">Claim</Button>
 *     </ListItemAction>
 *   </ListItem>
 * </List>
 * ```
 */
const meta: Meta<typeof List> = {
  title: 'Composed/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof List>;

/** Basic list with simple items */
export const Default: Story = {
  render: () => (
    <List className="w-80">
      <ListItem>
        <ListItemIcon>1</ListItemIcon>
        <ListItemContent title="First Item" subtitle="Description here" />
      </ListItem>
      <ListItem>
        <ListItemIcon>2</ListItemIcon>
        <ListItemContent title="Second Item" subtitle="Another description" />
      </ListItem>
      <ListItem>
        <ListItemIcon>3</ListItemIcon>
        <ListItemContent title="Third Item" subtitle="More details" />
      </ListItem>
    </List>
  ),
};

/** Interactive list with click handlers */
export const Interactive: Story = {
  render: () => (
    <List className="w-80">
      <ListItem onClick={() => alert('Settings clicked')}>
        <ListItemIcon>S</ListItemIcon>
        <ListItemContent title="Settings" subtitle="Manage preferences" />
        <ListItemAction>
          <span className="text-text-muted">&gt;</span>
        </ListItemAction>
      </ListItem>
      <ListItem onClick={() => alert('Profile clicked')}>
        <ListItemIcon>P</ListItemIcon>
        <ListItemContent title="Profile" subtitle="View your profile" />
        <ListItemAction>
          <span className="text-text-muted">&gt;</span>
        </ListItemAction>
      </ListItem>
      <ListItem onClick={() => alert('Help clicked')}>
        <ListItemIcon>?</ListItemIcon>
        <ListItemContent title="Help" subtitle="Get support" />
        <ListItemAction>
          <span className="text-text-muted">&gt;</span>
        </ListItemAction>
      </ListItem>
    </List>
  ),
};

/** List with action buttons */
export const WithActions: Story = {
  render: () => (
    <List className="w-96">
      <ListItem>
        <ListItemIcon>D</ListItemIcon>
        <ListItemContent title="Daily Reward" subtitle="Available now!" />
        <ListItemAction>
          <Button size="sm" variant="solid">Claim</Button>
        </ListItemAction>
      </ListItem>
      <ListItem>
        <ListItemIcon>W</ListItemIcon>
        <ListItemContent title="Weekly Challenge" subtitle="2 days left" />
        <ListItemAction>
          <Button size="sm" variant="outline">View</Button>
        </ListItemAction>
      </ListItem>
      <ListItem>
        <ListItemIcon>L</ListItemIcon>
        <ListItemContent title="Limited Event" subtitle="Completed!" />
        <ListItemAction>
          <Badge variant="primary">Done</Badge>
        </ListItemAction>
      </ListItem>
    </List>
  ),
};

/** List with active state */
export const WithActiveState: Story = {
  render: () => (
    <List className="w-80">
      <ListItem active>
        <ListItemIcon>H</ListItemIcon>
        <ListItemContent title="Home" subtitle="Currently selected" />
      </ListItem>
      <ListItem onClick={() => {}}>
        <ListItemIcon>T</ListItemIcon>
        <ListItemContent title="Team" />
      </ListItem>
      <ListItem onClick={() => {}}>
        <ListItemIcon>S</ListItemIcon>
        <ListItemContent title="Shop" />
      </ListItem>
    </List>
  ),
};

/** Leaderboard-style list */
export const Leaderboard: Story = {
  render: () => (
    <List className="w-80">
      {[
        { rank: 1, name: 'Player1', score: 15420 },
        { rank: 2, name: 'Player2', score: 14850 },
        { rank: 3, name: 'Player3', score: 13200 },
        { rank: 4, name: 'You', score: 12100 },
        { rank: 5, name: 'Player5', score: 11500 },
      ].map((player) => (
        <ListItem key={player.rank} active={player.name === 'You'}>
          <ListItemIcon>{player.rank}</ListItemIcon>
          <ListItemContent title={player.name} />
          <ListItemAction>
            <span className="text-value text-text-primary">{player.score.toLocaleString()}</span>
          </ListItemAction>
        </ListItem>
      ))}
    </List>
  ),
};
