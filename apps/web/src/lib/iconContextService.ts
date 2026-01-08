import { getSupabase } from './supabase';
import { getProjectMemory, updateProjectSummary, updateGameType } from './projectMemoryService';

interface ProjectMeta {
  name: string;
  description: string | null;
}

interface IconContextResult {
  prompt: string;
  sources: string[];
}

const BASE_ICON_STYLE = [
  'Isometric game app icon, premium mobile game quality',
  'clean silhouette, bold focal object, no text, no borders',
  'soft rim light, simple gradient backdrop, crisp edges, high contrast',
].join(', ');

async function fetchProjectMeta(projectId: string): Promise<ProjectMeta | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_projects')
    .select('name, description')
    .eq('id', projectId)
    .single();

  if (error || !data) {
    console.warn('[iconContextService] Failed to fetch project meta', error);
    return null;
  }

  return {
    name: data.name,
    description: data.description,
  };
}

function buildConcept(meta: ProjectMeta | null, memory: Awaited<ReturnType<typeof getProjectMemory>>): {
  text: string;
  sources: string[];
} {
  const sources: string[] = [];
  const parts: string[] = [];

  if (meta?.name) {
    parts.push(meta.name);
    sources.push('name');
  }

  if (meta?.description) {
    parts.push(meta.description);
    sources.push('description');
  }

  if (memory?.project_summary) {
    parts.push(memory.project_summary);
    sources.push('project_summary');
  }

  if (memory?.game_type) {
    parts.push(`game type: ${memory.game_type}`);
    sources.push('game_type');
  }

  const text = parts.join('. ');
  return { text, sources };
}

export async function getProjectIconContext(projectId: string): Promise<IconContextResult> {
  const [meta, memory] = await Promise.all([
    fetchProjectMeta(projectId),
    getProjectMemory(projectId),
  ]);

  const { text, sources } = buildConcept(meta, memory);

  const conceptPrompt = text.trim();
  const prompt = conceptPrompt
    ? `${BASE_ICON_STYLE}, ${conceptPrompt}`
    : BASE_ICON_STYLE;

  return { prompt, sources };
}

export async function updateProjectConcept(
  projectId: string,
  options: { summary?: string; gameType?: string }
): Promise<void> {
  const updates: Array<Promise<void>> = [];

  if (options.summary) {
    updates.push(updateProjectSummary(projectId, options.summary));
  }

  if (options.gameType) {
    updates.push(updateGameType(projectId, options.gameType));
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }
}
