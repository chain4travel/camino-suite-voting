import { ButtonGroup, styled } from '@mui/material';
import React, { ReactNode } from 'react';
import { map } from 'lodash';
import { Percentage } from '@/types';
import Button from './Button';

const PROPOSAL_DISTRIBUTION_COLORS = ['#304275', '#4864AF', '#7D92CA'];
const TURNOUTS_COLORS = ['#B7C3E1', '#7D92CA'];
const VOTE_DISTRIBUTION_COLORS = ['#7251B5', '#9163CB', '#B185DB'];

interface DistributionBarProps<T extends Percentage> {
  data: T[];
  renderContent: (d: T) => ReactNode | ReactNode[] | null;
  variant?: 'proposal' | 'vote' | 'turnouts';
}
const DistributionContainer = styled(ButtonGroup)(() => ({
  boxShadow: 'none',
}));
const DistributionBar = <T extends Percentage>({
  data,
  renderContent,
  variant,
}: DistributionBarProps<T>) => {
  let colors: string[];
  switch (variant) {
    case 'vote':
      colors = VOTE_DISTRIBUTION_COLORS;
      break;
    case 'turnouts':
      colors = TURNOUTS_COLORS;
      break;
    case 'proposal':
    default:
      colors = PROPOSAL_DISTRIBUTION_COLORS;
  }
  return (
    <DistributionContainer variant="contained" fullWidth>
      {map(data, (datum, idx) => {
        return (
          <Button
            key={`dist-${variant ?? ''}-${idx}`}
            disabled
            sx={{
              backgroundColor: colors[idx],
              display: 'block',
              textAlign: 'left',
              textTransform: 'none',
              width: `${datum.percentage}%`,
            }}
          >
            {renderContent(datum)}
          </Button>
        );
      })}
    </DistributionContainer>
  );
};
export default DistributionBar;
