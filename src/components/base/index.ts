/**
 * Base Components
 *
 * Primitive UI components that form the foundation of the design system.
 * These are atomic, reusable building blocks with minimal dependencies.
 *
 * Usage:
 * import { Button, Card, Badge, IconBox } from '@/components/base';
 */

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Card } from './Card';
export type { CardProps, CardPadding } from './Card';

export { Badge, NotificationDot } from './Badge';
export type { BadgeProps, BadgeVariant, NotificationDotProps } from './Badge';

export { IconBox } from './IconBox';
export type { IconBoxProps, IconBoxSize, IconBoxShape } from './IconBox';

export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { Timer } from './Timer';
export type { TimerProps, TimerVariant } from './Timer';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps, ProgressBarSize } from './ProgressBar';

export { Toggle } from './Toggle';
export type { ToggleProps } from './Toggle';

export { Modal } from './Modal';
export type { ModalProps, ModalSize, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './Modal';
