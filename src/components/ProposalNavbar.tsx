import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';

function ProposalNavbar() {
  const { category } = useParams();
  return (
    <div style={{ width: '100%', marginTop: 20, marginBottom: 20 }}>
      <Box
        component="div"
        sx={{
          display: 'inline',
          p: 1,
          m: 1,
          bgcolor: theme =>
            theme.palette.mode === 'dark' ? '#101010' : '#fff',
          color: theme =>
            theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
          border: '1px solid',
          borderColor: theme =>
            theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: '700',
        }}
      >
        <NavLink to={`/vote/${category}/create`}>Start new voting</NavLink>
      </Box>
      <Box
        component="div"
        sx={{
          display: 'inline',
          p: 1,
          m: 1,
          bgcolor: theme =>
            theme.palette.mode === 'dark' ? '#101010' : '#fff',
          color: theme =>
            theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
          border: '1px solid',
          borderColor: theme =>
            theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: '700',
        }}
      >
        <NavLink to={`/vote/${category}`}>Active votes</NavLink>
      </Box>
      <Box
        component="div"
        sx={{
          display: 'inline',
          p: 1,
          m: 1,
          bgcolor: theme =>
            theme.palette.mode === 'dark' ? '#101010' : '#fff',
          color: theme =>
            theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
          border: '1px solid',
          borderColor: theme =>
            theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: '700',
        }}
      >
        <NavLink to="/vote">Previous votes</NavLink>
      </Box>
    </div>
  );
}

export default ProposalNavbar;
