import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables before importing
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-key');

// Mock @supabase/ssr
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockLimit = vi.fn();
const mockMaybeSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@supabase/ssr', () => ({
     createBrowserClient: vi.fn(() => ({
          from: mockFrom,
     })),
}));

describe('supabase-browser utilities', () => {
     beforeEach(() => {
          vi.clearAllMocks();

          // Default chain setup
          mockFrom.mockReturnValue({
               select: mockSelect.mockReturnThis(),
               order: mockOrder.mockReturnThis(),
               eq: mockEq.mockReturnThis(),
               limit: mockLimit.mockReturnThis(),
               maybeSingle: mockMaybeSingle,
          });

          // Default: select returns data
          mockSelect.mockReturnValue({
               order: mockOrder,
               data: null,
               error: null,
          });
     });

     describe('fetchRows', () => {
          it('is exported as a function', async () => {
               const mod = await import('./supabase-browser');
               expect(typeof mod.fetchRows).toBe('function');
          });

          it('fetches rows from first valid table name', async () => {
               const testData = [{ id: '1', name: 'Test' }];

               mockSelect.mockReturnValue({
                    order: vi.fn().mockReturnValue({ data: testData, error: null }),
                    data: testData,
                    error: null,
               });

               const { fetchRows } = await import('./supabase-browser');
               const result = await fetchRows(['test_table']);

               expect(mockFrom).toHaveBeenCalledWith('test_table');
               expect(result).toEqual(testData);
          });

          it('returns empty array when table has no data', async () => {
               mockSelect.mockReturnValue({
                    order: vi.fn().mockReturnValue({ data: [], error: null }),
                    data: [],
                    error: null,
               });

               const { fetchRows } = await import('./supabase-browser');
               const result = await fetchRows(['empty_table']);

               expect(result).toEqual([]);
          });

          it('applies orderBy when provided', async () => {
               const mockOrderFn = vi.fn().mockReturnValue({ data: [], error: null });
               mockSelect.mockReturnValue({ order: mockOrderFn });

               const { fetchRows } = await import('./supabase-browser');
               await fetchRows(['test_table'], { column: 'name', ascending: true });

               expect(mockOrderFn).toHaveBeenCalledWith('name', { ascending: true });
          });

          it('throws on non-missing-relation errors', async () => {
               mockSelect.mockReturnValue({
                    order: vi.fn().mockReturnValue({ data: null, error: { code: '42501', message: 'Permission denied' } }),
               });

               const { fetchRows } = await import('./supabase-browser');

               await expect(fetchRows(['test_table'])).rejects.toThrow();
          });
     });

     describe('fetchSingleRow', () => {
          it('is exported as a function', async () => {
               const mod = await import('./supabase-browser');
               expect(typeof mod.fetchSingleRow).toBe('function');
          });
     });

     describe('asDate', () => {
          it('converts string to Date', async () => {
               const { asDate } = await import('./supabase-browser');
               const result = asDate('2024-01-01T00:00:00Z');
               expect(result).toBeInstanceOf(Date);
               expect(result.getFullYear()).toBe(2024);
          });

          it('returns Date instance unchanged', async () => {
               const { asDate } = await import('./supabase-browser');
               const date = new Date('2024-06-15');
               expect(asDate(date)).toBe(date);
          });

          it('returns invalid Date for unknown types', async () => {
               const { asDate } = await import('./supabase-browser');
               const result = asDate(undefined);
               expect(result.toString()).toBe('Invalid Date');
          });
     });
});
