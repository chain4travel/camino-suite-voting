import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTheme, CssBaseline, Theme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import Toast from '@/components/Toast';
import { getRoutes } from './routes';
import './locales/i18n';
import CaminoTheme from './theme';
import type { Network } from './types';
import { useNetworkStore } from './store/network';
import { updateBaseUrl } from './helpers/http';

const queryClient = new QueryClient();

interface RootProps {
  network: Network;
  theme?: Theme;
}
const Root = (props: RootProps) => {
  const setActiveNetwork = useNetworkStore(state => state.setActiveNetwork);
  useEffect(() => {
    if (props.network) {
      setActiveNetwork(props.network);
      updateBaseUrl(props.network.explorerUrl!);
    }
  }, [props.network]);
  const caminoTheme = CaminoTheme.getThemeOptions('dark');
  const theme = props.theme ?? createTheme(caminoTheme);
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={getRoutes(queryClient)} />
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
