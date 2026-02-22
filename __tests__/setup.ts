import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

export const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    throwOnError: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase', () => ({
    supabaseServer: mockSupabase,
    supabaseBrowser: mockSupabase,
}));

vi.mock('@/lib/email', () => ({
    sendOrderConfirmation: vi.fn().mockResolvedValue(true),
}));
