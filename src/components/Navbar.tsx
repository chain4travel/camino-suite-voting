import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

interface NavItemProps {
  to: string;
  text: string;
}
const NavItem = ({ to, text }: NavItemProps) => {
  return (
    <NavLink to={`/dac/${to}`} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <>
          <Typography
            color={isActive ? 'text.primary' : 'grey.500'}
            sx={{
              paddingX: 1.25,
              paddingY: 1.5,
              fontWeight: 600,
            }}
          >
            {text}
          </Typography>
          <Box
            height={4}
            borderRadius="4px 4px 0 0"
            sx={{ backgroundColor: isActive ? 'primary.main' : 'transparent' }}
          />
        </>
      )}
    </NavLink>
  );
};

const ProposalNavbar = () => (
  <Stack
    direction="row"
    spacing={3}
    borderBottom={1}
    borderColor="divider"
    paddingX={1.5}
  >
    <NavItem to="active" text="Ongoing proposals" />
    <NavItem to="completed" text="Completed proposals" />
  </Stack>
);

export default ProposalNavbar;
