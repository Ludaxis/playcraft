/**
 * Game Templates
 *
 * Pre-built game templates for quick project starts.
 * Each template includes starter code and AI prompt context.
 */

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: 'arcade' | 'puzzle' | 'action' | 'strategy' | 'casual';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  tags: string[];
  features: string[];
  aiContext: string;
  files: Record<string, string>;
}

const TEMPLATE_BASE_FILES = {
  '/src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  '/src/App.tsx': `import { HashRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}`,

  '/src/pages/NotFound.tsx': `import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-8">Page not found</p>
      <Link to="/" className="px-6 py-3 bg-violet-600 rounded-lg hover:bg-violet-700">
        Go Home
      </Link>
    </div>
  );
}`,

  '/src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #111827;
  color: white;
}`,
};

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'platformer',
    name: 'Platformer',
    description: 'Classic side-scrolling platformer with jumping and obstacles',
    category: 'action',
    difficulty: 'intermediate',
    thumbnail: '🎮',
    tags: ['2d', 'jump', 'physics', 'levels'],
    features: ['Arrow key controls', 'Gravity physics', 'Platform collision', 'Coin collection'],
    aiContext: 'This is a 2D platformer game with a player character that can move left/right and jump. Features include platforms, collectibles, and simple physics.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useCallback, useRef } from 'react';

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const PLAYER_SIZE = 32;

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PLATFORMS: Platform[] = [
  { x: 0, y: 350, width: 800, height: 50 },
  { x: 200, y: 280, width: 150, height: 20 },
  { x: 450, y: 200, width: 150, height: 20 },
  { x: 100, y: 150, width: 100, height: 20 },
];

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 300,
    vx: 0,
    vy: 0,
    onGround: false,
  });
  const [score, setScore] = useState(0);
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setPlayer(prev => {
        let { x, y, vx, vy, onGround } = prev;
        const keys = keysRef.current;

        // Input
        if (keys.has('ArrowLeft')) vx = -MOVE_SPEED;
        else if (keys.has('ArrowRight')) vx = MOVE_SPEED;
        else vx = 0;

        if ((keys.has('ArrowUp') || keys.has(' ')) && onGround) {
          vy = JUMP_FORCE;
          onGround = false;
        }

        // Physics
        vy += GRAVITY;
        x += vx;
        y += vy;

        // Platform collision
        onGround = false;
        for (const plat of PLATFORMS) {
          if (
            x + PLAYER_SIZE > plat.x &&
            x < plat.x + plat.width &&
            y + PLAYER_SIZE > plat.y &&
            y + PLAYER_SIZE < plat.y + plat.height + vy + 5 &&
            vy > 0
          ) {
            y = plat.y - PLAYER_SIZE;
            vy = 0;
            onGround = true;
          }
        }

        // Boundaries
        x = Math.max(0, Math.min(768, x));

        return { x, y, vx, vy, onGround };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 400);

    // Draw platforms
    ctx.fillStyle = '#4c1d95';
    for (const plat of PLATFORMS) {
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Draw player
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
  }, [player]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 text-xl font-bold text-white">Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border-2 border-violet-600 rounded-lg"
      />
      <p className="mt-4 text-gray-400">Arrow keys to move, Space to jump</p>
    </div>
  );
}`,
    },
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game - eat food and grow longer',
    category: 'arcade',
    difficulty: 'beginner',
    thumbnail: '🐍',
    tags: ['2d', 'arcade', 'classic', 'grid'],
    features: ['Arrow key controls', 'Growing snake', 'Food spawning', 'Score tracking'],
    aiContext: 'Classic Snake game where the player controls a snake that grows when eating food. Game over when hitting walls or self.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export default function Index() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const spawnFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    spawnFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = { ...prev[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        if (prev.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          spawnFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, spawnFood]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 text-2xl font-bold text-white">Score: {score}</div>
      <div
        className="relative border-2 border-violet-600 rounded-lg"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {snake.map((seg, i) => (
          <div
            key={i}
            className="absolute bg-green-500 rounded-sm"
            style={{
              left: seg.x * CELL_SIZE,
              top: seg.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />
        ))}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
          }}
        />
      </div>
      {gameOver && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-xl text-red-500 mb-2">Game Over!</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            Play Again
          </button>
        </div>
      )}
      <p className="mt-4 text-gray-400">Use arrow keys to move</p>
    </div>
  );
}`,
    },
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Flip cards to find matching pairs',
    category: 'puzzle',
    difficulty: 'beginner',
    thumbnail: '🃏',
    tags: ['2d', 'puzzle', 'cards', 'memory'],
    features: ['Card flipping', 'Match detection', 'Move counter', 'Win condition'],
    aiContext: 'Memory matching card game where players flip cards to find matching pairs. Track moves and time.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect } from 'react';

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎸'];
const CARDS = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function Index() {
  const [cards, setCards] = useState<Card[]>(
    CARDS.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const handleClick = (id: number) => {
    if (selected.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    setSelected([...selected, id]);
  };

  useEffect(() => {
    if (selected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = selected;

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards(newCards);
          setSelected([]);

          if (newCards.every(c => c.matched)) {
            setWon(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setSelected([]);
        }, 1000);
      }
    }
  }, [selected, cards]);

  const resetGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
    setSelected([]);
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Memory Match</h1>
      <p className="text-xl text-violet-400 mb-6">Moves: {moves}</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={\`w-20 h-20 text-4xl rounded-xl transition-all duration-300 \${
              card.flipped || card.matched
                ? 'bg-violet-600 rotate-0'
                : 'bg-gray-700 hover:bg-gray-600'
            } \${card.matched ? 'opacity-50' : ''}\`}
          >
            {(card.flipped || card.matched) && card.emoji}
          </button>
        ))}
      </div>

      {won && (
        <div className="text-center">
          <p className="text-2xl text-green-500 mb-4">You Won in {moves} moves!</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}`,
    },
  },
  {
    id: 'clicker',
    name: 'Idle Clicker',
    description: 'Click to earn points and buy upgrades',
    category: 'casual',
    difficulty: 'beginner',
    thumbnail: '👆',
    tags: ['idle', 'clicker', 'upgrades', 'casual'],
    features: ['Click counter', 'Auto-clickers', 'Upgrades shop', 'Passive income'],
    aiContext: 'Idle clicker game with upgrades. Click to earn currency, buy upgrades for passive income and click multipliers.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect } from 'react';

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  owned: number;
}

