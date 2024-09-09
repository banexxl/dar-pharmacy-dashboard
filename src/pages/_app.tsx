import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import 'simplebar-react/dist/simplebar.min.css';
import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react';
import { createStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/root-reducer';

const clientSideEmotionCache = createEmotionCache();

const SplashScreen = () => null;

const App = (props: any) => {
     const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

     useNProgress();

     const store = createStore(rootReducer);

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
                         <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <ThemeProvider theme={theme}>
                                   <CssBaseline />
                                   {
                                        getLayout(<Component {...pageProps} />)
                                   }
                              </ThemeProvider>
                         </LocalizationProvider>
                    </CacheProvider>
               </Provider>
          </SessionProvider>
     );
};

export default App;
