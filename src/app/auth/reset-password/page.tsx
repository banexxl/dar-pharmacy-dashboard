'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
     Box,
     Button,
     Card,
     CircularProgress,
     Stack,
     TextField,
     Typography,
     Alert,
     useMediaQuery,
} from '@mui/material';
import { supabaseBrowser } from '@/services/supabase-browser';

const Page = () => {
     const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
     const router = useRouter();

     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [error, setError] = useState<string | null>(null);
     const [success, setSuccess] = useState(false);
     const [loading, setLoading] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setError(null);

          if (password.length < 6) {
               setError('Password must be at least 6 characters long.');
               return;
          }

          if (password !== confirmPassword) {
               setError('Passwords do not match.');
               return;
          }

          setLoading(true);

          try {
               const { error: updateError } = await supabaseBrowser.auth.updateUser({
                    password,
               });

               if (updateError) {
                    setError(updateError.message);
               } else {
                    setSuccess(true);
                    setTimeout(() => {
                         router.push('/');
                         router.refresh();
                    }, 2000);
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
                                   <Typography variant="h4">Password Updated</Typography>
                                   <Alert severity="success">
                                        Your password has been reset successfully. Redirecting...
                                   </Alert>
                              </Stack>
                         ) : (
                              <form onSubmit={handleSubmit}>
                                   <Stack spacing={3}>
                                        <Typography variant="h4">Reset Password</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                             Enter your new password below.
                                        </Typography>

                                        {error && (
                                             <Alert severity="error" onClose={() => setError(null)}>
                                                  {error}
                                             </Alert>
                                        )}

                                        <TextField
                                             fullWidth
                                             label="New Password"
                                             type="password"
                                             value={password}
                                             onChange={(e) => setPassword(e.target.value)}
                                             required
                                             autoComplete="new-password"
                                        />

                                        <TextField
                                             fullWidth
                                             label="Confirm New Password"
                                             type="password"
                                             value={confirmPassword}
                                             onChange={(e) => setConfirmPassword(e.target.value)}
                                             required
                                             autoComplete="new-password"
                                        />

                                        <Button
                                             type="submit"
                                             variant="contained"
                                             size="large"
                                             disabled={loading}
                                             startIcon={loading ? <CircularProgress size={20} /> : null}
                                        >
                                             {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                   </Stack>
                              </form>
                         )}
                    </Box>
               </Card>
          </Box>
     );
};

export default Page;
