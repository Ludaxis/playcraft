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

  '/src/App.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
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
