import React from 'react';
import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

import ProposalNavbar from '@/components/ProposalNavbar';

const ProposalContainer = () => {
  return (
    <Container>
      <ProposalNavbar />
      <Outlet />
    </Container>
  );
};
export default ProposalContainer;
