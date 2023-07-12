import React from 'react';
import { Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const Layout = () => {
  return (
    <Paper style={{ height: '100%', boxShadow: 'none', paddingBottom: '40px' }}>
      <Navbar />
      <Outlet />
    </Paper>
  );
};
export default Layout;
