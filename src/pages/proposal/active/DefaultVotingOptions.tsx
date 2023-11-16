import React, { MouseEvent, MouseEventHandler, useMemo, useState } from 'react';
import { countBy, filter, find, findIndex } from 'lodash';
import { IconButton, Stack } from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import useVote from '@/hooks/useVote';
import type { Proposal, VotingOption } from '@/types';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import Button from '@/components/Button';
import { getOptionLabel } from '@/helpers/util';

interface DefaultVotingOptionsProps {
  data: Proposal;
  multisigFunctions: {
    signMultisigTx?: (tx: ModelMultisigTx) => Promise<void>;
    abortSignavault?: (tx: ModelMultisigTx) => Promise<void>;
    executeMultisigTx?: (
      onSuccess?: (txID?: string) => void
    ) => (tx: ModelMultisigTx) => Promise<void> | undefined;
  };
  isConsortiumMember?: boolean;
  compact?: boolean;
  onVoteSuccess?: (txId?: string) => void;
  onRefresh?: () => void;
}
const DefaultVotingOptions = ({
  data,
  isConsortiumMember,
  compact,
  onVoteSuccess,
  onRefresh,
  multisigFunctions,
}: DefaultVotingOptionsProps) => {
  const [isCancelTx, setIsCancelTx] = useState(false);
  const {
    selectedOption,
    setSelectedOption,
    confirmedOption,
    setConfirmedOption,
    submitVote,
  } = useVote(onVoteSuccess, onRefresh);
  const { signMultisigTx, abortSignavault, executeMultisigTx } =
    multisigFunctions;

  const voted = filter(
    data.options,
    opt => !!find(data.voted, v => v.option === opt.option)
  ).map(opt => ({ ...opt, label: getOptionLabel(opt) }));

  const triggerVoting =
    (option: VotingOption): MouseEventHandler<HTMLButtonElement> =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setSelectedOption(option);
    };

  // Multisig vote
  const signPendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    data.pendingMultisigTx && signMultisigTx?.(data.pendingMultisigTx);
  };
  const abortPendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setIsCancelTx(true);
  };
  const confrimToAbortPendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    data.pendingMultisigTx && abortSignavault?.(data.pendingMultisigTx);
    setIsCancelTx(false);
  };
  const cancelAbortTx = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsCancelTx(false);
  };
  const executePendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    data.pendingMultisigTx &&
      executeMultisigTx?.(txId => {
        onVoteSuccess?.(txId);
        setTimeout(() => onRefresh?.(), 500);
      })(data.pendingMultisigTx);
  };

  const actionButtons = useMemo(() => {
    const isVoted = voted.length > 0;
    // Voted state
    if (isVoted) {
      return voted.map(v => (
        <StateButton
          key={`voted-${v.option}`}
          variant="contained"
          color={v.value ? 'success' : 'error'}
          startIcon={v.value ? <CheckCircle /> : <Cancel />}
          fullWidth
        >
          You {toPastTense(String(v.label))}
        </StateButton>
      ));
    }

    // Multisig pending state
    if (!isVoted && data.pendingMultisigTx) {
      const votedOption = find(data.options, {
        option: data.pendingMultisigTx?.voteOptionIndex,
      });
      if (votedOption) {
        const signedCount = countBy(
          data.pendingMultisigTx.owners,
          o => !!o.signature
        );
        return (
          <Stack spacing={1.5} direction={'row'} alignItems={'center'} flex={1}>
            <Button
              variant="contained"
              color={data.pendingMultisigTx.canExecute ? 'success' : 'primary'}
              sx={{ flex: 1, py: 1.25, px: 2 }}
              onClick={
                data.pendingMultisigTx.canExecute
                  ? executePendingMultisigTx
                  : signPendingMultisigTx
              }
              loading={confirmedOption === votedOption.option}
              loadingPosition="start"
              startIcon={<CheckCircle />}
              disabled={
                data.pendingMultisigTx.isSigned &&
                !data.pendingMultisigTx.canExecute
              }
            >
              {data.pendingMultisigTx.canExecute
                ? 'Execute the transaction'
                : `${getOptionLabel(votedOption)} (${signedCount.true ?? 0} / ${
                    data.pendingMultisigTx.threshold
                  })`}
            </Button>
            {isCancelTx ? (
              <Stack direction="row" spacing={1} alignItems="center" flex={2}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ flex: 1, py: 1.25, px: 2 }}
                  onClick={confrimToAbortPendingMultisigTx}
                  loading={confirmedOption === votedOption.option}
                  loadingPosition="start"
                  startIcon={<CheckCircle />}
                >
                  Confirm to abort
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ flex: compact ? undefined : 1, py: 1.25, px: 2 }}
                  onClick={cancelAbortTx}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                sx={{ flex: 1, py: 1.25, px: 2 }}
                onClick={abortPendingMultisigTx}
                loadingPosition="start"
                startIcon={<Cancel />}
              >
                Abort the transaction
              </Button>
            )}
          </Stack>
        );
        // return (
        //   <Button
        //     key={`multisig-voted-${votedOption?.option}`}
        //     variant={isAccepted ? 'contained' : 'outlined'}
        //     startIcon={isAccepted ? <CheckCircle /> : <Cancel />}
        //     onClick={triggerVoting(votedOption)}
        //     loading={confirmedOption === votedOption.option}
        //     loadingPosition="start"
        //     color={isAccepted ? 'primary' : 'inherit'}
        //     fullWidth
        //     disabled={!isConsortiumMember}
        //   >
        //     {getOptionLabel(votedOption)}
        //   </Button>
        // );
      }
    }

    // default non-voted state
    return data.options
      .map(opt => (
        <Button
          key={opt.option}
          variant={opt.value ? 'contained' : 'outlined'}
          startIcon={opt.value ? <CheckCircle /> : <Cancel />}
          onClick={triggerVoting(opt)}
          color={opt.value ? 'primary' : 'inherit'}
          fullWidth
          disabled={!isConsortiumMember || data.inactive}
        >
          {getOptionLabel(opt)}
        </Button>
      ))
      .reverse();
  }, [voted, data.options, data.pendingMultisigTx]);

  const confirmVoting =
    (option: VotingOption): MouseEventHandler<HTMLButtonElement> =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setConfirmedOption(option.option);
      const optionIndex = findIndex(
        data.options,
        opt => opt.option === option.option
      );
      submitVote({
        proposalId: data.id,
        optionIndex,
      });
    };

  return (
    <Stack direction="row" sx={{ minWidth: 240, flex: 1 }} spacing={1.5}>
      {selectedOption
        ? [
            <IconButton
              key="btn-cancel"
              color="inherit"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                paddingX: 2,
              }}
              onClick={event => {
                event.stopPropagation();
                setSelectedOption(null);
              }}
              disabled={!isConsortiumMember || data.inactive}
            >
              <Cancel />
            </IconButton>,
            <Button
              key="btn-confirm"
              fullWidth
              startIcon={<CheckCircle />}
              variant="contained"
              loading={!!confirmedOption}
              loadingPosition="start"
              color={selectedOption.value ? 'success' : 'error'}
              onClick={confirmVoting(selectedOption)}
              disabled={!isConsortiumMember || data.inactive}
            >
              Confirm {getOptionLabel(selectedOption)}
            </Button>,
          ]
        : actionButtons}
    </Stack>
  );
};
export default DefaultVotingOptions;
