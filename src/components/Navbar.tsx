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
      to={`/proposal/${to}`}
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
      <NavItem to="active" text="Ongoing proposals" />
      <NavItem to="completed" text="Completed proposals" />
    </Stack>
  );
}

export default ProposalNavbar;
