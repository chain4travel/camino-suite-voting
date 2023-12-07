import React, { useMemo } from 'react';
import { NavLink, useLoaderData, useNavigate } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { omit } from 'lodash';
import NoProposals from '../active/NoProposals';
import Header from '@/components/Header';
import { ProposalType } from '@/types';
import Paper from '@/components/Paper';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@/components/Accordion';
import useToast from '@/hooks/useToast';
import Button from '@/components/Button';
import { getTxExplorerUrl } from '@/helpers/string';
import useWallet from '@/hooks/useWallet';
import useNetwork from '@/hooks/useNetwork';
import GroupHeader from './GroupHeader';
import PendingList from './PendingList';
import {
  useMultisig,
  usePendingMultisigAddProposalTxs,
} from '@/hooks/useMultisig';
import RefreshButton from '@/components/RefreshButton';

const CreatingProposals = () => {
  const navigate = useNavigate();
  const { activeNetwork } = useNetwork();
  const { currentWalletAddress, isKycVerified } = useWallet();
  const { signMultisigTx, executeMultisigTx, abortSignavault } = useMultisig();
  const { pendingMultisigAddProposalTxs, refetch, isFetching } =
    usePendingMultisigAddProposalTxs();
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

  const onAddProposalTxSuccess = (data?: string) => {
    toast.success(
      'Proposal successfully created',
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
    navigate('/dac/upcoming');
  };

  return (
    <Paper sx={{ px: 2 }}>
      <Header headline="Creating Proposals" variant="h5">
        <Stack direction="row" alignItems="center" spacing={1}>
          {currentWalletAddress && (
            <NavLink to={isKycVerified ? '/dac/create' : '#'}>
              <Button
                variant="contained"
                color="primary"
                disabled={!isKycVerified}
              >
                Create new
              </Button>
            </NavLink>
          )}
          <RefreshButton loading={isFetching} onRefresh={refetch} />
        </Stack>
      </Header>
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
                  multisigFunctions={{
                    signMultisigTx,
                    abortSignavault,
                    executeMultisigTx,
                  }}
                  onTxSuccess={onAddProposalTxSuccess}
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
