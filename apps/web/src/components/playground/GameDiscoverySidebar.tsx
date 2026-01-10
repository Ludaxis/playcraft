import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GameCard } from './GameCard';
import type { PublishedGame } from '../../types';

interface GameDiscoverySidebarProps {
  games: PublishedGame[];
  currentGameId?: string;
  className?: string;
  title?: string;
}

export function GameDiscoverySidebar({
  games,
  currentGameId,
  className,
  title = 'More Games',
}: GameDiscoverySidebarProps) {
  const navigate = useNavigate();

  // Filter out current game
  const filteredGames = currentGameId
    ? games.filter((g) => g.id !== currentGameId)
    : games;

  const handleGameClick = (game: PublishedGame) => {
    navigate(`/play/${game.id}`);
  };

  if (filteredGames.length === 0) return null;

  return (
    <aside className={cn('w-full', className)}>
      <div className="lg:sticky lg:top-4">
        <h2 className="mb-4 px-1 text-lg font-bold text-content">{title}</h2>

        <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 scrollbar-hide">
          {/* 3-column grid on sidebar, responsive on mobile */}
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-3">
            {filteredGames.slice(0, 18).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                size="sm"
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
