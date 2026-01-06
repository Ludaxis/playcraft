/**
 * Adaptive Weights Service
 *
 * Learns optimal hybrid retrieval weights from selection accuracy data.
 * Analyzes past generation outcomes to tune weights per project.
 *
 * Strategy:
 * 1. Collect outcomes with high selection accuracy (>0.7)
 * 2. Analyze patterns in successful vs unsuccessful selections
 * 3. Adjust weights based on what's working for this project
 */

import { getSupabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface HybridWeights {
  semanticWeight: number;
  keywordWeight: number;
  recencyWeight: number;
  importanceWeight: number;
}

interface OutcomeData {
  selection_accuracy: number;
  files_selected_for_context: string[];
  files_actually_modified: string[];
  missed_files: string[];
  context_mode: string;
  intent_type: string;
  created_at: string;
}

interface WeightAnalysis {
  weights: HybridWeights;
  confidence: number;
  sampleSize: number;
  avgAccuracy: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Default weights (used when insufficient data)
export const DEFAULT_WEIGHTS: HybridWeights = {
  semanticWeight: 0.4,
  keywordWeight: 0.2,
  recencyWeight: 0.25,
  importanceWeight: 0.15,
};

// Minimum outcomes needed before adapting weights
const MIN_OUTCOMES_FOR_ADAPTATION = 10;

// Minimum accuracy to consider an outcome "successful"
const SUCCESS_THRESHOLD = 0.7;

// Cache TTL (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// ============================================================================
// CACHE
// ============================================================================

interface CachedWeights {
  weights: HybridWeights;
  confidence: number;
  cachedAt: number;
}

const weightCache = new Map<string, CachedWeights>();

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get adaptive weights for a project
 * Returns optimized weights based on past performance, or defaults if insufficient data
 */
export async function getAdaptiveWeights(projectId: string): Promise<WeightAnalysis> {
  // Check cache first
  const cached = weightCache.get(projectId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      weights: cached.weights,
      confidence: cached.confidence,
      sampleSize: -1, // Cached
      avgAccuracy: -1,
    };
  }

  try {
    const analysis = await analyzeProjectOutcomes(projectId);

    // Cache the result
    weightCache.set(projectId, {
      weights: analysis.weights,
      confidence: analysis.confidence,
      cachedAt: Date.now(),
    });

    return analysis;
  } catch (error) {
    console.warn('[AdaptiveWeights] Analysis failed, using defaults:', error);
    return {
      weights: DEFAULT_WEIGHTS,
      confidence: 0,
      sampleSize: 0,
      avgAccuracy: 0,
    };
  }
}

/**
 * Clear cached weights for a project (call after significant changes)
 */
export function clearWeightCache(projectId?: string): void {
  if (projectId) {
    weightCache.delete(projectId);
  } else {
    weightCache.clear();
  }
}

/**
 * Get global weight recommendations across all projects
 */
export async function getGlobalWeightRecommendations(): Promise<WeightAnalysis> {
  return analyzeProjectOutcomes(undefined);
}

// ============================================================================
// ANALYSIS
// ============================================================================

/**
 * Analyze outcomes for a project (or globally) to determine optimal weights
 */
async function analyzeProjectOutcomes(projectId: string | undefined): Promise<WeightAnalysis> {
  const supabase = getSupabase();

  // Query recent outcomes with selection data
  let query = supabase
    .from('playcraft_generation_outcomes')
    .select('selection_accuracy, files_selected_for_context, files_actually_modified, missed_files, context_mode, intent_type, created_at')
    .not('selection_accuracy', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch outcomes: ${error.message}`);
  }

  const outcomes = (data || []) as OutcomeData[];

  if (outcomes.length < MIN_OUTCOMES_FOR_ADAPTATION) {
    console.log(`[AdaptiveWeights] Insufficient data (${outcomes.length}/${MIN_OUTCOMES_FOR_ADAPTATION}), using defaults`);
    return {
      weights: DEFAULT_WEIGHTS,
      confidence: 0,
      sampleSize: outcomes.length,
      avgAccuracy: outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.selection_accuracy, 0) / outcomes.length
        : 0,
    };
  }

  // Separate successful and unsuccessful outcomes
  const successful = outcomes.filter(o => o.selection_accuracy >= SUCCESS_THRESHOLD);
  const unsuccessful = outcomes.filter(o => o.selection_accuracy < SUCCESS_THRESHOLD);

  console.log(`[AdaptiveWeights] Analyzing ${outcomes.length} outcomes: ${successful.length} successful, ${unsuccessful.length} unsuccessful`);

  // Calculate average accuracy
  const avgAccuracy = outcomes.reduce((sum, o) => sum + o.selection_accuracy, 0) / outcomes.length;

  // If already high accuracy, stick with current approach
  if (avgAccuracy >= 0.8) {
    console.log(`[AdaptiveWeights] High accuracy (${(avgAccuracy * 100).toFixed(1)}%), keeping default weights`);
    return {
      weights: DEFAULT_WEIGHTS,
      confidence: 0.9,
      sampleSize: outcomes.length,
      avgAccuracy,
    };
  }

  // Analyze patterns in missed files
  const adjustments = analyzePatterns(successful, unsuccessful);

  // Apply adjustments to default weights
  const adaptedWeights = applyAdjustments(DEFAULT_WEIGHTS, adjustments);

  // Calculate confidence based on sample size and consistency
  const confidence = Math.min(0.9, outcomes.length / 50);

  console.log(`[AdaptiveWeights] Adapted weights:`, adaptedWeights, `confidence: ${(confidence * 100).toFixed(0)}%`);

  return {
    weights: adaptedWeights,
    confidence,
    sampleSize: outcomes.length,
    avgAccuracy,
  };
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

interface WeightAdjustments {
  semanticDelta: number;
  keywordDelta: number;
  recencyDelta: number;
  importanceDelta: number;
}

/**
 * Analyze patterns in successful vs unsuccessful outcomes
 */
function analyzePatterns(
  successful: OutcomeData[],
  unsuccessful: OutcomeData[]
): WeightAdjustments {
  const adjustments: WeightAdjustments = {
    semanticDelta: 0,
    keywordDelta: 0,
    recencyDelta: 0,
    importanceDelta: 0,
  };

  if (unsuccessful.length === 0) {
    return adjustments; // No failures to learn from
  }

  // Analyze missed file patterns
  const missedPatterns = analyzeMissedFiles(unsuccessful);

  // If we're missing recently modified files, increase recency weight
  if (missedPatterns.recentlyModifiedMissRate > 0.3) {
    adjustments.recencyDelta = 0.1;
    adjustments.semanticDelta = -0.05;
    console.log('[AdaptiveWeights] Pattern: Missing recent files, boosting recency');
  }

  // If we're missing important files (pages, main components), increase importance weight
  if (missedPatterns.importantFilesMissRate > 0.3) {
    adjustments.importanceDelta = 0.1;
    adjustments.keywordDelta = -0.05;
    console.log('[AdaptiveWeights] Pattern: Missing important files, boosting importance');
  }

  // If accuracy is very low, try boosting keyword matching (more deterministic)
  const avgUnsuccessfulAccuracy = unsuccessful.reduce((sum, o) => sum + o.selection_accuracy, 0) / unsuccessful.length;
  if (avgUnsuccessfulAccuracy < 0.3) {
    adjustments.keywordDelta += 0.1;
    adjustments.semanticDelta -= 0.1;
    console.log('[AdaptiveWeights] Pattern: Very low accuracy, boosting keyword matching');
  }

  return adjustments;
}

interface MissedFilePatterns {
  recentlyModifiedMissRate: number;
  importantFilesMissRate: number;
}

/**
 * Analyze what types of files are being missed
 */
function analyzeMissedFiles(unsuccessful: OutcomeData[]): MissedFilePatterns {
  let totalMissed = 0;
  let recentlyModifiedMissed = 0;
  let importantFilesMissed = 0;

  for (const outcome of unsuccessful) {
    const missed = outcome.missed_files || [];
    totalMissed += missed.length;

    for (const file of missed) {
      // Check if it's an important file (pages, main components)
      if (
        file.includes('/pages/') ||
        file.includes('Index.tsx') ||
        file.includes('Game') ||
        file.includes('Main')
      ) {
        importantFilesMissed++;
      }

      // We can't directly check recency without more data,
      // but we can infer from file patterns
      // For now, treat all missed files as potentially recent
      recentlyModifiedMissed++;
    }
  }

  return {
    recentlyModifiedMissRate: totalMissed > 0 ? recentlyModifiedMissed / totalMissed : 0,
    importantFilesMissRate: totalMissed > 0 ? importantFilesMissed / totalMissed : 0,
  };
}

/**
 * Apply adjustments to base weights, ensuring they still sum to 1
 */
function applyAdjustments(
  base: HybridWeights,
  adjustments: WeightAdjustments
): HybridWeights {
  // Apply adjustments
  let semantic = Math.max(0.1, Math.min(0.6, base.semanticWeight + adjustments.semanticDelta));
  let keyword = Math.max(0.1, Math.min(0.4, base.keywordWeight + adjustments.keywordDelta));
  let recency = Math.max(0.1, Math.min(0.4, base.recencyWeight + adjustments.recencyDelta));
  let importance = Math.max(0.05, Math.min(0.3, base.importanceWeight + adjustments.importanceDelta));

  // Normalize to sum to 1
  const total = semantic + keyword + recency + importance;
  semantic /= total;
  keyword /= total;
  recency /= total;
  importance /= total;

  return {
    semanticWeight: Number(semantic.toFixed(3)),
    keywordWeight: Number(keyword.toFixed(3)),
    recencyWeight: Number(recency.toFixed(3)),
    importanceWeight: Number(importance.toFixed(3)),
  };
}

// ============================================================================
// DIAGNOSTICS
// ============================================================================

/**
 * Get diagnostic info about weight adaptation for a project
 */
export async function getWeightDiagnostics(projectId: string): Promise<{
  currentWeights: HybridWeights;
  confidence: number;
  sampleSize: number;
  avgAccuracy: number;
  successRate: number;
  recentOutcomes: Array<{
    accuracy: number;
    filesSelected: number;
    filesModified: number;
    missed: number;
  }>;
}> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('playcraft_generation_outcomes')
    .select('selection_accuracy, files_selected_for_context, files_actually_modified, missed_files')
    .eq('project_id', projectId)
    .not('selection_accuracy', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  const outcomes = (data || []) as OutcomeData[];
  const analysis = await getAdaptiveWeights(projectId);

  const successRate = outcomes.length > 0
    ? outcomes.filter(o => o.selection_accuracy >= SUCCESS_THRESHOLD).length / outcomes.length
    : 0;

  return {
    currentWeights: analysis.weights,
    confidence: analysis.confidence,
    sampleSize: analysis.sampleSize,
    avgAccuracy: analysis.avgAccuracy,
    successRate,
    recentOutcomes: outcomes.slice(0, 10).map(o => ({
      accuracy: o.selection_accuracy,
      filesSelected: (o.files_selected_for_context || []).length,
      filesModified: (o.files_actually_modified || []).length,
      missed: (o.missed_files || []).length,
    })),
  };
}
