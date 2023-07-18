import { InsertChartOutlinedTwoTone } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import React from 'react';

const OngoingState = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={3}
      width={458}
      textAlign="center"
      sx={{ my: 8, mx: 'auto' }}
    >
      <InsertChartOutlinedTwoTone fontSize="large" sx={{ color: 'grey.400' }} />
      <Stack spacing={2}>
        <Typography variant="h5" color="text.secondary">
          Voting not completed
        </Typography>
        <Typography variant="body1" color="text.secondary">
          After the voting time is expired the details and analytical data like
          distribution, turnouts and vote results per validator are shown here.
        </Typography>
      </Stack>
    </Stack>
  );
};
export default OngoingState;
