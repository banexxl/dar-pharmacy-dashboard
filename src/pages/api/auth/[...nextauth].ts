import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { userServices } from "@/services/user-services";

// Define the User type
type User = {
     _id: string;
     email: string;
     // other user properties
}

export const authOptions: NextAuthOptions = {
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
               if (account.provider === "google") {
                    const user = await userServices().getUserByEmailAndRole(profile.email, 'admin');
                    return profile.email_verified && profile.email.endsWith("@gmail.com") && user?.email ? true : false;
               }
               return false; // Do different verification for other providers that don't have `email_verified`
          },
          async session({ session, token }: any) {
               const sessionUser: any = await userServices().getUserByEmailAndRole(session.user.email, 'admin');
               console.log('aaaaaa', sessionUser);

               if (sessionUser) {
                    session.user.email = sessionUser.email;
                    session.user.role = sessionUser.role;
                    session.user._id = sessionUser._id;
               }
               return {
                    ...session,
                    user: {
                         ...session.user,
                         email: sessionUser?.email
                    }
               };
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

export default NextAuth(authOptions);
