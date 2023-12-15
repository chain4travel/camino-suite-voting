import React from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Paper from './Paper';

import './suite-override.css';

const Layout = () => {
  return (
    <Paper
      className="dac-container"
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
