import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createTheme, ThemeProvider } from '@mui/material';

import router from './routes';
import './locales/i18n';

const queryClient = new QueryClient();

const Root = (props: { theme: object }) => {
  const theme = createTheme(props.theme);
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

// online
export default Root;
