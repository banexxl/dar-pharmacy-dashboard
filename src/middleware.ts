import { withAuth } from 'next-auth/middleware';

export default withAuth({
     secret: process.env.NEXTAUTH_SECRET,

     pages: {
          signIn: '/auth/login',
          error: '/auth/error',
     },

     callbacks: {
          authorized: ({ token }) => Boolean(token),
     },
});

export const config = {
     matcher: [
          '/',
          '/artikli/:path*',
          '/datoteke/:path*',
          '/klijenti/:path*',
          '/porudzbenice/:path*',
     ],
};