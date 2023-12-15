import React, { useMemo } from 'react';
import { ComponentsProps, Stack, Typography, styled } from '@mui/material';
import { ProposalTypes, type Group, Proposal } from '@/types';
import ListItemStatus from '@/components/ListItemStatus';
import { countBy } from 'lodash';

interface GroupHeaderProps {
  group: Group;
}
const GroupHeader = styled(
  ({ group, ...props }: GroupHeaderProps & ComponentsProps) => {
    const extraInfo = useMemo(() => {
      switch (group.type) {
        case ProposalTypes.BaseFee:
        case ProposalTypes.FeeDistribution:
          return (
            <ListItemStatus
              startTimestamp={group.data[0]?.startTimestamp}
              endTimestamp={group.data[0]?.endTimestamp}
            />
          );
        default:
      }
      return null;
    }, [group]);
    const votedCount = countBy(
      group.data,
      (p: Proposal) => p.voted && p.voted.length > 0
    );
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        {...props}
      >
        {/* {group.icon} */}
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Typography variant="h6">{group.name}</Typography>
          {extraInfo}
        </Stack>
        <Stack direction="row" alignItems="center">
          <ListItemStatus
            status={`${votedCount.true ?? 0} / ${group.data.length}`}
          />
        </Stack>
      </Stack>
    );
  }
)(({ theme }) => ({
  '.MuiSvgIcon-root': {
    color: theme.palette.info.light,
  },
}));
export default GroupHeader;
