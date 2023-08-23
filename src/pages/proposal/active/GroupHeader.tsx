import React, { useMemo } from 'react';
import { ComponentsProps, Stack, Typography, styled } from '@mui/material';
import { ProposalTypes, type Group } from '@/types';
import ListItemStatus from '@/components/ListItemStatus';
import { DateTime } from 'luxon';

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
    return (
      <Stack direction="row" alignItems="center" spacing={2.5} {...props}>
        {/* {group.icon} */}
        <Typography variant="h6">{group.name}</Typography>
        {extraInfo}
      </Stack>
    );
  }
)(({ theme }) => ({
  '.MuiSvgIcon-root': {
    color: theme.palette.info.light,
  },
}));
export default GroupHeader;
