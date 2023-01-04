import React from 'react';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import { CheckBox, DisabledByDefault } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useProposal } from '@/hooks/proposals';

const ProposalDetail = () => {
  const { category, id } = useParams();
  const proposal = useProposal(category, id);
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6" paddingY={2} paddingX={2}>
        {t(`proposals.active.title_${category}`)}
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
          <Typography>{t('common.accept')}</Typography>
        </IconButton>
        <IconButton>
          <DisabledByDefault fontSize="large" color="error" />
          <Typography>{t('common.decline')}</Typography>
        </IconButton>
      </Grid>
    </>
  );
};

export default ProposalDetail;
