import React, { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { omit } from 'lodash';
import Header from '@/components/Header';
import { ProposalType } from '@/types';
import Paper from '@/components/Paper';
import NoProposals from '../active/NoProposals';
import { usePendingMultisigProposals } from '@/hooks/useProposals';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@/components/Accordion';
import useToast from '@/hooks/useToast';
import Button from '@/components/Button';
import { getTxExplorerUrl } from '@/helpers/string';
import useNetwork from '@/hooks/useNetwork';
import GroupHeader from './GroupHeader';
import PendingList from './PendingList';

const CreatingProposals = () => {
  const { activeNetwork } = useNetwork();
  const {
    pendingMultisigAddProposalTxs,
    signMultisigTx,
    executeMultisigTx,
    abortSignavault,
  } = usePendingMultisigProposals();
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const toast = useToast();

  const groupedPendingProposals = useMemo(() => {
    return pendingMultisigAddProposalTxs.reduce((result: any, msigTx: any) => {
      const proposalType = proposalTypes.find(
        (vtype: ProposalType) => vtype.id === msigTx.proposal.typeId
      );
      if (proposalType) {
        const currentData = result[proposalType.id]
          ? result[proposalType.id].data
          : [];
        return {
          ...result,
          [proposalType.id]: {
            type: msigTx.proposal.type,
            typeId: msigTx.proposal.typeId,
            name: proposalType.name,
            icon: proposalType.icon,
            data: [
              ...currentData,
              {
                ...msigTx.proposal,
                id: `${proposalType.name}-${msigTx.alias}`,
                msigTx: omit(msigTx, 'proposal'),
              },
            ],
          },
        };
      } else {
        console.warn(
          `unsupported proposal type(${msigTx.proposal.type}) of proposal(${msigTx.proposal.id})`
        );
      }
      return result;
    }, {});
  }, [pendingMultisigAddProposalTxs]);

  const onVoteTxSuccess = data => {
    toast.success(
      'Proposal successfully created',
      data,
      data && (
        <Button
          href={getTxExplorerUrl(activeNetwork?.name, 'p', data)}
          target="_blank"
          variant="outlined"
          color="inherit"
        >
          View on explorer
        </Button>
      )
    );
  };

  console.log(
    '@CreatingProposals: groupedPendingProposals',
    groupedPendingProposals
  );

  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Creating Proposals" variant="h5" />
      {pendingMultisigAddProposalTxs?.length > 0 ? (
        Object.entries(groupedPendingProposals).map(
          ([proposalType, group]: [string, any]) => (
            <Accordion
              key={proposalType}
              defaultExpanded={group.data.length > 0}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: 'grey.800',
                  border: 1,
                  borderColor: 'grey.700',
                }}
              >
                <GroupHeader group={group} />
              </AccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                <PendingList
                  data={group}
                  signMultisigTx={signMultisigTx}
                  executeMultisigTx={executeMultisigTx?.(onVoteTxSuccess)}
                  abortSignavault={abortSignavault}
                />
              </AccordionDetails>
            </Accordion>
          )
        )
      ) : (
        <NoProposals type="creating" />
      )}
    </Paper>
  );
};
export default CreatingProposals;
