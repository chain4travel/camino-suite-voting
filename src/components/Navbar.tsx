import { useWalletStore } from '@/store';
import { PlatformVMConstants } from '@c4tplatform/caminojs/dist/apis/platformvm';
import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { filter } from 'lodash';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ProposalNavbar = () => {
  const [value, setValue] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const lastNavigationTime = useRef(Date.now());
  const initialFetchDone = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!initialFetchDone.current) {
      Promise.all([queryClient.invalidateQueries(['getActiveVotings'])])
        .then(() => {
          initialFetchDone.current = true;
        })
        .catch(err => {
          console.error('Error prefetching proposal data:', err);
        });
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes('active')) {
      setValue(0);
    } else if (location.pathname.includes('upcoming')) {
      setValue(1);
    } else if (location.pathname.includes('completed')) {
      setValue(2);
    } else if (location.pathname.includes('creating')) {
      setValue(3);
    }
  }, [location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (isNavigating) return;

    const now = Date.now();
    if (now - lastNavigationTime.current < 300) {
      return;
    }

    setValue(newValue);
    setIsNavigating(true);
    lastNavigationTime.current = now;

    let destination = '/dac/active';
    switch (newValue) {
      case 0:
        destination = '/dac/active';
        queryClient.invalidateQueries(['getActiveVotings']);
        break;
      case 1:
        destination = '/dac/upcoming';
        queryClient.invalidateQueries([
          'getActiveVotings',
          undefined,
          0,
          'upcoming',
        ]);
        break;
      case 2:
        destination = '/dac/completed';
        queryClient.invalidateQueries(['getCompletedVotes']);
        break;
      case 3:
        destination = '/dac/creating';
        break;
    }

    setTimeout(() => {
      navigate(destination);
      setTimeout(() => {
        setIsNavigating(false);
      }, 100);
    }, 50);
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

  const isCreateProposalAllowed = isKycVerified || isConsortiumAdminProposer;
  const enableCreateButton = currentWalletAddress && isCreateProposalAllowed;

  const handleTabClick = (path: string, tabValue: number) => {
    if (isNavigating || value === tabValue) return;

    const now = Date.now();
    if (now - lastNavigationTime.current < 300) {
      return;
    }

    setValue(tabValue);
    setIsNavigating(true);
    lastNavigationTime.current = now;

    switch (tabValue) {
      case 0: // active
        queryClient.invalidateQueries(['getActiveVotings']);
        break;
      case 1: // upcoming
        queryClient.invalidateQueries([
          'getActiveVotings',
          undefined,
          0,
          'upcoming',
        ]);
        break;
      case 2: // completed
        queryClient.invalidateQueries(['getCompletedVotes']);
        break;
    }

    setTimeout(() => {
      navigate(path);
      setTimeout(() => {
        setIsNavigating(false);
      }, 100);
    }, 50);
  };

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
          '& .Mui-disabled': {
            opacity: 0.6,
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
          onClick={() => handleTabClick('/dac/active', 0)}
          disabled={isNavigating}
        />
        <Tab
          className="tab"
          disableRipple
          label="Upcoming Proposals"
          {...a11yProps(1)}
          key={1}
          sx={{ '&::after': { display: value === 1 ? 'block' : 'none' } }}
          onClick={() => handleTabClick('/dac/upcoming', 1)}
          disabled={isNavigating}
        />
        <Tab
          className="tab"
          disableRipple
          label="Completed Proposals"
          {...a11yProps(2)}
          key={2}
          sx={{ '&::after': { display: value === 2 ? 'block' : 'none' } }}
          onClick={() => handleTabClick('/dac/completed', 2)}
          disabled={isNavigating}
        />
        {enableCreateButton && (
          <Tab
            className="tab"
            disableRipple
            label="Create Proposal"
            {...a11yProps(3)}
            key={3}
            sx={{ '&::after': { display: value === 3 ? 'block' : 'none' } }}
            onClick={() => handleTabClick('/dac/creating', 3)}
            disabled={isNavigating}
          />
        )}
      </Tabs>
    </Box>
  );
};

export default React.memo(ProposalNavbar);
