import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

type CallbackProps = {
     status: 'loading';
};

type CallbackQuery = {
     code?: string | string[];
     error?: string | string[];
     error_code?: string | string[];
     error_description?: string | string[];
};

const toSingleValue = (value: string | string[] | undefined) => {
     if (Array.isArray(value)) {
          return value[0];
     }

     return value;
};

export const getServerSideProps: GetServerSideProps<CallbackProps> = async (context) => {
     const { code, error, error_code, error_description } = context.query as CallbackQuery;
     const origin = process.env.NEXT_PUBLIC_BASE_URL ?? `${context.req.headers['x-forwarded-proto'] ?? 'http'}://${context.req.headers.host}`;

     if (toSingleValue(error)) {
          return {
               redirect: {
                    destination: `${origin}/auth/error?error=${encodeURIComponent(toSingleValue(error) ?? 'auth_error')}&error_code=${encodeURIComponent(toSingleValue(error_code) ?? '')}&error_description=${encodeURIComponent(toSingleValue(error_description) ?? '')}`,
                    permanent: false,
               },
          };
     }

     const oauthCode = toSingleValue(code);

     if (!oauthCode) {
          return {
               redirect: {
                    destination: `${origin}/auth/error?error=no_code&error_description=${encodeURIComponent('No code provided in the callback.')}`,
                    permanent: false,
               },
          };
     }

     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
     const supabaseServiceRoleKey = process.env.NEXT_SUPABASE_SECRET_KEY;

     if (!supabaseUrl || !supabaseServiceRoleKey) {
          return {
               redirect: {
                    destination: `${origin}/auth/error?error=missing_supabase_key&error_description=${encodeURIComponent('NEXT_SUPABASE_SECRET_KEY is required for the auth callback.')}`,
                    permanent: false,
               },
          };
     }

     const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
               autoRefreshToken: false,
               persistSession: false,
          },
     });

     const { data, error: authError } = await supabase.auth.exchangeCodeForSession(oauthCode);

     if (authError) {
          return {
               redirect: {
                    destination: `${origin}/auth/error?error=exchange_failed&error_description=${encodeURIComponent(authError.message)}`,
                    permanent: false,
               },
          };
     }

     const email = data.session?.user.email?.toLowerCase();

     if (!email) {
          return {
               redirect: {
                    destination: `${origin}/auth/error?error=no_email&error_description=${encodeURIComponent('No email was returned from Google OAuth.')}`,
                    permanent: false,
               },
          };
     }

     const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('id, email')
          .eq('email', email)
          .maybeSingle();

     if (adminError) {
          return {
               redirect: {
                    destination: `${origin}/auth/error?error=admin_lookup_failed&error_description=${encodeURIComponent(adminError.message)}`,
                    permanent: false,
               },
          };
     }

     if (!admin) {
          await supabase.auth.signOut();

          return {
               redirect: {
                    destination: `${origin}/auth/error?error=access_denied&error_description=${encodeURIComponent('Your account is not listed in the admins table.')}`,
                    permanent: false,
               },
          };
     }

     return {
          redirect: {
               destination: `${origin}/dashboard`,
               permanent: false,
          },
     };
};

type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
     getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const Page: NextPageWithLayout<CallbackProps> = () => {
     return (
          <Box
               sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    px: 3,
               }}
          >
               <Head>
                    <title>Auth Callback</title>
               </Head>
               <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography color="text.secondary" variant="body2">
                         Processing sign-in...
                    </Typography>
               </Stack>
          </Box>
     );
};

Page.getLayout = (page: React.ReactElement) => (
     <AuthLayout>
          {page}
     </AuthLayout>
);

export default Page;