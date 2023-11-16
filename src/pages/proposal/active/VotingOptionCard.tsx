import { Cancel, CheckCircle } from '@mui/icons-material';
import {
  Card as MuiCard,
  CardProps,
  styled,
  CardHeader as MuiCardHeader,
  CardContent,
  Stack,
} from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { countBy, find } from 'lodash';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import Button from '@/components/Button';
import StateButton from '@/components/StateButton';
import type { PendingMultisigTx, Vote, VotingOption } from '@/types';

interface StyledCardProps {
  active?: boolean;
  isVoted?: boolean;
}
const StyledCard = styled((props: StyledCardProps & CardProps) => (
  <MuiCard {...props} />
))(({ theme, ...props }) => ({
  flex: 1,
  boxShadow: 'none',
  background: 'transparent',
  borderWidth: props.isVoted ? 2 : 1,
  borderStyle: 'solid',
  borderColor: props.isVoted
    ? theme.palette.text.primary
    : props.active
    ? theme.palette.grey[400]
    : theme.palette.divider,
}));
const StyledCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  paddingBottom: 0,
  '.MuiCardHeader-title': {
    display: 'initial',
    marginLeft: '0 !important', // we should not use '!important' here, but 'datacharts.css' use '!important' to force overriding this style when integrating with camino-suite
    marginBottom: 0,
  },
}));

interface VotingOptionProps {
  option: VotingOption;
  isConsortiumMember?: boolean;
  title?: string;
  voted?: VotingOption[];
  inactive?: boolean;
  isSubmitting?: boolean;
  selected?: string | number | null;
  children?: ReactNode;
  pendingMultisigTx?: PendingMultisigTx;
  renderContent?: (option: VotingOption) => ReactNode;
  onSelect?: (option: VotingOption | null) => void;
  onVote?: () => void;
  signMultisigTx?: (tx: ModelMultisigTx) => void;
  abortSignavault?: (tx: ModelMultisigTx) => void;
  executeMultisigTx?: (tx: ModelMultisigTx) => void;
}
const VotingOptionCard = ({
  option,
  title,
  isConsortiumMember,
  voted,
  inactive,
  isSubmitting,
  selected,
  pendingMultisigTx,
  renderContent,
  onSelect,
  onVote,
  signMultisigTx,
  abortSignavault,
  executeMultisigTx,
}: VotingOptionProps) => {
  const [isCancelTx, setIsCancelTx] = useState(false);
  const hadVoted = voted && voted.length > 0;
  const isVoted = !!find(voted, v => v.option === option.option);
  const isSelected = option.option === selected;
  // Singleton vote
  const toggleSelected = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    !hadVoted && onSelect && onSelect(option);
  };
  const confirmSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onVote && onVote();
  };

  // Multisig vote
  const signPendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    pendingMultisigTx && signMultisigTx?.(pendingMultisigTx);
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
    pendingMultisigTx && abortSignavault?.(pendingMultisigTx);
  };
  const cancelAbortTx = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsCancelTx(false);
  };
  const executePendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    pendingMultisigTx && executeMultisigTx?.(pendingMultisigTx);
  };

  let pendingMultisigTxActions = null;
  if (pendingMultisigTx) {
    if (pendingMultisigTx.voteOptionIndex === option.option) {
      const signedCount = countBy(pendingMultisigTx.owners, o => !!o.signature);
      pendingMultisigTxActions = (
        <Stack spacing={1} alignItems="flex-start">
          <Button
            variant="contained"
            color={pendingMultisigTx.canExecute ? 'success' : 'primary'}
            sx={{ marginTop: 1.5, py: 1.25, px: 2 }}
            onClick={
              pendingMultisigTx.canExecute
                ? executePendingMultisigTx
                : signPendingMultisigTx
            }
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<CheckCircle />}
            disabled={
              pendingMultisigTx.isSigned && !pendingMultisigTx.canExecute
            }
          >
            {pendingMultisigTx.canExecute
              ? 'Execute the transaction'
              : `Sign the transaction (${signedCount.true ?? 0} / ${
                  pendingMultisigTx.threshold
                })`}
          </Button>
          {isCancelTx ? (
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: 1.5, py: 1.25, px: 2 }}
                onClick={confrimToAbortPendingMultisigTx}
                loading={isSubmitting}
                loadingPosition="start"
                startIcon={<CheckCircle />}
              >
                Confirm to abort
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                sx={{ marginTop: 1.5, py: 1.25, px: 2 }}
                onClick={cancelAbortTx}
              >
                Cancel
              </Button>
            </Stack>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              sx={{ marginTop: 1.5, py: 1.25, px: 2 }}
              onClick={abortPendingMultisigTx}
              loadingPosition="start"
              startIcon={<Cancel />}
            >
              Abort the transaction
            </Button>
          )}
        </Stack>
      );
    }
  }

  return (
    <StyledCard active={isSelected} isVoted={isVoted}>
      <StyledCardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent sx={{ padding: 2.5, paddingTop: 1.5 }}>
        {renderContent && <Stack spacing={0.5}>{renderContent(option)}</Stack>}
        {isConsortiumMember &&
          (isVoted ? (
            <StateButton
              variant="contained"
              color="success"
              sx={{ marginTop: 1.5 }}
              startIcon={<CheckCircle />}
            >
              Your selection
            </StateButton>
          ) : (
            pendingMultisigTxActions || (
              <Button
                variant={isSelected ? 'contained' : 'outlined'}
                color={isSelected ? 'success' : 'inherit'}
                sx={{ marginTop: 1.5, py: 1.25, px: 2 }}
                onClick={isSelected ? confirmSelection : toggleSelected}
                loading={isSubmitting}
                loadingPosition="start"
                startIcon={<CheckCircle />}
                disabled={hadVoted || inactive || !!pendingMultisigTx}
              >
                {isSelected ? 'Confirm selection' : 'Select'}
              </Button>
            )
          ))}
      </CardContent>
    </StyledCard>
  );
};
export default VotingOptionCard;
