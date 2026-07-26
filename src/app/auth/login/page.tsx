'use client';

import { Box, Button, Stack, Typography, Card, CardMedia, useMediaQuery } from '@mui/material';
import { supabaseBrowser } from '@/services/supabase-browser';

const Page = () => {
     const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));


     const handleGoogleSignIn = async (): Promise<{
          success: boolean;
          error?: unknown;
     }> => {
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

     return (
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: mdDown ? '10px' : '200px', mt: '120px', width: mdDown ? '90dvw' : '70dvw', height: '70dvh' }}>
               <Card sx={{ backgroundColor: 'background.paper', flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                    <CardMedia
                         sx={{ height: 400, width: 200, borderRadius: '8px', display: mdDown ? 'none' : 'block' }}
                         image="/ailogo.png"
                         title="green iguana"
                    />
                    <Box
                         sx={{
                              maxWidth: 550,
                              px: 3,
                              py: '100px',
                              width: '100%'
                         }}
                    >
                         <Stack
                              spacing={1}
                              sx={{ mb: 3 }}
                         >
                              <Typography variant="h4">
                                   Login
                              </Typography>
                              <Button
                                   variant="contained"
                                   onClick={() => handleGoogleSignIn()}
                              >
                                   Login
                              </Button>
                         </Stack>
                    </Box>
               </Card>
          </Box>
     );
};


export default Page;
