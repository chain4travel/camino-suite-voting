import React from 'react';
import { Typography, Container } from '@mui/material';
import DistributionBar from '@/components/DistributionBar';
import type { Proposal, VotingOption } from '@/types';
import Paragraph from '@/components/Paragraph';

interface TransactionFeeProps {
  data: Proposal;
}

const TransactionFee = ({ data }: TransactionFeeProps) => {
  const [proposal] = data.options.map((option: VotingOption) => {
    return (option.value as number[]).map((v: number, idx: number) => {
      return {
        option: option.option,
        value: v,
        label: option.label?.[idx],
        percent: v as number,
      };
    });
  });
  return (
    <Container sx={{ paddingBottom: 2 }} maxWidth="xl" disableGutters>
      <Paragraph spacing="sm">
        <Typography variant="h5">{data.target}</Typography>
        <DistributionBar
          data={proposal}
          renderContent={(proposal: VotingOption) => {
            return (
              <>
                <Typography color="text.primary" variant="body2">
                  {proposal.label}
                </Typography>
                <Typography color="text.primary" fontWeight={700}>
                  {proposal.value}%
                </Typography>
              </>
            );
          }}
          variant={'vote'}
        />
      </Paragraph>
    </Container>
  );
};

export default TransactionFee;
