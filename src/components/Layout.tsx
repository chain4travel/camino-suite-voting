import { Outlet } from 'react-router-dom';

import { Box, Toolbar } from '@mui/material';
import React from 'react';
import Navbar from './Navbar';
import './suite-override.css';

const Layout = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Toolbar
        sx={{
          borderBottom: '1px solid',
          borderColor: 'rgba(145, 158, 171, 0.24)',
          background: theme => theme.palette.background.paper,
          flexGrow: 1,
          p: '1.5rem',
          zIndex: 9,
          position: 'fixed',
          top: '65px',
          width: '100vw',
          height: '61px',
          display: 'flex',
          justifyContent: 'center',
          right: 0,
        }}
      >
        <Navbar />
      </Toolbar>
      <Box
        sx={{
          marginTop: '5rem',
          width: '100%',
          maxWidth: '1530px',
          height: '100%',
          paddingBottom: '4rem',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
export default React.memo(Layout);
