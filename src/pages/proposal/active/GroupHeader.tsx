import React from 'react';
import { ComponentsProps, Stack, Typography, styled } from '@mui/material';
import type { Group } from '@/types';

interface GroupHeaderProps {
  group: Group;
}
const GroupHeader = styled(
  ({ group, ...props }: GroupHeaderProps & ComponentsProps) => {
    return (
      <Stack direction="row" alignItems="center" spacing={2.5} {...props}>
        {/* {group.icon} */}
        <Typography variant="h6">{group.name}</Typography>
      </Stack>
    );
  }
)(({ theme }) => ({
  '.MuiSvgIcon-root': {
    color: theme.palette.info.light,
  },
}));
export default GroupHeader;
