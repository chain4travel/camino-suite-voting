import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import useWallet from '@/hooks/useWallet';
import { filter } from 'lodash';
import Badge from './Badge';
import { useWalletStore } from '@/store';
import { PlatformVMConstants } from '@c4tplatform/caminojs/dist/apis/platformvm';

interface NavItemProps {
  to: string;
  text: string;
  notification?: string;
}
const NavItem = ({ to, text, notification }: NavItemProps) => {
  return (
    <NavLink
      to={`/dac/${to}`}
      style={{ textDecoration: 'none', position: 'relative' }}
    >
      {({ isActive }) => (
        <>
          {notification && (
            <Badge
              color="primary"
              label={notification}
              sx={{ position: 'absolute', top: 8, right: 4 }}
            />
          )}
          <Typography
            color={isActive ? 'text.primary' : 'grey.500'}
            sx={{
              paddingX: 1.25,
              paddingY: 1.5,
              paddingTop: 3,
              fontWeight: 600,
            }}
          >
            {text}
          </Typography>
          <Box
            height={4}
            borderRadius="4px 4px 0 0"
            sx={{ backgroundColor: isActive ? 'primary.main' : 'transparent' }}
          />
        </>
      )}
    </NavLink>
  );
};

const ProposalNavbar = () => {
  const { isConsortiumMember, currentWalletAddress } = useWallet();
  const pendingMultisigTxs = useWalletStore(state => state.pendingMultisigTxs);
  const { pendingAddProposals, pendingAddVotes } = useMemo(() => {
    const pendingForCurrentAlias = filter(pendingMultisigTxs, {
      alias: currentWalletAddress,
    });
    const pendingAddProposalCount = filter(
      pendingForCurrentAlias,
      tx => tx.typeId === PlatformVMConstants.ADDPROPOSALTX
    ).length;
    const pendingAddVoteCount = filter(
      pendingForCurrentAlias,
      tx => tx.typeId === PlatformVMConstants.ADDVOTETX
    ).length;
    return {
      pendingAddProposals:
        pendingAddProposalCount > 0
          ? `${pendingAddProposalCount} pending`
          : undefined,
      pendingAddVotes:
        pendingAddVoteCount > 0 ? `${pendingAddVoteCount} pending` : undefined,
    };
  }, [pendingMultisigTxs]);
  return (
    <Stack
      direction="row"
      borderBottom={1}
      borderColor="divider"
      paddingX={1.5}
      alignItems="flex-end"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={3} alignItems="flex-end">
        <NavItem
          to="active"
          text="Ongoing Proposals"
          notification={pendingAddVotes}
        />
        <NavItem to="upcoming" text="Upcoming Proposals" />
        <NavItem to="completed" text="Completed Proposals" />
      </Stack>
      {isConsortiumMember && (
        <NavItem
          to="creating"
          text="Create Proposal"
          notification={pendingAddProposals}
        />
      )}
    </Stack>
  );
};

export default ProposalNavbar;
