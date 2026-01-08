import { describe, it, expect } from 'vitest';
import {
  predictNextSteps,
  getInitialSuggestions,
  getSuggestionsForGameType,
  determineProjectState,
  extractPredictionContext,
  type PredictionContext,
} from '../nextStepPredictionService';
import type { ChatMessage } from '../../types';

describe('nextStepPredictionService', () => {
  describe('predictNextSteps', () => {
    it('returns error-focused suggestions when errors exist', () => {
      const context: PredictionContext = {
        lastUserPrompt: 'Add a new feature',
        lastAssistantResponse: 'Added the feature',
        filesModified: ['/src/App.tsx'],
        hasThreeJs: false,
        currentErrors: ['TypeError: Cannot read undefined'],
        projectState: 'iterating',
      };

      const steps = predictNextSteps(context);

      expect(steps.length).toBeGreaterThan(0);
      expect(steps.some(s => s.label.toLowerCase().includes('fix') || s.label.toLowerCase().includes('error'))).toBe(true);
    });

    it('matches game creation patterns', () => {
      const context: PredictionContext = {
        lastUserPrompt: 'Create a snake game',
        lastAssistantResponse: 'I\'ve created a basic snake game for you!',
        filesModified: ['/src/pages/Index.tsx'],
        hasThreeJs: false,
        projectState: 'initial',
      };

      const steps = predictNextSteps(context);

      expect(steps.length).toBe(3);
      // Should suggest common game features
      expect(steps.some(s =>
        s.label.toLowerCase().includes('control') ||
        s.label.toLowerCase().includes('score') ||
        s.label.toLowerCase().includes('game over')
      )).toBe(true);
    });

    it('matches bug fix patterns', () => {
      const context: PredictionContext = {
        lastUserPrompt: 'Fix the crash',
        lastAssistantResponse: 'I\'ve fixed the bug in the collision detection.',
        filesModified: ['/src/hooks/useGame.ts'],
        hasThreeJs: false,
        projectState: 'iterating',
      };

      const steps = predictNextSteps(context);

      expect(steps.length).toBeGreaterThan(0);
      expect(steps.some(s =>
        s.label.toLowerCase().includes('test') ||
        s.label.toLowerCase().includes('continue') ||
        s.label.toLowerCase().includes('error')
      )).toBe(true);
    });

    it('includes Three.js suggestions when hasThreeJs is true', () => {
      const context: PredictionContext = {
        lastUserPrompt: 'Add a 3D cube',
        lastAssistantResponse: 'Added a rotating 3D cube to the scene',
        filesModified: ['/src/pages/Index.tsx'],
        hasThreeJs: true,
        projectState: 'iterating',
      };

      const steps = predictNextSteps(context);

      expect(steps.length).toBeGreaterThan(0);
      // Should include 3D-specific suggestions
      expect(steps.some(s =>
        s.label.toLowerCase().includes('light') ||
        s.label.toLowerCase().includes('camera') ||
        s.label.toLowerCase().includes('texture') ||
        s.label.toLowerCase().includes('3d')
      )).toBe(true);
    });

    it('returns generic suggestions when no patterns match', () => {
      const context: PredictionContext = {
        lastUserPrompt: 'Do something random',
        lastAssistantResponse: 'Done something completely unique.',
        filesModified: [],
        hasThreeJs: false,
        projectState: 'iterating',
      };

      const steps = predictNextSteps(context);

      expect(steps.length).toBe(3);
      // Should return generic iterating suggestions
      expect(steps.some(s => s.label.toLowerCase().includes('feature') || s.label.toLowerCase().includes('improve'))).toBe(true);
    });

    it('limits results to 3 suggestions', () => {
      const context: PredictionContext = {
        lastUserPrompt: 'Create a game with player, scoring, and enemies',
        lastAssistantResponse: 'Created a game with player controls, scoring system, and enemies!',
        filesModified: ['/src/pages/Index.tsx'],
        hasThreeJs: false,
        projectState: 'initial',
      };

      const steps = predictNextSteps(context);

      expect(steps.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getInitialSuggestions', () => {
    it('returns starter game suggestions', () => {
      const suggestions = getInitialSuggestions();

      expect(suggestions.length).toBe(3);
      expect(suggestions.every(s => s.label && s.prompt)).toBe(true);
      expect(suggestions.some(s => s.label.toLowerCase().includes('arcade'))).toBe(true);
      expect(suggestions.some(s => s.label.toLowerCase().includes('puzzle'))).toBe(true);
      expect(suggestions.some(s => s.label.toLowerCase().includes('platformer'))).toBe(true);
    });
  });

  describe('getSuggestionsForGameType', () => {
    it('returns platformer-specific suggestions', () => {
      const suggestions = getSuggestionsForGameType('platformer');

      expect(suggestions.length).toBe(3);
      expect(suggestions.some(s =>
        s.label.toLowerCase().includes('jump') ||
        s.label.toLowerCase().includes('enemies') ||
        s.label.toLowerCase().includes('collectibles')
      )).toBe(true);
    });

    it('returns puzzle-specific suggestions', () => {
      const suggestions = getSuggestionsForGameType('puzzle');

      expect(suggestions.length).toBe(3);
      expect(suggestions.some(s =>
        s.label.toLowerCase().includes('timer') ||
        s.label.toLowerCase().includes('level') ||
        s.label.toLowerCase().includes('hint')
      )).toBe(true);
    });

    it('returns generic suggestions for unknown game type', () => {
      const suggestions = getSuggestionsForGameType('unknown-type');

      expect(suggestions.length).toBe(3);
    });
  });

  describe('determineProjectState', () => {
    it('returns empty for new projects', () => {
      const files = {
        '/src/pages/Index.tsx': 'export default function Index() { return null; }',
      };

      const state = determineProjectState(files, 0);

      expect(state).toBe('empty');
    });

    it('returns initial for early development', () => {
      const files = {
        '/src/pages/Index.tsx': `
          import { useState } from 'react';
          export default function Index() {
            const [score, setScore] = useState(0);
            return <div>Game</div>;
          }
        `,
      };

      const state = determineProjectState(files, 1);

      expect(state).toBe('initial');
    });

    it('returns iterating for ongoing development', () => {
      const files = {
        '/src/pages/Index.tsx': `
          import { useState, useEffect } from 'react';
          export default function Index() {
            const [score, setScore] = useState(0);
            useEffect(() => { /* game loop */ }, []);
            return <canvas />;
          }
        `,
      };

      const state = determineProjectState(files, 5);

      expect(state).toBe('iterating');
    });

    it('returns polishing for mature projects', () => {
      const files = {
        '/src/pages/Index.tsx': `
          import { useState, useEffect } from 'react';
          export default function Index() {
            const [gameState, setGameState] = useState('playing');
            useEffect(() => { /* game loop */ }, []);
            return <canvas id="game" />;
          }
        `,
        '/src/hooks/useGame.ts': 'export function useGame() { return useState(0); }',
      };

      const state = determineProjectState(files, 15);

      expect(state).toBe('polishing');
    });
  });

  describe('extractPredictionContext', () => {
    it('extracts context from messages', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Create a game' },
        { id: '2', role: 'assistant', content: 'Created the game!', files: [{ path: '/src/pages/Index.tsx', content: '...' }] },
        { id: '3', role: 'user', content: 'Add scoring' },
        { id: '4', role: 'assistant', content: 'Added scoring system' },
      ];
      const files = { '/src/pages/Index.tsx': 'game code' };

      const context = extractPredictionContext(messages, files, false);

      expect(context.lastUserPrompt).toBe('Add scoring');
      expect(context.lastAssistantResponse).toBe('Added scoring system');
      expect(context.filesModified).toContain('/src/pages/Index.tsx');
      expect(context.hasThreeJs).toBe(false);
      expect(context.projectState).toBe('iterating');
    });

    it('handles empty messages', () => {
      const context = extractPredictionContext([], {}, false);

      expect(context.lastUserPrompt).toBe('');
      expect(context.lastAssistantResponse).toBe('');
      expect(context.filesModified).toEqual([]);
      expect(context.projectState).toBe('empty');
    });

    it('includes errors when provided', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Fix the bug' },
      ];
      const errors = ['TypeError: undefined'];

      const context = extractPredictionContext(messages, {}, false, errors);

      expect(context.currentErrors).toEqual(errors);
    });
  });
});
