import React from 'react';
import Button from '@/components/Button';
import DistributionBar from '@/components/DistributionBar';
import Tag from '@/components/Tag';
import { getTxExplorerUrl } from '@/helpers/string';
import { useMultisig, usePendingMultisigAddVoteTxs } from '@/hooks/useMultisig';
import useToast from '@/hooks/useToast';
import { useNetworkStore } from '@/store/network';
import {
  Percentage,
  Proposal,
  ProposalStatuses,
  ProposalTypes,
  VotingOption,
} from '@/types';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import Big from 'big.js';
import { filter, find } from 'lodash';
import { Serialization } from '@c4tplatform/caminojs/dist/utils';

import BaseFeeVoting from '../active/BaseFeeVoting';
import DefaultVotingOptions from '../active/DefaultVotingOptions';
import GrantProgramVotingOptions from '../active/GrantProgram/GrantProgramVotingOptions';
import GeneralProposalVoting from '../active/GeneralProposalVoting';

type VotedOption = VotingOption & Percentage;
const serialization = Serialization.getInstance();

interface VoteOptionsProps {
  proposal: Proposal;
  options: VotedOption[];
  result?: VotingOption;
  status?: number;
  baseFee?: string | number;
  isConsortiumMember?: boolean;
  refresh?: () => void;
}

const VoteOptions: React.FC<VoteOptionsProps> = ({
  proposal,
  options,
  result,
  baseFee,
  isConsortiumMember,
  refresh,
}) => {
  if (!options) return null;

  const activeNetwork = useNetworkStore(state => state.activeNetwork);
  const { signMultisigTx, abortSignavault, executeMultisigTx } = useMultisig();
  const toast = useToast();
  const { pendingMultisigAddVoteTxs } = usePendingMultisigAddVoteTxs();

  const onVoteTxSuccess = React.useCallback(
    (data?: string) => {
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
    },
    [activeNetwork?.name, toast]
  );

  const pendingMultisigTx = React.useMemo(
    () =>
      find(
        pendingMultisigAddVoteTxs,
        msigTx => msigTx.proposalId === proposal.id
      ),
    [pendingMultisigAddVoteTxs, proposal.id]
  );

  const multisigFunctions = React.useMemo(
    () => ({
      signMultisigTx,
      abortSignavault,
      executeMultisigTx,
    }),
    [signMultisigTx, abortSignavault, executeMultisigTx]
  );

  const isCompleted = React.useMemo(
    () =>
      (Object.values(ProposalStatuses).indexOf(ProposalStatuses.Completed) &
        (proposal.status ?? 0)) >
      0,
    [proposal.status]
  );

  const renderVotingComponent = React.useCallback(() => {
    switch (proposal.type) {
      case ProposalTypes.BaseFee:
        return (
          <BaseFeeVoting
            data={{ ...proposal, pendingMultisigTx }}
            isConsortiumMember={isConsortiumMember}
            refresh={refresh}
            multisigFunctions={multisigFunctions}
            onVoteSuccess={onVoteTxSuccess}
          />
        );
      case ProposalTypes.General:
        return (
          <GeneralProposalVoting
            data={proposal}
            isConsortiumMember={isConsortiumMember}
            refresh={refresh}
            onVoteSuccess={onVoteTxSuccess}
            multisigFunctions={multisigFunctions}
          />
        );
      case ProposalTypes.GrantProgram:
        return isConsortiumMember ? (
          <GrantProgramVotingOptions data={proposal} showFullText />
        ) : null;
      case ProposalTypes.NewMember:
      case ProposalTypes.ExcludeMember:
        return (
          <DefaultVotingOptions
            data={{ ...proposal, pendingMultisigTx }}
            isConsortiumMember={isConsortiumMember}
            multisigFunctions={multisigFunctions}
            onVoteSuccess={onVoteTxSuccess}
            onRefresh={refresh}
          />
        );
      default:
        return null;
    }
  }, [
    proposal,
    pendingMultisigTx,
    isConsortiumMember,
    refresh,
    multisigFunctions,
    onVoteTxSuccess,
  ]);

  const renderOptionContent = React.useCallback(
    (opt: VotedOption) => {
      let label;
      let extraInfo = null;
      let labelDirection = 'column';
      let labelSpacing = 1;

      switch (proposal.type) {
        case ProposalTypes.BaseFee: {
          if (baseFee) {
            const absoluteChange = new Big(opt.value as number).minus(baseFee);
            const percentageChange =
              Number(baseFee) > 0 ? absoluteChange.times(100).div(baseFee) : 0;
            const sign = absoluteChange.s > 0 ? '+' : '';

            label = (
              <Typography variant="body2" fontWeight={600}>
                {`Future Base Fee ${opt.value} nCAM`}
              </Typography>
            );
            labelDirection = 'row';
            labelSpacing = 3;
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
          break;
        }
        case ProposalTypes.FeeDistribution: {
          label = (
            <Typography variant="body2" fontWeight={600}>
              {`Distribution #${opt.option}`}
            </Typography>
          );
          const values = opt.value as number[];
          extraInfo = (
            <DistributionBar
              data={values.map(percent => ({ percent }))}
              variant={opt.option === result?.option ? 'vote' : 'default'}
            />
          );
          break;
        }
        case ProposalTypes.General: {
          label = (
            <Stack direction="row" spacing={1}>
              {opt.value ? <CheckCircle /> : <Cancel />}
              <Typography
                variant="body2"
                fontWeight={600}
                dangerouslySetInnerHTML={{
                  __html: opt.value
                    ? serialization.decoder(
                        opt.value as string,
                        'base64',
                        'base64',
                        'utf8'
                      )
                    : '',
                }}
              />
            </Stack>
          );
          break;
        }
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

      return { label, extraInfo, labelDirection, labelSpacing };
    },
    [proposal.type, baseFee, result?.option]
  );

  if (!result && !isCompleted) {
    return (
      <Stack
        direction={options.length < 3 ? 'row' : 'column'}
        spacing={options.length < 3 ? 1 : 2}
      >
        {renderVotingComponent()}
      </Stack>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {filter(options, opt => opt.value !== baseFee).map(opt => {
        const { label, extraInfo, labelDirection, labelSpacing } =
          renderOptionContent(opt);

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
              alignItems="flex-start"
              spacing={labelSpacing}
            >
              {label}
              <Tag
                color={opt.option === result?.option ? 'success' : 'default'}
                label={
                  proposal.isAdminProposal
                    ? opt.option === result?.option
                      ? 'VOTED'
                      : 'NOT VOTED'
                    : `VOTED ${opt.percent ?? 0}%`
                }
              />
            </Stack>
            {extraInfo}
          </Stack>
        );
      })}
    </Box>
  );
};

VoteOptions.displayName = 'VoteOptions';

export default React.memo(VoteOptions);
