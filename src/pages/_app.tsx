import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { ThemeProvider } from '@mui/material/styles';
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import 'simplebar-react/dist/simplebar.min.css';
import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';

const clientSideEmotionCache = createEmotionCache();

const SplashScreen = () => null;

const App = (props: any) => {
     const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

     useNProgress();

     const getLayout = Component.getLayout ?? ((page: any) => page);

     const theme = createTheme();

     return (
          <SessionProvider>
               <Provider store={store}>
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
               </Provider>
          </SessionProvider>
     );
};

export default App;
