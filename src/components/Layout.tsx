import React from 'react';
import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const Layout = () => {
  return (
    <Container
      style={{ height: '100%', boxShadow: 'none', paddingBottom: '40px' }}
    >
      <Navbar />
      <Outlet />
    </Container>
  );
};
export default Layout;
