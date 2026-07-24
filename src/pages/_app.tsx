import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { ThemeProvider } from '@mui/material/styles';
import { useNProgress } from 'src/hooks/use-nprogress';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { createCustomTheme } from '@/theme';
import { createEmotionCache } from '@/utils/create-emotion-cache';

const clientSideEmotionCache = createEmotionCache();

const App = (props: any) => {
     const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

     useNProgress();

     const getLayout = Component.getLayout ?? ((page: any) => page);

     const theme = createCustomTheme();

     return (
          <SessionProvider>
               <CacheProvider value={emotionCache}>
                    <Head>
                         <title>
                              Apoteka DAR
                         </title>
                         <meta
                              name="viewport"
                              content="initial-scale=1, width=device-width"
                         />
                    </Head>
                    <ThemeProvider theme={theme}>
                         <CssBaseline />
                         <LocalizationProvider dateAdapter={AdapterDateFns}>
                              {getLayout(<Component {...pageProps} />)}
                         </LocalizationProvider>
                    </ThemeProvider>
                    <Toaster />
               </CacheProvider>
          </SessionProvider>
     );
};

export default App;
