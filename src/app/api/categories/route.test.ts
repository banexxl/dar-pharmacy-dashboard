import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock supabase
let mockFrom: any;

vi.mock('@/services/supabase-browser', () => ({
     supabase: {
          from: (...args: any[]) => mockFrom(...args),
     },
     supabaseBrowser: {
          from: (...args: any[]) => mockFrom(...args),
     },
}));

function makeRequest(method: string, body?: any): NextRequest {
     return new NextRequest(new URL('http://localhost:3000/api/categories'), {
          method,
          ...(body ? { body: JSON.stringify(body) } : {}),
     });
}

describe('Categories API Route', () => {
     beforeEach(() => {
          vi.clearAllMocks();
     });

     describe('GET', () => {
          it('returns all categories grouped by level', async () => {
               const mainData = [{ id: '1', label: 'Apoteka', value: 'apoteka' }];
               const midData = [{ id: '2', label: 'Alergije', value: 'alergije', main_category_id: '1' }];
               const subData = [{ id: '3', label: 'Kapsule', value: 'kapsule', mid_category_id: '2' }];

               mockFrom = vi.fn((table: string) => {
                    const chain = {
                         select: vi.fn().mockReturnThis(),
                         order: vi.fn(),
                    };

                    if (table === 'main_categories') {
                         chain.order.mockReturnValue({ data: mainData, error: null });
                    } else if (table === 'mid_categories') {
                         chain.order.mockReturnValue({ data: midData, error: null });
                    } else {
                         chain.order.mockReturnValue({ data: subData, error: null });
                    }

                    return chain;
               });

               const response = await GET();
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data.main).toEqual(mainData);
               expect(json.data.mid).toEqual(midData);
               expect(json.data.sub).toEqual(subData);
          });

          it('returns 500 when any query fails', async () => {
               mockFrom = vi.fn(() => ({
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnValue({ data: null, error: { message: 'DB error' } }),
               }));

               const response = await GET();
               const json = await response.json();

               expect(response.status).toBe(500);
               expect(json.error).toBe('Failed to fetch categories.');
          });
     });

     describe('POST', () => {
          it('creates a main category', async () => {
               const created = { id: '1', label: 'Test', value: 'test' };

               mockFrom = vi.fn(() => ({
                    insert: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnThis(),
                    single: vi.fn().mockReturnValue({ data: created, error: null }),
               }));

               const request = makeRequest('POST', { level: 'main', label: 'Test' });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(created);
          });

          it('returns 400 when level is missing', async () => {
               const request = makeRequest('POST', { label: 'Test' });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toContain('Missing or invalid');
          });

          it('returns 400 when label is missing', async () => {
               mockFrom = vi.fn(() => ({}));

               const request = makeRequest('POST', { level: 'main', label: '' });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('Missing label.');
          });

          it('returns 400 when mid category missing main_category_id', async () => {
               mockFrom = vi.fn(() => ({}));

               const request = makeRequest('POST', { level: 'mid', label: 'Test' });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toContain('main_category_id');
          });

          it('returns 400 when sub category missing mid_category_id', async () => {
               mockFrom = vi.fn(() => ({}));

               const request = makeRequest('POST', { level: 'sub', label: 'Test' });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toContain('mid_category_id');
          });
     });

     describe('PUT', () => {
          it('updates a category', async () => {
               const updated = { id: '1', label: 'Updated', value: 'updated' };

               mockFrom = vi.fn(() => ({
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockReturnValue({ data: updated, error: null }),
               }));

               const request = makeRequest('PUT', { level: 'main', id: '1', label: 'Updated' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(updated);
          });

          it('returns 400 when id is missing', async () => {
               mockFrom = vi.fn(() => ({}));

               const request = makeRequest('PUT', { level: 'main', label: 'Test' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('Missing id.');
          });

          it('returns 404 when category not found', async () => {
               mockFrom = vi.fn(() => ({
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockReturnValue({ data: null, error: null }),
               }));

               const request = makeRequest('PUT', { level: 'main', id: 'nonexistent', label: 'X' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(404);
               expect(json.error).toBe('Category not found.');
          });
     });

     describe('DELETE', () => {
          it('deletes a category', async () => {
               mockFrom = vi.fn(() => ({
                    delete: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnValue({ data: [{ id: '1' }], error: null }),
               }));

               const request = makeRequest('DELETE', { level: 'main', id: '1' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.message).toBe('Category deleted!');
          });

          it('returns 400 when id is missing', async () => {
               mockFrom = vi.fn(() => ({}));

               const request = makeRequest('DELETE', { level: 'main' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('Missing id.');
          });

          it('returns 404 when category not found', async () => {
               mockFrom = vi.fn(() => ({
                    delete: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnValue({ data: [], error: null }),
               }));

               const request = makeRequest('DELETE', { level: 'mid', id: 'nonexistent' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(404);
               expect(json.error).toBe('Category not found.');
          });
     });
});
