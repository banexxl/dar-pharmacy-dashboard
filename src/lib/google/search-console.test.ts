import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Suppress console.error in tests (the service logs errors intentionally)
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => { });

describe('submitSitemapIfProduction', () => {
     const originalEnv = { ...process.env };

     beforeEach(() => {
          vi.resetModules();
          mockFetch.mockReset();
     });

     afterEach(() => {
          // Restore env
          Object.keys(process.env).forEach((key) => {
               if (!(key in originalEnv)) {
                    delete process.env[key];
               }
          });
          Object.assign(process.env, originalEnv);
          mockConsoleError.mockClear();
          mockConsoleLog.mockClear();
     });

     it('does nothing when NODE_ENV is not production', async () => {
          vi.stubEnv('NODE_ENV', 'development');

          const { submitSitemapIfProduction } = await import('./search-console');
          await submitSitemapIfProduction();

          expect(mockFetch).not.toHaveBeenCalled();
     });

     it('does nothing when GOOGLE_SEARCH_CONSOLE_SITE is missing', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', '');
          vi.stubEnv('GOOGLE_SITEMAP_URL', 'https://darpharmacy.rs/sitemap.xml');

          const { submitSitemapIfProduction } = await import('./search-console');
          await submitSitemapIfProduction();

          expect(mockFetch).not.toHaveBeenCalled();
     });

     it('does nothing when GOOGLE_SITEMAP_URL is missing', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', 'sc-domain:darpharmacy.rs');
          vi.stubEnv('GOOGLE_SITEMAP_URL', '');

          const { submitSitemapIfProduction } = await import('./search-console');
          await submitSitemapIfProduction();

          expect(mockFetch).not.toHaveBeenCalled();
     });

     it('does nothing when OAuth credentials are missing', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', 'sc-domain:darpharmacy.rs');
          vi.stubEnv('GOOGLE_SITEMAP_URL', 'https://darpharmacy.rs/sitemap.xml');
          vi.stubEnv('GOOGLE_CLIENT_ID', '');
          vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
          vi.stubEnv('GOOGLE_REFRESH_TOKEN', '');

          const { submitSitemapIfProduction } = await import('./search-console');
          await submitSitemapIfProduction();

          expect(mockFetch).not.toHaveBeenCalled();
     });

     it('submits sitemap when all credentials are present in production', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', 'sc-domain:darpharmacy.rs');
          vi.stubEnv('GOOGLE_SITEMAP_URL', 'https://darpharmacy.rs/sitemap.xml');
          vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
          vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');
          vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'test-refresh-token');

          // First call: token exchange
          mockFetch.mockResolvedValueOnce({
               ok: true,
               json: async () => ({ access_token: 'test-access-token' }),
          });

          // Second call: sitemap submission
          mockFetch.mockResolvedValueOnce({
               ok: true,
               status: 200,
               text: async () => '',
          });

          const { submitSitemapIfProduction } = await import('./search-console');
          await submitSitemapIfProduction();

          expect(mockFetch).toHaveBeenCalledTimes(2);

          // Verify token request
          const tokenCall = mockFetch.mock.calls[0];
          expect(tokenCall[0]).toBe('https://oauth2.googleapis.com/token');
          expect(tokenCall[1].method).toBe('POST');

          // Verify sitemap PUT request
          const sitemapCall = mockFetch.mock.calls[1];
          expect(sitemapCall[0]).toContain('/sitemaps/');
          expect(sitemapCall[0]).toContain('sc-domain%3Adarpharmacy.rs');
          expect(sitemapCall[1].method).toBe('PUT');
          expect(sitemapCall[1].headers.Authorization).toBe('Bearer test-access-token');
     });

     it('does not throw when token exchange fails', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', 'sc-domain:darpharmacy.rs');
          vi.stubEnv('GOOGLE_SITEMAP_URL', 'https://darpharmacy.rs/sitemap.xml');
          vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
          vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');
          vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'test-refresh-token');

          mockFetch.mockResolvedValueOnce({
               ok: false,
               status: 401,
               text: async () => 'Unauthorized',
          });

          const { submitSitemapIfProduction } = await import('./search-console');

          await expect(submitSitemapIfProduction()).resolves.toBeUndefined();
          expect(mockFetch).toHaveBeenCalledTimes(1);
     });

     it('does not throw when sitemap submission fails', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', 'sc-domain:darpharmacy.rs');
          vi.stubEnv('GOOGLE_SITEMAP_URL', 'https://darpharmacy.rs/sitemap.xml');
          vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
          vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');
          vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'test-refresh-token');

          mockFetch.mockResolvedValueOnce({
               ok: true,
               json: async () => ({ access_token: 'test-access-token' }),
          });

          mockFetch.mockResolvedValueOnce({
               ok: false,
               status: 403,
               text: async () => 'Forbidden',
          });

          const { submitSitemapIfProduction } = await import('./search-console');

          await expect(submitSitemapIfProduction()).resolves.toBeUndefined();
          expect(mockFetch).toHaveBeenCalledTimes(2);
     });

     it('does not throw when fetch throws a network error', async () => {
          vi.stubEnv('NODE_ENV', 'production');
          vi.stubEnv('GOOGLE_SEARCH_CONSOLE_SITE', 'sc-domain:darpharmacy.rs');
          vi.stubEnv('GOOGLE_SITEMAP_URL', 'https://darpharmacy.rs/sitemap.xml');
          vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
          vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');
          vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'test-refresh-token');

          mockFetch.mockRejectedValueOnce(new Error('Network error'));

          const { submitSitemapIfProduction } = await import('./search-console');

          await expect(submitSitemapIfProduction()).resolves.toBeUndefined();
     });
});
