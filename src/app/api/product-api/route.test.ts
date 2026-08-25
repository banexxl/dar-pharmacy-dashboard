import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();

const createChain = () => ({
     select: vi.fn().mockReturnThis(),
     insert: vi.fn().mockReturnThis(),
     update: vi.fn().mockReturnThis(),
     delete: vi.fn().mockReturnThis(),
     eq: vi.fn().mockReturnThis(),
     order: vi.fn().mockReturnThis(),
     single: vi.fn(),
     maybeSingle: vi.fn(),
});

let chain: ReturnType<typeof createChain>;

vi.mock('@/services/supabase-browser', () => ({
     supabaseBrowser: {
          from: vi.fn(() => chain),
     },
     supabase: {
          from: vi.fn(() => chain),
     },
}));

vi.mock('@/lib/google/search-console', () => ({
     submitSitemapIfProduction: vi.fn().mockResolvedValue(undefined),
}));

function makeRequest(method: string, body?: any): NextRequest {
     return new NextRequest(new URL('http://localhost:3000/api/product-api'), {
          method,
          ...(body ? { body: JSON.stringify(body) } : {}),
     });
}

describe('Product API Route', () => {
     beforeEach(() => {
          vi.clearAllMocks();
          chain = createChain();
     });

     describe('GET', () => {
          it('returns products on success', async () => {
               const products = [{ id: '1', name: 'Test Product' }];
               chain.order.mockReturnValue({ data: products, error: null });

               const response = await GET();
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(products);
               expect(json.message).toBe('Products found!');
          });

          it('returns 500 on database error', async () => {
               chain.order.mockReturnValue({ data: null, error: { message: 'DB error' } });

               const response = await GET();
               const json = await response.json();

               expect(response.status).toBe(500);
               expect(json.error).toBe('Failed to fetch products.');
          });
     });

     describe('POST', () => {
          it('creates a product on success', async () => {
               const newProduct = { id: '1', name: 'New Product', slug: 'new-product' };
               chain.select.mockReturnThis();
               chain.insert.mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue({ data: newProduct, error: null }) }) });

               const request = makeRequest('POST', { name: 'New Product', price: 100, available_stock: 10 });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(newProduct);
          });

          it('returns 500 on insert error', async () => {
               chain.insert.mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue({ data: null, error: { message: 'Insert failed' } }) }) });

               const request = makeRequest('POST', { name: 'Fail Product', price: 50 });
               const response = await POST(request);
               const json = await response.json();

               expect(response.status).toBe(500);
               expect(json.error).toBe('Failed to add product.');
          });
     });

     describe('PUT', () => {
          it('updates a product on success', async () => {
               const updatedProduct = { id: '1', name: 'Updated', is_active: true };

               // First call: fetch existing (for activation check)
               chain.select.mockReturnThis();
               chain.eq.mockReturnThis();
               chain.maybeSingle.mockResolvedValueOnce({ data: { is_active: true }, error: null });

               // Second call: update
               chain.update.mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                         select: vi.fn().mockReturnValue({
                              single: vi.fn().mockReturnValue({ data: updatedProduct, error: null })
                         })
                    })
               });

               const request = makeRequest('PUT', { id: '1', name: 'Updated', price: 200 });
               const response = await PUT(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.data).toEqual(updatedProduct);
          });
     });

     describe('DELETE', () => {
          it('deletes a product on success', async () => {
               chain.delete.mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                         select: vi.fn().mockReturnValue({ data: [{ id: '1' }], error: null })
                    })
               });

               const request = makeRequest('DELETE', { currentProductID: '1' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(200);
               expect(json.message).toBe('Product successfully deleted!');
          });

          it('returns 404 when product not found', async () => {
               chain.delete.mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                         select: vi.fn().mockReturnValue({ data: [], error: null })
                    })
               });

               const request = makeRequest('DELETE', { currentProductID: 'nonexistent' });
               const response = await DELETE(request);
               const json = await response.json();

               expect(response.status).toBe(404);
               expect(json.error).toBe('Product not found.');
          });
     });
});
