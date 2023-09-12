import React from 'react';
import { Typography, Container } from '@mui/material';
import { reduce } from 'lodash';
import DistributionBar from '@/components/DistributionBar';
import {
  ProposalStatuses,
  type Percentage,
  type Proposal,
  type VotingOption,
} from '@/types';
import Paragraph from '@/components/Paragraph';
import { countMultipleOptionsBy } from '@/helpers/util';
import Big from 'big.js';

interface TransactionFeeProps {
  data: Proposal;
  index?: number;
}

const TransactionFee = ({ data, index }: TransactionFeeProps) => {
  const isFailed =
    Object.values(ProposalStatuses).indexOf(ProposalStatuses.Failed) ===
    data.status;
  const summary = countMultipleOptionsBy(data.votes, 'votedOptions');
  const total = reduce(summary, (sum, subtotal) => (sum += subtotal), 0);
  const optionsStatistics = data.options.map((option: VotingOption) => ({
    ...option,
    percent:
      total > 0
        ? new Big(summary[option.option] ?? 0).div(total).mul(100).toFixed(2)
        : 0,
  }));
  return (
    <Container sx={{ paddingBottom: 2 }} maxWidth="xl" disableGutters>
      <Paragraph spacing="sm">
        <Typography variant="h5">
          {data.type} #{index}
        </Typography>
        <DistributionBar
          data={optionsStatistics}
          emptyValues={total === 0}
          renderContent={(option: VotingOption & Percentage) => {
            return (
              <>
                <Typography
                  color={isFailed ? 'common.black' : 'text.primary'}
                  variant="body2"
                >
                  {option.value} nCAM
                </Typography>
                <Typography
                  color={isFailed ? 'common.black' : 'text.primary'}
                  fontWeight={700}
                >
                  {option.percent}%
                </Typography>
              </>
            );
          }}
          variant={isFailed ? 'default' : 'vote'}
        />
      </Paragraph>
    </Container>
  );
};

export default TransactionFee;
