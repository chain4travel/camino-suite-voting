import React, { useState } from 'react';
import { List, ListItem, Stack } from '@mui/material';
import { ProposalTypes, type Proposal } from '@/types';
// import NewMemberVoting from './NewMemberVoting';
import BaseFeeVoting from '../active/BaseFeeVoting';
// import ExcludeMemberVoting from './ExcludeMemberVoting';
// import FeeDistributionVoting from './FeeDistributionVoting';
// import GrantProgramVoting from './GrantProgram';
import Button from '@/components/Button';
import { ModelMultisigTx } from '@c4tplatform/signavaultjs';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { countBy } from 'lodash';

type MultisigTx = ModelMultisigTx & {
  canExecuteMultisigTx: boolean;
  isSigned: boolean;
};
type MultisigProposal = Proposal & { msigTx: MultisigTx };
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

  const confrimToAbortPendingMultisigTx = (pendingMultisigTx: MultisigTx) => {
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

  const pendingMultisigTxActions = (msigTx: MultisigTx) => {
    const signedCount = countBy(msigTx.owners, o => !!o.signature);
    return (
      <Stack direction="row" spacing={1} alignItems="center" marginTop={1.5}>
        <Button
          variant="contained"
          color={msigTx.canExecuteMultisigTx ? 'success' : 'primary'}
          sx={{ py: 1.25, px: 2 }}
          onClick={
            msigTx.canExecuteMultisigTx
              ? () => executeMultisigTx?.(msigTx)
              : () => signMultisigTx?.(msigTx)
          }
          // loading={isSubmitting}
          loadingPosition="start"
          startIcon={<CheckCircle />}
          disabled={msigTx.isSigned && !msigTx.canExecuteMultisigTx}
        >
          {msigTx.canExecuteMultisigTx
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
          // case ProposalTypes.NewMember:
          //   Vote = (
          //     <Stack width="100%">
          //       <NewMemberVoting
          //         data={proposal}
          //         isConsortiumMember={isConsortiumMember}
          //       />
          //       <ListItemStatus
          //         startTimestamp={proposal.startTimestamp}
          //         endTimestamp={proposal.endTimestamp}
          //         multisig={proposal.multisig}
          //       />
          //     </Stack>
          //   );
          //   break;
          // case ProposalTypes.ExcludeMember:
          //   Vote = (
          //     <Stack width="100%">
          //       <ExcludeMemberVoting
          //         data={proposal}
          //         isConsortiumMember={isConsortiumMember}
          //       />
          //       <ListItemStatus
          //         startTimestamp={proposal.startTimestamp}
          //         endTimestamp={proposal.endTimestamp}
          //         multisig={proposal.multisig}
          //       />
          //     </Stack>
          //   );
          //   break;
          // case ProposalTypes.FeeDistribution:
          //   Vote = (
          //     <FeeDistributionVoting
          //       data={proposal}
          //       isConsortiumMember={isConsortiumMember}
          //     />
          //   );
          //   break;
          // case ProposalTypes.GrantProgram:
          //   {
          //     const applicant = proposal.target! as Applicant;
          //     Vote = (
          //       <Stack width="100%">
          //         <GrantProgramVoting
          //           data={proposal}
          //           isConsortiumMember={isConsortiumMember}
          //         />
          //         <ListItemStatus
          //           startTimestamp={proposal.startTimestamp}
          //           endTimestamp={proposal.endTimestamp}
          //           multisig={proposal.multisig}
          //           stage={applicant.companyStage}
          //           industry={applicant.companyIndustry}
          //         />
          //       </Stack>
          //     );
          //   }
          //   break;
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
            {/* <ArrowForwardIos /> */}
          </ListItem>
        );
      })}
    </List>
  );
};
export default PendingList;
