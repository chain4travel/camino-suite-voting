import React from 'react';
import { DateTime } from 'luxon';
import { Chip, ChipProps, Stack, alpha, styled } from '@mui/material';
import { MultisigVote } from '@/types';

interface ListItemStatusProps extends ChipProps {
  startTimestamp: number;
  endTimestamp: number;
  multisig?: MultisigVote;
}
const ListItemStatus = styled(
  ({
    startTimestamp,
    endTimestamp,
    multisig,
    ...props
  }: ListItemStatusProps) => {
    const startDateTime = DateTime.fromSeconds(startTimestamp);
    const endDateTime = DateTime.fromSeconds(endTimestamp);
    const isNotStartYet =
      startDateTime.startOf('day') > DateTime.now().startOf('day');
    const duration = isNotStartYet
      ? startDateTime.toFormat('dd.MM.yyyy hh:mm:ss a')
      : endDateTime
          .diffNow(['days', 'hours', 'minutes'])
          .toFormat("dd'd' hh'h' mm'm'");

    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip {...props} label={duration} />
        {multisig && multisig.voted?.count && (
          <Chip
            className={`${props.className} status-warning`}
            label={`${multisig.voted?.count} / ${multisig.threshold} pending`}
          />
        )}
      </Stack>
    );
  }
)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius / 2,
  backgroundColor: theme.palette.grey[800],
  height: 20,
  '.MuiChip-label': {
    ...theme.typography.caption,
    fontWeight: 600,
    color: theme.palette.grey[300],
    padding: theme.spacing(0, 1),
  },
  '&.status-warning': {
    '.MuiChip-label': {
      color: theme.palette.warning.main,
      backgroundColor: alpha(theme.palette.warning.main, 0.2),
    },
  },
  '&.status-success': {
    '.MuiChip-label': {
      color: theme.palette.success.main,
      backgroundColor: alpha(theme.palette.success.main, 0.2),
    },
  },
}));
export default ListItemStatus;
