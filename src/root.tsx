import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import Toast from '@/components/Toast';
import router from './routes';
import './locales/i18n';
import CaminoTheme from './theme';

const queryClient = new QueryClient();

const Root = (props: { theme?: object }) => {
  const caminoTheme = CaminoTheme.getThemeOptions('dark');
  const theme = createTheme(props.theme ?? caminoTheme);
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toast />

            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

// online
export default Root;