export default function Index() {
  const [points, setPoints] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClick, setAutoClick] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { id: 'cursor', name: '🖱️ Auto Cursor', cost: 15, multiplier: 1.15, owned: 0 },
    { id: 'click', name: '💪 Power Click', cost: 100, multiplier: 1.2, owned: 0 },
    { id: 'factory', name: '🏭 Click Factory', cost: 500, multiplier: 1.15, owned: 0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(p => p + autoClick);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoClick]);

  const handleClick = () => {
    setPoints(p => p + clickPower);
  };

  const buyUpgrade = (id: string) => {
    const upgrade = upgrades.find(u => u.id === id);
    if (!upgrade || points < upgrade.cost) return;

    setPoints(p => p - upgrade.cost);

    if (id === 'cursor') {
      setAutoClick(a => a + 1);
    } else if (id === 'click') {
      setClickPower(c => c + 1);
    } else if (id === 'factory') {
      setAutoClick(a => a + 5);
    }

    setUpgrades(ups => ups.map(u =>
      u.id === id
        ? { ...u, cost: Math.floor(u.cost * u.multiplier), owned: u.owned + 1 }
        : u
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-violet-400 mb-2">{Math.floor(points)} Points</h1>
      <p className="text-gray-400 mb-6">+{autoClick}/sec | +{clickPower}/click</p>

      <button
        onClick={handleClick}
        className="w-48 h-48 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500
                   text-6xl shadow-lg hover:scale-105 active:scale-95 transition-transform mb-8"
      >
        🎯
      </button>

      <div className="w-full max-w-md space-y-3">
        {upgrades.map(upgrade => (
          <button
            key={upgrade.id}
            onClick={() => buyUpgrade(upgrade.id)}
            disabled={points < upgrade.cost}
            className={\`w-full p-4 rounded-xl flex justify-between items-center
                       \${points >= upgrade.cost
                         ? 'bg-gray-800 hover:bg-gray-700'
                         : 'bg-gray-800/50 opacity-50 cursor-not-allowed'}\`}
          >
            <div className="text-left">
              <p className="text-lg font-medium">{upgrade.name}</p>
              <p className="text-sm text-gray-400">Owned: {upgrade.owned}</p>
            </div>
            <div className="text-violet-400 font-bold">{upgrade.cost}</div>
          </button>
        ))}
      </div>
    </div>
  );
}`,
    },
  },
  {
    id: 'pong',
    name: 'Pong',
    description: 'Classic 2-player paddle game',
    category: 'arcade',
    difficulty: 'beginner',
    thumbnail: '🏓',
    tags: ['2d', 'arcade', 'multiplayer', 'classic'],
    features: ['2-player controls', 'Ball physics', 'Score tracking', 'AI opponent option'],
    aiContext: 'Classic Pong game with paddles and a bouncing ball. Can be 2-player or vs AI.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const PADDLE_SPEED = 8;

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const gameRef = useRef({
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED / 2 },
    p1: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    p2: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
  });
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      const game = gameRef.current;
      const keys = keysRef.current;

      // Move paddles
      if (keys.has('w')) game.p1.y = Math.max(0, game.p1.y - PADDLE_SPEED);
      if (keys.has('s')) game.p1.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.p1.y + PADDLE_SPEED);
      if (keys.has('ArrowUp')) game.p2.y = Math.max(0, game.p2.y - PADDLE_SPEED);
      if (keys.has('ArrowDown')) game.p2.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.p2.y + PADDLE_SPEED);

      // Move ball
      game.ball.x += game.ball.vx;
      game.ball.y += game.ball.vy;

      // Ball collision with top/bottom
      if (game.ball.y <= 0 || game.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
        game.ball.vy *= -1;
      }

      // Ball collision with paddles
      if (
        game.ball.x <= PADDLE_WIDTH + 20 &&
        game.ball.y >= game.p1.y &&
        game.ball.y <= game.p1.y + PADDLE_HEIGHT
      ) {
        game.ball.vx = Math.abs(game.ball.vx);
      }
      if (
        game.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE &&
        game.ball.y >= game.p2.y &&
        game.ball.y <= game.p2.y + PADDLE_HEIGHT
      ) {
        game.ball.vx = -Math.abs(game.ball.vx);
      }

      // Score
      if (game.ball.x < 0) {
        setScore(s => ({ ...s, p2: s.p2 + 1 }));
        game.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED / 2 };
      }
      if (game.ball.x > CANVAS_WIDTH) {
        setScore(s => ({ ...s, p1: s.p1 + 1 }));
        game.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: -BALL_SPEED, vy: BALL_SPEED / 2 };
      }

      // Draw
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#fff';
      ctx.fillRect(20, game.p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - 30, game.p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(game.ball.x, game.ball.y, BALL_SIZE, BALL_SIZE);

      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 text-3xl font-bold text-white">
        <span className="text-blue-400">{score.p1}</span>
        <span className="mx-4">-</span>
        <span className="text-red-400">{score.p2}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-violet-600 rounded-lg"
      />
      <p className="mt-4 text-gray-400">P1: W/S | P2: ↑/↓</p>
    </div>
  );
}`,
    },
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Bounce the ball to break all bricks',
    category: 'arcade',
    difficulty: 'intermediate',
    thumbnail: '🧱',
    tags: ['2d', 'arcade', 'physics', 'bricks'],
    features: ['Paddle control', 'Brick destruction', 'Ball physics', 'Power-ups'],
    aiContext: 'Breakout/Arkanoid style game where the player controls a paddle to bounce a ball and destroy bricks.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 18;
const BRICK_GAP = 4;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;

interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const gameRef = useRef({
    paddle: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40, vx: 3, vy: -3 },
    bricks: [] as Brick[],
  });

  useEffect(() => {
    // Initialize bricks
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const bricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (BRICK_WIDTH + BRICK_GAP) + 20,
          y: r * (BRICK_HEIGHT + BRICK_GAP) + 30,
          alive: true,
          color: colors[r],
        });
      }
    }
    gameRef.current.bricks = bricks;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - PADDLE_WIDTH / 2;
      gameRef.current.paddle = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (gameOver || won) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      const game = gameRef.current;
      const ball = game.ball;

      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collision
      if (ball.x <= BALL_RADIUS || ball.x >= CANVAS_WIDTH - BALL_RADIUS) ball.vx *= -1;
      if (ball.y <= BALL_RADIUS) ball.vy *= -1;

      // Paddle collision
      if (
        ball.y >= CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10 &&
        ball.x >= game.paddle &&
        ball.x <= game.paddle + PADDLE_WIDTH
      ) {
        ball.vy = -Math.abs(ball.vy);
        const hitPos = (ball.x - game.paddle) / PADDLE_WIDTH - 0.5;
        ball.vx = hitPos * 6;
      }

      // Game over
      if (ball.y > CANVAS_HEIGHT) {
        setGameOver(true);
        return;
      }

      // Brick collision
      for (const brick of game.bricks) {
        if (!brick.alive) continue;
        if (
          ball.x >= brick.x &&
          ball.x <= brick.x + BRICK_WIDTH &&
          ball.y >= brick.y &&
          ball.y <= brick.y + BRICK_HEIGHT
        ) {
          brick.alive = false;
          ball.vy *= -1;
          setScore(s => s + 10);
        }
      }

      // Win check
      if (game.bricks.every(b => !b.alive)) {
        setWon(true);
      }

      // Draw
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bricks
      for (const brick of game.bricks) {
        if (!brick.alive) continue;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }

      // Draw paddle
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(game.paddle, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameOver, won]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 text-xl font-bold text-white">Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-violet-600 rounded-lg cursor-none"
      />
      {(gameOver || won) && (
        <div className="mt-4 text-center">
          <p className={\`text-2xl \${won ? 'text-green-500' : 'text-red-500'}\`}>
            {won ? 'You Won!' : 'Game Over!'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            Play Again
          </button>
        </div>
      )}
      <p className="mt-4 text-gray-400">Move mouse to control paddle</p>
    </div>
  );
}`,
    },
  },
  {
    id: 'space-shooter',
    name: 'Space Shooter',
    description: 'Shoot enemies and dodge bullets in space',
    category: 'action',
    difficulty: 'intermediate',
    thumbnail: '🚀',
    tags: ['2d', 'shooter', 'space', 'bullets'],
    features: ['Player movement', 'Shooting mechanics', 'Enemy waves', 'Score system'],
    aiContext: 'Top-down space shooter with player ship, enemies, and projectiles. Features wave-based gameplay.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 30;
const BULLET_SIZE = 5;
const ENEMY_SIZE = 25;

interface Entity {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameRef = useRef({
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 },
    bullets: [] as Entity[],
    enemies: [] as Entity[],
    lastShot: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      const game = gameRef.current;
      const keys = keysRef.current;
      const now = Date.now();

      // Player movement
      if (keys.has('ArrowLeft')) game.player.x = Math.max(PLAYER_SIZE / 2, game.player.x - 6);
      if (keys.has('ArrowRight')) game.player.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE / 2, game.player.x + 6);

      // Shooting
      if (keys.has(' ') && now - game.lastShot > 200) {
        game.bullets.push({ x: game.player.x, y: game.player.y - PLAYER_SIZE / 2, vy: -10 });
        game.lastShot = now;
      }

      // Move bullets
      game.bullets = game.bullets.filter(b => {
        b.y += b.vy || 0;
        return b.y > 0;
      });

      // Spawn enemies
      if (Math.random() < 0.02) {
        game.enemies.push({
          x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE * 2) + ENEMY_SIZE,
          y: -ENEMY_SIZE,
          vy: 2 + Math.random() * 2,
        });
      }

      // Move enemies
      game.enemies = game.enemies.filter(e => {
        e.y += e.vy || 0;
        if (e.y > CANVAS_HEIGHT) return false;

        // Check collision with player
        if (
          Math.abs(e.x - game.player.x) < (PLAYER_SIZE + ENEMY_SIZE) / 2 &&
          Math.abs(e.y - game.player.y) < (PLAYER_SIZE + ENEMY_SIZE) / 2
        ) {
          setGameOver(true);
        }
        return true;
      });

      // Bullet-enemy collision
      game.bullets = game.bullets.filter(bullet => {
        for (let i = game.enemies.length - 1; i >= 0; i--) {
          const enemy = game.enemies[i];
          if (
            Math.abs(bullet.x - enemy.x) < ENEMY_SIZE / 2 &&
            Math.abs(bullet.y - enemy.y) < ENEMY_SIZE / 2
          ) {
            game.enemies.splice(i, 1);
            setScore(s => s + 100);
            return false;
          }
        }
        return true;
      });

      // Draw
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Stars background
      ctx.fillStyle = '#ffffff22';
      for (let i = 0; i < 50; i++) {
        ctx.fillRect((i * 73) % CANVAS_WIDTH, (i * 97 + now / 50) % CANVAS_HEIGHT, 2, 2);
      }

      // Player
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(game.player.x, game.player.y - PLAYER_SIZE / 2);
      ctx.lineTo(game.player.x - PLAYER_SIZE / 2, game.player.y + PLAYER_SIZE / 2);
      ctx.lineTo(game.player.x + PLAYER_SIZE / 2, game.player.y + PLAYER_SIZE / 2);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#fbbf24';
      for (const bullet of game.bullets) {
        ctx.fillRect(bullet.x - BULLET_SIZE / 2, bullet.y, BULLET_SIZE, BULLET_SIZE * 2);
      }

      // Enemies
      ctx.fillStyle = '#ef4444';
      for (const enemy of game.enemies) {
        ctx.fillRect(enemy.x - ENEMY_SIZE / 2, enemy.y - ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE);
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 text-xl font-bold text-white">Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-violet-600 rounded-lg"
      />
      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-2xl text-red-500">Game Over!</p>
          <p className="text-gray-400 mb-2">Final Score: {score}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            Play Again
          </button>
        </div>
      )}
      <p className="mt-4 text-gray-400">← → to move, SPACE to shoot</p>
    </div>
  );
}`,
    },
  },
  {
    id: 'sliding-puzzle',
    name: 'Sliding Puzzle',
    description: 'Slide tiles to solve the puzzle',
    category: 'puzzle',
    difficulty: 'intermediate',
    thumbnail: '🧩',
    tags: ['puzzle', 'tiles', 'brain', 'numbers'],
    features: ['Tile sliding', 'Move counter', 'Shuffle algorithm', 'Win detection'],
    aiContext: 'Classic sliding puzzle game where player arranges numbered tiles in order by sliding them into the empty space.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useCallback } from 'react';

const SIZE = 4;
const TOTAL_TILES = SIZE * SIZE;

function createSolvedBoard(): number[] {
  return Array.from({ length: TOTAL_TILES }, (_, i) => (i + 1) % TOTAL_TILES);
}

function shuffle(board: number[]): number[] {
  const shuffled = [...board];
  for (let i = 0; i < 200; i++) {
    const emptyIdx = shuffled.indexOf(0);
    const emptyRow = Math.floor(emptyIdx / SIZE);
    const emptyCol = emptyIdx % SIZE;

    const moves: number[] = [];
    if (emptyRow > 0) moves.push(emptyIdx - SIZE);
    if (emptyRow < SIZE - 1) moves.push(emptyIdx + SIZE);
    if (emptyCol > 0) moves.push(emptyIdx - 1);
    if (emptyCol < SIZE - 1) moves.push(emptyIdx + 1);

    const swapIdx = moves[Math.floor(Math.random() * moves.length)];
    [shuffled[emptyIdx], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[emptyIdx]];
  }
  return shuffled;
}

function isSolved(board: number[]): boolean {
  return board.every((val, idx) => val === (idx + 1) % TOTAL_TILES);
}

export default function Index() {
  const [board, setBoard] = useState(() => shuffle(createSolvedBoard()));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const handleClick = useCallback((idx: number) => {
    if (won) return;

    const emptyIdx = board.indexOf(0);
    const emptyRow = Math.floor(emptyIdx / SIZE);
    const emptyCol = emptyIdx % SIZE;
    const clickRow = Math.floor(idx / SIZE);
    const clickCol = idx % SIZE;

    const isAdjacent =
      (Math.abs(emptyRow - clickRow) === 1 && emptyCol === clickCol) ||
      (Math.abs(emptyCol - clickCol) === 1 && emptyRow === clickRow);

    if (!isAdjacent) return;

    const newBoard = [...board];
    [newBoard[emptyIdx], newBoard[idx]] = [newBoard[idx], newBoard[emptyIdx]];
    setBoard(newBoard);
    setMoves(m => m + 1);

    if (isSolved(newBoard)) {
      setWon(true);
    }
  }, [board, won]);

  const reset = () => {
    setBoard(shuffle(createSolvedBoard()));
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Sliding Puzzle</h1>
      <p className="text-xl text-violet-400 mb-6">Moves: {moves}</p>

      <div
        className="grid gap-2 p-4 bg-gray-800 rounded-xl"
        style={{ gridTemplateColumns: \`repeat(\${SIZE}, 1fr)\` }}
      >
        {board.map((value, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={\`w-16 h-16 text-2xl font-bold rounded-lg transition-all \${
              value === 0
                ? 'bg-transparent'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg'
            }\`}
            disabled={value === 0}
          >
            {value !== 0 && value}
          </button>
        ))}
      </div>

      {won && (
        <div className="mt-6 text-center">
          <p className="text-2xl text-green-500 mb-2">Congratulations!</p>
          <p className="text-gray-400 mb-4">Solved in {moves} moves</p>
        </div>
      )}

      <button
        onClick={reset}
        className="mt-6 px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
      >
        {won ? 'Play Again' : 'Shuffle'}
      </button>
    </div>
  );
}`,
    },
  },
  {
    id: 'mini-rpg',
    name: 'Mini RPG',
    description: 'Explore a dungeon and battle monsters',
    category: 'action',
    difficulty: 'advanced',
    thumbnail: '⚔️',
    tags: ['rpg', 'dungeon', 'battle', 'exploration'],
    features: ['Character movement', 'Turn-based combat', 'Health/damage system', 'Item pickups'],
    aiContext: 'Simple dungeon crawler RPG with tile-based movement, enemy encounters, and basic combat system.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useCallback } from 'react';

const MAP_SIZE = 10;
const TILE_SIZE = 40;

type TileType = 'floor' | 'wall' | 'exit' | 'health';

interface Entity {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
}

interface GameState {
  player: Entity;
  enemies: Entity[];
  map: TileType[][];
  level: number;
  combat: { enemy: Entity; message: string } | null;
}

function generateMap(): TileType[][] {
  const map: TileType[][] = Array(MAP_SIZE).fill(null).map(() =>
    Array(MAP_SIZE).fill('floor')
  );

  // Add walls
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
    const y = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
    if (!(x === 1 && y === 1)) map[y][x] = 'wall';
  }

  // Add border walls
  for (let i = 0; i < MAP_SIZE; i++) {
    map[0][i] = 'wall';
    map[MAP_SIZE - 1][i] = 'wall';
    map[i][0] = 'wall';
    map[i][MAP_SIZE - 1] = 'wall';
  }

  // Add exit and health
  map[MAP_SIZE - 2][MAP_SIZE - 2] = 'exit';
  map[Math.floor(MAP_SIZE / 2)][Math.floor(MAP_SIZE / 2)] = 'health';

  return map;
}

