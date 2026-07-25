'use client';

import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { Toaster } from 'react-hot-toast';
import { createCustomTheme } from '@/theme';
import { createEmotionCache } from '@/utils/create-emotion-cache';
import { AuthProvider } from '@/context/auth-context';

const emotionCache = createEmotionCache();
const theme = createCustomTheme();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {children}
          </LocalizationProvider>
        </ThemeProvider>
        <Toaster />
      </CacheProvider>
    </AuthProvider>
  );
}
