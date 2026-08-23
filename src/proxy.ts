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
     const startTime = Date.now();
     const { pathname, search } = request.nextUrl;

     console.log(`[proxy] → ${request.method} ${pathname}${search}`);

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
                         cookiesToSet.forEach(
                              ({ name, value }) => {
                                   request.cookies.set(name, value);
                              }
                         );

                         response = NextResponse.next({
                              request,
                         });

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
      * Validate session with a timeout to avoid edge hangs.
      */
     let user = null;
     let userError: any = null;

     try {
          const authStart = Date.now();
          const result = await Promise.race([
               supabase.auth.getUser(),
               new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout after 10s')), 10000)
               ),
          ]);
          user = result.data?.user ?? null;
          userError = result.error;
          console.log(`[proxy] auth.getUser() resolved in ${Date.now() - authStart}ms | user=${user?.email ?? 'null'} | error=${userError?.message ?? 'none'}`);

          // If session is invalid but cookies exist, clear them to prevent future refresh hangs
          if (userError && !user) {
               const allCookies = request.cookies.getAll();
               const supabaseCookies = allCookies.filter(
                    (c) => c.name.startsWith('sb-') || c.name.includes('supabase')
               );
               if (supabaseCookies.length > 0) {
                    console.log(`[proxy] session invalid, clearing ${supabaseCookies.length} stale supabase cookie(s)`);
                    response = NextResponse.next({ request });
                    supabaseCookies.forEach((cookie) => {
                         response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
                    });
               }
          }
     } catch (e: any) {
          userError = e;
          console.error(`[proxy] auth.getUser() FAILED: ${e.message} | elapsed=${Date.now() - startTime}ms`);

          // Clear stale cookies on timeout to prevent repeated hangs
          const allCookies = request.cookies.getAll();
          const supabaseCookies = allCookies.filter(
               (c) => c.name.startsWith('sb-') || c.name.includes('supabase')
          );
          if (supabaseCookies.length > 0) {
               console.log(`[proxy] timeout/error, clearing ${supabaseCookies.length} stale supabase cookie(s)`);
               response = NextResponse.next({ request });
               supabaseCookies.forEach((cookie) => {
                    response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
               });
          }
     }

     const isApiRoute = pathname.startsWith('/api/');
     const isLoggedIn = Boolean(user) && !userError;

     console.log(`[proxy] isLoggedIn=${isLoggedIn} | isApiRoute=${isApiRoute} | pathname=${pathname}`);

     if (isMatchingRoute(pathname, ALWAYS_PUBLIC_ROUTES)) {
          console.log(`[proxy] ← public route, passing through | ${Date.now() - startTime}ms`);
          return response;
     }

     if (pathname === LOGIN_ROUTE) {
          if (isLoggedIn) {
               console.log(`[proxy] ← logged-in user on login page, redirecting to / | ${Date.now() - startTime}ms`);
               const redirectResponse = NextResponse.redirect(
                    new URL('/', request.url)
               );

               response.cookies.getAll().forEach((cookie) => {
                    redirectResponse.cookies.set(cookie);
               });

               return redirectResponse;
          }

          console.log(`[proxy] ← login page, passing through | ${Date.now() - startTime}ms`);
          return response;
     }

     if (!isLoggedIn) {
          if (isApiRoute) {
               console.log(`[proxy] ← unauthorized API request, returning 401 | ${Date.now() - startTime}ms`);
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

          console.log(`[proxy] ← not logged in, redirecting to ${loginUrl.pathname} | ${Date.now() - startTime}ms`);
          return NextResponse.redirect(loginUrl);
     }

     if (!isApiRoute) {
          response.headers.set(
               'Cache-Control',
               'no-store, no-cache, must-revalidate, max-age=0'
          );
          response.headers.set('Pragma', 'no-cache');
          response.headers.set('Expires', '0');
     }

     console.log(`[proxy] ← authenticated, passing through | ${Date.now() - startTime}ms`);
     return response;
}