function generateEnemies(level: number): Entity[] {
  const count = 2 + level;
  const enemies: Entity[] = [];
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (MAP_SIZE - 4)) + 2;
      y = Math.floor(Math.random() * (MAP_SIZE - 4)) + 2;
    } while (enemies.some(e => e.x === x && e.y === y) || (x < 3 && y < 3));

    enemies.push({
      x, y,
      hp: 20 + level * 5,
      maxHp: 20 + level * 5,
      attack: 5 + level * 2,
    });
  }
  return enemies;
}

export default function Index() {
  const [game, setGame] = useState<GameState>(() => ({
    player: { x: 1, y: 1, hp: 100, maxHp: 100, attack: 15 },
    enemies: generateEnemies(1),
    map: generateMap(),
    level: 1,
    combat: null,
  }));
  const [gameOver, setGameOver] = useState(false);

  const move = useCallback((dx: number, dy: number) => {
    if (gameOver || game.combat) return;

    setGame(prev => {
      const newX = prev.player.x + dx;
      const newY = prev.player.y + dy;

      if (prev.map[newY]?.[newX] === 'wall') return prev;

      const newState = { ...prev, player: { ...prev.player, x: newX, y: newY } };

      // Check for enemy
      const enemyIdx = prev.enemies.findIndex(e => e.x === newX && e.y === newY);
      if (enemyIdx >= 0) {
        newState.combat = { enemy: prev.enemies[enemyIdx], message: 'Battle!' };
        return newState;
      }

      // Check for health pickup
      if (prev.map[newY][newX] === 'health') {
        newState.player.hp = Math.min(prev.player.maxHp, prev.player.hp + 30);
        newState.map = prev.map.map((row, y) =>
          row.map((tile, x) => (x === newX && y === newY ? 'floor' : tile))
        );
      }

      // Check for exit
      if (prev.map[newY][newX] === 'exit') {
        return {
          ...newState,
          level: prev.level + 1,
          map: generateMap(),
          enemies: generateEnemies(prev.level + 1),
          player: { ...newState.player, x: 1, y: 1 },
        };
      }

      return newState;
    });
  }, [gameOver, game.combat]);

  const attack = useCallback(() => {
    setGame(prev => {
      if (!prev.combat) return prev;

      const enemy = { ...prev.combat.enemy };
      enemy.hp -= prev.player.attack;

      if (enemy.hp <= 0) {
        const newEnemies = prev.enemies.filter(e => !(e.x === enemy.x && e.y === enemy.y));
        return {
          ...prev,
          enemies: newEnemies,
          combat: null,
        };
      }

      const playerHp = prev.player.hp - enemy.attack;
      if (playerHp <= 0) {
        setGameOver(true);
      }

      return {
        ...prev,
        player: { ...prev.player, hp: Math.max(0, playerHp) },
        combat: { enemy, message: \`Enemy attacks for \${enemy.attack}!\` },
      };
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (game.combat) {
        if (e.key === ' ') attack();
        return;
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': move(0, -1); break;
        case 'ArrowDown': case 's': move(0, 1); break;
        case 'ArrowLeft': case 'a': move(-1, 0); break;
        case 'ArrowRight': case 'd': move(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, attack, game.combat]);

  const TILE_COLORS: Record<TileType, string> = {
    floor: '#374151',
    wall: '#1f2937',
    exit: '#22c55e',
    health: '#ef4444',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4 flex gap-8 text-white">
        <span>Level: {game.level}</span>
        <span className="text-red-400">HP: {game.player.hp}/{game.player.maxHp}</span>
      </div>

      <div className="relative" style={{ width: MAP_SIZE * TILE_SIZE, height: MAP_SIZE * TILE_SIZE }}>
        {game.map.map((row, y) =>
          row.map((tile, x) => (
            <div
              key={\`\${x}-\${y}\`}
              className="absolute"
              style={{
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
                width: TILE_SIZE - 1,
                height: TILE_SIZE - 1,
                backgroundColor: TILE_COLORS[tile],
              }}
            />
          ))
        )}

        {game.enemies.map((enemy, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center text-2xl"
            style={{ left: enemy.x * TILE_SIZE, top: enemy.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
          >
            👹
          </div>
        ))}

        <div
          className="absolute flex items-center justify-center text-2xl"
          style={{ left: game.player.x * TILE_SIZE, top: game.player.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
        >
          🧙
        </div>
      </div>

      {game.combat && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-xl mb-2">⚔️ Combat! ⚔️</p>
          <p className="text-gray-400 mb-2">{game.combat.message}</p>
          <p className="mb-4">Enemy HP: {game.combat.enemy.hp}/{game.combat.enemy.maxHp}</p>
          <button onClick={attack} className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700">
            Attack (Space)
          </button>
        </div>
      )}

      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-2xl text-red-500 mb-4">Game Over!</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-violet-600 rounded-lg">
            Try Again
          </button>
        </div>
      )}

      <p className="mt-4 text-gray-400">WASD or Arrow keys to move • Green = Exit • Red = Health</p>
    </div>
  );
}`,
    },
  },
  {
    id: 'racing',
    name: 'Racing',
    description: 'Top-down racing game with obstacles',
    category: 'arcade',
    difficulty: 'intermediate',
    thumbnail: '🏎️',
    tags: ['2d', 'racing', 'speed', 'dodge'],
    features: ['Car controls', 'Obstacle dodging', 'Speed increase', 'High score'],
    aiContext: 'Top-down endless racing game where player dodges obstacles and collects power-ups.',
    files: {
      ...TEMPLATE_BASE_FILES,
      '/src/pages/Index.tsx': `import { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 500;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const LANE_COUNT = 3;
const LANE_WIDTH = CANVAS_WIDTH / LANE_COUNT;

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'car' | 'coin';
}

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef({
    playerLane: 1,
    obstacles: [] as Obstacle[],
    speed: 5,
    roadOffset: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      const game = gameRef.current;
      if (e.key === 'ArrowLeft' && game.playerLane > 0) game.playerLane--;
      if (e.key === 'ArrowRight' && game.playerLane < LANE_COUNT - 1) game.playerLane++;
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      const game = gameRef.current;

      // Update road animation
      game.roadOffset = (game.roadOffset + game.speed) % 40;

      // Spawn obstacles
      if (Math.random() < 0.03) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        const isCoin = Math.random() < 0.3;
        game.obstacles.push({
          x: lane * LANE_WIDTH + LANE_WIDTH / 2 - (isCoin ? 15 : CAR_WIDTH / 2),
          y: -60,
          width: isCoin ? 30 : CAR_WIDTH,
          height: isCoin ? 30 : CAR_HEIGHT,
          type: isCoin ? 'coin' : 'car',
        });
      }

      // Move obstacles
      const playerX = game.playerLane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
      const playerY = CANVAS_HEIGHT - CAR_HEIGHT - 20;

      game.obstacles = game.obstacles.filter(obs => {
        obs.y += game.speed;

        // Collision detection
        if (
          obs.y + obs.height > playerY &&
          obs.y < playerY + CAR_HEIGHT &&
          obs.x + obs.width > playerX &&
          obs.x < playerX + CAR_WIDTH
        ) {
          if (obs.type === 'coin') {
            setScore(s => s + 50);
            return false;
          } else {
            setGameOver(true);
            setHighScore(h => Math.max(h, score));
          }
        }

        return obs.y < CANVAS_HEIGHT;
      });

      // Increase difficulty
      game.speed = 5 + Math.floor(score / 500) * 0.5;
      setScore(s => s + 1);

      // Draw
      // Road
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Lane markers
      ctx.strokeStyle = '#9ca3af';
      ctx.setLineDash([20, 20]);
      for (let i = 1; i < LANE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * LANE_WIDTH, -game.roadOffset);
        for (let y = -game.roadOffset; y < CANVAS_HEIGHT; y += 40) {
          ctx.moveTo(i * LANE_WIDTH, y);
          ctx.lineTo(i * LANE_WIDTH, y + 20);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Obstacles
      for (const obs of game.obstacles) {
        if (obs.type === 'coin') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(obs.x + 15, obs.y + 15, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('$', obs.x + 10, obs.y + 21);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          // Car details
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(obs.x + 5, obs.y + 10, obs.width - 10, 20);
        }
      }

      // Player car
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(playerX, playerY, CAR_WIDTH, CAR_HEIGHT);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(playerX + 5, playerY + 10, CAR_WIDTH - 10, 25);

      // Wheels
      ctx.fillStyle = '#111';
      ctx.fillRect(playerX - 3, playerY + 5, 6, 15);
      ctx.fillRect(playerX + CAR_WIDTH - 3, playerY + 5, 6, 15);
      ctx.fillRect(playerX - 3, playerY + CAR_HEIGHT - 20, 6, 15);
      ctx.fillRect(playerX + CAR_WIDTH - 3, playerY + CAR_HEIGHT - 20, 6, 15);
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameOver, score]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 flex gap-8">
        <span className="text-xl font-bold text-white">Score: {score}</span>
        <span className="text-xl text-yellow-400">Best: {highScore}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-gray-700 rounded-lg"
      />
      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-2xl text-red-500 mb-2">Crash!</p>
          <p className="text-gray-400 mb-4">Score: {score}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            Play Again
          </button>
        </div>
      )}
      <p className="mt-4 text-gray-400">← → to change lanes • Collect coins, avoid cars!</p>
    </div>
  );
}`,
    },
  },
];

export function getTemplate(id: string): GameTemplate | undefined {
  return GAME_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: GameTemplate['category']): GameTemplate[] {
  return GAME_TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesByDifficulty(difficulty: GameTemplate['difficulty']): GameTemplate[] {
  return GAME_TEMPLATES.filter(t => t.difficulty === difficulty);
}
