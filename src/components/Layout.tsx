import React from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Paper from './Paper';

const Layout = () => {
  return (
    <Paper
      style={{
        width: '100%',
        height: '100%',
        paddingBottom: '40px',
      }}
    >
      <Navbar />
      <Outlet />
    </Paper>
  );
};
export default Layout;
