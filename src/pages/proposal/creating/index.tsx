import React, { useMemo } from 'react';
import { NavLink, useLoaderData, useNavigate } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { Stack, useTheme } from '@mui/material';
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
import Button from '@/components/Button';
import GroupHeader from './GroupHeader';
import PendingList from './PendingList';
import {
  useMultisig,
  usePendingMultisigAddProposalTxs,
  usePendingMultisigTx,
} from '@/hooks/useMultisig';
import RefreshButton from '@/components/RefreshButton';
import { useNetworkStore } from '@/store/network';
import { useWalletStore } from '@/store';
import { useNotificationStore } from '@/store/notifications';

const CreatingProposals = () => {
  const navigate = useNavigate();
  const activeNetwork = useNetworkStore(state => state.activeNetwork);
  const { currentWalletAddress, addressState } = useWalletStore(state => ({
    currentWalletAddress: state.currentWalletAddress,
    addressState: state.addressState,
  }));
  const { isKycVerified } = addressState;
  const { signMultisigTx, executeMultisigTx, abortSignavault } = useMultisig();
  const { pendingMultisigAddProposalTxs, refetch, isFetching } =
    usePendingMultisigAddProposalTxs();
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const { dispatchNotification } = useNotificationStore();

  const { pendingMultisigTxs } = usePendingMultisigTx();
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
    dispatchNotification({
      type: 'success',
      message: 'Proposal successfully created',
    });
    navigate('/dac/upcoming');
  };
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper sx={{ p: 2 }}>
      <Header headline="Creating Proposals" variant="h6">
        <Stack direction="row" alignItems="center" spacing={1}>
          {currentWalletAddress &&
            (isKycVerified &&
            !(pendingMultisigTxs && pendingMultisigTxs?.length > 0) ? (
              <NavLink to="/dac/create">
                <Button variant="contained" color="primary">
                  Create new
                </Button>
              </NavLink>
            ) : (
              <Button variant="contained" color="primary" disabled={true}>
                Create new
              </Button>
            ))}
          <RefreshButton loading={isFetching} onRefresh={refetch} />
        </Stack>
      </Header>

      {pendingMultisigAddProposalTxs?.length > 0 ? (
        Object.entries(groupedPendingProposals).map(
          ([proposalType, group]: [string, any]) => (
            <Accordion
              key={proposalType}
              defaultExpanded={group.data.length > 0}
              sx={{
                borderRadius: '12px',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  background: isDark
                    ? '#0F182A'
                    : `${theme.palette.background.default} !important`,
                  border: 0,
                }}
              >
                <GroupHeader group={group} />
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: 0,
                  borderRadius: 0,
                  '& .MuiList-root': {
                    borderRadius: 0,
                    maxWidth: 'none',
                  },
                }}
              >
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
