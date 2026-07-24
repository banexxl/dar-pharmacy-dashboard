import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { fetchSingleRow } from "@/services/supabase";

const authOptions: NextAuthOptions = {
     secret: process.env.NEXTAUTH_SECRET,
     providers: [
          GoogleProvider({
               clientId: process.env.GOOGLE_CLIENT_ID!,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
          // ...add more providers here
     ],
     callbacks: {
          async signIn({ account, profile }: any) {
               if (account?.provider === "google") {
                    const email = profile?.email?.toLowerCase();

                    if (!email) {
                         return false;
                    }

                    const admin = await fetchSingleRow<{ id: string; email: string }>(['admins'], 'email', email);
                    return !!admin?.email;
               }
               return false;
          },
          async session({ session }: any) {
               session.user.id = session?.user?.email ?? '';
               session.user.avatar = session?.user?.image || '';

               return session;
          },
          async redirect({ url, baseUrl }: any) {
               const redirectUrl = url.startsWith('/') ? new URL(url, baseUrl).toString() : url;
               return redirectUrl;
          }
     },
     session: {
          maxAge: 1 * 60 * 60, // 1 hour
     }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
