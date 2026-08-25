import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock supabase
let chain: any;

vi.mock('@/services/supabase-browser', () => ({
     supabase: {
          from: vi.fn(() => chain),
     },
     supabaseBrowser: {
          from: vi.fn(() => chain),
     },
}));

function makeRequest(method: string, body?: any): NextRequest {
     return new NextRequest(new URL('http://localhost:3000/api/manufacturers'), {
          method,
          ...(body ? { body: JSON.stringify(body) } : {}),
     });
}

describe('Manufacturers API Route', () => {
     beforeEach(() => {
          vi.clearAllMocks();
          chain = {
               select: vi.fn().mockReturnThis(),
               insert: vi.fn().mockReturnThis(),
               update: vi.fn().mockReturnThis(),
               delete: vi.fn().mockReturnThis(),
               eq: vi.fn().mockReturnThis(),
               order: vi.fn(),
               single: vi.fn(),
               maybeSingle: vi.fn(),
          };
     });

     describe('GET', () => {
          it('returns manufacturers sorted by name', async () => {
               const manufacturers = [{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }];
               chain.order.mockReturnValue({ data: manufacturers, error: null });

               const response = await GET();
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(manufacturers);
          });

          it('returns 500 on error', async () => {
               chain.order.mockReturnValue({ data: null, error: { message: 'fail' } });

               const response = await GET();
               const json = await response.json();

               expect(response.status).toBe(500);
               expect(json.error).toBe('Failed to fetch manufacturers.');
          });
     });

     describe('POST', () => {
          it('creates a manufacturer', async () => {
               const created = { id: '1', name: 'New Mfg', value: 'new-mfg', url: '' };
               chain.single.mockReturnValue({ data: created, error: null });

               const request = makeRequest('POST', { name: 'New Mfg' });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(created);
          });

          it('returns 400 when name is missing', async () => {
               const request = makeRequest('POST', {});
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('Missing name.');
          });
     });

     describe('PUT', () => {
          it('updates a manufacturer', async () => {
               const updated = { id: '1', name: 'Updated', value: 'updated', url: '' };
               chain.maybeSingle.mockReturnValue({ data: updated, error: null });

               const request = makeRequest('PUT', { id: '1', name: 'Updated' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(updated);
          });

          it('returns 400 when id is missing', async () => {
               const request = makeRequest('PUT', { name: 'No ID' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('Missing id.');
          });

          it('returns 400 when no fields to update', async () => {
               const request = makeRequest('PUT', { id: '1' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('No fields to update.');
          });

          it('returns 404 when manufacturer not found', async () => {
               chain.maybeSingle.mockReturnValue({ data: null, error: null });

               const request = makeRequest('PUT', { id: 'nonexistent', name: 'X' });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(404);
               expect(json.error).toBe('Manufacturer not found.');
          });
     });

     describe('DELETE', () => {
          it('deletes a manufacturer', async () => {
               chain.select.mockReturnValue({ data: [{ id: '1' }], error: null });

               const request = makeRequest('DELETE', { id: '1' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.message).toBe('Manufacturer successfully deleted!');
          });

          it('returns 400 when id is missing', async () => {
               const request = makeRequest('DELETE', {});
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(400);
               expect(json.error).toBe('Missing id.');
          });

          it('returns 404 when manufacturer not found', async () => {
               chain.select.mockReturnValue({ data: [], error: null });

               const request = makeRequest('DELETE', { id: 'nonexistent' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(404);
               expect(json.error).toBe('Manufacturer not found.');
          });
     });
});
