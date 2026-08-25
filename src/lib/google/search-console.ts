/**
 * Google Search Console — Sitemap Submission Service
 *
 * Submits the sitemap to Google Search Console via the Sitemaps API.
 * Only runs in production. Never throws — logs errors server-side only.
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3';

async function getAccessToken(): Promise<string | null> {
     const clientId = process.env.GOOGLE_CLIENT_ID;
     const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
     const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

     if (!clientId || !clientSecret || !refreshToken) {
          console.error('[search-console] Missing Google OAuth credentials in environment variables.');
          return null;
     }

     try {
          const response = await fetch(GOOGLE_TOKEN_URL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
               body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
               }),
          });

          if (!response.ok) {
               const errorBody = await response.text();
               console.error(`[search-console] Token refresh failed (${response.status}): ${errorBody}`);
               return null;
          }

          const data = await response.json();
          return data.access_token ?? null;
     } catch (error: any) {
          console.error(`[search-console] Token refresh error: ${error.message}`);
          return null;
     }
}

/**
 * Submits the sitemap to Google Search Console.
 * Only executes in production (NODE_ENV === 'production').
 * Never throws — all errors are logged server-side.
 */
export async function submitSitemapIfProduction(): Promise<void> {
     if (process.env.NODE_ENV !== 'production') {
          return;
     }

     const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE;
     const appUrl = process.env.GOOGLE_SITEMAP_URL;

     if (!siteUrl || !appUrl) {
          console.error('[search-console] Missing GOOGLE_SEARCH_CONSOLE_SITE or GOOGLE_SITEMAP_URL.');
          return;
     }

     const sitemapUrl = appUrl;

     try {
          const authStart = Date.now();
          const accessToken = await getAccessToken();

          if (!accessToken) {
               return;
          }

          console.log(`[search-console] Access token obtained in ${Date.now() - authStart}ms`);

          const encodedSiteUrl = encodeURIComponent(siteUrl);
          const encodedSitemapUrl = encodeURIComponent(sitemapUrl);

          const url = `${SEARCH_CONSOLE_API}/sites/${encodedSiteUrl}/sitemaps/${encodedSitemapUrl}`;
          console.log(`[search-console] Submitting sitemap: PUT ${url}`);

          const response = await fetch(url, {
               method: 'PUT',
               headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
               },
          });

          const responseBody = await response.text();

          if (!response.ok) {
               console.error(`[search-console] Sitemap submission failed (${response.status}): ${responseBody}`);
               return;
          }

          console.log(`[search-console] Sitemap submitted successfully (${response.status}): ${sitemapUrl}`);
          if (responseBody) {
               console.log(`[search-console] Response body: ${responseBody}`);
          }
     } catch (error: any) {
          console.error(`[search-console] Sitemap submission error: ${error.message}`);
     }
}
