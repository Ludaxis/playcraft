import { Link } from 'react-router-dom';
import { Wand2, Sparkles, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Avatar } from '../Avatar';

interface CreateCTABannerProps {
  variant: 'cta';
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

interface CreatorSpotlightProps {
  variant: 'spotlight';
  creator: {
    name: string;
    avatar_url?: string | null;
    games_count: number;
    total_plays: number;
  };
  href?: string;
}

type MiniBannerProps = (CreateCTABannerProps | CreatorSpotlightProps) & {
  className?: string;
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function MiniBanner(props: MiniBannerProps) {
  const { className } = props;

  if (props.variant === 'cta') {
    const {
      title = 'Create Your Own Game',
      description = 'Build with AI, no coding required',
      buttonText = 'Start Building',
      href = '/',
    } = props;

    return (
      <div
        className={cn(
          'mx-4 my-8 overflow-hidden rounded-2xl border border-border-muted md:mx-8',
          'bg-gradient-to-r from-surface-elevated via-surface-elevated to-accent/10',
          className
        )}
      >
        <div className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary shadow-glow-sm">
              <Wand2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content">{title}</h3>
              <p className="text-sm text-content-secondary">{description}</p>
            </div>
          </div>
          <Button asChild variant="accent" className="w-full sm:w-auto">
            <Link to={href}>
              <Sparkles className="mr-2 h-4 w-4" />
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Creator Spotlight variant
  const { creator, href = '#' } = props;

  return (
    <div
      className={cn(
        'mx-4 my-8 overflow-hidden rounded-2xl border border-border-muted md:mx-8',
        'bg-gradient-to-r from-secondary/5 via-surface-elevated to-accent/5',
        className
      )}
    >
      <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar
          src={creator.avatar_url}
          name={creator.name}
          size="lg"
          className="h-16 w-16 shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Creator Spotlight
            </span>
          </div>
          <h3 className="mt-1 text-lg font-bold text-content">{creator.name}</h3>
          <p className="text-sm text-content-secondary">
            {creator.games_count} games &middot; {formatNumber(creator.total_plays)} plays
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link to={href}>View Profile</Link>
        </Button>
      </div>
    </div>
  );
}
