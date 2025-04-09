import Button from '@/components/Button';
import Paragraph from '@/components/Paragraph';
import StateButton from '@/components/StateButton';
import Tag from '@/components/Tag';
import { toPastTense } from '@/helpers/string';
import { getOptionLabel } from '@/helpers/util';
import {
  Proposal,
  ProposalStatuses,
  ProposalTypes,
  VotingOption,
} from '@/types';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { filter, find, map } from 'lodash';
import { DateTime } from 'luxon';
import React, { useEffect, useMemo } from 'react';
import { Serialization } from '@c4tplatform/caminojs/dist/utils';
import useWallet from '@/hooks/useWallet';
import { useWalletStore } from '@/store';
import { usePendingMultisigTx } from '@/hooks/useMultisig';
interface ExtraInfo {
  label: string;
  value: number | string;
}
interface ProposalStatusProps {
  proposal: Proposal;
  isLoggedIn?: boolean;
  extraInfo?: ExtraInfo | ExtraInfo[];
}

const serialization = Serialization.getInstance();

const ProposalStatus = ({
  proposal,
  isLoggedIn,
  extraInfo,
}: ProposalStatusProps) => {
  const [hasValidator, setHasValidator] = React.useState(false);
  const voted = proposal?.voted?.flatMap((v: VotingOption) =>
    filter(
      proposal.options,
      (opt: VotingOption) => opt.option === v.option
    ).map(opt => ({ ...opt, label: getOptionLabel(opt) }))
  );
  const { signer, pchainAPI } = useWallet();
  const {
    currentWalletAddress,
    addressState: { isConsortiumMember },
  } = useWalletStore(state => ({
    currentWalletAddress: state.currentWalletAddress,
    addressState: state.addressState,
  }));
  const isSuccess =
    proposal?.status ===
    Object.values(ProposalStatuses).indexOf(ProposalStatuses.Success);
  const isFailed =
    proposal?.status ===
    Object.values(ProposalStatuses).indexOf(ProposalStatuses.Failed);
  const isCompleted = isSuccess || isFailed;
  useEffect(() => {
    setHasValidator(false);
    if (currentWalletAddress) {
      pchainAPI?.getCurrentValidators().then(result => {
        const hasVal = find(
          (result as { validators: any[] }).validators,
          validator =>
            validator.rewardOwner.addresses.includes(currentWalletAddress)
        );
        if (hasVal) {
          setHasValidator(true);
        }
      });
    }
  }, [currentWalletAddress]);
  const { getVotedState, extraInfoComponent } = useMemo(() => {
    let extraInfoComponent = null;
    let getVotedState = (option: VotingOption) =>
      toPastTense(String(option.label));
    switch (proposal?.type) {
      case ProposalTypes.BaseFee:
        {
          const info = extraInfo as ExtraInfo;
          extraInfoComponent = (
            <>
              <Typography
                variant="caption"
                fontWeight={600}
                letterSpacing={2}
                sx={{ textTransform: 'uppercase' }}
              >{`${info?.label} prior to proposal`}</Typography>
              <Typography variant="body2" color="text.secondary">
                {info?.value} nCAM
              </Typography>
            </>
          );
          getVotedState = (option: VotingOption) =>
            `New Base Fee ${option.value} nCAM`;
        }
        break;
      case ProposalTypes.FeeDistribution:
        {
          const info = extraInfo as ExtraInfo[];
          extraInfoComponent = (
            <>
              <Typography
                variant="caption"
                fontWeight={600}
                letterSpacing={2}
                sx={{ textTransform: 'uppercase' }}
              >
                Distribution prior to proposal
              </Typography>
              {map(info, distribution => (
                <Stack
                  key={`dist-${distribution.label}`}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" color="text.secondary">
                    {distribution.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {distribution.value}%
                  </Typography>
                </Stack>
              ))}
            </>
          );
          getVotedState = (option: VotingOption) =>
            `Distribution #${option.option}`;
        }
        break;
      case ProposalTypes.General:
        {
          getVotedState = (option: VotingOption) =>
            `${serialization.decoder(
              option.value,
              'base64',
              'base64',
              'utf8'
            )}`;
        }
        break;
      default:
    }
    return {
      getVotedState,
      extraInfoComponent,
    };
  }, [proposal?.type]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { pendingMultisigTxs } = usePendingMultisigTx();

  const hasPendingMultisigVote = useMemo(() => {
    return (
      isLoggedIn &&
      pendingMultisigTxs &&
      pendingMultisigTxs.length &&
      pendingMultisigTxs.length > 0 &&
      pendingMultisigTxs[0].proposalId === proposal.id
    );
  }, [isLoggedIn, pendingMultisigTxs, proposal?.id]);

  return (
    <Box
      padding={2.5}
      minWidth={280}
      borderRadius={1.5}
      sx={{
        background: isDark
          ? '#0F182A'
          : `${theme.palette.background.default} !important`,
        marginLeft: '0px',
      }}
    >
      <Paragraph spacing="md">
        <Paragraph divider>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Status</Typography>
            <Tag
              color={isSuccess ? 'success' : isFailed ? 'error' : 'default'}
              label={
                proposal?.status === 0 && proposal?.inactive
                  ? 'INACTIVE'
                  : Object.values(ProposalStatuses)[
                      proposal?.status
                    ]?.toUpperCase()
              }
            />
          </Stack>
        </Paragraph>
        <Paragraph spacing={1.5} divider>
          <Typography
            variant="caption"
            fontWeight={600}
            letterSpacing={2}
            sx={{ textTransform: 'uppercase' }}
          >
            Proposal period
          </Typography>
          <Paragraph spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Start:{' '}
              {DateTime.fromSeconds(proposal?.startTimestamp ?? 0).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End:{' '}
              {DateTime.fromSeconds(proposal?.endTimestamp ?? 0).toFormat(
                'dd.MM.yyyy - hh:mm:ss a'
              )}
            </Typography>
          </Paragraph>
        </Paragraph>
        {extraInfo && (
          <Paragraph spacing={1.5} divider>
            {extraInfoComponent}
          </Paragraph>
        )}
        {signer && (
          <Paragraph spacing="md">
            <>
              <Typography
                variant="caption"
                fontWeight={600}
                letterSpacing={2}
                sx={{ textTransform: 'uppercase' }}
              >
                Your vote
              </Typography>

              <Paragraph spacing="sm" alignItems="flex-start">
                {voted ? (
                  voted.map((v: VotingOption) => (
                    <StateButton
                      key={v.option}
                      variant="contained"
                      color={v.value ? 'success' : 'error'}
                      startIcon={v.value ? <CheckCircle /> : <Cancel />}
                      sx={{ textTransform: 'none', textAlign: 'left' }}
                    >
                      {getVotedState(v)}
                    </StateButton>
                  ))
                ) : isCompleted ? (
                  <Typography variant="body2" color="text.secondary">
                    Did not participate
                  </Typography>
                ) : hasPendingMultisigVote ? (
                  <Typography variant="body2" color="text.secondary">
                    Vote needs more signatures from multisig owners to count
                  </Typography>
                ) : isLoggedIn && isConsortiumMember && hasValidator ? (
                  <Typography variant="body2" color="text.secondary">
                    You have not voted yet
                  </Typography>
                ) : isLoggedIn && (!isConsortiumMember || !hasValidator) ? (
                  <Typography variant="body2" color="text.secondary">
                    You must be a consortium member with a running validator to
                    vote
                  </Typography>
                ) : (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => (location.pathname = '/login')}
                  >
                    Please login to vote
                  </Button>
                )}
              </Paragraph>
            </>
          </Paragraph>
        )}
      </Paragraph>
    </Box>
  );
};
export default React.memo(ProposalStatus);
