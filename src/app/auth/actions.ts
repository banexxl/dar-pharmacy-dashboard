'use client';


export async function handleGoogleSignIn(): Promise<{
     success: boolean;
     error?: unknown;
}> {
     const redirectTo =
          `${window.location.origin}/auth/callback`;

     const { error } =
          await supabaseBrowser.auth.signInWithOAuth({
               provider: 'google',

               options: {
                    redirectTo,
               },
          });

     if (error) {
          console.error('Google sign-in failed:', error);

          return {
               success: false,
               error,
          };
     }

     return {
          success: true,
     };
}