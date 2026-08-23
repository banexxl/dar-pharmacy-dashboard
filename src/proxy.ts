import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const config = {
     matcher: [
          '/',
          '/artikli/:path*',
          '/blog/:path*',
          '/datoteke/:path*',
          '/klijenti/:path*',
          '/porudzbenice/:path*',
          '/auth/:path*',
          '/api/:path*',
     ],
};

const ALWAYS_PUBLIC_ROUTES = [
     '/auth/callback',
     '/auth/error',
     '/auth/forgot-password',
     '/auth/reset-password',
     '/401',
] as const;

const LOGIN_ROUTE = '/auth/login';

const isMatchingRoute = (
     pathname: string,
     routes: readonly string[]
) => {
     return routes.some(
          (route) =>
               pathname === route ||
               pathname.startsWith(`${route}/`)
     );
};

export async function proxy(request: NextRequest) {
     let response = NextResponse.next({
          request,
     });

     const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          {
               cookies: {
                    getAll() {
                         return request.cookies.getAll();
                    },

                    setAll(cookiesToSet) {
                         /*
                          * Update the request cookies so Server Components
                          * in this request can see the refreshed session.
                          */
                         cookiesToSet.forEach(
                              ({ name, value }) => {
                                   request.cookies.set(name, value);
                              }
                         );

                         response = NextResponse.next({
                              request,
                         });

                         /*
                          * Send refreshed cookies back to the browser.
                          */
                         cookiesToSet.forEach(
                              ({ name, value, options }) => {
                                   response.cookies.set(
                                        name,
                                        value,
                                        options
                                   );
                              }
                         );
                    },
               },
          }
     );

     /*
      * Do not place logic between createServerClient() and getUser().
      * Calling getUser() validates the current Supabase session and may
      * refresh its cookies.
      *
      * AbortSignal.timeout ensures this doesn't hang indefinitely on the edge.
      */
     let user = null;
     let userError: any = null;

     try {
          const result = await Promise.race([
               supabase.auth.getUser(),
               new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 10000)
               ),
          ]);
          user = result.data?.user ?? null;
          userError = result.error;
     } catch (e) {
          // Auth call timed out or failed — treat as not logged in
          userError = e;
     }

     const { pathname, search } = request.nextUrl;
     const isApiRoute = pathname.startsWith('/api/');
     const isLoggedIn = Boolean(user) && !userError;

     /*
      * The callback must remain accessible because this route exchanges
      * the OAuth code for a Supabase session.
      */
     if (isMatchingRoute(pathname, ALWAYS_PUBLIC_ROUTES)) {
          return response;
     }

     /*
      * Logged-in users should not return to the login page.
      */
     if (pathname === LOGIN_ROUTE) {
          if (isLoggedIn) {
               const redirectResponse = NextResponse.redirect(
                    new URL('/', request.url)
               );

               /*
                * Preserve any session cookies refreshed above.
                */
               response.cookies.getAll().forEach((cookie) => {
                    redirectResponse.cookies.set(cookie);
               });

               return redirectResponse;
          }

          return response;
     }

     /*
      * Every remaining matched page and API endpoint is protected.
      */
     if (!isLoggedIn) {
          if (isApiRoute) {
               return NextResponse.json(
                    {
                         error: 'Unauthorized',
                    },
                    {
                         status: 401,
                         headers: {
                              'Cache-Control': 'no-store',
                         },
                    }
               );
          }

          const loginUrl = new URL(LOGIN_ROUTE, request.url);

          loginUrl.searchParams.set(
               'redirect',
               `${pathname}${search}`
          );

          return NextResponse.redirect(loginUrl);
     }

     /*
      * Avoid caching authenticated pages.
      */
     if (!isApiRoute) {
          response.headers.set(
               'Cache-Control',
               'no-store, no-cache, must-revalidate, max-age=0'
          );
          response.headers.set('Pragma', 'no-cache');
          response.headers.set('Expires', '0');
     }

     return response;
}