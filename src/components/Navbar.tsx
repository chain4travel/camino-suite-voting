import React from 'react';
import { NavLink } from 'react-router-dom';
import { Stack, Typography, useTheme } from '@mui/material';

interface NavItemProps {
  to: string;
  text: string;
}
const NavItem = ({ to, text }: NavItemProps) => {
  const theme = useTheme();
  return (
    <NavLink
      to={`/vote/${to}`}
      style={{
        marginLeft: '24px',
        paddingTop: '16px',
        paddingBottom: '16px',
        textDecoration: 'none',
      }}
    >
      {({ isActive }) => (
        <Typography
          color={
            theme.palette.mode === 'dark'
              ? isActive
                ? 'grey.50'
                : 'grey.500'
              : isActive
              ? 'grey.900'
              : 'grey.400'
          }
        >
          {text}
        </Typography>
      )}
    </NavLink>
  );
};

function ProposalNavbar() {
  return (
    <Stack direction="row">
      <NavItem to="active" text="Active Votings" />
      <NavItem to="completed" text="Completed Votes" />
    </Stack>
  );
}

export default ProposalNavbar;
