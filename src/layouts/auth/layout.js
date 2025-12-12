import PropTypes from 'prop-types';
import NextLink from 'next/link';
import Image from 'next/image'
import { Box, Grid } from '@mui/material';

// TODO: Change subtitle text

export const Layout = (props) => {
     const { children } = props;

     return (
          <Box
               component="main"
               sx={{
                    display: 'flex',
                    flex: '1 1 auto'
               }}
          >
               <Grid
                    container
                    sx={{ flex: '1 1 auto' }}
               >
                    <Grid
                         xs={12}
                         lg={6}
                         sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative'
                         }}
                    >
                         <Box
                              component="header"
                              sx={{
                                   left: 0,
                                   p: 3,
                                   position: 'fixed',
                                   top: 0,
                                   width: '100%'
                              }}
                         >
                              <Box
                                   component={NextLink}
                                   href="/"
                                   sx={{
                                        display: 'inline-flex',
                                        height: 32,
                                        width: 32
                                   }}
                              >
                                   <Image src="/dar.ico"
                                        alt='DAR Apoteka'
                                        width='75'
                                        height='70' />
                                   {/* <Logo /> */}
                              </Box>
                         </Box>
                         {children}
                    </Grid>
               </Grid>
          </Box>
     );
};

Layout.prototypes = {
     children: PropTypes.node
};