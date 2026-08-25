import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextRequest } from 'next/server';

// Mock supabase server client
let chain: any;

vi.mock('@/services/supabase-server', () => ({
     createSupabaseServerClient: vi.fn(async () => ({
          from: vi.fn(() => chain),
     })),
}));

function makeRequest(body?: any): NextRequest {
     return new NextRequest(new URL('http://localhost:3000/api/orders/status'), {
          method: 'PUT',
          ...(body ? { body: JSON.stringify(body) } : {}),
     });
}

describe('Orders Status API Route', () => {
     beforeEach(() => {
          vi.clearAllMocks();
          chain = {
               update: vi.fn().mockReturnThis(),
               eq: vi.fn().mockReturnThis(),
               select: vi.fn().mockReturnThis(),
               single: vi.fn(),
          };
     });

     it('updates order status successfully', async () => {
          const updated = { id: 'order-1', order_status: 'shipped' };
          chain.single.mockReturnValue({ data: updated, error: null });

          const request = makeRequest({ orderId: 'order-1', status: 'shipped' });
          const response = await PUT(request);
          const json = await response.json();

          expect(response.status).toBe(200);
          expect(json.success).toBe(true);
          expect(json.data).toEqual(updated);
     });

     it('returns 400 when orderId is missing', async () => {
          const request = makeRequest({ status: 'shipped' });
          const response = await PUT(request);
          const json = await response.json();

          expect(response.status).toBe(400);
          expect(json.error).toBe('orderId and status are required');
     });

     it('returns 400 when status is missing', async () => {
          const request = makeRequest({ orderId: 'order-1' });
          const response = await PUT(request);
          const json = await response.json();

          expect(response.status).toBe(400);
          expect(json.error).toBe('orderId and status are required');
     });

     it('returns 400 for invalid status value', async () => {
          const request = makeRequest({ orderId: 'order-1', status: 'invalid-status' });
          const response = await PUT(request);
          const json = await response.json();

          expect(response.status).toBe(400);
          expect(json.error).toBe('Invalid status value');
     });

     it('accepts all valid status values', async () => {
          const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];

          for (const status of validStatuses) {
               chain.single.mockReturnValue({ data: { id: 'order-1', order_status: status }, error: null });

               const request = makeRequest({ orderId: 'order-1', status });
               const response = await PUT(request);

               expect(response.status).toBe(200);
          }
     });

     it('returns 500 on database error', async () => {
          chain.single.mockReturnValue({ data: null, error: { message: 'DB connection failed' } });

          const request = makeRequest({ orderId: 'order-1', status: 'shipped' });
          const response = await PUT(request);
          const json = await response.json();

          expect(response.status).toBe(500);
          expect(json.error).toBe('DB connection failed');
     });
});
