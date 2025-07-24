import { CssBaseline, Theme, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useIsFeatureEnabled } from '@/utils/featureFlags/featureFlagUtils';

import { updateBaseUrl } from './helpers/http';
import './locales/i18n';
import { getRoutes } from './routes';
import { useNetworkStore } from './store/network';
import CaminoTheme from './theme';
import type { DispatchNotificationFunction, Network } from './types';
import { useNotificationStore } from './store/notifications';

const queryClient = new QueryClient();

interface RootProps {
  network: Network;
  pChainAddress?: string;
  theme?: Theme;
  dispatchNotification?: DispatchNotificationFunction;
}

const Root = (props: RootProps) => {
  const [load, setLoad] = React.useState(true);
  const setActiveNetwork = useNetworkStore(state => state.setActiveNetwork);
  const setDispatchNotification = useNotificationStore(
    state => state.setDispatchNotification
  );
  useEffect(() => {
    if (props.network) {
      setActiveNetwork(props.network);
      updateBaseUrl(props.network.explorerUrl!);
      setLoad(false);
    }
  }, [props.network]);
  useEffect(() => {
    if (props.dispatchNotification) {
      setDispatchNotification(props.dispatchNotification);
    }
  }, [props.dispatchNotification, setDispatchNotification]);
  const caminoTheme = CaminoTheme.getThemeOptions('dark');
  const theme = props.theme ?? createTheme(caminoTheme);
  const { isFeatureEnabled } = useIsFeatureEnabled();
  useEffect(() => {
    isFeatureEnabled('NewMember');
  }, [isFeatureEnabled]);
  if (load) return;
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={getRoutes(queryClient, isFeatureEnabled)} />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

// online
export default Root;
