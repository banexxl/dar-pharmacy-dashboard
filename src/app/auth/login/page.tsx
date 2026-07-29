'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
     Box,
     Button,
     Card,
     CardMedia,
     CircularProgress,
     Link as MuiLink,
     Stack,
     TextField,
     Typography,
     Alert,
     useMediaQuery,
} from '@mui/material';
import NextLink from 'next/link';
import { supabaseBrowser } from '@/services/supabase-browser';

const Page = () => {
     const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
     const router = useRouter();

     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setError(null);
          setLoading(true);

          try {
               // Attempt sign in first
               const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
                    email: email.trim(),
                    password,
               });

               if (signInError) {
                    setError(signInError.message);
                    setLoading(false);
                    return;
               }

               // After successful login, verify the user is in the admins table
               const { data: adminData, error: adminError } = await supabaseBrowser
                    .from('admins')
                    .select('email')
                    .eq('email', email.trim().toLowerCase())
                    .single();

               if (adminError || !adminData?.email) {
                    // Not an admin — sign out and block access
                    await supabaseBrowser.auth.signOut();
                    setError('You are not authorized to access this dashboard.');
                    setLoading(false);
                    return;
               }

               router.push('/');
               router.refresh();
          } catch (err) {
               setError('An unexpected error occurred. Please try again.');
               setLoading(false);
          }
     };

     return (
          <Box
               sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    ml: mdDown ? '10px' : '200px',
                    mt: '120px',
                    width: mdDown ? '90dvw' : '70dvw',
                    height: '70dvh',
               }}
          >
               <Card
                    sx={{
                         backgroundColor: 'background.paper',
                         flex: '1 1 auto',
                         alignItems: 'center',
                         display: 'flex',
                         justifyContent: 'center',
                    }}
               >
                    <CardMedia
                         sx={{
                              height: 400,
                              width: 200,
                              borderRadius: '8px',
                              display: mdDown ? 'none' : 'block',
                         }}
                         image="/ailogo.png"
                         title="DAR Pharmacy"
                    />
                    <Box
                         sx={{
                              maxWidth: 550,
                              px: 3,
                              py: '100px',
                              width: '100%',
                         }}
                    >
                         <form onSubmit={handleSubmit}>
                              <Stack spacing={3}>
                                   <Typography variant="h4">Login</Typography>

                                   {error && (
                                        <Alert severity="error" onClose={() => setError(null)}>
                                             {error}
                                        </Alert>
                                   )}

                                   <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                   />

                                   <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                   />

                                   <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : null}
                                   >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                   </Button>

                                   <MuiLink
                                        component={NextLink}
                                        href="/auth/forgot-password"
                                        variant="body2"
                                        sx={{ textAlign: 'center' }}
                                   >
                                        Forgot your password?
                                   </MuiLink>
                              </Stack>
                         </form>
                    </Box>
               </Card>
          </Box>
     );
};

export default Page;
