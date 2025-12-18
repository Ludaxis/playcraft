/**
 * UI Components Re-exports
 *
 * This module re-exports components from their canonical locations
 * for backward compatibility. New code should import directly from:
 * - @/components/base (atomic components)
 * - @/components/composed (composed patterns)
 */

// Re-export from base/
export { Button } from '@/components/base';
export { Badge, NotificationDot } from '@/components/base';
export { Modal } from '@/components/base';
export { ProgressBar } from '@/components/base';
export { Toggle } from '@/components/base';
export { Card } from '@/components/base';

// Panel is now an alias for Card (backward compatibility)
export { Card as Panel } from '@/components/base';

// Re-export from composed/
export { List, ListItem, ListItemIcon, ListItemContent, ListItemAction } from '@/components/composed';
export { Tabs } from '@/components/composed';
export { AnimatedModal, ModalHeader } from '@/components/composed';
export { AnimatedTabs, AnimatedTabBar } from '@/components/composed';

// Domain-specific components (kept in ui/)
export { IconButton } from './IconButton';
export { ResourceDisplay } from './ResourceDisplay';
export { ShopPanel, CoinPackGrid } from './ShopPanel';
