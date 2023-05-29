import React from 'react';
import { ListItemText, ListItemTextProps, styled } from '@mui/material';
import { DateTime } from 'luxon';

interface ListItemDurationProps extends ListItemTextProps {
  startTimestamp: number;
  endTimestamp: number;
}
const ListItemDuration = styled(
  ({ startTimestamp, endTimestamp, ...props }: ListItemDurationProps) => {
    const startDateTime = DateTime.fromSeconds(startTimestamp);
    const endDateTime = DateTime.fromSeconds(endTimestamp);
    const isNotStartYet =
      startDateTime.startOf('day') > DateTime.now().startOf('day');
    const duration = isNotStartYet
      ? startDateTime.toFormat('dd MM yyyy hh:mm:ss a')
      : endDateTime
          .diffNow(['days', 'hours', 'minutes'])
          .toFormat("dd'd' hh'h' mm'm'");

    return <ListItemText {...props} primary={duration} />;
  }
)(({ theme }) => ({
  flex: 'none',
  width: '100px',
  marginRight: theme.spacing(3),
  '.MuiListItemText-primary': {
    ...theme.typography.body2,
    textAlign: 'right',
    fontWeight: 700,
  },
}));
export default ListItemDuration;
