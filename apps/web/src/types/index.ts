/**
 * Shared TypeScript types for PlayCraft
 * All types should be defined here to avoid circular dependencies
 */

// ============================================================================
// File System Types
// ============================================================================

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface NextStep {
  label: string;
  prompt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp?: Date;
  files?: FileContent[];
  nextSteps?: NextStep[];
  features?: string[];
}

export interface ConversationMessage {
  role: ChatRole;
  content: string;
}

export interface ChatSession {
  id: string;
  project_id: string;
  title: string;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

export interface CreateChatSessionInput {
  project_id: string;
  title: string;
  messages?: ConversationMessage[];
}

export interface UpdateChatSessionInput {
  title?: string;
  messages?: ConversationMessage[];
}

// ============================================================================
// Project Types
// ============================================================================

export type ProjectStatus = 'draft' | 'building' | 'ready' | 'published';

export interface PlayCraftProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url?: string | null; // Optional - column doesn't exist in DB yet
  workspace_id?: string | null;
  has_three_js: boolean;
  status: ProjectStatus;
  files: Record<string, string>;
  conversation: ConversationMessage[];
  active_chat_session_id: string | null;
  // Publishing fields
  published_url?: string | null;
  published_at?: string | null;
  play_count?: number;
  is_public?: boolean;
  is_starred?: boolean;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  workspace_id?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  has_three_js?: boolean;
  status?: ProjectStatus;
  files?: Record<string, string>;
  conversation?: ConversationMessage[];
  active_chat_session_id?: string | null;
  // Publishing fields
  published_url?: string | null;
  published_at?: string | null;
  is_public?: boolean;
  is_starred?: boolean;
  workspace_id?: string | null;
}

// Published game for showcase/discover
export interface PublishedGame {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url?: string | null; // Optional - column doesn't exist in DB yet
  published_url: string;
  published_at: string;
  play_count: number;
  user_id: string;
  // Author info (joined from user_settings)
  author_name?: string;
  author_avatar?: string | null;
}

// ============================================================================
// Settings Types
// ============================================================================

export type GenerationSoundOption = 'first' | 'always' | 'never';

export interface ConnectedAccounts {
  google?: { email: string; connected_at: string };
  github?: { username: string; connected_at: string };
}

export interface UserSettings {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  hide_profile_picture: boolean;
  studio_name: string;
  studio_description: string | null;
  chat_suggestions: boolean;
  generation_sound: GenerationSoundOption;
  labs_github_branch_switching: boolean;
  voyage_api_key: string | null;
  connected_accounts: ConnectedAccounts;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsInput {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  location?: string | null;
  website_url?: string | null;
  hide_profile_picture?: boolean;
  studio_name?: string;
  studio_description?: string | null;
  chat_suggestions?: boolean;
  generation_sound?: GenerationSoundOption;
  labs_github_branch_switching?: boolean;
  voyage_api_key?: string | null;
  connected_accounts?: ConnectedAccounts;
}

// ============================================================================
// Workspace Types
// ============================================================================

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type WorkspaceMemberStatus = 'invited' | 'active';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
  created_at: string;
  updated_at: string;
}

export type WorkspaceInviteStatus = 'pending' | 'accepted' | 'revoked';

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  token: string;
  expires_at: string | null;
  status: WorkspaceInviteStatus;
  created_at: string;
}

export interface WorkspaceWithMembership {
  workspace: Workspace;
  membership: Pick<WorkspaceMember, 'role' | 'status' | 'user_id'>;
}

// ============================================================================
// Usage & Stats Types
// ============================================================================

export interface UsageStats {
  projectsCount: number;
  creditsUsed: number;
  creditsRemaining: number;
  totalCredits: number;
  currentStreak: number;
  dailyAverage: number;
  daysEdited: number;
}

// ============================================================================
// WebContainer Types
// ============================================================================

export type WebContainerStatus =
  | 'idle'
  | 'booting'
  | 'ready'
  | 'installing'
  | 'running'
  | 'error';

// ============================================================================
// AI Generation Types
// ============================================================================

