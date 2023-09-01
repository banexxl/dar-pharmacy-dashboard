import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Link, Stack, TextField, Typography, Container, SvgIcon } from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

const Page = () => {
          const router = useRouter();
          const auth = useAuth();
          const formik = useFormik({
                    initialValues: {
                              email: '',
                              name: '',
                              password: '',
                              submit: null
                    },
                    validationSchema: Yup.object({
                              email: Yup
                                        .string()
                                        .email('Must be a valid email')
                                        .max(255)
                                        .required('Email is required'),
                              name: Yup
                                        .string()
                                        .max(255)
                                        .required('Name is required'),
                              password: Yup
                                        .string()
                                        .max(255)
                                        .required('Password is required')
                    }),
                    onSubmit: async (values, helpers) => {
                              try {
                                        await auth.signUp(values.email, values.name, values.password);
                                        router.push('/');
                              } catch (err) {
                                        helpers.setStatus({ success: false });
                                        helpers.setErrors({ submit: err.message });
                                        helpers.setSubmitting(false);
                              }
                    }
          });

          return (
                    // <>
                    //           <Head>
                    //                     <title>
                    //                               Register
                    //                     </title>
                    //           </Head>
                    //           <Box
                    //                     sx={{
                    //                               flex: '1 1 auto',
                    //                               alignItems: 'center',
                    //                               display: 'flex',
                    //                               justifyContent: 'center'
                    //                     }}
                    //           >
                    //                     <Box
                    //                               sx={{
                    //                                         maxWidth: 550,
                    //                                         px: 3,
                    //                                         py: '100px',
                    //                                         width: '100%'
                    //                               }}
                    //                     >
                    //                               <div>
                    //                                         <Stack
                    //                                                   spacing={1}
                    //                                                   sx={{ mb: 3 }}
                    //                                         >
                    //                                                   <Typography variant="h4">
                    //                                                             Register
                    //                                                   </Typography>
                    //                                                   <Typography
                    //                                                             color="text.secondary"
                    //                                                             variant="body2"
                    //                                                   >
                    //                                                             Already have an account?
                    //                                                             &nbsp;
                    //                                                             <Link
                    //                                                                       component={NextLink}
                    //                                                                       href="/auth/login"
                    //                                                                       underline="hover"
                    //                                                                       variant="subtitle2"
                    //                                                             >
                    //                                                                       Log in
                    //                                                             </Link>
                    //                                                   </Typography>
                    //                                         </Stack>
                    //                                         <form
                    //                                                   noValidate
                    //                                                   onSubmit={formik.handleSubmit}
                    //                                         >
                    //                                                   <Stack spacing={3}>
                    //                                                             <TextField
                    //                                                                       error={!!(formik.touched.name && formik.errors.name)}
                    //                                                                       fullWidth
                    //                                                                       helperText={formik.touched.name && formik.errors.name}
                    //                                                                       label="Name"
                    //                                                                       name="name"
                    //                                                                       onBlur={formik.handleBlur}
                    //                                                                       onChange={formik.handleChange}
                    //                                                                       value={formik.values.name}
                    //                                                             />
                    //                                                             <TextField
                    //                                                                       error={!!(formik.touched.email && formik.errors.email)}
                    //                                                                       fullWidth
                    //                                                                       helperText={formik.touched.email && formik.errors.email}
                    //                                                                       label="Email Address"
                    //                                                                       name="email"
                    //                                                                       onBlur={formik.handleBlur}
                    //                                                                       onChange={formik.handleChange}
                    //                                                                       type="email"
                    //                                                                       value={formik.values.email}
                    //                                                             />
                    //                                                             <TextField
                    //                                                                       error={!!(formik.touched.password && formik.errors.password)}
                    //                                                                       fullWidth
                    //                                                                       helperText={formik.touched.password && formik.errors.password}
                    //                                                                       label="Password"
                    //                                                                       name="password"
                    //                                                                       onBlur={formik.handleBlur}
                    //                                                                       onChange={formik.handleChange}
                    //                                                                       type="password"
                    //                                                                       value={formik.values.password}
                    //                                                             />
                    //                                                   </Stack>
                    //                                                   {formik.errors.submit && (
                    //                                                             <Typography
                    //                                                                       color="error"
                    //                                                                       sx={{ mt: 3 }}
                    //                                                                       variant="body2"
                    //                                                             >
                    //                                                                       {formik.errors.submit}
                    //                                                             </Typography>
                    //                                                   )}
                    //                                                   <Button
                    //                                                             fullWidth
                    //                                                             size="large"
                    //                                                             sx={{ mt: 3 }}
                    //                                                             type="submit"
                    //                                                             variant="contained"
                    //                                                   >
                    //                                                             Continue
                    //                                                   </Button>
                    //                                         </form>
                    //                               </div>
                    //                     </Box>
                    //           </Box>
                    // </>
                    <>
                              <Head>
                                        <title>
                                                  404
                                        </title>
                              </Head>
                              <Box
                                        component="main"
                                        sx={{
                                                  alignItems: 'center',
                                                  display: 'flex',
                                                  flexGrow: 1,
                                                  minHeight: '100%'
                                        }}
                              >
                                        <Container maxWidth="md">
                                                  <Box
                                                            sx={{
                                                                      alignItems: 'center',
                                                                      display: 'flex',
                                                                      flexDirection: 'column'
                                                            }}
                                                  >
                                                            <Box
                                                                      sx={{
                                                                                mb: 3,
                                                                                textAlign: 'center'
                                                                      }}
                                                            >
                                                                      <img
                                                                                alt="Under development"
                                                                                src="/assets/errors/error-404.png"
                                                                                style={{
                                                                                          display: 'inline-block',
                                                                                          maxWidth: '100%',
                                                                                          width: 400
                                                                                }}
                                                                      />
                                                            </Box>
                                                            <Typography
                                                                      align="center"
                                                                      sx={{ mb: 3 }}
                                                                      variant="h3"
                                                            >
                                                                      404: The page you are looking for isn’t here
                                                            </Typography>
                                                            <Typography
                                                                      align="center"
                                                                      color="text.secondary"
                                                                      variant="body1"
                                                            >
                                                                      You either tried some shady route or you came here by mistake.
                                                                      Whichever it is, try using the navigation
                                                            </Typography>
                                                            <Button
                                                                      component={NextLink}
                                                                      href="/"
                                                                      startIcon={(
                                                                                <SvgIcon fontSize="small">
                                                                                          <ArrowLeftIcon />
                                                                                </SvgIcon>
                                                                      )}
                                                                      sx={{ mt: 3 }}
                                                                      variant="contained"
                                                            >
                                                                      Go back to dashboard
                                                            </Button>
                                                  </Box>
                                        </Container>
                              </Box>
                    </>
          );
};

Page.getLayout = (page) => (
          <AuthLayout>
                    {page}
          </AuthLayout>
);

export default Page;
