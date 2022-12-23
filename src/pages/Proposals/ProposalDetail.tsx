import React from 'react';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import { CheckBox, DisabledByDefault } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import { useProposal } from '@/hooks/proposals';

const ProposalDetail = () => {
  const { category, id } = useParams();
  const proposal = useProposal(category, id);

  return (
    <>
      <Typography variant="h6" paddingY={2} paddingX={2}>
        Vote for new members to be part of the consortium
      </Typography>
      <Divider sx={{ marginBottom: 3 }} />
      <Typography variant="h5" marginBottom={4} paddingX={2}>
        {proposal?.title}
      </Typography>
      <Typography variant="body2" paddingX={2}>
        {proposal?.description}
      </Typography>
      <Grid container direction="row" marginTop={8}>
        <IconButton>
          <CheckBox fontSize="large" color="success" />
          <Typography>Accept</Typography>
        </IconButton>
        <IconButton>
          <DisabledByDefault fontSize="large" color="error" />
          <Typography>Decline</Typography>
        </IconButton>
      </Grid>
    </>
  );
};

export default ProposalDetail;
