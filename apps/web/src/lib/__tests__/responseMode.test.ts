import { describe, it, expect } from 'vitest';
import type { ResponseMode, ImplementationPlan, DebugAnalysis } from '../../types';

describe('ResponseMode Types', () => {
  describe('ResponseMode type', () => {
    it('accepts valid response modes', () => {
      const validModes: ResponseMode[] = ['edit', 'file', 'plan', 'explanation', 'debug'];

      for (const mode of validModes) {
        expect(['edit', 'file', 'plan', 'explanation', 'debug']).toContain(mode);
      }
    });
  });

  describe('ImplementationPlan', () => {
    it('validates plan structure', () => {
      const plan: ImplementationPlan = {
        summary: 'Add user authentication',
        steps: [
          { step: 1, description: 'Create auth context', files: ['/src/context/AuthContext.tsx'], complexity: 'medium' },
          { step: 2, description: 'Add login form', files: ['/src/components/LoginForm.tsx'], complexity: 'low' },
          { step: 3, description: 'Integrate with API', complexity: 'high' },
        ],
        estimatedEffort: '2-3 hours',
        considerations: [
          'Consider using JWT tokens',
          'Remember to handle token refresh',
        ],
      };

      expect(plan.summary).toBe('Add user authentication');
      expect(plan.steps).toHaveLength(3);
      expect(plan.steps[0].step).toBe(1);
      expect(plan.steps[0].files).toContain('/src/context/AuthContext.tsx');
      expect(plan.steps[2].complexity).toBe('high');
      expect(plan.considerations).toHaveLength(2);
    });

    it('accepts minimal plan structure', () => {
      const minimalPlan: ImplementationPlan = {
        summary: 'Simple change',
        steps: [{ step: 1, description: 'Make the change' }],
      };

      expect(minimalPlan.summary).toBeDefined();
      expect(minimalPlan.steps).toHaveLength(1);
      expect(minimalPlan.estimatedEffort).toBeUndefined();
      expect(minimalPlan.considerations).toBeUndefined();
    });
  });

  describe('DebugAnalysis', () => {
    it('validates debug analysis structure', () => {
      const analysis: DebugAnalysis = {
        issue: 'Component crashes on mount',
        rootCause: 'Accessing undefined property in useEffect',
        affectedFiles: ['/src/components/Player.tsx', '/src/hooks/useGame.ts'],
        suggestedFix: 'Add null check before accessing player.position',
        steps: [
          'Add optional chaining to player?.position',
          'Initialize player state with default values',
          'Add error boundary around component',
        ],
      };

      expect(analysis.issue).toBe('Component crashes on mount');
      expect(analysis.rootCause).toContain('undefined');
      expect(analysis.affectedFiles).toHaveLength(2);
      expect(analysis.suggestedFix).toContain('null check');
      expect(analysis.steps).toHaveLength(3);
    });
  });
});

describe('Response Mode Formatting', () => {
  describe('formatPlanForDisplay', () => {
    it('formats plan with all fields', () => {
      const plan: ImplementationPlan = {
        summary: 'Add dark mode support',
        steps: [
          { step: 1, description: 'Create theme context', files: ['/src/context/ThemeContext.tsx'], complexity: 'low' },
          { step: 2, description: 'Add theme toggle', files: ['/src/components/ThemeToggle.tsx'], complexity: 'low' },
        ],
        estimatedEffort: '1 hour',
        considerations: ['Consider system preference'],
      };

      const formatted = formatPlanForDisplay(plan);

      expect(formatted).toContain('## Add dark mode support');
      expect(formatted).toContain('### Steps:');
      expect(formatted).toContain('1. Create theme context');
      expect(formatted).toContain('/src/context/ThemeContext.tsx');
      expect(formatted).toContain('[low]');
      expect(formatted).toContain('### Considerations:');
      expect(formatted).toContain('Consider system preference');
      expect(formatted).toContain('**Estimated effort:** 1 hour');
    });

    it('formats plan without optional fields', () => {
      const plan: ImplementationPlan = {
        summary: 'Simple fix',
        steps: [{ step: 1, description: 'Fix the bug' }],
      };

      const formatted = formatPlanForDisplay(plan);

      expect(formatted).toContain('## Simple fix');
      expect(formatted).toContain('1. Fix the bug');
      expect(formatted).not.toContain('### Considerations:');
      expect(formatted).not.toContain('**Estimated effort:**');
    });
  });

  describe('formatDebugAnalysisForDisplay', () => {
    it('formats debug analysis', () => {
      const analysis: DebugAnalysis = {
        issue: 'TypeError on click',
        rootCause: 'Missing event handler',
        affectedFiles: ['/src/App.tsx'],
        suggestedFix: 'Add onClick handler',
        steps: ['Add handler', 'Test click'],
      };

      const formatted = formatDebugAnalysisForDisplay(analysis);

      expect(formatted).toContain('## Debug Analysis');
      expect(formatted).toContain('**Issue:** TypeError on click');
      expect(formatted).toContain('**Root Cause:** Missing event handler');
      expect(formatted).toContain('**Affected Files:** /src/App.tsx');
      expect(formatted).toContain('**Fix:** Add onClick handler');
      expect(formatted).toContain('- Add handler');
      expect(formatted).toContain('- Test click');
    });
  });
});

// Helper functions that mirror what's in usePlayCraftChat
function formatPlanForDisplay(plan: ImplementationPlan): string {
  let formattedContent = `## ${plan.summary}\n\n`;
  formattedContent += '### Steps:\n';
  for (const step of plan.steps) {
    formattedContent += `${step.step}. ${step.description}`;
    if (step.files?.length) {
      formattedContent += ` (${step.files.join(', ')})`;
    }
    if (step.complexity) {
      formattedContent += ` [${step.complexity}]`;
    }
    formattedContent += '\n';
  }
  if (plan.considerations?.length) {
    formattedContent += '\n### Considerations:\n';
    for (const consideration of plan.considerations) {
      formattedContent += `- ${consideration}\n`;
    }
  }
  if (plan.estimatedEffort) {
    formattedContent += `\n**Estimated effort:** ${plan.estimatedEffort}`;
  }
  return formattedContent;
}

function formatDebugAnalysisForDisplay(debug: DebugAnalysis): string {
  let debugContent = `## Debug Analysis\n\n`;
  debugContent += `**Issue:** ${debug.issue}\n\n`;
  debugContent += `**Root Cause:** ${debug.rootCause}\n\n`;
  debugContent += `**Affected Files:** ${debug.affectedFiles.join(', ')}\n\n`;
  debugContent += `**Fix:** ${debug.suggestedFix}\n\n`;
  if (debug.steps?.length) {
    debugContent += '**Steps to fix:**\n';
    for (const step of debug.steps) {
      debugContent += `- ${step}\n`;
    }
  }
  return debugContent;
}
