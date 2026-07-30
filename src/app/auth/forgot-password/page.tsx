'use client';

import { useState } from 'react';
import {
     Box,
     Button,
     Card,
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

     const [email, setEmail] = useState('');
     const [error, setError] = useState<string | null>(null);
     const [success, setSuccess] = useState(false);
     const [loading, setLoading] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setError(null);
          setSuccess(false);
          setLoading(true);

          try {
               // Check if the email is in the admins table first
               const { data: adminData, error: adminError } = await supabaseBrowser
                    .from('admins')
                    .select('email')
                    .eq('email', email.trim().toLowerCase())
                    .single();

               if (adminError || !adminData?.email) {
                    setError('No account found with this email address.');
                    setLoading(false);
                    return;
               }

               // Email is an admin — send the reset link
               const { error: resetError } = await supabaseBrowser.auth.resetPasswordForEmail(
                    email.trim(),
                    {
                         redirectTo: `https://dar-pharmacy-dashboard.vercel.app/auth/callback?type=recovery`,
                    }
               );

               if (resetError) {
                    setError(resetError.message);
               } else {
                    setSuccess(true);
               }
          } catch (err) {
               setError('An unexpected error occurred. Please try again.');
          } finally {
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
                    <Box
                         sx={{
                              maxWidth: 550,
                              px: 3,
                              py: '100px',
                              width: '100%',
                         }}
                    >
                         {success ? (
                              <Stack spacing={3}>
                                   <Typography variant="h4">Check your email</Typography>
                                   <Alert severity="success">
                                        We sent a password reset link to <strong>{email}</strong>.
                                        Please check your inbox and follow the link to reset your password.
                                   </Alert>
                                   <MuiLink
                                        component={NextLink}
                                        href="/auth/login"
                                        variant="body2"
                                        sx={{ textAlign: 'center' }}
                                   >
                                        Back to login
                                   </MuiLink>
                              </Stack>
                         ) : (
                              <form onSubmit={handleSubmit}>
                                   <Stack spacing={3}>
                                        <Typography variant="h4">Forgot Password</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                             Enter your email address and we will send you a link to reset your password.
                                        </Typography>

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

                                        <Button
                                             type="submit"
                                             variant="contained"
                                             size="large"
                                             disabled={loading}
                                             startIcon={loading ? <CircularProgress size={20} /> : null}
                                        >
                                             {loading ? 'Sending...' : 'Send Reset Link'}
                                        </Button>

                                        <MuiLink
                                             component={NextLink}
                                             href="/auth/login"
                                             variant="body2"
                                             sx={{ textAlign: 'center' }}
                                        >
                                             Back to login
                                        </MuiLink>
                                   </Stack>
                              </form>
                         )}
                    </Box>
               </Card>
          </Box>
     );
};

export default Page;