/**
 * Response mode determines how the AI formats its response.
 * The AI can choose the most appropriate format based on the request.
 */
export type ResponseMode =
  | 'edit'        // Search/replace edits for small changes
  | 'file'        // Full file rewrites for new features
  | 'plan'        // Implementation plan without code
  | 'explanation' // Explain existing code
  | 'debug';      // Focused debugging analysis

export interface GenerateCodeRequest {
  prompt: string;
  conversationHistory?: ConversationMessage[];
  currentFile?: string;
  currentFileContent?: string;
  hasThreeJs?: boolean;
  responseMode?: ResponseMode | 'auto';
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ImplementationPlan {
  summary: string;
  steps: Array<{
    step: number;
    description: string;
    files?: string[];
    complexity?: 'low' | 'medium' | 'high';
  }>;
  estimatedEffort?: string;
  considerations?: string[];
}

export interface DebugAnalysis {
  issue: string;
  rootCause: string;
  affectedFiles: string[];
  suggestedFix: string;
  steps: string[];
}

export interface GenerateCodeResponse {
  message: string;
  files: GeneratedFile[];
  explanation: string;
  needsThreeJs?: boolean;
  mode?: ResponseMode;
  plan?: ImplementationPlan;
  debugAnalysis?: DebugAnalysis;
}

// Generation progress states for UX feedback
export type GenerationStage =
  | 'idle'
  | 'preparing'           // Building context, reading files
  | 'analyzing'           // Gemini analyzing request and planning
  | 'generating'          // Gemini writing code
  | 'processing'          // Parsing response, preparing files
  | 'applying'            // Writing files to container
  | 'validating'          // Running TypeScript check, detecting errors
  | 'retrying'            // Auto-fixing errors with AI
  | 'complete'
  | 'error';

export interface GenerationProgress {
  stage: GenerationStage;
  message: string;
  startedAt: number;
  detail?: string;
   // Rich progress metadata for UI
  log?: string[];               // Recent progress lines
  activeItem?: string;          // Current file/task being processed
  completed?: number;           // Work units completed
  total?: number;               // Total work units (for progress bar)
  etaMs?: number;               // Optional ETA hint
}

// Stage configuration for UI display
export const GENERATION_STAGES: Record<GenerationStage, { label: string; icon: string; duration?: number }> = {
  idle: { label: '', icon: '' },
  preparing: { label: 'Preparing context...', icon: 'folder', duration: 1000 },
  analyzing: { label: 'Gemini is analyzing your request...', icon: 'brain', duration: 3000 },
  generating: { label: 'Gemini is writing code...', icon: 'code', duration: 10000 },
  processing: { label: 'Processing response...', icon: 'sparkles', duration: 1000 },
  applying: { label: 'Applying changes...', icon: 'save', duration: 500 },
  validating: { label: 'Checking for errors...', icon: 'search', duration: 2000 },
  retrying: { label: 'Auto-fixing errors...', icon: 'refresh', duration: 5000 },
  complete: { label: 'Done!', icon: 'check' },
  error: { label: 'Something went wrong', icon: 'alert' },
};

// ============================================================================
// Template Types
// ============================================================================

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  category: 'arcade' | 'puzzle' | 'platformer' | '3d' | 'casual' | 'strategy';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

// ============================================================================
// UI Types
// ============================================================================

export type SettingsTab =
  | 'studio'
  | 'plans'
  | 'usage'
  | 'account'
  | 'labs'
  | 'github';

export type ViewMode = 'grid' | 'list';

export type NavItem =
  | 'home'
  | 'search'
  | 'projects'
  | 'starred'
  | 'shared'
  | 'discover'
  | 'templates'
  | 'learn';

// ============================================================================
// User Profile Types
// ============================================================================

export interface UserProfile {
  id: string;
  updated_at?: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  website?: string;
  github_username?: string;
  linkedin_profile?: string;
  twitter_handle?: string;
  bio?: string;
  address?: string;
  passport_nationality?: string;
  allergies?: string[];
  diet_preference?: string[];
}
