import React from 'react';
import { Box, Stack, Typography, styled } from '@mui/material';

const Wrapper = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  minHeight: '300px',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 0, 3, 0),
  justifyContent: 'center',
  alignItems: 'center',
}));
interface NoProposalsProps {
  type: string;
}
const NoProposals = ({ type }: NoProposalsProps) => {
  return (
    <Wrapper>
      <Box maxWidth="300px" textAlign="center">
        <Typography variant="h6" color="grey.500" sx={{ marginBottom: '8px' }}>
          {`No ${type} votings`}
        </Typography>
      </Box>
    </Wrapper>
  );
};
export default NoProposals;
