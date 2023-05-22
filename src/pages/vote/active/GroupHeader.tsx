import React, { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';
import type { Group } from '@/types';
import { Exposure, PersonAddAlt1Outlined } from '@mui/icons-material';

interface GroupHeaderProps {
  group: Group;
}
const GroupHeader = ({ group }: GroupHeaderProps) => {
  const icon = useMemo(() => {
    let icon = null;
    switch (group.type) {
      case 'NEW_MEMBER':
        icon = <PersonAddAlt1Outlined />;
        break;
      case 'BASE_FEE':
        icon = <Exposure />;
        break;
      default:
        console.warn(`Unsupport voting type ${group.type}`);
    }
    return icon;
  }, [group.type]);
  return (
    <Stack direction="row" alignItems="center" spacing="20px">
      {icon}
      <Typography variant="h6">{group.name}</Typography>
    </Stack>
  );
};
export default GroupHeader;
