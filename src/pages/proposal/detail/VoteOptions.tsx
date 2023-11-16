import React from 'react';
import { filter, find } from 'lodash';
import { Stack, Typography } from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';
import Big from 'big.js';
import GrantProgramVotingOptions from '../active/GrantProgram/GrantProgramVotingOptions';
import BaseFeeVoting from '../active/BaseFeeVoting';
import DefaultVotingOptions from '../active/DefaultVotingOptions';
import {
  Percentage,
  Proposal,
  ProposalStatuses,
  ProposalTypes,
  VotingOption,
} from '@/types';
import DistributionBar from '@/components/DistributionBar';
import Tag from '@/components/Tag';
import { useMultisig, usePendingMultisigAddVoteTxs } from '@/hooks/useMultisig';
import useToast from '@/hooks/useToast';
import Button from '@/components/Button';
import { getTxExplorerUrl } from '@/helpers/string';
import useNetwork from '@/hooks/useNetwork';

type VotedOption = VotingOption & Percentage;

interface VoteOptionsProps {
  proposal: Proposal;
  options: VotedOption[];
  result?: VotingOption;
  status?: number;
  baseFee?: string | number;
  isConsortiumMember?: boolean;
  refresh?: () => void;
}
const VoteOptions = ({
  proposal,
  options,
  result,
  baseFee,
  isConsortiumMember,
  refresh,
}: VoteOptionsProps) => {
  if (!options) return null;
  const { activeNetwork } = useNetwork();
  const { signMultisigTx, abortSignavault, executeMultisigTx } = useMultisig();
  const toast = useToast();
  const onVoteTxSuccess = (data?: string) => {
    toast.success(
      'Successfully voted',
      data,
      data ? (
        <Button
          href={getTxExplorerUrl(activeNetwork?.name, 'p', data)}
          target="_blank"
          variant="outlined"
          color="inherit"
        >
          View on explorer
        </Button>
      ) : undefined
    );
  };
  const { pendingMultisigBaseFeeTxs } = usePendingMultisigAddVoteTxs();
  const pendingMultisigTx = find(
    pendingMultisigBaseFeeTxs,
    msigTx => msigTx.proposalId === proposal.id
  );
  const multisigFunctions = {
    signMultisigTx,
    abortSignavault,
    executeMultisigTx,
  };
  const isCompleted =
    (Object.values(ProposalStatuses).indexOf(ProposalStatuses.Completed) &
      (proposal.status ?? 0)) >
    0;

  console.log('proposal.type: ', proposal.type, ProposalTypes.ExcludeMember);
  if (!result && !isCompleted) {
    let item;
    switch (proposal.type) {
      case ProposalTypes.BaseFee:
        item = (
          <BaseFeeVoting
            data={{ ...proposal, pendingMultisigTx }}
            isConsortiumMember={isConsortiumMember}
            refresh={refresh}
            multisigFunctions={multisigFunctions}
            onVoteSuccess={onVoteTxSuccess}
          />
        );
        break;
      case ProposalTypes.GrantProgram:
        item = isConsortiumMember && (
          <GrantProgramVotingOptions data={proposal} showFullText />
        );
        break;
      case ProposalTypes.NewMember:
      case ProposalTypes.ExcludeMember:
        item = (
          <DefaultVotingOptions
            data={{ ...proposal, pendingMultisigTx }}
            isConsortiumMember={isConsortiumMember}
            multisigFunctions={multisigFunctions}
            onVoteSuccess={onVoteTxSuccess}
            onRefresh={refresh}
          />
        );
    }
    return (
      <Stack
        direction={options.length < 3 ? 'row' : 'column'}
        spacing={options.length < 3 ? 1 : 2}
      >
        {item}
      </Stack>
    );
  }

  return (
    <Stack direction={options.length <= 3 ? 'row' : 'column'} spacing={1.5}>
      {filter(options, opt => opt.value !== baseFee).map(opt => {
        let label;
        let extraInfo = null;
        let labelDirection = 'column';
        let labelSpacing = 1;
        switch (proposal.type) {
          case ProposalTypes.BaseFee:
            {
              if (baseFee) {
                label = (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >{`Future Base Fee ${opt.value} nCAM`}</Typography>
                );
                labelDirection = 'row';
                labelSpacing = 3;
                const absoluteChange = new Big(opt.value as number).minus(
                  baseFee
                );
                const percentageChange =
                  Number(baseFee) > 0
                    ? absoluteChange.times(100).div(baseFee)
                    : 0;
                const sign = absoluteChange.s > 0 ? '+' : '';
                extraInfo = (
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Percentage Change
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {sign}
                        {Number(percentageChange.toFixed(2))}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Absolute Change
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {sign}
                        {absoluteChange.toString()} nCAM
                      </Typography>
                    </Stack>
                  </Stack>
                );
              }
            }
            break;
          case ProposalTypes.FeeDistribution:
            {
              label = (
                <Typography
                  variant="body2"
                  fontWeight={600}
                >{`Distribution #${opt.option}`}</Typography>
              );
              const values = opt.value as number[];
              extraInfo = (
                <DistributionBar
                  data={values.map(percent => ({ percent }))}
                  variant={opt.option === result?.option ? 'vote' : 'default'}
                />
              );
            }
            break;
          default: {
            label = (
              <Stack direction="row" spacing={1}>
                {opt.value ? <CheckCircle /> : <Cancel />}
                <Typography variant="body2" fontWeight={600}>
                  {opt.label}
                </Typography>
              </Stack>
            );
          }
        }
        return (
          <Stack
            key={opt.option}
            padding={2.5}
            border="1px solid"
            borderColor="divider"
            borderRadius={2}
            flex={1}
            spacing={1}
            justifyContent="space-between"
          >
            <Stack
              direction={labelDirection}
              justifyContent="space-between"
              alignItems="center"
              spacing={labelSpacing}
            >
              {label}
              <Tag
                color={opt.option === result?.option ? 'success' : 'default'}
                label={`VOTED ${opt.percent ?? 0}%`}
              />
            </Stack>
            {extraInfo}
          </Stack>
        );
      })}
    </Stack>
  );
};
export default VoteOptions;
