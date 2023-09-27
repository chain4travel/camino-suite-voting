import React, { useState } from 'react';
import { List, ListItem, Stack } from '@mui/material';
import {
  ProposalTypes,
  type Proposal,
  type PendingMultisigTx,
  Applicant,
} from '@/types';
import NewMemberVoting from '../active/NewMemberVoting';
import BaseFeeVoting from '../active/BaseFeeVoting';
import ExcludeMemberVoting from '../active/ExcludeMemberVoting';
import FeeDistributionVoting from '../active/FeeDistributionVoting';
import GrantProgramVoting from '../active/GrantProgram';
import Button from '@/components/Button';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { countBy } from 'lodash';
import ListItemStatus from '@/components/ListItemStatus';

type MultisigProposal = Proposal & { msigTx: PendingMultisigTx };
interface PendingListProps {
  data: {
    type: string;
    typeId: number;
    name: string;
    data: MultisigProposal[];
  };
  signMultisigTx?: (tx: ModelMultisigTx) => void;
  executeMultisigTx?: (tx: ModelMultisigTx) => void;
  abortSignavault?: (tx: ModelMultisigTx) => void;
}
const PendingList = ({
  data,
  signMultisigTx,
  executeMultisigTx,
  abortSignavault,
}: PendingListProps) => {
  const [isCancelTx, setIsCancelTx] = useState(false);

  const confrimToAbortPendingMultisigTx = (
    pendingMultisigTx: PendingMultisigTx
  ) => {
    pendingMultisigTx && abortSignavault?.(pendingMultisigTx);
  };
  const cancelAbortTx = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsCancelTx(false);
  };
  const abortPendingMultisigTx = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setIsCancelTx(true);
  };

  const pendingMultisigTxActions = (msigTx: PendingMultisigTx) => {
    const signedCount = countBy(msigTx.owners, o => !!o.signature);
    return (
      <Stack direction="row" spacing={1} alignItems="center" marginTop={1.5}>
        <Button
          variant="contained"
          color={msigTx.canExecute ? 'success' : 'primary'}
          sx={{ py: 1.25, px: 2 }}
          onClick={
            msigTx.canExecute
              ? () => executeMultisigTx?.(msigTx)
              : () => signMultisigTx?.(msigTx)
          }
          // loading={isSubmitting}
          loadingPosition="start"
          startIcon={<CheckCircle />}
          disabled={msigTx.isSigned && !msigTx.canExecute}
        >
          {msigTx.canExecute
            ? 'Execute the transaction'
            : `Sign the transaction (${signedCount.true ?? 0} / ${
                msigTx.threshold
              })`}
        </Button>
        {isCancelTx ? (
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <Button
              variant="contained"
              color="primary"
              sx={{ py: 1.25, px: 2 }}
              onClick={() => confrimToAbortPendingMultisigTx(msigTx)}
              // loading={isSubmitting}
              loadingPosition="start"
              startIcon={<CheckCircle />}
            >
              Confirm to abort
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              sx={{ py: 1.25, px: 2 }}
              onClick={cancelAbortTx}
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <Button
            variant="outlined"
            color="inherit"
            sx={{ py: 1.25, px: 2 }}
            onClick={abortPendingMultisigTx}
            loadingPosition="start"
            startIcon={<Cancel />}
          >
            Abort the transaction
          </Button>
        )}
      </Stack>
    );
  };
  return (
    <List disablePadding>
      {data.data.map((proposal: MultisigProposal, index: number) => {
        let Vote: JSX.Element | null = null;
        switch (data.type) {
          case ProposalTypes.BaseFee:
            Vote = (
              <Stack width="100%">
                <BaseFeeVoting data={proposal} />
                {pendingMultisigTxActions(proposal.msigTx)}
              </Stack>
            );
            break;
          case ProposalTypes.NewMember:
            Vote = (
              <Stack width="100%">
                <NewMemberVoting data={proposal} />
                <ListItemStatus
                  startTimestamp={proposal.startTimestamp}
                  endTimestamp={proposal.endTimestamp}
                  pendingMultisigTx={proposal.pendingMultisigTx}
                />
                {pendingMultisigTxActions(proposal.msigTx)}
              </Stack>
            );
            break;
          case ProposalTypes.ExcludeMember:
            Vote = (
              <Stack width="100%">
                <ExcludeMemberVoting data={proposal} />
                <ListItemStatus
                  startTimestamp={proposal.startTimestamp}
                  endTimestamp={proposal.endTimestamp}
                  pendingMultisigTx={proposal.pendingMultisigTx}
                />
                {pendingMultisigTxActions(proposal.msigTx)}
              </Stack>
            );
            break;
          case ProposalTypes.FeeDistribution:
            Vote = (
              <Stack width="100%">
                <FeeDistributionVoting data={proposal} />
                {pendingMultisigTxActions(proposal.msigTx)}
              </Stack>
            );
            break;
          case ProposalTypes.GrantProgram:
            {
              const applicant = proposal.target! as Applicant;
              Vote = (
                <Stack width="100%">
                  <GrantProgramVoting data={proposal} />
                  <ListItemStatus
                    startTimestamp={proposal.startTimestamp}
                    endTimestamp={proposal.endTimestamp}
                    pendingMultisigTx={proposal.pendingMultisigTx}
                    stage={applicant.companyStage}
                    industry={applicant.companyIndustry}
                  />
                  {pendingMultisigTxActions(proposal.msigTx)}
                </Stack>
              );
            }
            break;
          default:
            console.warn(`Unsupport voting type ${data.type}`);
        }
        return (
          <ListItem
            key={proposal.id}
            divider={index !== data.data.length - 1}
            sx={{ padding: 2.5, width: '100%' }}
          >
            {Vote}
          </ListItem>
        );
      })}
    </List>
  );
};
export default PendingList;
