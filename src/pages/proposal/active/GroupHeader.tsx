import React, { ReactNode, useMemo } from 'react';
import { ComponentsProps, Stack, Typography, styled } from '@mui/material';
import type { Group } from '@/types';
import ListItemStatus from '@/components/ListItemStatus';

interface GroupHeaderProps {
  group: Group;
}
const GroupHeader = styled(
  ({ group, ...props }: GroupHeaderProps & ComponentsProps) => {
    const extraInfo = useMemo(() => {
      switch (group.type) {
        case 'BASE_FEE':
        case 'FEE_DISTRIBUTION':
          return (
            <ListItemStatus
              startTimestamp={group.data[0]?.startDateTime}
              endTimestamp={group.data[0]?.endDateTime}
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
