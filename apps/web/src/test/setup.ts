import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({ data: [], error: null })),
        })),
        order: vi.fn(() => ({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })) })),
      delete: vi.fn(() => ({ eq: vi.fn() })),
    })),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@webcontainer/api', () => ({
  WebContainer: {
    boot: vi.fn(),
  },
}));
