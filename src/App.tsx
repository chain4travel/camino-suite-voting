import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import router from './routes';

const Root = () => (
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// local development
const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<Root />);

// online
// export default Root;
