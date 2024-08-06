import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { userServices } from "@/utils/user-services";

// Define the User type
type User = {
     _id: string;
     email: string;
     // other user properties
}

export const authOptions = {
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
               console.log(process.env.NEXTAUTH_SECRET);

               if (account.provider === "google") {
                    const user = await userServices().getUserByEmail(profile.email);

                    return profile.email_verified && profile.email.endsWith("@gmail.com") && user?.email ? true : false;
               }
               return false; // Do different verification for other providers that don't have `email_verified`
          },
          async session({ session, token }: any) {
               const sessionUser = await userServices().getUserByEmail(session.user.email);

               if (sessionUser) {
                    session.user.email = sessionUser.email;
               }
               return session;
          },
          async redirect({ url, baseUrl }: any) {
               const redirectUrl = url.startsWith('/') ? new URL(url, baseUrl).toString() : url;
               console.log(`[next-auth] Redirecting to "${redirectUrl}" (resolved from url "${url}" and baseUrl "${baseUrl}")`);
               return redirectUrl;
          }
     },
     session: {
          maxAge: 1 * 60 * 60, // 1 hour
     }
}

export default NextAuth(authOptions);
