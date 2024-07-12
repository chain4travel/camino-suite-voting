import { useWalletStore } from '@/store';
import { PlatformVMConstants } from '@c4tplatform/caminojs/dist/apis/platformvm';
import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { filter } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

//TODO: notification is removed need to be added
const ProposalNavbar = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const theme = useTheme();
  const { addressState, currentWalletAddress, pendingMultisigTxs } =
    useWalletStore(state => ({
      addressState: state.addressState,
      currentWalletAddress: state.currentWalletAddress,
      pendingMultisigTxs: state.pendingMultisigTxs,
    }));
  const { isKycVerified, isConsortiumAdminProposer } = addressState;
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
  const navigate = useNavigate();
  const isCreateProposalAllowed = isKycVerified || isConsortiumAdminProposer;
  const enableCreateButton = currentWalletAddress && isCreateProposalAllowed;
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        maxWidth: '1536px',
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        sx={{
          '& .MuiTabs-indicator': { display: 'none' },
          height: '61px',
          '& .Mui-selected': {
            color: `${theme.palette.text.primary} !important`,
          },
        }}
        scrollButtons="auto"
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab
          className="tab"
          disableRipple
          label="Ongoing Proposals"
          {...a11yProps(0)}
          key={0}
          sx={{ '&::after': { display: value === 0 ? 'block' : 'none' } }}
          onClick={() => navigate('/dac/active')}
        />
        <Tab
          className="tab"
          disableRipple
          label="Upcoming Proposals"
          {...a11yProps(1)}
          key={1}
          sx={{ '&::after': { display: value === 1 ? 'block' : 'none' } }}
          onClick={() => navigate('/dac/upcoming')}
        />
        <Tab
          className="tab"
          disableRipple
          label="Completed Proposals"
          {...a11yProps(2)}
          key={2}
          sx={{ '&::after': { display: value === 2 ? 'block' : 'none' } }}
          onClick={() => navigate('/dac/completed')}
        />
        {enableCreateButton && (
          <Tab
            className="tab"
            disableRipple
            label="Create Proposal"
            {...a11yProps(3)}
            key={3}
            sx={{ '&::after': { display: value === 3 ? 'block' : 'none' } }}
            onClick={() => navigate('/dac/creating')}
          />
        )}
      </Tabs>
    </Box>
  );
};

export default React.memo(ProposalNavbar);
