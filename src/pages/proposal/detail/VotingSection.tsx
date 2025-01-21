import React from 'react';
import { Stack } from '@mui/material';
import Header from '@/components/Header';
import VoteOptions from './VoteOptions';
import { Proposal, VotingOption } from '@/types';

interface VotingSectionProps {
  proposalWithEligibles: Proposal | null | undefined;
  isConsortiumMember: boolean;
  statistics: any;
  result: VotingOption;
  baseFee?: string | number;
  refetch: () => void;
}

const VotingSection: React.FC<VotingSectionProps> = React.memo(
  ({
    proposalWithEligibles,
    isConsortiumMember,
    statistics,
    result,
    baseFee,
    refetch,
  }) => {
    const transformedOptions = React.useMemo(() => {
      if (!proposalWithEligibles?.options) {
        return [];
      }

      return proposalWithEligibles.options.map((opt: VotingOption) => ({
        ...opt,
        label:
          opt.value === true
            ? 'Accept'
            : opt.value === false
            ? 'Decline'
            : opt.label,
        percent: statistics?.summary[opt.option]?.percent ?? 0,
      }));
    }, [proposalWithEligibles?.options, statistics?.summary]);

    if (!proposalWithEligibles) {
      return null;
    }

    return (
      <Stack>
        <VoteOptions
          proposal={proposalWithEligibles}
          isConsortiumMember={isConsortiumMember}
          options={transformedOptions}
          result={result}
          baseFee={baseFee}
          refresh={refetch}
        />
      </Stack>
    );
  }
);

VotingSection.displayName = 'VotingSection';

export default VotingSection;
