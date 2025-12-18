/**
 * Composed Components
 *
 * Higher-level components built from base components.
 * These are reusable patterns extracted from pages.
 *
 * Usage:
 * import { PageHeader, EventCard, ProgressCard } from '@/components/composed';
 */

export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { EventCard } from './EventCard';
export type { EventCardProps } from './EventCard';

export { ResourceCounter } from './ResourceCounter';
export type { ResourceCounterProps, ResourceType } from './ResourceCounter';

export { RankBadge } from './RankBadge';
export type { RankBadgeProps, RankBadgeSize } from './RankBadge';

export { ProgressCard } from './ProgressCard';
export type { ProgressCardProps } from './ProgressCard';

export { MilestoneItem } from './MilestoneItem';
export type { MilestoneItemProps } from './MilestoneItem';

export { ListRow } from './ListRow';
export type { ListRowProps } from './ListRow';

export { InfoBox } from './InfoBox';
export type { InfoBoxProps } from './InfoBox';

// List components
export { List, ListItem, ListItemIcon, ListItemContent, ListItemAction } from './List';

// Tab components
export { Tabs } from './Tabs';

// Animated components
export { AnimatedModal, ModalHeader } from './AnimatedModal';
export { AnimatedTabs, AnimatedTabBar } from './AnimatedTabs';
