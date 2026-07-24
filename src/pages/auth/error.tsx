import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

type ErrorProps = {
     error: string;
     errorCode: string;
     errorDescription: string;
};

type ErrorQuery = {
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

export const getServerSideProps: GetServerSideProps<ErrorProps> = async (context) => {
     const query = context.query as ErrorQuery;

     return {
          props: {
               error: toSingleValue(query.error) ?? 'auth_error',
               errorCode: toSingleValue(query.error_code) ?? '',
               errorDescription: toSingleValue(query.error_description) ?? 'Something went wrong during sign-in.',
          },
     };
};

type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
     getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const Page: NextPageWithLayout<ErrorProps> = ({ error, errorCode, errorDescription }) => {
     return (
          <Box
               sx={{
                    alignItems: 'center',
                    display: 'flex',
                    minHeight: '100vh',
                    px: 3,
                    py: 8,
               }}
          >
               <Head>
                    <title>Auth Error</title>
               </Head>
               <Card sx={{ maxWidth: 560, mx: 'auto', width: '100%' }}>
                    <CardContent>
                         <Stack spacing={2}>
                              <Typography variant="h4">Sign-in failed</Typography>
                              <Typography color="text.secondary">
                                   {errorDescription}
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                   {errorCode ? `Code: ${errorCode}` : `Error: ${error}`}
                              </Typography>
                              <Button component={Link} href="/auth/login" variant="contained">
                                   Back to login
                              </Button>
                         </Stack>
                    </CardContent>
               </Card>
          </Box>
     );
};

Page.getLayout = (page: React.ReactElement) => (
     <AuthLayout>
          {page}
     </AuthLayout>
);

export default Page;