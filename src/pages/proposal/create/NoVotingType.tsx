import React from 'react';
import { Box, Typography } from '@mui/material';
import FormContainer from './FormContainer';

const NoVotingType = () => {
  return (
    <FormContainer>
      <Box maxWidth="300px" textAlign="center">
        <Typography variant="h6" color="grey.500" sx={{ marginBottom: '8px' }}>
          No Voting type
        </Typography>
        <Typography color="grey.500" fontSize="14px">
          Please select the voting you want to start and we will show you all
          needed information.
        </Typography>
      </Box>
    </FormContainer>
  );
};
export default NoVotingType;
